<template>
    <!--布局一-->
    <!--<div class="wrapper">-->
        <!--<v-head></v-head>-->
        <!--<v-sidebar></v-sidebar>-->
        <!--&lt;!&ndash; Content Wrapper. Contains page content &ndash;&gt;-->
        <!--<div class="content">-->
            <!--<transition name="move" mode="out-in">-->
                <!--<router-view></router-view>-->
            <!--</transition>-->
        <!--</div>-->
        <!--&lt;!&ndash; /.content-wrapper &ndash;&gt;-->
    <!--</div>-->

<!--可以隐藏侧边栏布局-->
    <div class="app-wrapper">
      <div class="sidebar-wrapper">
        <v-sidebar class="sidebar-container"></v-sidebar>
      </div>
      <div class="main-container">
        <v-head></v-head>
        <div class="content">
          <transition name="move" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
      </div>
    </div>
</template>

<script>
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    export default {
      data() {
        return {
          a: true
        }
      },
      components: {
          vHead, vSidebar
      },
      created() {
        let that = this;
        Vue.nextTick(function () {
          document.getElementById("dave").onclick = function () {
            that.bbb();
          }
        })
      },
      methods: {
        bbb() {
          if(this.a) {
            document.getElementById("dave").style.transform = 'rotate(90deg)';
            this.a = !this.a;
            document.getElementsByClassName("app-wrapper")[0].className += " hideSidebar";
            document.getElementsByClassName("el-menu--dark")[0].style.marginLeft = '-5px';
          } else {
            document.getElementById("dave").style.transform = 'rotate(-0deg)';
            this.a = !this.a;
            document.getElementsByClassName("app-wrapper")[0].className = "app-wrapper";
            document.getElementsByClassName("el-menu--dark")[0].style.marginLeft = '0'
          }
        }
      }
    }
</script>
<style scoped>
  .app-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .hideSidebar .sidebar-wrapper{
    /*transform: translate(-140px, 0);*/
    width: 40px;
  }
  .hideSidebar .sidebar-container{
    transform: translate(132px, 0);
  }
  .hideSidebar .sidebar-wrapper:hover{
  /*transform: translate(0, 0);*/
    width: 200px;
  }
  .hideSidebar .sidebar-container{
    transform: translate(0, 0);
  }
  .hideSidebar .main-container{
    margin-left: 40px;
  }
  .sidebar-wrapper {
    width: 200px;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    transition: all .28s ease-out;
  }
  .sidebar-container {
    transition: all .28s ease-out;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: -17px;
    overflow-y: scroll;
  }
  .main-container {
    min-height: 100%;
    transition: all .28s ease-out;
    margin-left: 200px;
  }
</style>
