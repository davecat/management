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

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  // components: { App }
  render: h => h(App)
})
