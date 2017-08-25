<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
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
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span style="line-height: 36px;">菜单配置</span>
                        <el-button style="float: right;" type="primary" @click="delNode(node.id)">删除</el-button>
                    </div>
                    <div class="text">
                        菜单名称: {{node.name}}
                    </div>
                    <div class="text">
                        菜单类型: {{node.type == 'Directory' ? '目录':'功能'}}
                    </div>
                    <div class="text">
                        菜单路径: {{node.url}}
                    </div>
                    <div class="text">
                        权限标识: {{node.permission}}
                    </div>
                    <div class="text">
                        菜单图标: <i :class="node.icon"></i>
                    </div>
                    <div class="text">
                        菜单顺序: {{node.sortNum}}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="9">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="上级菜单">
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
                    <el-form-item label="菜单名称">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单类型">
                        <el-select v-model="form.type" placeholder="请选择菜单类型">
                            <el-option label="目录" value="Directory"></el-option>
                            <el-option label="功能" value="Menu"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="菜单路径">
                        <el-input v-model="form.url" :disabled="form.type == 'Directory' "></el-input>
                    </el-form-item>
                    <el-form-item label="权限标识">
                        <el-input v-model="form.permission"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单图标">
                        <el-input v-model="form.icon"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单顺序">
                        <el-input v-model="form.sortNum"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">新增</el-button>
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
                    parentId: '',
                    name: '',
                    type: '',
                    url: '',
                    permission: '',
                    icon: '',
                    sortNum: ''
                },
                node: {
                    id: '',
                    name: '',
                    type: '',
                    url: '',
                    permission: '',
                    icon: '',
                    sortNum: ''
                }
            }
        },
        computed: {
            menus() {
                return this.$store.state.menus.menus;
            }
        },
        methods: {
            handleNodeClick(data) {
                this.node.id = data.id;
                this.node.name = data.name;
                this.node.type = data.type;
                this.node.url = data.url;
                this.node.permission = data.permission;
                this.node.icon = data.icon;
                this.node.sortNum = data.sortNum;
            },
            onSubmit() {
                let postForm = Object.assign({}, this.form);
                // TODO 应该在用户输入的权限标识前加上父级权限标识并使用冒号分隔
                this.axios.post("/api/v1/menu", postForm).then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    console.log(error);
                })
            },
            delNode(id) {
                this.axios.delete("/api/v1/menu/" + id).then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    console.log(error);
                })
            },
            handleChange(value) {
                this.form.parentId = value[value.length - 1];
            },
            cleanSelectedOptions() {
                this.selectedOptions = [];
                this.form.parentId = '';
            },
            getPath(id) {
                // TODO 应该返回节点id在整个tree的路径id数组,暂时返回空数组
                return [];
            }
        }
    }
</script>

<style>
    .text {
        font-size: 14px;
        padding: 18px 0;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 300px;
    }
</style>