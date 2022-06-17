import {AdvanceComponent, Advanced} from "./component";
import {doGet} from "./request";

const getBaseSearchLayoutSpan = function (span = 6) {
    return `repeat(${span}, ${100 / span}%)`
}

export function BaseSearchLayout(h, t, {span}) {
    return (
        <el-form className="form">
            <div style={{display: "grid", "grid-template-columns": getBaseSearchLayoutSpan(span)}}>
                {t.renderSearchForm()}
            </div>
            <div style="text-align: center; margin-top: 20px">
                <el-button type="normal" onclick={t.initQueryParams}>重置</el-button>
                <el-button type="primary" onclick={_ => t.load()} loading={t.loading}>提交</el-button>
            </div>
        </el-form>
    )
}

export * from "./layout/BaseSearchLayout"


const readFile = function (file, callback) {
    var fr = new FileReader()
    fr.onload = function (e) {
        callback(fr.result)
    }
    fr.readAsDataURL(file)
}

/**
 * 图片上传组件
 *
 * @returns {function(*, *, {field: *})}
 * @constructor
 */
export function ImageUploadComponent(h, t, {field}) {
    // useEffect(() => {
    //     console.log("inited")
    //     t.scope[fieldName] = {
    //         imgUrl: ""
    //     }
    // })
    // var scope = t.scope[fieldName]
    const fieldName = field.name
    const choose = function () {
        $("<input type='file'/>").change(function (e) {
            var f = e.target.files[0]
            readFile(f, (result) => {
                t.data[fieldName] = result
            })
        }).click()
    }
    return (
        <div>
            {
                !field.readonly ? (
                    <span>
                        <el-button icon="el-icon-edit" type="primary" onclick={choose}>选择图片</el-button>
                        <el-button icon="el-icon-delete" type="danger"
                                   onclick={() => t.data[fieldName] = ""}>清空图片</el-button>
                    </span>
                ) : <span/>
            }
            {
                t.data[fieldName] ? <img src={t.data[fieldName]} className="avatar" style={{
                    width: "360px",
                    height: "180px",
                    display: "block",
                    marginTop: "20px"
                }}/> : <div></div>
            }
        </div>
    )
}

/**
 * 用于自定义组件时处理初始值，也可以不用自己定义
 *
 * @param t
 * @param field
 */
export function handleScopeAndData(t, field) {
    //scope and data
    if (!field.data) {
        return
    }
    switch (typeof field.data) {
        case "function":
            var {scope, data} = field.data()
            t.data[field.name] = data
            t.scope[field.name] = scope
            break
        case "object":
            var {scope, data} = JSON.parse(JSON.stringify(field.data))
            t.data[field.name] = data
            t.scope[field.name] = scope
            break
        default:
            //默认情况下可以不用scope
            t.data[field.name] = field.data
            break
    }
}

export const $DatePickerComponent = Advanced((t, {field, useData}) => {
    console.log("field is", field)
    if (field.range) {
        t.scope[field.name] = []
        t.data[field.keys[0]] = ""
        t.data[field.keys[1]] = ""
    } else {
        t.scope[field.name] = ""
    }
    //如果给了默认值，那么无视配置，以用户配置的为准
    //即使用户提供的可能会出错
    handleScopeAndData(t, field)
    console.log("t is", t)
    useData(() => {
        t.scope[field.name] = t.data[field.name]
    })
    return function (h, t, {field}) {
        return <el-date-picker
            value={t.scope[field.name]}
            oninput={value => {
                // console.log(value)
                if (field.range) {
                    t.scope[field.name] = value
                    t.data[field.keys[0]] = value[0]
                    t.data[field.keys[1]] = value[1]
                } else {
                    t.scope[field.name] = value
                    t.data[field.name] = value
                }
            }}
            value-format="yyyy-MM-dd"
            disabled={field.readonly}
            props={{
                ...(field.range ? {
                    type: "daterange",
                    "range-separator": "至",
                    "start-placeholder": "开始日期",
                    "end-placeholder": "结束日期"
                } : {
                    type: "date"
                })
            }}
            placeholder="选择日期">
        </el-date-picker>
    }
})

export function TextareaComponent(h, t, {field}) {
    return <el-input
        disabled={field.readonly}
        type="textarea" row={4} value={t.data[field.name]} oninput={v => t.$set(t.data, field.name, v)}/>
}

// export function TextareaComponent2(t, params = {}){
//     //初始化
//     return function (h,t){
//
//     }
// }

export function SelectComponent(h, t, {field}) {
    // console.log("select: field is", field, t)
    return <el-select
        disabled={field.readonly}
        // disabled
        // props={{
        //     disabled: !!field.readonly
        //     }}
        // disabled={!!field.readonly}
        // v-model={t.data[field.name]}
        onchange={v => t.$set(t.data, field.name, v)}
        value={t.data[field.name]}
        clearable={true}
    >
        {
            Object.keys(field.options).map(k => <el-option value={k} label={field.options[k]}/>)
        }
    </el-select>
}


/**
 * 选择支行，其实就是部门中加了支行的
 *
 *
 * @param h
 * @param t
 * @param field
 * @param useData
 * @returns {function(*, *)}
 */
export const $ZhiHangPicker = Advanced((t, {field, useData}) => {
    const scope = t.scope[field.name] = {
        loading: false,
        options: [],
        value: "",
        list: []
    }
    t.data[field.name] = ""
    const handleSelect = function () {
        t.data[field.name] = scope.value
    }
    var timer;
    const querySearch = (queryString) => {
        if (timer != null) {
            clearTimeout(timer)
        }
        timer = setTimeout(async () => {
            scope.loading = true
            if (queryString === "支行") {
                queryString = "支行$"
            }
            var r = await doGet(t, "/loi/util/fetchDeps", {keyword: queryString})
            scope.loading = false
            console.log(r, scope)
            scope.options = r.map(e => ({value: e.id, label: e.name}))
        }, 100)
        console.log(queryString)
    }
    querySearch("支行")

    useData(async _ => {
        var r = await doGet(t, "/loi/util/findDep", {id: t.data[field.name]})
        if (r) {
            scope.options = [{value: r.id, label: r.name}]
            scope.value = r.id
            t.data[field.name] = r.id
        }
    })
    return function (h, t) {
        return <div>
            <el-select
                value={scope.value}
                oninput={v => scope.value = v}
                onchange={handleSelect}
                filterable
                remote
                placeholder="请输入关键词"
                remote-method={querySearch}
                clearable
                loading={scope.loading}
            >
                {
                    scope.options.map(v => {
                        return <el-option key={v.value} value={v.value} label={v.label}/>
                    })
                }
            </el-select>
        </div>
    }
})

/**
 * 用户选择
 */
export const $UserSelectPickerComponent = Advanced((t, {field, useData}) => {
    const scope = t.scope[field.name] = {
        loading: false,
        options: [],
        value: "",
        list: []
    }
    t.data[field.name] = ""
    const handleSelect = function () {
        t.data[field.name] = scope.value
    }
    var timer;
    const querySearch = (queryString) => {
        if (timer != null) {
            clearTimeout(timer)
        }
        if (!queryString) {
            return
        }
        timer = setTimeout(async () => {
            scope.loading = true
            // if (queryString === "支行") {
            //     queryString = "支行$"
            // }
            var r = await t.$get("/loi/util/fetchUsers", {keyword: queryString})
            scope.loading = false
            console.log(r, scope)
            scope.options = r.map(e => ({value: e.id, label: e.name}))
        }, 100)
        console.log(queryString)
    }
    // querySearch("支行")

    useData(async _ => {
        var r = await t.$get("/loi/util/findUser", {id: t.data[field.name]})
        if (r) {
            scope.options = [{value: r.id, label: r.name}]
            scope.value = r.id
            t.data[field.name] = r.id
        }
    })
    return function (h, t) {
        return <div>
            <el-select
                value={scope.value}
                oninput={v => scope.value = v}
                onchange={handleSelect}
                filterable
                remote
                placeholder="请输入关键词"
                remote-method={querySearch}
                clearable
                loading={scope.loading}
            >
                {
                    scope.options.map(v => {
                        return <el-option key={v.value} value={v.value} label={v.label}/>
                    })
                }
            </el-select>
        </div>
    }
})


export class NoneLayout extends AdvanceComponent {
}
