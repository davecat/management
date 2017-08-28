// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import VueAxios from 'vue-axios';
// 设置axios支持set cookies
axios.defaults.withCredentials = true;
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if  (401 === error.response.status) {
    localStorage.removeItem('token');
    window.location = '/';
  }
  return Promise.reject(error);
});
Vue.use(VueAxios, axios);

//vuex store
import store from './store/';

router.beforeEach((to, from, next) => {
  if(to.path === '/login') {
    const token = localStorage.getItem('token');
    if(token) {
      next({path: '/home'})
    }
  }
  if(to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token');
    if (!token || token === null) {
      next({path: '/login'})
    } else {
      //vuex menu 赋值
      Vue.axios.get("/api/v1/menu").then((response) => {
        let menus = response.data;
        menus.sort((a,b) => a.sortNum - b.sortNum);
        menus.forEach(m => m.children.sort((a,b) => a.sortNum - b.sortNum));
        store.dispatch('set_menu', menus);
      }).catch((error) => {
        console.log(error);
      });
      //staff  赋值
      Vue.axios.get("/api/v1/user/current").then((response) => {
        let staff = response.data;
        store.dispatch('get_staff', staff);
      }).catch((error) => {
        console.log(error);
      });
      next()
    }
  } else {
    next()
  }
});

Vue.filter('currency', function (value) {
  const l10nCNY = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" })
  if (value !== null) {
    return l10nCNY.format(value);
  }
});

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  // components: { App }
  render: h => h(App)
})
