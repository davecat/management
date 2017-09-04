<template>
  <div class="errPage-container">
    <el-button @click="back" icon='arrow-left' class="pan-back-btn">返回</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">Oops!</h1>
        <h2>你没有权限去该页面</h2>
        <h6>如有不满请联系你领导</h6>
        <ul class="list-unstyled">
          <li>或者你可以去:</li>
          <li class="link-type">
            <router-link to="/home">回首页</router-link>
          </li>
          <li class="link-type"><a href="https://www.taobao.com/">随便看看</a></li>
          <li><a @click.prevent="dialogVisible=true" href="#">点我看图</a></li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>

    <el-dialog title="随便看" :visible.sync="dialogVisible" size="large">
      <img class="pan-img" :src="ewizardClap">
    </el-dialog>
  </div>
</template>

<script>
  import errGif from '../../assets/401.gif';
  export default {
    data() {
      return {
        errGif: errGif + '?' + +new Date(),
        ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
        dialogVisible: false
      }
    },
    methods: {
      back() {
        if (this.$route.query.noGoBack) {
          this.$router.push({ path: '/home' });
        } else {
          this.$router.go(-1);
        }
      }
    }
  };
</script>

<style scoped>
  .errPage-container {
    width: 800px;
    margin: 100px auto;
  }
  .errPage-container .pan-back-btn {
    background: #008489;
    color: #fff;
  }
  .errPage-container .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .errPage-container .pan-img {
    display: block;
    margin: 0 auto;
  }
  .errPage-container .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .errPage-container  li {
    font-size: 14px;
    padding-bottom: 5px;
  }
  .errPage-container a {
    color: #008489;
    text-decoration: none;
  }
  .errPage-container a:hover {
     text-decoration: underline;
   }

</style>
