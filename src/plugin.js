import ListFrame from "./vue/list.frame"
import DialogFrame from "./vue/dialog.frame"


const fixSession = (function() {
    // 新打开一个tab标签页并通知其他标签页同步sessionStorage的数据到本标签页
    if (!sessionStorage.length) {
        // 这个调用能触发storage事件，从而达到共享数据的目的
        localStorage.setItem('syncSessionStorage', Date.now());
    };

    // 该事件是核心
    window.addEventListener('storage', function(event) {
        if (event.key === 'syncSessionStorage') {
            // 已存在的标签页会收到这个事件
            localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
            localStorage.removeItem('sessionStorage');

        } else if (event.key === 'sessionStorage' && !sessionStorage.length) {
            // 新开启的标签页会收到这个事件
            var data = JSON.parse(event.newValue);
            for (var key in data) {
                sessionStorage.setItem(key, data[key]);
            }
        }
    });
});

import AdosPage from "./vue/ados-page"
import AdosTable from "./vue/ados-table"
import AdosSearch from "./vue/ados-search"

export const Ados = {

    install: function (Vue){
        // alert(2)
        fixSession()

        Vue.component("AdosList", ListFrame)
        Vue.component("AdosDialog", DialogFrame)
        Vue.component("AdosPage", AdosPage)
        Vue.component("AdosTable", AdosTable)
        Vue.component("AdosSearch", AdosSearch)
    }
}