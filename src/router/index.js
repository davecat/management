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
          path: '/changePassword',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/ChangePassword'], resolve)
        },
        {
          path: '/roles',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Roles'], resolve)
        },
        {
          path: '/menus',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Menu'], resolve)
        },
        {
          path: '/buttons',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Button'], resolve)
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
          path: '/contract',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Contract'], resolve)
        },
        {
          path: '/loaner',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Loaner'], resolve)
        },
        {
          path: '/risk_control_request',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Risk_control_request'], resolve)
        },
        {
          path: '/post_lending_management_contract',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Post_lending_management_contract'], resolve)
        },
        {
          path: '/request_handling',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Request_handling'], resolve)
        },
        {
          path: '/eod_report',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Eod_report'], resolve)
        },
        {
          path: '/receivables_agency',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Receivables_agency'], resolve)
        },
        {
          path: '/receivables_loaner',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Receivables_loaner'], resolve)
        },
        {
          path: '/receivables_tenant',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Receivables_tenant'], resolve)
        },
        {
          path: '/payables_agency',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Payables_agency'], resolve)
        },
        {
          path: '/payables_loaner',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Payables_loaner'], resolve)
        },
        {
          path: '/statement',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Statement'], resolve)
        },
        {
          path: '/rates',
          meta: { requiresAuth: true },
          component: resolve => require(['components/page/Rates'], resolve)
        }
      ]
    },
    {
      path: '*',
      component: resolve => require(['components/common/404.vue'], resolve)
    }
  ]
})
