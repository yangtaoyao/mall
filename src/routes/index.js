import Vue from "vue"
import VueRouter from "vue-router"
Vue.use(VueRouter)

const Login = () =>
    import ("components/Login.vue")
const Layout = () =>
    import ("components/Layout.vue")
const Home = () =>
    import ("components/Home.vue")
const PersonalCenter = () =>
    import ("components/PersonalCenter")
const Header = () =>
    import ('components/Header.vue')

export const allRoutesMap = [{
    path: '/home',
    name: '首页',
    component: Layout,
    children: [{
            path: 'header',
            name: '头部',
            component: Header
        },
        {

        }
    ]
}]

export const constantRouterMap = [{
    path: "/login",
    name: "Login",
    component: Login
}]

export default new VueRouter({ routes: constantRouterMap })