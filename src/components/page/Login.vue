<template>
  <div class="login-wrap">
    <div class="ms-title">后台管理系统</div>
    <div class="ms-login">

      <el-tooltip class="item" effect="dark" :content="tipContent" placement="top-start">
        <div style="position: absolute;top: 0;right: 3px;cursor: pointer" @click="checkLogin">
          <i :class="checkClass" aria-hidden="true" style="font-size: xx-large"></i>
        </div>
      </el-tooltip>
      <!--密码登陆-->
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm" v-if="checkForm">
        <el-form-item prop="cellphone">
          <el-input v-model="ruleForm.cellphone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-button @click="getCaptcha('ruleForm')" id="captcha" :disabled="captchaBloor">获取验证码</el-button>
        <!--<el-form-item prop="password">-->
        <!--<el-input type="password" placeholder="密码" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item prop="verifyCode">
          <el-input type="captcha" placeholder="请输入验证码" v-model="ruleForm.verifyCode"
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
      <span v-if="!checkForm"><img src="static/2.jpg" width="100%"></span>
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        tipContent: '扫码登陆更安全哦~',
        checkForm: true,
        checkClass:'fa fa-qrcode',
        captchaBloor: false,
        time: 60,
        error: '',
        captchaUrl: '',
        ruleForm: {
          cellphone: '13041385766',
          verifyCode: ''
        },
        rules: {
          cellphone: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {pattern:/^1[34578]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
          ],
          verifyCode: [
            {required: true, message: '请输入验证码', trigger: 'blur'}
          ]
        }
      }
    },
    created: function () {
    },
    methods: {
      checkLogin() {
        if(this.checkClass === 'fa fa-qrcode') {
          this.checkClass = 'fa fa-television';
          this.checkForm = false;
          this.tipContent = '手机号登陆'
        } else {
          this.checkClass = 'fa fa-qrcode';
          this.checkForm = true;
          this.tipContent = '扫码登陆更安全哦~'
        }
      },
      submitForm(formName) {
        const self = this;
        self.$refs[formName].validate((valid) => {
          if (valid) {
            this.doLogin(self.ruleForm).then((response) => {
              self.$router.push('/home');
            }).catch((error) => {
              this.$message.error(error.response.data.message);
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
      getCaptcha(formName) {
        let that = this;
        that.$refs[formName].validateField('cellphone',function (valid) {
          if (!valid) {
            that.captchaBloor = true;
            let val = document.getElementById('captcha').children[0];
            that.setTime(val);
            that.axios.get("/api/v2/sms/send/"+that.ruleForm.cellphone).then((res) => {
            }).catch((error) => {
              that.captchaBloor = false;
              that.$message.error(error.response.data.message);
            })
          } else {
            console.log(valid);
            return false;
          }
        })
      },
      setTime(val) {
        let a;
        let that = this;
        if (this.time === 0) {
          val.innerHTML="获取验证码";
          this.time = 60;
          this.captchaBloor = false;
          clearTimeout(a);
        } else {
          val.innerHTML="重新发送(" + this.time + ")";
          this.time--;
          a = setTimeout(function() {
            that.setTime(val)
          },1000);
        }
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
