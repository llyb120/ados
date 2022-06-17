import {deleteByIds, fetchPageList, create, find, update} from "./mock";

export function doGet(t, url, data){
    var mock = t.pageOptions?.mock
    if(mock && mock.api[url]){
        var item = mock.api[url]
        if(typeof item == 'function'){
            return item(data)
        }
        return item
    }
    return new Promise(function (resolve, reject) {
        $.ajax({
            type:"GET",
            url:url,
            data,
        }).then(r => {
            if(!r.success){
                t.$message.error(r.errMessage)
                reject(r)
            } else {
                resolve(r.data)
            }
        }).fail(e => {
            console.log(e)
            reject(e)
        })
    });
}

export function doPost(t, url, data){
    var mock = t.pageOptions?.mock
    if(mock && mock.api[url]){
        var item = mock.api[url]
        if(typeof item == 'function'){
            return item()
        }
        return item
    }
    return new Promise(function (resolve, reject) {
        $.ajax({
            type:"POST",
            url:url,
            contentType:"application/json",
            data: JSON.stringify(data)
        }).then(r => {
            if(!r.success){
                t.$message.error(r.errMessage)
                reject(r)
            } else {
                resolve(r.data)
            }
        }).fail(e => {
            console.log(e)
            reject(e)
        })
    });
}

export function doPageRequest(t, url, data){
    if(t.pageOptions?.mock){
        return fetchPageList(t.pageOptions?.mock.name, t.pageOptions?.mock);
    }  else {
        return doGet(t, url, data)
    }
}

export function doDeleteRequest(t, url, data){
    if(t.pageOptions?.mock){
        return deleteByIds(t.pageOptions.mock.name, data)
    } else {
        return doPost(t, url, data)
    }
}

export function doCreateRequest(t, url, data){
    if(t.pageOptions?.mock){
        return create(t.pageOptions.mock.name, data, t.pageOptions?.mock)
    } else {
        return doPost(t, url, data)
    }
}

export function doUpdateRequest(t, url, data){
    if(t.pageOptions?.mock){
        return update(t.pageOptions.mock.name, data)
    } else {
        return doPost(t, url, data)
    }
}

export function doFindRequest(t, url, data){
    if(t.pageOptions?.mock){
        return find(t.pageOptions.mock.name, data.id)
    } else {
        return doGet(t, url, data)
    }
}