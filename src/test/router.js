import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            path:"/",
            redirect: "/test"
        },
        {
            path: "/test",
            component: () => import("./test")
        }
    ]
})

export default router