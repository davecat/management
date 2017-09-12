<template>
  <div class="login-wrap">
    <div class="ms-title">后台管理系统</div>
    <div class="ms-login">
      <div style="position: absolute;top: 0;right: 3px">
        <i class="fa fa-qrcode" aria-hidden="true" style="font-size: xx-large"></i>
      </div>
      <!--密码登陆-->
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
        <el-form-item prop="cellphone">
          <el-input v-model="ruleForm.cellphone" placeholder="手机号"></el-input>
        </el-form-item>
        <!--<el-form-item prop="password">-->
        <!--<el-input type="password" placeholder="密码" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item prop="verifyCode">
          <el-input type="captcha" placeholder="验证码" v-model="ruleForm.verifyCode"
                    @keyup.enter.native="submitForm('ruleForm')"></el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </div>
        <el-form-item prop="error" v-if="error">
          <el-alert
            :title="error"
            :closable="false"
            type="error">
          </el-alert>
        </el-form-item>
      </el-form>
      <!--二维码-->
      <!--<span><img src="static/2.jpg" width="100%"></span>-->
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        error: '',
        captchaUrl: '',
        ruleForm: {
          cellphone: '13041385766',
          verifyCode: ''
        },
        rules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ],
          captcha: [
            {required: true, message: '请输入验证码', trigger: 'blur'}
          ]
        }
      }
    },
    created: function () {
    },
    methods: {
      submitForm(formName) {
        const self = this;
        self.$refs[formName].validate((valid) => {
          if (valid) {
            this.doLogin(self.ruleForm).then((response) => {
              self.$router.push('/home');
            }).catch((error) => {
              this.$message.error(error.response.data.message);
              this.getCaptcha();
              this.error = error.response.data.message;
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      doLogin(ruleForm) {
        return this.axios.post("/v2/anons/login", ruleForm);
      },
      getCaptcha() {
        this.axios.get("/api/v2/sms/send/" + this.ruleForm.cellphone).then((response) => {
          this.captchaUrl = response.data.captchaURL;
          this.ruleForm.captchaId = response.data.captchaId;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      }
    }
  }
</script>

<style scoped>
  .login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .ms-title {
    position: absolute;
    top: 50%;
    width: 100%;
    margin-top: -230px;
    text-align: center;
    font-size: 30px;
    color: #fff;
  }

  .ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 300px;
    height: 350px;
    margin: -150px 0 0 -190px;
    padding: 40px;
    border-radius: 5px;
    background: #fff;
  }

  .login-btn {
    text-align: center;
  }

  .login-btn button {
    width: 100%;
    height: 36px;
  }
</style>
