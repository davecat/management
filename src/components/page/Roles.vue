<template>
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.roleName" placeholder="角色名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0" v-if="addButton">
          <el-button type="success" @click="formVisible = true;">新增角色</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px;height: 28px;">
      <div class="pagination" style="position: absolute; right: 0; top: -1px; margin: 0;">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </div>
    </el-row>
    <el-row>
      <el-table :data="tableData"
                style="width: 100%"
                highlight-current-row
                @current-change="handleCurrentRow">
        <el-table-column prop="name" label="角色名称">
        </el-table-column>
        <el-table-column prop="description" label="描述">
        </el-table-column>
        <el-table-column min-width="50" label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="删除" placement="top-end">
              <el-button size="small" type="warning"
                         @click="rowDelete(scope.row.id)"><i class="fa fa-trash"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="授权" placement="top-end">
              <el-button size="small" type="info"
                         @click="rowWarrant(scope.row.id)"><i class="fa fa-user-circle-o"></i>
              </el-button>
            </el-tooltip>
          </template>

        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增角色" :visible.sync="formVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="角色名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitRole('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="删除"
      :visible.sync="dialogVisible"
      size="tiny">
      <span>此操作将删除选中角色，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleDelete">确 定</el-button>
            </span>
    </el-dialog>

    <!--授权弹窗-->
    <el-dialog
      title="授权"
      :visible.sync="warrant"
      size="tiny">
      <el-tree
        :data="testMenus"
        :props="defaultProps"
        ref="tree"
        show-checkbox
        node-key="permission"
        :default-checked-keys='permissionId'
        :highlight-current="true"
        accordion>
      </el-tree>
      <span slot="footer" class="dialog-footer">
                <el-button @click="handleCancel">取 消</el-button>
                <el-button type="primary" @click="getCheckedNodes">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  import store from '@/store'
  export default {
    data() {
      return {
        addButton: false,
        loading: false,//加载动画
        tableData: [],
        cur_page: 1,
        size: 10,
        totalElements: 0,
        url: '/api/v2/roles/getRoleAll',
        searchForm: {
          roleName: ''
        },
        //授权选择的对象
        permission: {
          id: '',
          permissions: []
        },
        //已有权限的id
        permissionId: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        formVisible: false,
        dialogVisible: false,
        warrant: false,
        formLabelWidth: '80px',
        deleteId: '',
        currentRow: {},
        form: {
          name: '',
          description: ''
        },
        rules: {
          name: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
          description: [{required: true, message: '请输入描述', trigger: 'blur'}]
        },
        props: {
          label: 'name',
          children: 'children'
        },
        testMenus: []
      }
    },
    computed: {
      button() {
        return store.state.button;
      },
      menus() {
        return store.state.menus.menus;
      }
    },
    created(){
      this.getData();
      if (this.button.button.indexOf('新增') >= 0) {
        this.addButton = true;
      }
    },
    methods: {
      handleCurrentChange(val){
        this.cur_page = val;
        this.getData();
      },
      getData(){
        this.loading = true;
        this.axios.post(this.url, {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size
        }).then((res) => {
          this.tableData = res.data.content;
          this.totalElements = res.data.totalElements;
          this.loading = false;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      Search() {
        this.getData();
      },
      //点击授权确定
      getCheckedNodes() {
        let that = this;
        that.permission.permissions = [];
        let checked = this.$refs.tree.getCheckedNodes();
        checked.forEach((item) => {
          that.permission.permissions.push(item.permission)
        });
        console.log(that.permission);
        this.axios.put('/api/v2/roles/setPermission', that.permission).then((res) => {
          if (res.data.status === 200) {
            this.$message({
              message: '授权成功！',
              type: 'success'
            });
          }
        }).catch((error) => {
          console.log(error);
        });

        this.warrant = false;
        this.$forceUpdate();
        window.location.reload();
      },
      //删除
      rowDelete(id) {
        this.dialogVisible = true;
        this.deleteId = id;
      },

      //授权
      rowWarrant(id) {
        let that = this;
        this.testMenus = this.menus;
        this.permission.id = id;
// 获取用户已有权限
        this.axios.get('/api/v2/roles/getRolePermission/' + id).then((res) => {
          //清空已有权限的id数组
          this.permissionId = res.data;
          console.log(res.data);
          that.warrant = true;
        }).catch((error) => {
          console.log('a');
          console.log(error);
        });
      },
      handleDelete() {
        this.axios.delete('/api/v2/roles/' + this.deleteId).then((res) => {
          this.getData();
          this.dialogVisible = false;
        }).catch((error) => {
          console.log(error);
        })
      },
      submitRole(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.post('/api/v2/roles', this.form).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              this.formVisible = false;
            }).catch((error) => {
              console.log(error);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.formVisible = false;
      },
      handleCheckChange(data, checked, indeterminate) {
        console.log(data, checked, indeterminate);
      },
      handleCurrentRow(val) {
        this.currentRow = val;
      },
      handleCancel() {
        window.location.reload();
//                this.testMenus = [{
//                    id:"4028b8815cdee019015cdee04b40000d",
//                    name:"控制台首页",
//                    children: []
//                }];
        this.warrant = false;
      }

    }
  }
</script>

<style>
</style>
