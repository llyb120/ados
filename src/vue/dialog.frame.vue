<!--<template>-->
<!--    <el-dialog-->
<!--        :visible.sync="visible"-->
<!--        :fullscreen="formOption && formOption.style && formOption.style.dialogWidth === 'fullscreen'"-->
<!--        :title="title"-->
<!--        :width="formOption && formOption.style && formOption.style.dialogWidth || 'auto'"-->
<!--        >-->
<!--        <el-page-header slot="title" @back="visible = false" :content="title"></el-page-header>-->
<!--        <el-form :label-width="formOption && formOption.style && formOption.style.labelWidth || '150px'">-->
<!--            <div class="form" :style="{...(formOption.style||{})}">-->
<!--                <el-form-item :label="v.label" v-for="v in fields">-->
<!--                    <component :is="v.component" v-if="v.component" v-model="data[v.name]" @shit="shit"/>-->
<!--                    <el-input v-model="data[v.name]" v-else />-->
<!--                </el-form-item>-->
<!--            </div>-->
<!--        </el-form>-->
<!--    </el-dialog>-->
<!--</template>-->

<script>
import {None} from "../base";
import {NoneLayout} from "../base";
import {AdvanceComponent} from "../component";
import {doCreateRequest, doFindRequest, doPost, doUpdateRequest} from "../request";

export default {
    name: "dialog.frame",
    props: {
        options: {
            type: Object,
            default() {
                return {
                    editForm: {},
                    addForm: {}
                }
            }
        }
    },
    data() {
        return {
            visible: false,
            title: "",
            fields: [],
            data: {},
            scope: {},
            formOption: {},
            //父元素上的options
            pageOptions: null,
            inited: false,

            useDataHandlers: {}
        }
    },
    watch: {
        options: {
            handler(nv) {
                // this.init(nv)
            },
            immediate: true
        }
    },
    // computed:{
    //     /**
    //      * 获得父元素上的pageoptions，直接查找到list.frame
    //      */
    //     pageOptions(){
    //
    //     }
    // },
    render(createElement, context) {
        return !this.visible ? <div/> : <el-dialog
            visible={this.visible}
            fullscreen={this.formOption?.style?.dialogWidth === 'fullscreen'}
            title={this.title}
            width={this.formOption?.style?.dialogWidth || 'auto'}
            {...{
                on: {
                    "update:visible": val => this.visible = val
                }
            }}
        >
            <el-page-header
                slot="title"
                {...{on: {back: () => this.visible = false}}}
                content={this.title}/>
            {/*因为命名会冲突，所以优先使用这个*/}
            <div style={{width: this.formOption?.style?.formWidth || "auto", margin: "0 auto"}}>
                {this.formOption?.renderForm?.call(null, this.$createElement, this, {}) || this.renderForm({action: true})}
            </div>

        </el-dialog>
    },
    methods: {
        renderForm(params = {}) {
            const {exclude, include, readonly = false, action = false} = params;
            var fields = this.fields
            if (include) {
                //白名单模式
                fields = this.fields.filter(f => {
                    return include.filter(inf => {
                        if (typeof inf == 'string') {
                            return inf === f.name
                        }
                        if (inf instanceof RegExp) {
                            return inf.test(f.name)
                        }
                        //default
                        return inf.name === f.name
                    }).length > 0
                })
            }
            if (exclude) {
                //黑名单模式
                fields = this.fields.filter(f => {
                    return exclude.filter(enf => {
                        if (typeof enf == 'string') {
                            return enf === f.name
                        }
                        if (enf instanceof RegExp) {
                            return enf.test(f.name)
                        }
                        return enf.name === f.name
                    }).length === 0
                })
            }
            //使用副本
            fields = fields.map(e => {
                var newE = {...e}
                newE.readonly = e.readonly || readonly
                return newE
            })
            // console.log("in/excluded fields is", include, exclude, fields)
            return (<el-form label-width={this.formOption?.style?.labelWidth || '150px'}>
                <el-row style={{...(this.formOption?.style || {})}}>
                    {fields.map(v => (
                        [
                            <el-col span={v.span || 24}>
                            {
                                <el-form-item label={v.label}>
                                    {
                                        v.render?.call(null, this.$createElement, this, {
                                            field: v,
                                            scope: this.scope[v.name],
                                            data: this.data[v.name],
                                            mock: this.pageOptions.mock
                                        }) ||
                                        <el-input v-model={this.data[v.name]} disabled={v.readonly}/>
                                    }
                                </el-form-item>
                            }
                            </el-col>,
                            v.skipSpan > 0 ? <el-col span={v.skipSpan}><el-form-item><el-input style="visibility: hidden"/></el-form-item></el-col> : undefined
                        ]
                    ))}
                </el-row>
                {this.inited = this.inited || true}
                {action && this.renderFormAction()}
            </el-form>)
        },

        renderFormAction() {
            console.log("parent is", this.pageOptions)
            return <div style="text-align: center; margin-top: 10px;">
                <el-button type="primary" icon="el-icon-edit" onClick={this.submit}>提交</el-button>
            </div>
        },


        /** unrender methods **/
        async init(nv) {
            this.inited = false
            this.useDataHandlers = {}
            this.formOption = nv

            //计算父元素上的options
            var t = this
            while(t != null && t.$options.name != "list.frame"){
                t = t.$parent
            }
            this.pageOptions =  t.options

            // var t = this
            // var f = nv.fields?.map(e => {
            //     data[e.name] = ""
            //     scope[e.name] = {}
            //     if (e.render) {
            //         //做出组件
            //         var newE = {...e}
            //         var inited = false
            //         const useEffect = (cb) => {
            //             if (inited) {
            //                 return
            //             }
            //             inited = true
            //             cb()
            //         }
            //         newE.render = function (h,t,p){
            //             p.useEffect = useEffect
            //             return e.render(h,t,p)
            //         }
            //         return newE
            //     } else {
            //         return {...e}
            //     }
            // }) || []
            console.log("form option is", nv)
            const scope = {}, data = {}
            nv.fields?.forEach(e => {
                if (e.scope) {
                    if (typeof e.scope === 'function') {
                        scope[e.name] = e.scope()
                    } else {
                        scope[e.name] = JSON.parse(JSON.stringify(e.scope))
                    }
                } else {
                    scope[e.name] = ""
                }
                if (e.data) {
                    if (typeof e.data === 'function') {
                        data[e.name] = e.data()
                    } else {
                        data[e.name] = JSON.parse(JSON.stringify(e.data))
                    }
                } else {
                    data[e.name] = ""
                }
            })
            this.data = data
            this.scope = scope

            this.fields = await Promise.all((nv.fields || []).map(async e => {
                var newE = {...e}
                if (AdvanceComponent.isAdvanceComponent(e.render)) {
                    newE.render = await e.render.newInstance(this, {field: newE} )
                    this.useDataHandlers[e.name] = newE.render
                    // newE.render = await e.render?.init(this.$createElement, this, {field: e, useData, self: e.render})
                    // newE.$render = await e.render?.call(this.$createElement, this, {field: e, useData, self: e.render})
                }
                // if (e.render ) {
                //     console.log("e.render is ", e.render.toString())
                //     if (e.render.toString().match(/_.+\.apply/) || e.render.toString().match(/return\s+function/)) {
                //         newE.render = await e.render(this.$createElement, this, {field: e})
                //         console.log(newE)
                //     }
                // }
                return newE
            }))
            console.log("dialog inited: ", this)
            this.title = nv.title || ""

            // if (this.formOption?.render instanceof AdvanceComponent) {
            if (AdvanceComponent.isAdvanceComponent(this.formOption?.render)) {
                // this.$render = await this.formOption?.render?.init(this.$createElement, this, {self: this.formOption.render})
                this.formOption.render = await this.formOption?.render?.newInstance(this, {})
            }

            //handle renderForm
            if (AdvanceComponent.isAdvanceComponent(this.formOption?.renderForm)) {
                // if(this.formOption?.renderForm instanceof AdvanceComponent){
                this.formOption.renderForm = await this.formOption?.renderForm?.newInstance(this, {options: this.formOption})
            }
        },
        showAdd() {
            this.init(this.options.addForm)
            this.visible = true
        },
        showEdit() {
            this.init(this.options.editForm)
            this.visible = true
        },
        //一般用
        async show(id) {
            console.log("show", this.options)
            await this.init(this.options)
            if (id) {
                //获取数据
                // var r = await this.$get(this.options.findUrl, {id})
                var r = await doFindRequest(this, this.options.findUrl, {id})
                this.data = Object.assign(this.data, r)
                console.log("find data is", this.data)
                //触发usedata
                Object.values(this.useDataHandlers).forEach(h => {
                    h.useData(this)
                })
            }
            this.visible = true
            console.log(this.data)
        },

        hide() {
            this.visible = false
        },

        async submit() {
            console.log(this.options)
            // await this.$post(this.options.saveUrl, this.data)
            if(this.data.id){
                await doUpdateRequest(this, this.options.saveUrl, this.data)
            } else {
                await doCreateRequest(this, this.options.saveUrl, this.data)
            }
            this.$message.success("提交成功")
            this.$emit("ok")
            this.visible = false
        },
    }
}
</script>

<style scoped>
.form {
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: auto auto;
    padding-right: 50px;
}

/deep/ .el-select {
    display: block;
}

/deep/ .el-cascader {
    display: block;
}

/deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
}

/deep/ .el-input-number--mini {
    width: 100%;
}

/deep/ .el-dialog {
    display: flex;
    overflow: hidden;
    flex-direction: column;
}

/deep/ .el-dialog__body {
    overflow: auto;
    flex: 1;
}

</style>