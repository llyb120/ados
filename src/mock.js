import {IdGenerator} from "./generate";

function getTableName(mock){
    return `${mock.name}-data`;
}

/**
 * 为该模型生成专属的数据
 * 保存在sessionStorage之中
 *
 */
export function generateRandomPageList(options){
    var mock = options.mock
    var table = getTableName(mock)
    var data
    if((data = sessionStorage.getItem(table)) && !mock.force){
        return
    }
    var db = []
    for(var i = 0; i < (mock.rows||10); i++){
        data = Object.fromEntries(options?.addForm?.fields.map(e => {
            if(!e.generator) {
                return [e.name, ""]
            }
            return [e.name, e.generator()]
        })) || {}
        if(!data.id){
            //如果没有id，为其生成一个id
            data.id = IdGenerator()
        }
        db.push(data)
    }
    sessionStorage.setItem(table, JSON.stringify(db))
}

function getDB(name){
    var list = sessionStorage.getItem(getTableName({name}))
    try{
        list = JSON.parse(list)
    } catch (e){
        list = []
    }
    return list
}

function setDB(name, data){
    sessionStorage.setItem(getTableName({name}), JSON.stringify([...data]))
}

export function fetchPageList(name,mock){
    var list = sessionStorage.getItem(getTableName({name}))
    try{
        list = JSON.parse(list)
    } catch (e){
        list = []
    }
    mock?.api?.onPage?.call(null, list)
    return {
        records: list,
        total: list.length
    }
}

export function deleteByIds(name, ids){
    var list = getDB(name)
    list = list.filter(e => !ids.includes(e.id))
    setDB(name, list)
}

export function create(name, data, mock){
    data.id = IdGenerator()
    var list = getDB(name)
    list.push(data)
    mock?.api?.onCreate?.call(null, data)
    setDB(name, list)
    console.log("create data is", data)
}

export function find(name, id){
    var list = getDB(name)
    return list.find(e => e.id === id)
}

export function update(name, data){
    var list = getDB(name)
    var pos = list.findIndex(e => e.id === data.id)
    if(pos === -1){
       return
    }
    list[pos] = Object.assign(list[pos], data)
    setDB(name, list)
}

