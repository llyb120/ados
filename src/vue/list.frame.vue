<!--<template>-->
<!--</template>-->
<script>
import EditDialog from "./dialog.frame"
import {BaseSearchLayout, handleScopeAndData} from "../base";
import {AdvanceComponent, NoneLayout} from "../index";
import {generateRandomPageList} from "../mock";
import {doDeleteRequest, doPageRequest} from "../request";

export default {
    name: "list.frame",
    components: {DialogFrame: EditDialog},
    props: {
        options: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            data: {},
            scope: {},
            list: [],
            total: 0,
            handleSelection: [],
            page: {
                page: 1,
                size: 20
            },
            loading: false,

            searchFields: [],
            listFields: [],
            useDataHandlers: {},
            inited: false
        }
    },
    watch: {
        options: {
            immediate: true,
            handler(nv) {
                if(!nv){
                    return
                }
                this.initQueryParams()
            }
        }
    },
    computed:{
        pageOptions(){
            return this.options
        }
    },
    render(h, ctx) {
        if (!this.inited) {
            return <div/>
        }
        return <el-card>
            <div>
                <el-card className="card options">
                    {this.renderSearchPart()}
                </el-card>
                <el-card className="card">
                    <div style="margin-bottom: 20px;">
                        {this.options.list?.renderToolbar?.call(null, this.$createElement, this) || this.renderToolbar()}
                    </div>
                    <el-table border
                              data={this.list}
                              {...{
                                  on: {
                                      "selection-change": (val) => {
                                          this.handleSelection = []
                                          val.forEach(k => {
                                              this.handleSelection.push(k[this.options.list?.key || 'id'])
                                          })
                                          console.log(this.handleSelection)
                                      }
                                  }
                              }}
                    >
                        <el-table-column type="selection"/>
                        <el-table-column type="index"/>
                        <el-table-column label="操作"
                                         min-width="50px"
                                         width={this.options.list?.style?.actionWidth || 'auto'}
                                         scopedSlots={{
                                             default: props => {
                                                 return this.options.list?.renderAction?.call(null, this.$createElement, this, {props}) || this.renderAction(props)
                                             }
                                         }}
                        >
                        </el-table-column>
                        {
                            this.listFields.filter(v => {
                                return !(v.render instanceof NoneLayout)
                            }).map(v => (
                                <el-table-column label={v.label} prop={v.name}
                                                 width={v.width || 'auto'}
                                                 scopedSlots={{
                                                     default: props => {
                                                         return <span>
                                                          {v.value?.call(null, props.row) || (v.translate ? props.row[v.name + "_translate"] : props.row[v.name])}
                                                      </span>
                                                     }
                                                 }}
                                />)
                            )
                        }
                    </el-table>
                    <div style="text-align: right; margin-top: 20px;">
                        <el-pagination
                            background
                            layout="prev, pager, next"
                            total={this.total}
                            current-page={this.page.page}
                            {...{
                                on: {
                                    // "update:current-page": val => this.page.page = val,
                                    "current-change": this.load
                                }
                            }}
                            page-size={this.page.size}
                        >
                        </el-pagination>
                    </div>
                </el-card>
            </div>
            <dialog-frame ref="addDialog" options={this.options.addForm} {...{on: {"ok": () => this.load()}}} />
            {
                this.options.editForm ?
                    <dialog-frame ref="editDialog"
                                  options={this.options.editForm} {...{on: {"ok": () => this.load()}}} /> :
                    <template/>
            }

            {
                Object.values(this.options.external || {}).map(e => {
                    //render命名会冲突
                    var options = {...e}
                    delete options.render
                    return e.render(this.$createElement, this, {options})
                })
            }
        </el-card>
    },
    methods: {
        /**
         * 渲染搜索大块
         * @returns {*}
         */
        renderSearchPart() {
            return (this.options.search?.render || BaseSearchLayout).call(null, this.$createElement, this, {...(this.options.search || {})})
        },
        /**
         * 渲染搜索表单
         * @param fields
         * @returns {unknown[]}
         */
        renderSearchForm() {
            //暂时先用searchFields
            return this.searchFields
                .filter(v => !(v.render instanceof NoneLayout))
                .map(v => {
                try{
                    return (
                        <el-form-item label={v.label}>
                            {
                                (v.$render || v.render)?.call(null, this.$createElement, this, {field: v}) ||
                                <el-input value={this.data[v.name]} oninput={value => this.data[v.name] = value}
                                          placeholder={v.placeholder || ''}/>
                            }
                        </el-form-item>
                    )
                } catch (e) {
                    console.error(e, v)
                }
            })
        },

        renderSearchAction(){
          return [<div>
            <el-button type="normal" onclick={this.initQueryParams}>重置</el-button>
            <el-button type="primary" onclick={_ => this.load()} loading={this.loading}>提交</el-button>
          </div>]
        },

        /**
         * 渲染工具栏
         *
         * @returns {JSX.Element}
         */
        renderToolbar() {
            return <div>
                <el-button type="primary"
                           icon="el-icon-edit"
                           onclick={() => this.$refs.addDialog.show()}>{this.options?.addForm?.title}</el-button>
                {
                    this.handleSelection.length ?
                        <el-button icon="el-icon-delete" type="danger" onclick={this.rm}>批量删除</el-button> : <div></div>
                }
            </div>
        },

        renderAction(props) {
            return <el-button type="text"
                              onclick={() => this.edit(props.row)}>编辑</el-button>
        },


        /**
         * 初始化搜索条件
         */
        async initQueryParams() {
            /**
             * 这一步的目的是为了让vue认识这些属性
             * @type {{}}
             */
            var data = {}, scope = {}
            this.options.search?.fields.forEach(e => {
                data[e.name] = ""
                scope[e.name] = ""
            })
            this.data = data
            this.scope = scope

            /**
             * 这里暂时不需要这个， 但是不能报错
             * @param callback
             */
            // const useData = (callback) => {
            // this.useDataHandlers
            // }
            this.searchFields = await AdvanceComponent.initAdvanceComponents(this, this.options?.search?.fields, true)
            this.listFields = await AdvanceComponent.initAdvanceComponents(this, this.options?.list?.fields, false)

            if(AdvanceComponent.isAdvanceComponent(this.options.search?.render)){
                this.options.search.render = await this.options.search.render.newInstance(this, {...this.options.search})
            }

            // var fields = this.options.list.fields;
            //  = this.options.list?.fields?.map(e => {
            //     if(e.translate){
            //         return {...e, name: e.name + "_translate"}
            //     } else {
            //         return e
            //     }
            // })


            console.log("init options is ", this.options, this)
            this.inited = true
        },

        edit(row) {
            console.log("edit is ", row)
            var key = this.options.list?.key || 'id'
            var id = row[key]
            this.$refs.editDialog.show(id)
        },
        async rm() {
            if (this.handleSelection.length === 0) {
                return
            }
            await this.$confirm('此操作将永久删除该项, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
            await doDeleteRequest(this, this.options.list?.deleteUrl, this.handleSelection)
            // this.$post(this.options.list?.deleteUrl, this.handleSelection)
            this.load()
        },
        async load(pageNumber = 1) {
            if(this.options.mock){
                generateRandomPageList(this.options)
            }
            this.loading = true
            try {
                this.page.page = pageNumber
                var r = await doPageRequest(this, this.options.list.requestUrl, {...this.data, ...this.page})
                console.log("r is", r)
                var tran = {}
                this.options.list?.fields?.forEach(e => {
                    if (e.translate) {
                        if (typeof e.translate === 'string') {
                            tran[e.name] = e[e.translate]
                        } else {
                            tran[e.name] = e.translate
                        }
                    }
                })
                console.log("tran is ", tran)
                this.list = r.records?.map(e => {
                    //处理数据
                    //主要处理枚举数据
                    for (var i in e) {
                        if (tran[i]) {
                            e[i + "_translate"] = tran[i][e[i]]
                        }
                    }
                    return e;
                })
                this.total = Number(r.total)
            } finally {
                this.loading = false
            }
        }

    },
    mounted() {
        this.load()
    }
}
</script>

<style scoped lang="less">
.card {
    margin: 20px;
}

/deep/ .options .el-form-item {
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 0;

    .el-form-item__label {
        margin-top: 8px;
        margin-bottom: 4px;
    }
}

.row {
    display: grid;
    grid-template-columns: repeat(6, 16.66%);
}

/deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
}

/deep/ .options .el-select {
    width: 100%;
}
</style>