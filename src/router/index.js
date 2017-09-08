import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
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
      component: resolve => require(['components/common/Home'], resolve),
      children:[
        {
          path: '/',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Index'], resolve)
        },
        {
          path: '/roles',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Roles'], resolve)
        },
        {
          path: '/users',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/User'], resolve)
        },
        {
          path: '/agency',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Agency'], resolve)
        },
        {
          path: '/branch',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Branch'], resolve)
        },
        {
          path: '/agent',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Agent'], resolve)
        },
        {
          path: '/request',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Request'], resolve)
        },
        {
          path: '/statement',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Statement'], resolve)
        },
        {
          path: '/homeManager',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/HomeManager'], resolve)
        }
      ]
    },
    {
      path: '*',
      component: resolve => require(['components/common/404.vue'], resolve)
    }
  ]
})
