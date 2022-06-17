import {handleScopeAndData} from "./base";

/**
 * 高阶组件定义类
 *
 */
export class AdvanceComponent {
    /**
     * 真正的渲染工厂
     */
    renderFactory;
    /**
     * 如果存在useData，则调用
     */
    useDataHandler;
    /**
     * 简易构造器
     */
    simpleConstructor;

    // constructor(renderFactory) {
    //     console.log("factory is ", renderFactory)
    //     this.renderFactory = renderFactory
    //     await this.init()
    // }

    static async newInstance(t, params) {
        var ins = new this()
        params.self = ins
        const useData = (callback) => {
            ins.useDataHandler = callback
        }
        params.useData = useData
        //给类声明的用
        await ins.init(t, params)
        //给简易声明的用
        ins.renderFactory = await ins.simpleConstructor?.call(this, t, params)
        // ins.useDataHandler = params.useData || null
        return ins
    }

    async init(t, {field = null, options = null}){}

    async useData(t){
        await this.useDataHandler?.call()
    }

    /**
     * 高阶组件的渲染函数，通过工厂来进行创建
     * @param h
     * @param t
     * @param params
     * @returns {*}
     */
    render(h, t, {field = null, options = null}){
        return this.renderFactory?.call(this, arguments[0], arguments[1], arguments[2])
    }

    /**
     * 给外部调用的，不应该被重写
     *
     * @param ptr
     * @param h
     * @param t
     * @param params
     * @returns {*}
     */
    call(ptr,h,t,params){
        return this.render(arguments[1], arguments[2], arguments[3])
    }

    /**
     * 检查是否高阶组件的子类
     *
     * @param target
     * @returns {boolean}
     */
    static isAdvanceComponent(target){
        return target != null && target.prototype instanceof AdvanceComponent
    }

    static async initAdvanceComponents(t,fields = [], initData = false){
        return await Promise.all(fields.map(async e => {
            var newE = {...e}
            if (AdvanceComponent.isAdvanceComponent(e.render)) {
                //高阶组件自己在内部处理属性
                newE.render = await e.render.newInstance(t, {field: newE})
                // newE.$render = await e.render?.call(this.$createElement, this, {field: e, useData})
            } else {
                //普通组件使用默认的属性处理器
                if(initData){
                    handleScopeAndData(t, e)
                }
            }
            return newE
        }))
    }

    // render(h,t,params){
    //     return this.realRender.call(this, h, t, params)
    // }
}


/**
 * 高阶组件构造
 *
 * @param callback
 * @returns {AdvanceComponent}
 * @constructor
 */
export function Advanced(callback) {
    return class extends AdvanceComponent{
        simpleConstructor = callback
        // renderFactory = callback
        // init(h, t, params) {
        //     this.renderFactory = callback(h, t, params)
        //     this.useDataHandler = params.useData
        // }
    }
}
