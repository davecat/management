<template>
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-select v-model="searchForm.staffType" filterable
                     placeholder="员工类型">
            <el-option v-for="staff in staffTypeList" :key="staff.englishName" :label="staff.name"
                       :value="staff.englishName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchForm.nickname" placeholder="用户昵称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0" v-if="addButton">
          <el-button type="success" @click="addUser()">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="searchForm.status" @change="Search"
                         style="float: left; margin-top: 7px; min-width: 150px;">
        <el-checkbox label="Normal">启用</el-checkbox>
        <el-checkbox label="Blocked">停用</el-checkbox>
      </el-checkbox-group>
      <div class="pagination" style="position: absolute; right: 0; top: -1px; margin: 0;">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </div>
    </el-row>
    <el-row>
      <el-table :data="tableData"  width="100%">
        <el-table-column prop="nickname" label="用户昵称">
        </el-table-column>
        <el-table-column prop="staffType" label="类型">
          <template scope="scope">
            {{scope.row.staffType | staffTypeFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template scope="scope">
            {{scope.row.status == 'Normal' ? '启用' : '停用'}}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="登录名" min-width="92">
        </el-table-column>
        <el-table-column prop="role" label="角色">
        </el-table-column>
        <el-table-column label="操作" min-width="80">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
              <el-button size="small" type="primary"
                         @click="handleEdit(scope.row)"><i class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="停用" placement="top-end" v-if="scope.row.status === 'Normal'">
              <el-button size="small" type="danger"
                         @click="lock(scope.row.id)"><i class="fa fa-lock"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="启用" placement="top-end" v-if="scope.row.status === 'Blocked'">
              <el-button size="small" type="success"
                         @click="unlock(scope.row.id)"><i class="fa fa-unlock-alt"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增用户" :visible.sync="formVisible" class="formVisible">
      <div class="left">
        <el-form :model="form" ref="form" :rules="rules">
          <el-form-item label="用户昵称" :label-width="formLabelWidth" prop="nickname">
            <el-input v-model="form.nickname"></el-input>
          </el-form-item>
          <el-form-item label="登录名" :label-width="formLabelWidth" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item label="员工类型" :label-width="formLabelWidth" prop="staffType">
            <el-col :span="24">
              <el-select v-model="form.staffType" filterable @change="staffTypeChange"
                         placeholder="员工类型">
                <el-option v-for="staff in staffTypeList2" :key="staff.englishName" :label="staff.name"
                           :value="staff.englishName"></el-option>
              </el-select>
            </el-col>
          </el-form-item>
          <el-form-item label="角色" :label-width="formLabelWidth" prop="role">
            <el-select v-model="form.role" :disabled="form.staffType === 'Admin'">
              <el-option v-for="role in roleList" :key="role.id" :value="role.id" :label="role.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管辖中介：" :label-width="formLabelWidth" prop="agencies">
            <el-select v-model="form.agencies" multiple @change="getBranchListAdd(form.agencies)"
                       :disabled="form.staffType === 'Admin'">
              <el-option v-for="agency in agencyList" :value="agency.id" :label="agency.name" :key="agency.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管辖门店：" :label-width="formLabelWidth" prop="branches">
            <el-select v-model="form.branches" multiple :disabled="form.staffType === 'Admin' || form.staffType === 'Interior'" @change="getRightData(form.branches)">
              <el-option v-for="branch in branchList" :key="branch.id" :value="branch.id" :label="branch.name"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="right">
        <el-row style="margin: 10px 0">
          <span>管辖人员：</span>
        </el-row>
        <el-transfer v-model="form.agents" :data="data" :titles="['所选门店经纪人', '管辖经纪人']"></el-transfer>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitUser('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改用户" :visible.sync="formVisible2" class="formVisible">
      <div class="left">
        <el-form :model="form2" ref="form2" :rules="rules">
          <el-form-item label="用户昵称" :label-width="formLabelWidth" prop="nickname">
            <el-input v-model="form2.nickname"></el-input>
          </el-form-item>
          <el-form-item label="登录名" :label-width="formLabelWidth" prop="username">
            <el-input v-model="form2.username"></el-input>
          </el-form-item>
          <el-form-item label="员工类型" :label-width="formLabelWidth" prop="staffType">
            <el-col :span="24">
              <el-select v-model="form2.staffType" filterable @change="staffTypeChange"
                         placeholder="员工类型">
                <el-option v-for="staff in staffTypeList2" :key="staff.englishName" :label="staff.name"
                           :value="staff.englishName"></el-option>
              </el-select>
            </el-col>
          </el-form-item>
          <el-form-item label="角色" :label-width="formLabelWidth" prop="role">
            <el-select v-model="form2.role" :disabled="form2.staffType === 'Admin'">
              <el-option v-for="role in roleList" :key="role.id" :value="role.id" :label="role.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管辖中介：" :label-width="formLabelWidth" prop="agencies">
            <el-select v-model="form2.agencies" multiple @change="getBranchListAdd(form.agencies)"
                       :disabled="form2.staffType === 'Admin'">
              <el-option v-for="agency in agencyList" :value="agency.id" :label="agency.name" :key="agency.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管辖门店：" :label-width="formLabelWidth" prop="branches">
            <el-select v-model="form2.branches" multiple :disabled="form2.staffType === 'Admin' || form.staffType === 'Interior'" @change="getRightData(form.branches)">
              <el-option v-for="branch in branchList" :key="branch.id" :value="branch.id" :label="branch.name"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="right">
        <el-row style="margin: 10px 0">
          <span>管辖人员：</span>
        </el-row>
        <el-transfer v-model="form2.agents" :data="data" :titles="['所选门店经纪人', '管辖经纪人']"></el-transfer>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm2('form2')">取 消</el-button>
        <el-button type="primary" @click="submitUser2('form2')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {pagination} from '../mixins/pagination.js'
  import store from '@/store'
  export default {
    mixins: [pagination],
    data() {
      return {
        addButton: false,
        staffTypeList: [],//人员类型
        staffTypeList2: [],//人员类型2
        data: [],
        roleId: '',//角色id
        loanerId: '',//资金端id
        loanerDisable: true,//用来控制资金端是否能选择
        editShow: true,//用来控制修改时候资金端是否显示
        agenciesIds: [],//存放选择的中介id
        branchesIds: [],//存放选择的门店id
        formVisible: false,
        formVisible2: false,
        formLabelWidth: '120px',
        roleList: [],
        agencyList: [],
        branchList: [],
        loanerList: [],
        form: {
          nickname: '',//昵称
          username: '',
          staffType: '',
          role: '',//角色
          branches: [],//管理门店
          agencies: [],//中介
          agents: []
        },
        form2: {
          nickname: '',//昵称
          username: '',
          staffType: '',
          role: '',//角色
          branches: [],//管理门店
          agencies: [],//中介
        },
        rules: {
          staffName: [{required: true, message: '请输入昵称', trigger: 'blur'}],
          username: [{required: true, message: '请输入登录名', trigger: 'blur'}],
          password: [{required: true, message: '请输入密码', trigger: 'blur'}],
          staffType: [{required: true, message: '请输入员工类型', trigger: 'change'}],
          loanerId: [{required: true, message: '请输入员工类型', trigger: 'change'}],
        },
        searchForm:{
          nickname: '',
          staffType: '',
          status:['Normal','Blocked']
        },
        url: '/api/v2/users/getList'
      }
    },
    created(){
      this.getStaffTypeList();
      this.getStaffTypeList2();
      this.getRoleList();
      this.getAgencyList();
      if(this.button.button.indexOf('新增') >= 0) {
        this.addButton = true;
      }
    },
    computed: {
      button() {
        return store.state.button;
      }
    },
    filters: {
      staffTypeFormat: function (value) {
        switch (value) {
          case 'Admin': return '管理员';
          case 'Interior': return '内部员工';
          case 'BranchManager': return '门店经理';
          case 'BrachDirector': return '门店主管';
          case 'BrachSalesman': return '门店业务员';
        }
      }
    },
    methods: {
      //新增员工类型变化时
      staffTypeChange() {
          this.form.role = '';
          this.form.agencies = [];
          this.form.branches = [];
          this.data = [];
      },
      addUser() {
        this.data = [];
        this.formVisible = true
      },
      //获取角色
      getRoleList() {
        this.axios.get('/api/v2/roles/getRoleAll').then((res) => {
            this.roleList = res.data;
        }).catch((error) => {
            this.$message.error(error.response.data.message);
        })
      },
      //获取中介
      getAgencyList() {
        this.axios.get('/api/v2/agencys/adminAndLib/getIdNameAgencyList').then((res) => {
          this.agencyList = res.data;
          console.log(this.agencyList);
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      getStaffTypeList() {
        this.axios.get('/api/v2/users/admin/registGetAllStaffType').then((res) => {
          this.staffTypeList = res.data;
          console.log(this.staffTypeList);
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      getStaffTypeList2() {
        this.axios.get('/api/v2/users/admin/addGetAllStaffType').then((res) => {
          this.staffTypeList2 = res.data;
          console.log(this.staffTypeList2);
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //只有当选择了中介，才能选择门店
      //新增
      getBranchListAdd(ids) {
        console.log(ids);
        this.axios.post('/api/v2/admin/branch/getBranchListByAgencyIdList', ids).then((res) => {
          this.branchList = res.data;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      getRightData(ids) {
        let that = this;
        that.data = [];
        if(this.form.staffType === 'BranchManager'){
            return;
        }
        this.axios.post('/api/v2/admin/getAgentListByAgencyIdList ', ids).then((res) => {
          res.data.forEach(item => {
              let form = {key: '',label: ''};
              form.key = item.id;
              form.label = item.branchName+'-'+item.name;
              that.data.push(form)
          });
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //修改
      handleEdit(row) {
//        console.log(row);
        //获取指定用户的详细信息
        this.axios.get('/api/v2/users/assign/' + row.id).then((res) => {
          console.log(res.data);
          this.form2 = res.data;
          //请求门店
          this.axios.post('/api/v2/admin/branch/getBranchListByAgencyIdList', this.form2.agencies).then((res) => {
            this.branchList = res.data;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
          this.formVisible2 = true;
        })
      },
      //锁定
      lock(id) {
        this.axios.put('/api/v2/users/admin/blockUser', [id]).then((res) => {
          this.tableData = res.data.content;
          this.totalElements = res.data.totalElements;
          this.$message({
            message: '锁定成功！',
            type: 'success'
          });
        })
      },
      //解锁
      unlock(id) {
        this.axios.put('/api/v2/users/admin/unblockUser', [id]).then((res) => {
          this.tableData = res.data.content;
          this.totalElements = res.data.totalElements;
          this.$message({
            message: '解锁成功！',
            type: 'success'
          });
        })
      },
      //确定新增
      submitUser(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.post('/api/v2/users/admin/addUser', this.form).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              this.formVisible = false;
              this.$message({
                message: '新增成功！',
                type: 'success'
              });
            }).catch((error) => {
              this.$message.error(error.response.data.message);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      //重置新增form
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.formVisible = false;
      },
      //修改提交
      submitUser2(formName) {
        let that = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            that.axios.put('/api/v2/users/admin/updateUser', that.form2).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              this.formVisible2 = false;
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
            }).catch((error) => {
              this.$message.error(error.response.data.message);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      //重置新增form
      resetForm2(formName) {
        this.$refs[formName].resetFields();
        this.formVisible2 = false;
      },
    }
  }
</script>

<style>
  .left {
    margin-right: 30px;
    background: none repeat scroll 0 0 #fff;
    box-sizing: border-box;
    display: inline-block;
    width: 40%;
    height: 334px;
    vertical-align: bottom;
  }

  .left .el-select {
    width: 100%;
  }

  .right {
    display: inline-block;
    background: none repeat scroll 0 0 #fff;
    width: 485px;
    height: 366px;
    box-sizing: border-box;
    overflow-y: scroll;
  }
  .right .el-transfer {
    width: 468px;
  }

  .formVisible .el-dialog {
    min-width: 922px;
  }
</style>
