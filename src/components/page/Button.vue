<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>按钮管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row :gutter="20">
            <el-col :span="6">
                <el-tree
                        :data="menus"
                        :props="defaultProps"
                        :highlight-current="true"
                        accordion
                        @node-click="handleNodeClick"></el-tree>
            </el-col>
            <el-col :span="9">
                <el-table
                        :data="tableData"
                        style="width: 100%">
                    <el-table-column
                            prop="icon"
                            label="图标">
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            label="名称">
                    </el-table-column>
                    <el-table-column
                            prop="url"
                            label="路径">
                    </el-table-column>
                    <el-table-column
                            prop="permission"
                            label="标识">
                    </el-table-column>
                    <el-table-column
                            min-width="50"
                            prop="opt"
                            label="操作">
                        <template scope="scope">
                            <el-button @click="delButton(scope.row.id)" type="danger" icon="delete" size="small"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="9">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="所属菜单">
                        <el-cascader
                                :options="menus"
                                :show-all-levels="false"
                                :props="defaultProps2"
                                change-on-select
                                v-model="selectedOptions"
                                @change="handleChange">
                        </el-cascader>
                        <el-button type="primary" @click="cleanSelectedOptions">清空</el-button>
                    </el-form-item>
                    <el-form-item label="按钮名称">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="按钮路径">
                        <el-input v-model="form.url" :disabled="form.type == 'Directory' "></el-input>
                    </el-form-item>
                    <el-form-item label="权限标识">
                        <el-input v-model="form.permission"></el-input>
                    </el-form-item>
                    <el-form-item label="按钮图标">
                        <el-input v-model="form.icon"></el-input>
                    </el-form-item>
                    <el-form-item label="按钮顺序">
                        <el-input v-model="form.sortNum"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">新增按钮</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                defaultProps2: {
                    children: 'children',
                    label: 'name',
                    value: 'id'
                },
                selectedOptions: [],
                form: {
                    menuId: '',
                    name: '',
                    url: '',
                    permission: '',
                    icon: '',
                    sortNum: ''
                },
                button: {
                    id: '',
                    menuId: '',
                    name: '',
                    url: '',
                    permission: '',
                    icon: '',
                    sortNum: ''
                },
                tableData: []
            }
        },
        computed: {
            menus() {
                return this.$store.state.menus.menus;
            }
        },
        methods: {
            handleNodeClick(data) {
                this.axios.get("/api/v1/button/" + data.id).then((response) => {
                    this.tableData = response.data;
                }).catch((error) => {
                    console.log(error);
                })

            },
            onSubmit() {
                let postForm = Object.assign({}, this.form);
                // TODO 应该在用户输入的权限标识前加上父级权限标识并使用冒号分隔
                this.axios.post("/api/v1/button", postForm).then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            delButton(id) {
                this.axios.delete("/api/v1/button/" + id).then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    console.log(error);
                })
            },
            handleChange(value) {
                this.form.menuId = value[value.length - 1];
            },
            cleanSelectedOptions() {
                this.selectedOptions = [];
                this.form.menuId = '';
            },
            getPath(id) {
                // TODO 应该返回节点id在整个tree的路径id数组,暂时返回空数组
                return [];
            }
        }
    }
</script>

<style>
</style>