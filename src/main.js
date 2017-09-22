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
  // 只有当auth存在时候才更新token,防止请求首页报表时候清空token
  if(response.headers.auth){
    localStorage.setItem('token',response.headers.auth)
  }
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

import { constantRouterMap } from '@/router';

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token || token === null) {
    next();
  } else {
    // 动态生成路由
    Vue.axios.get("/api/v2/v1/menus").then((response) => {
      let ids = response.data;
      let tree = [
        {
          "children":[],
          "icon":"fa fa-dashboard",
          "id":"402880ef5e703923015e70394c2b0000",
          "name":"控制台首页",
          "permission":"instalment:home",
          "sortNum":1,
          "type":"Menu",
          "path":"/index",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/Index'], resolve)
        },
        {
          "children":[
            {
              "id":"624dee7c11324eb6a2e4bcc26b18fadd",
              "name":"导出",
              "permission":"instalment:branch:import_button",
              "sortNum":2,
              "type":"Button",
              "path":"/1",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"6ffd916c5511468ab744cb62b9f85f84",
              "name":"新增",
              "permission":"instalment:branch:add_button",
              "sortNum":1,
              "type":"Button",
              "path":"/2",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"0015a70c2c28442791127fabc68eb8412",
              "name":"基础权限",
              "permission":"basePermission",
              "sortNum":3,
              "type":"Button",
              "path":"/3",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            }
          ],
          "icon":"fa fa-briefcase",
          "id":"402880ef5e703923015e70394c400001",
          "name":"门店管理",
          "permission":"instalment:branch",
          "sortNum":2,
          "type":"Menu",
          "path":"/branch",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/Branch'], resolve)
        },
        {
          "children":[
            {
              "id":"af267d9315d94c08b8440561aa62a4c3",
              "name":"导出",
              "permission":"instalment:agent:import_button",
              "sortNum":1,
              "type":"Button",
              "path":"/4",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"0015a70c2c28442791127fabc68eb8413",
              "name":"基础权限",
              "permission":"basePermission",
              "sortNum":3,
              "type":"Button",
              "path":"/5",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            }
          ],
          "icon":"fa fa-briefcase",
          "id":"402880ef5e703923015e70394c430002",
          "name":"经纪人管理",
          "permission":"instalment:agent",
          "sortNum":3,
          "type":"Menu",
          "path":"/agent",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/Agent'], resolve)
        },
        {
          "children":[
            {
              "id":"6234524c9c204f6092e938fffd9126cd",
              "name":"导出",
              "permission":"instalment:librequest:import_button",
              "sortNum":1,
              "type":"Button",
              "path":"/6",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"0015a70c2c28442791127fabc68eb8414",
              "name":"基础权限",
              "permission":"basePermission",
              "sortNum":3,
              "type":"Button",
              "path":"/7",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            }
          ],
          "icon":"fa fa-paper-plane",
          "id":"402880ef5e703923015e70394c460003",
          "name":"分期申请",
          "permission":"instalment:request",
          "sortNum":4,
          "type":"Menu",
          "path":"/request",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/Request'], resolve)
        },
        {
          "children":[
            {
              "id":"bad8d2306dcf43b9af5686abc46e4257",
              "name":"导出",
              "permission":"instalment:statement:import_button",
              "sortNum":1,
              "type":"Button",
              "path":"/9",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"0015a70c2c28442791127fabc68eb8415",
              "name":"基础权限",
              "permission":"basePermission",
              "sortNum":3,
              "type":"Button",
              "path":"/10",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            }
          ],
          "icon":"fa fa-paper-plane",
          "id":"402880ef5e703923015e70394c480004",
          "name":"对账明细",
          "permission":"instalment:statement",
          "sortNum":5,
          "type":"Menu",
          "path":"/statement",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/Statement'], resolve)
        },
        {
          "children":[
            {
              "id":"c84db7657cd6459885eea212c97b7c97",
              "name":"新增",
              "permission":"instalment:system:homeManager:add_button",
              "sortNum":1,
              "type":"Button",
              "path":"/11",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            },
            {
              "id":"0015a70c2c28442791127fabc68eb8416",
              "name":"基础权限",
              "permission":"basePermission",
              "sortNum":3,
              "type":"Button",
              "path":"/12",
              "meta": { requiresAuth: false },
              "component": resolve => require(['components/page/Index'], resolve)
            }
          ],
          "icon":"fa fa-briefcase",
          "id":"402880ef5e703923015e70394c4a0005",
          "name":"房源管理",
          "permission":"instalment:homeManager",
          "sortNum":6,
          "type":"Menu",
          "path":"/homeManager",
          "meta": { requiresAuth: true },
          "component": resolve => require(['components/page/HomeManager'], resolve)
        },
        {
          "children":[
            {
              "children":[],
              "icon":"fa fa-table",
              "id":"402880ef5e703923015e70394c4c0006",
              "name":"日志",
              "permission":"instalment:log",
              "sortNum":7,
              "type":"Menu",
              "path":"/log",
              "meta": { requiresAuth: true },
              "component": resolve => require(['components/page/Log'], resolve)
            },
            {
              "children":[
                {
                  "id":"f6b2ee3ccfa441c78f63beef1400ff4b",
                  "name":"新增",
                  "permission":"instalment:system:agency:add_button",
                  "sortNum":1,
                  "type":"Button",
                  "path":"/15",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                },
                {
                  "id":"0015a70c2c28442791127fabc68eb8417",
                  "name":"基础权限",
                  "permission":"basePermission",
                  "sortNum":3,
                  "type":"Button",
                  "path":"/16",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                }
              ],
              "icon":"fa fa-building",
              "id":"402880ef5e70454f015e704574dd0000",
              "name":"中介管理",
              "permission":"instalment:system:agency",
              "sortNum":1,
              "type":"Menu",
              "path":"/agency",
              "meta": { requiresAuth: true },
              "component": resolve => require(['components/page/Agency'], resolve)
            },
            {
              "children":[
                {
                  "id":"0e676b0ee5e74df1803ddb76c689fdf2",
                  "name":"新增",
                  "permission":"instalment:system:user:add_button",
                  "sortNum":1,
                  "type":"Button",
                  "path":"/21",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                },
                {
                  "id":"0015a70c2c28442791127fabc68eb8418",
                  "name":"基础权限",
                  "permission":"basePermission",
                  "sortNum":3,
                  "type":"Button",
                  "path":"/22",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                }
              ],
              "icon":"fa fa-user",
              "id":"402880ef5e70454f015e704574f00001",
              "name":"用户管理",
              "permission":"instalment:system:users",
              "sortNum":2,
              "type":"Menu",
              "path":"/users",
              "meta": { requiresAuth: true },
              "component": resolve => require(['components/page/User'], resolve)
            },
            {
              "children":[
                {
                  "id":"0015a70c2c28442791127fabc68eb841",
                  "name":"新增",
                  "permission":"instalment:system:role:add_button",
                  "sortNum":1,
                  "type":"Button",
                  "path":"/31",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                },
                {
                  "id":"0015a70c2c28442791127fabc68eb8429",
                  "name":"基础权限",
                  "permission":"basePermission",
                  "sortNum":3,
                  "type":"Button",
                  "path":"/32",
                  "meta": { requiresAuth: false },
                  "component": resolve => require(['components/page/Index'], resolve)
                }
              ],
              "icon":"fa fa-table",
              "id":"402880ef5e70454f015e704574f30002",
              "name":"角色管理",
              "permission":"instalment:system:roles",
              "sortNum":3,
              "type":"Menu",
              "path":"/roles",
              "meta": { requiresAuth: true },
              "component": resolve => require(['components/page/Roles'], resolve)
            }
          ],
          "icon":"el-icon-setting",
          "id":"402880ef5e704105015e704126750000",
          "name":"系统管理",
          "permission":"instalment:system",
          "sortNum":8,
          "type":"system",
          "path":"/system"
        }
      ];
      let newTree = [];
      function buildTree(tree, ids, newTree){
        if (!tree) { return; }
        for (let i = 0; i< tree.length; i++){
          let val = tree[i];
          let finder = ids.find(id => id === val.permission);
          if(finder !== undefined){
            let newVal = Object.assign({}, val);
            newVal.children = [];
            newTree.push(newVal);
            if (val.children) {
              buildTree(val.children, ids, newVal.children);
            }
          }
        }
      }
      buildTree(tree, ids, newTree);
      //处理菜单
      // console.log(newTree);

      newTree.sort((a,b) => a.sortNum - b.sortNum);
      newTree.forEach(m => m.children.sort((a,b) => a.sortNum - b.sortNum));
      store.dispatch('set_menu', newTree);
      //动态添加路由
      let routers = Object.assign([], newTree);
      routers.forEach(item => {
        //拿到系统管理
        if(item.permission === "instalment:system") {
          item.children.forEach(item2 => {
            routers.push(item2)
          });
          routers.splice(routers.indexOf(item),1);
        }
      });
      constantRouterMap[2].children = routers;
      constantRouterMap.push({
        path: '*',
        component: resolve => require(['components/common/404.vue'], resolve)
      });
      router.addRoutes(constantRouterMap);// 动态添加可访问路由表
      next(to.path); // hack方法 确保addRoutes已完成
    }).catch((error) => {
      console.log(error);
    });
    //vuex menu 赋值
    // Vue.axios.get("/api/v2/menus").then((response) => {
    //   let menus = response.data;
    //   menus.sort((a,b) => a.sortNum - b.sortNum);
    //   menus.forEach(m => m.children.sort((a,b) => a.sortNum - b.sortNum));
    //   store.dispatch('set_menu', menus);
    // }).catch((error) => {
    //   console.log(error);
    // });

    if(to.path === '/login') {
      next({path: '/home'})
    }

    //staff  赋值
    Vue.axios.get("/api/v2/users/current").then((response) => {
      let staff = response.data;
      store.dispatch('get_staff', staff);
    }).catch((error) => {
      console.log(error);
    });
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
