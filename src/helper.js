import {AdvanceComponent} from "./component";

const walkObject = (origin, target) => {
    for(var i in target){
        if(!origin[i]){
            origin[i] = target[i]
            continue
        }
        if(target[i] instanceof AppendArrayCommand && Array.isArray(origin[i])) {
            if(target[i].pos === -1){
                origin[i] = origin[i].concat(target[i].fields)
            }  else {
                origin[i].splice(target[i].pos, 0, target[i].fields)
            }
            continue
        }
        if(typeof target[i] === "object" && !Array.isArray(target[i])){
            walkObject(origin[i], target[i])
            // for(var j in target[i]){
            //     walkObject(origin[i][j], target[i][j])
            // }
        } else {
            origin[i] = target[i]
        }
    }
}

export function extendsObject(object, override = {}){
    var obj = {}
    deepClone(object, obj)
    walkObject(obj, override)
    // console.log("obj is ", obj)
    // // return  obj;
    // for(var key in override){
    //     var path = key.split(".")
    //     if(path.length === 1){
    //         obj[path[0]] = override[key]
    //     } else if(path.length > 1){
    //         var _obj = obj
    //         for(var i = 0; i < path.length - 1; i++){
    //             _obj = _obj[path[i]]
    //         }
    //         _obj[path[path.length - 1]] = override[key]
    //     }
    // }
    // console.log(obj)
    console.log("final copied object is ", object, obj)
    return obj
}

/**
 * 精湛的妖健深拷贝
 *
 *
 * @param orig
 * @returns {any}
 */
export function deepClone(origin, target){
    var target = target || {},
        toStr = Object.prototype.toString,
        arrStr = "[object Array]";
    for(var prop in origin){
        if(origin.hasOwnProperty(prop)){
            /**
             * 高阶组件不能被拷贝
             */
            if(AdvanceComponent.isAdvanceComponent(origin[prop])){
                target[prop] = origin[prop]
                continue
            }
            // if(origin[prop] instanceof AdvanceComponent){
            // }
            if(origin[prop] !== "null" && typeof(origin[prop]) == "object") {
                target[prop] = (toStr.call(origin[prop]) == arrStr) ? [] : {};
                deepClone(origin[prop],target[prop]);
            }else{
                //这里是默认function或其他的情况
                target[prop] = origin[prop]
            }
        }
    }
}

class AppendArrayCommand {
    pos = -1
    fields = []

    constructor(pos, fields) {
        this.pos = pos
        this.fields = fields
    }

}

export function appendArray(pos, ...fields){
    return new AppendArrayCommand(pos, fields)
}





/**
 * 标准化字段
 * 其实就是给每个字段添加了一个name属性，如果你书写name的话可以不需要
 *
 * @param fields
 * @returns {*}
 * @constructor
 */
export function NormalizeFields(fields) {
    for (var k in fields) {
        if (!fields[k].name) {
            fields[k].name = k
        }
    }
    return fields
}


