import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)



//所有权限通用路由表
//如首页和登录页和一些不用权限的公用页面
export const constantRouterMap = [
  {
    path: '/',
    meta: { requiresAuth: false },
    redirect: '/login'
  },
  {
    path: '/login',
    meta: { requiresAuth: false },
    component: resolve => require(['components/page/Login'], resolve)
  },
  {
    path: '/home',
    meta: { requiresAuth: true },
    component: resolve => require(['components/common/Home'], resolve),
    children:[]
  },
  {
    path: '*',
    component: resolve => require(['components/common/404.vue'], resolve)
  }
];

export default new Router({
  mode: 'history',
  routes: constantRouterMap
})

