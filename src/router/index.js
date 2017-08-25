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
    }
  ]
})
