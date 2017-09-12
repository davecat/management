// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import VueAxios from 'vue-axios';
// 设置axios支持set cookies
axios.defaults.withCredentials = true;
// 添加axios全局拦截器-请求
axios.interceptors.request.use(function (config) {
    if (localStorage.getItem('token')) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
        config.headers.Authorization = localStorage.getItem('token');
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
//返回拦截器
axios.interceptors.response.use(function (response) {
  localStorage.setItem('token',response.headers.auth)
  return response;
}, function (error) {
  // if  (401 === error.response.status) {
  //   localStorage.removeItem('token');
  //   window.location = '/';
  // }
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
    console.log(token);
    // next({path: '/login'});
    if (!token || token === null) {
      next({path: '/login'})
    } else {
      //vuex menu 赋值
      Vue.axios.get("/api/v2/menus").then((response) => {
        let menus = response.data;
        menus.sort((a,b) => a.sortNum - b.sortNum);
        menus.forEach(m => m.children.sort((a,b) => a.sortNum - b.sortNum));
        store.dispatch('set_menu', menus);
      }).catch((error) => {
        console.log(error);
      });
      //staff  赋值
      Vue.axios.get("/api/v2/users/current").then((response) => {
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
