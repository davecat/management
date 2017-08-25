<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 控制台</el-breadcrumb-item>
                <el-breadcrumb-item>Not Found</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- Main content -->
        <section class="content">

            <!-- Your Page Content Here -->
            <el-button type="primary" @click="test">测试Get</el-button>

        </section>
        <!-- /.content -->
    </div>
</template>

<script>
    export default {
        methods: {
            test() {
                this.axios.get("/api/user", {
                    params: {
                        ID: 12345
                    }
                }).then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    console.log(error);
                })
            }
        }
    }
</script>

<style>
</style>