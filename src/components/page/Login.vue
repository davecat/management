<template>
  <div class="login-wrap">
    <div class="ms-title">后台管理系统</div>
    <div class="ms-login" id="ms-login">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm" v-if="checkForm">
        <el-form-item prop="cellphone">
          <el-input v-model="ruleForm.cellphone" @change="phoneChange()" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="verifyCode">
          <el-input type="captcha" placeholder="请输入验证码" v-model="ruleForm.verifyCode" style="width: 64%;"
                    @keyup.enter.native="submitForm('ruleForm')"></el-input>
          <el-button @click="getCaptcha('ruleForm')" id="captcha" :disabled="captchaBloor" style="width: 102px;">获取验证码</el-button>
        </el-form-item>
        <el-form-item prop="captcha" v-if="error">
          <el-input type="captcha" placeholder="图形码" v-model="ruleForm.captcha" @keyup.enter.native="submitForm('ruleForm')"></el-input>
          <img :src="captchaUrl" @click="getCode"/>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </div>
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
        error: false,
        timeOut: '',
        tipContent: '扫码登陆更安全哦~',
        checkForm: true,
        checkClass:'fa fa-qrcode',
        captchaBloor: false,
        time: 60,
        captchaUrl: '',
        ruleForm: {
          captcha: '',
          cellphone: '',
          verifyCode: '',
          captchaId: ''
        },
        rules: {
          cellphone: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {pattern:/^1[34578]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
          ],
          verifyCode: [
            {required: true, message: '请输入验证码', trigger: 'blur'}
          ],
          captcha: [{required: true, message: '请输入图形码', trigger: 'blur'}]
        }
      }
    },
    created: function () {
    },
    methods: {
      phoneChange() {
        this.error = false;
        document.getElementById('ms-login').style.height = "172px";
      },
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
            this.doLogin(self.ruleForm).then((res) => {
              if(res.data.errorMessage) {
                this.$message.error(res.data.errorMessage);
              }
              if(res.data.ifCaptcha){
                document.getElementById('ms-login').style.height = "250px";
                this.error = true;
                this.getCode();
              }
              if(res.data.success) {
                self.$router.push('/home');
              }
            }).catch((error) => {
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      doLogin(ruleForm) {
        return this.axios.post("/api/v2/anons/login", ruleForm);
      },
      getCaptcha(formName) {
        let that = this;
        let form = {
          phoneNum: that.ruleForm.cellphone,
          clientId: '',
          captchaId: that.ruleForm.captchaId,
          captcha: that.ruleForm.captcha
        };
        that.$refs[formName].validateField('cellphone',function (valid) {
          if (!valid) {
            that.captchaBloor = true;
            let val = document.getElementById('captcha').children[0];
            that.setTime(val);
            that.axios.post("/api/v2/sms/send",form).then((res) => {
              if(res.data.flag === true) {
                document.getElementById('ms-login').style.height = "250px";
                that.error = true;
                that.getCode();
              }
              if(res.data.message) {
                that.captchaBloor = false;
                clearTimeout(that.timeOut);
                val.innerHTML="获取验证码";
                that.$message.error(res.data.message);
              }

            }).catch((error) => {
            })
          } else {
            return false;
          }
        })
      },
      getCode() {
        this.axios.get("/api/v2/sms/getCaptcha").then((res) => {
          this.captchaUrl = res.data.captchaURL;
          this.ruleForm.captchaId = res.data.captchaId;
        }).catch((error) => {
        })
      },
      setTime(val) {
        let that = this;
        if (this.time === 0) {
          val.innerHTML="获取验证码";
          this.time = 60;
          this.captchaBloor = false;
          clearTimeout(that.timeOut);
        } else {
          val.innerHTML=this.time;
          this.time--;
          this.timeOut = setTimeout(function() {
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
    height: 172px;
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
