<template>
    <div class="header">
        <div class="logo">后台管理系统</div>
        <div class="user-info">
            <span class="username">你好，{{staff.staffName}}</span>
            <i class="fa fa-sign-out logout" @click="doLogout"></i>
        </div>
    </div>
</template>
<script>
  import store from '@/store'
    export default {
        data() {
            return {}
        },
        computed: {
            staff (){
                return store.state.staff.staff
            }
        },
        created: function () {
          console.log(this.staff);
        },
        methods: {
            doLogout() {
                this.axios.get("/anon/logout").then((response) => {
                    localStorage.removeItem('token');
                    this.$router.push('/login');
                }).catch((error) => {
                    console.log(error);
                })
            }
        }
    }
</script>

<style scoped>
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 70px;
        font-size: 22px;
        line-height: 70px;
        color: #fff;
    }

    .header .logo {
        float: left;
        width: 250px;
        text-align: center;
    }

    .user-info {
        float: right;
        padding-right: 50px;
        font-size: 16px;
        color: #fff;
    }

    .user-info .user-logo {
        position: absolute;
        left: 0;
        top: 15px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    .username {
        height: 60px;
        line-height: 60px;
        cursor: pointer;
    }

    .logout {
        width: 60px;
        height: 60px;
        line-height: 70px;
        text-align: center;
        float: right;
        cursor: pointer;
    }
</style>
