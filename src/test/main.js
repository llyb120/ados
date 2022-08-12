import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element, {size: 'mini', zIndex: 3000});

import router from './router'

Vue.config.productionTip = false

//修复jquery
var fn = $.ajax;
$.ajax = function (args) {
    args.headers = args.headers || {};
    args.headers['bpm-token'] = localStorage.getItem("bpm-token")


    //修复post传json的问题
    if (args.type && args.type.toLowerCase() === 'post') {
        if (args.data && args.data.length > 0 && args.data.charAt(0) === '{') {
            args.contentType = 'application/json';
        }
    }

    // if((args.method || 'get').toLowerCase() === 'post'){
    //     args.contentType = 'application/json';
    // }
    return fn(args);
};

Vue.prototype.$clone = function (obj) {
    return JSON.parse(JSON.stringify(obj))
}
Vue.prototype.$post = function (url, data) {
    var t = this;
    // console.log(url)
    return new Promise(function (resolve, reject) {
        $.ajax({
            type:"POST",
            url:url,
            contentType:"application/json",
            data: JSON.stringify(data)
        }).then(r => {
            if(!r.success){
                let bool = false
                if(r.errMessage != null){
                    bool = true
                    t.$notify.error(r.errMessage)

                }
                reject(bool)
            } else {
                resolve(r.data)
            }
        }).fail(e => {
            reject(e)
        })
    });
}
Vue.prototype.$get = function (url, data) {
    var t = this;
    // console.log(url)
    return new Promise(function (resolve, reject) {
        $.ajax({
            type:"GET",
            url:url,
            data,
        }).then(r => {
            if(!r.success){
                t.$notify.error(r.errMessage)
                reject()
            } else {
                resolve(r.data)
            }
        }).fail(e => {
            console.log(e)
            reject(e)
        })
    });
}


import {Ados} from "../index"
Vue.use(Ados)

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')