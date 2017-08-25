<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 个人信息</el-breadcrumb-item>
                <el-breadcrumb-item>修改密码</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- Main content -->
        <section class="content">

            <el-form style="margin:20px;width:80%;"
                     label-width="100px"
                     :model="dialog.user_info"
                     :rules="dialog.user_info_rules"
                     ref='user_info'>
                <el-form-item class='edit-form'
                              label="当前密码"
                              prop='old_password'>
                    <el-input
                            type='password'
                            placeholder='当前密码'
                            auto-complete='off'
                            v-model="dialog.user_info.old_password"></el-input>
                </el-form-item>
                <el-form-item class='edit-form'
                              label="新密码"
                              prop='password'>
                    <el-input
                            type='password'
                            placeholder='新密码'
                            auto-complete='off'
                            v-model="dialog.user_info.password"></el-input>
                </el-form-item>
                <el-form-item class='edit-form'
                              label="确认密码"
                              prop='password_confirm'>
                    <el-input
                            type='password'
                            placeholder='确认密码'
                            auto-complete='off'
                            v-model="dialog.user_info.password_confirm"></el-input>
                </el-form-item>
                <el-button type="primary" @click="changePassword('user_info')">确 定</el-button>
            </el-form>

        </section>
        <!-- /.content -->
    </div>
</template>

<script>
    export default {
        data() {
            return {
                dialog: {
                    user_info: {
                        old_password: '',
                        password: '',
                        password_confirm: ''
                    },
                    user_info_rules: {
                        old_password: [{
                            required: true,
                            message: '旧密码不能为空！',
                            trigger: 'blur'
                        }],
                        password: [{
                            required: true,
                            message: '新密码不能为空！',
                            trigger: 'blur'
                        }, {
                            trigger: 'blur',
                            validator: (rule, value, callback) => {
                                if (value === '') {
                                    callback(new Error('请再次输入密码'));
                                } else {
                                    if ('' !== this.dialog.user_info.password) {
                                        this.$refs.user_info.validateField('password_confirm');
                                    }
                                    callback();
                                }
                            }
                        }],
                        password_confirm: [{
                            required: true,
                            message: '确认密码不能为空！',
                            trigger: 'blur'
                        }, {
                            trigger: 'blur',
                            validator: (rule, value, callback) => {
                                if (value === '') {
                                    callback(new Error('请再次输入密码'));
                                } else if (value !== this.dialog.user_info.password) {
                                    callback(new Error('两次输入密码不一致!'));
                                } else {
                                    callback();
                                }
                            }
                        }],
                    }
                }
            }
        },
        methods: {
            changePassword(userinfo) {
                this.$refs[userinfo].validate((valid) => {
                    if (valid) {
                        this.axios.put("/api/v1/user/changePassword", {
                            oldPassword: this.dialog[userinfo].old_password,
                            newPassword: this.dialog[userinfo].password
                        }).then((response) => {
                            this.sendMsg();
                        }).catch((error) => {
                            this.sendError(error.response.data.message);
                        })
                    }
                });
            },
            sendMsg() {
                this.$message({
                    showClose: true,
                    message: '恭喜你，密码修改成功',
                    type: 'success'
                });
            },
            sendError(message) {
                this.$message({
                    showClose: true,
                    message: message,
                    type: 'error'
                });
            }
        }
    }
</script>

<style>
</style>