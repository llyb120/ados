# Ados
ados基于vue和ElementUI，为敏捷开发提供辅助功能

## 快速安装
```npm
yarn add git+https://github.com/llyb120/ados
```
将Ados的相关依赖添加入package.json中，由于使用了jsx，你需要额外加入对jsx的支持，可参考本项目中对jsx支持的配置

```javascript
import {Ados} from "ados"
Vue.use(Ados)
```


## 基础容器
提供 **list.frame** 以及 **dialog.frame**两个基础组件，后者通常不需要手动引入

```vue
<list.frame :options="options" v-if="options"/>
```

## Options 参数
options 接受五个参数，如下

```json5
{
  "search": {
    //配置搜索布局相关 
  },
  "list": {
    //配置分页列表布局相关
  },
  "addForm": {
    //配置新建表单相关
  },
  "editForm": {
    //配置编辑表单相关
  },
  "external": {
    //如果有额外自定义的dialog，在这里配置   
  }
}
```

### search布局
定义如下

* fields Array，需要输入的表单字段
* render Component 重写渲染函数，如不提供默认为BaseSearchLayout
* span int 每行共分多少块，例如5则分5块，每块长度20%

### list布局
* fields Array, 需要显示的表单字段

如果字段中出现了translate属性，则会进行enum的转译，例如
```json5
//通常配合select使用
{
  name: "enum",
  label: "枚举",
  options: {
    A: "状态A",
    B: "状态B"
  },
  translate: "options" //该字段指向options属性
}
```
```json5
//通常单独使用
{
  name: "enum",
  label: "枚举",
  translate: {
    A: "状态A",
    B: "状态B"
  }
}
```

* key 列表每行的唯一标识，供批量删除以及编辑使用，默认为id
* requestUrl 列表拉取数据的接口
* deleteUrl 批量删除的接口
* renderAction 可重写该函数提供一个布局，替换操作内的按钮
* renderToolbar 重写该函数提供一个布局，替换表格上方的按钮

### addForm/editForm布局
定义如下

* fields Array，表单每一个字段的定义
* render 重写该函数提供一个布局，替换表单布局
* title 对话框上方的标题
* findUrl 仅editForm可用，用于编辑时拉取数据
* saveUrl 点击提交按钮时请求的地址
* style 配置页面样式
```json5
{
  style:{
    dialogWidth: "fullscreen 或者 具体的宽度，例如800px",
    formWidth: "表单长度，例如800px"
  }
}
```

### external布局
external提供多个自定义的dialog，例如
```javascript
const example = {
    external:{
        DIALOG1: {
            /**
             * 由于render函数占用了editForm的render，所以如需要重写表单布局，使用renderForm 
             */
            render(h,t,{params}){
                return <dialog-frame />
            },
            renderForm(h,t){
                return <div/>
            }
            //其余属性和editForm共享
        }        
    }
}
```


## fields定义
定义如下
```json5 
{
  name: "字段名",
  label: "显示名", 
  readonly: false, //字段是否只读，默认为false
  render: xxx, //字段布局
  span: 24, //给editForm提供的栅格，总长为24
  value: (Object) => Object //通常，如果直接取值不能满足需求，该方法会触发，自定义一个取值显示规则,
  data: Function | Object | Others,
  generator: Function //处于mock模式下，addForm的generator会自动帮助用户生成测试数据
}
```
可以用data属性定义默认的值，data接受3种参数，并返回一个包含scope和data的对象，例如
```javascript
f = {
    data:{
        scope:1,
        data: 2
    }
}
f = {
    data(){
        return {
            scope: 1,
            data: 2
        }
    }
}
f = {
    data: 3
}
```
通常，如果你不需要使用scope的时候，可以直接返回一个值，此时仅会赋值给t.data

**注意: 高阶组件不会使用该内容，而是需要看组件编写者是否支持该字段的处理**

## 基础组件
组件以function的形式定义，返回一个jsx的布局，例如
```javascript
/**
 * 该函数必须有一个h和t的参数
 * h 为vue的$craeteElement,
 * t 为最外层的this指针,
 * 第三个参数可根据调用的不同自定义，通常有field等等
 */
export function SimpleComponent(h,t,{field}){
    return <el-input value={t.data[field.name]} oninput={v => t.data[field.name] = v}/>
}
```

## 高阶组件
当组件需要维护自己的状态（例如初始化定义一些内容，或者根据数据的不同进行改变）时，可定义高阶组件，约定：高阶组件的函数名以$开头，并返回一个基础组件
```javascript
export const $AdvanceComponent = Advanced(async (t,{field, useData}) => {
    /**
     * 可在之类做一些属性初始化，例如
     */
    //scope为定义的临时数据区
    t.scope[field.name] = {
        prop1: "xxx",
        prop2: "xxx"
    }
    //data为最终提交的数据区
    t.data[field.name] = "xxx"
    //调用useData进行传值时的回调
    //通常为了以服务器的data进行scope的还原
    useData(() => {
        t.scope[field.name] = "xxx"
    })
    //do sth...
    //以上代码只会在初始化的时候执行一次，useData在每次load数据的时候执行一次
    
    return function (h,t){
        return <div/>
    } 
})
```

## 高阶组件的复用
高阶组件本质上是一个继承于AdvanceComponent的类，你可以使用构造参数传递一个高阶组件定义，或是重写init方法提供一个高阶组件定义
```javascript
class Test extends AdvanceComponent {

    init(t, params){
        //初始化时调用 
    }

    useData(t){
        //当被赋值的时候调用
    }

    render(h,t,{}){
        return <div>
            {this.getText()}
        </div>
    }

    getText(){
        return "123"
    }
}
```
这也就决定了它是可以复用的，我们可以使用extends来继承该组件，重写该组件的某些方法达到复用的结果
```javascript

export class $Test2 extends Test {

    getText() {
        return "444" + super.getText()
    }
    
    init(t, params){
        //初始化时调用 
    }
    
    useData(t){
        //当被赋值的时候调用
    }

}
```

## Mock
多数时候，如果你并不是急于编写服务端，你可以使用ados提供的mock功能来制作一个原型，在options中加入mock参数，而正式上线的时候只需要取消mock即可
```javascript
export const options = {
    mock:  {
        name: "test",
        // force: true,
        api: {
            "/api/test": function (){
                //可在此定义你的api，mock的时候会自动调用    
            },
            /**
             * 在create的时候附加字段
             */
            onCreate(data){
            },
            onPage(list){
                //补充page的额外字段
            }
        }
    }
}
```


## 其余说明
任何时候，当你重写一个布局的时候，你都可以调用原布局（即t)上的render系列函数，来进行复用，例如
```jsx
<el-divider content-position="left">基本信息填写</el-divider>
<div>
    {/* 渲染表单中，不包括state开头的部分 */}
    {t.renderForm({exclude: [/state\d.+/], readonly: t.data.state !== 'HANDLING'})}
</div>
<el-divider content-position="left">一级审批</el-divider>
<div>
    {/* 渲染表单中，只包括state1开头的部分 */}
    {t.renderForm({include: [/state1.+/], readonly: t.data.state !== 'HANDLE_STATE_1'})}
</div>
```