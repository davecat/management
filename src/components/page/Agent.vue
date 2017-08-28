<template>
  <div>
    <el-row>
      <el-form :inline="true" :model="form">
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable @change="getBranchList(searchForm.cityId)">
            <el-option label="选择城市" value=""></el-option>
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.branchId">
            <el-option label="选择城市下的门店" value=""></el-option>
            <el-option v-for="branch in branchList" :key="branch.id" :label="branch.name" :value="branch.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" >导出</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="checkList" style="float: left;margin-top: 12px;min-width: 280px">
        <el-checkbox label="待审批"></el-checkbox>
        <el-checkbox label="启用"></el-checkbox>
        <el-checkbox label="停用"></el-checkbox>
        <el-checkbox label="拒绝"></el-checkbox>
      </el-checkbox-group>
      <div class="pagination" style="position: absolute; right: 0; top: 0; margin: 0;">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </div>
    </el-row>
    <el-row>
      <el-table
        v-loading.body="loading"
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50">
        </el-table-column>
        <el-table-column
          min-width="80"
          prop="name"
          label="姓名">
        </el-table-column>
        <el-table-column
          min-width="86"
          prop="tel"
          label="联系电话">
        </el-table-column>
        <el-table-column
          min-width="180"
          prop="city"
          label="城市">
          <template scope="scope">
            {{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
            scope.row.district | districtFormat }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="branchName"
          label="门店">
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="status"
          label="人员状态">
          <template scope="scope">
            {{ scope.row.status | agentStatusFormat }}
          </template>
        </el-table-column>
        <el-table-column  min-width="50" label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
              <el-button size="small" type="primary"
                         @click="handleEdit(scope.row)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="修改经纪人" :visible.sync="formVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="所属中介：">
          <span>{{ form.agencyName }}</span>
        </el-form-item>
        <el-form-item label="所属门店：">
          <span>{{ form.branchName }}</span>
        </el-form-item>
        <el-form-item label="人员编号" :label-width="formLabelWidth">
          <span>{{ form.id }}</span>
        </el-form-item>
        <el-form-item label="人员姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" :label-width="formLabelWidth" prop="tel">
          <el-input v-model="form.tel"></el-input>
        </el-form-item>
        <el-form-item label="工号" :label-width="formLabelWidth" prop="staffNo">
          <el-input v-model="form.staffNo"></el-input>
        </el-form-item>
        <el-form-item label="人员状态：" :label-width="formLabelWidth" prop="status">
          <span>{{ form.status | agentStatusFormat }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitAgent('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="启用"
      :visible.sync="dialogVisible"
      size="tiny">
      <span>此操作将启用选中人员，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleEnable">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="停用"
      :visible.sync="dialogVisible1"
      size="tiny">
      <span>此操作将停用选中人员，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible1 = false">取 消</el-button>
                <el-button type="primary" @click="multipleDisable">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="审批通过"
      :visible.sync="dialogVisible2"
      size="tiny">
      <span>此操作将审批通过选中人员，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="multiplePass">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="审批不通过"
      :visible.sync="dialogVisible3"
      size="tiny">
      <span>此操作将审批不通过选中人员，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="multipleNoPass">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  import { pagination } from '../mixins/pagination.js'
  import json from "../../../static/city.json";
  export default {
    mixins: [pagination],
    data() {
      return {
        checkList: [],//选择的数组
        url: '/api/v1/agent/getAgentPage',
        branchList: [],
        searchForm: {
          name: '',
          branchId: '',
          cityId: '',
          tel: '',
          status: '',
        },
        form: {
          name: '',
          tel: '',
          staffNo: '',
          status: ''
        },
        formVisible: false,
        dialogVisible: false,
        dialogVisible1: false,
        dialogVisible2: false,
        dialogVisible3: false,
        formLabelWidth: '100px',
        rules: {
          name: [{required: true, message: '请输入经纪人姓名', trigger: 'blur'}],
          tel: [{required: true, message: '请输入经纪人电话', trigger: 'blur'}],
          staffNo: [{required: true, message: '请输入经纪人工号', trigger: 'blur'}],
          status: [{required: true, message: '请选择状态', trigger: 'change'}]
        }
      }
    },
    created(){
    },
    computed: {
      staff (){
        return this.$store.state.staff.staff
      },
      cityList () {
        let citys = [];
        json.forEach(item => {
          if(item.children){
            item.children.forEach(i => {
              citys.push({id: i.value, name: i.label});
            })
          }
        });
        return citys;
      }
    },
    filters: {
      agentStatusFormat: function (value) {
        if (value === "Pending") {
          return "待审批";
        } else if(value === "NoPass"){
          return "审批不通过";
        } else if (value === "Enabled") {
          return "启用";
        } else if (value === "Disable") {
          return "停用";
        }
      },
      districtFormat: function (value) {
        if(!value){
          return ''
        }
        let district = {};
        let findLabel = (item, value) => {
          if(item) {
            return item.some(i => {
              if (value === i.value) {
                district = i;
                return true;
              } else {
                return findLabel(i.children, value)
              }
            });
          }
        };
        findLabel(json, value);
        return district.label;
      }
    },
    methods: {
      getBranchList(cityId) {
        if (cityId !== '') {
          let param = {city: [cityId]};
          this.axios.post('/api/v1/branch/getBranchListByLocation', param).then((res) => {
            this.branchList = res.data;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        } else {
          this.searchForm.branchId = '';
          this.branchList = [];
        }
      },
      handleEdit(row) {
        this.form.id = row.id;
        this.form.tel = row.tel;
        this.form.name = row.name;
        this.form.staffNo = row.staffNo;
        this.form.status = row.status;
        this.form.branchName = row.branchName;
        this.formVisible = true;
      },
      submitAgent(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.put('/api/v1/agent', this.form).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              this.formVisible = false;
            }).catch((error) => {
              this.$message.error(error.response.data.message);
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
      multipleEnable() {
        let ids = this.multipleSelection.map(row => {
          return row.id
        });
        if (ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v1/agent/enabled', ids).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        }
        this.dialogVisible = false;
      },
      multipleDisable() {
        let ids = this.multipleSelection.map(row => {
          return row.id
        });
        if (ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v1/agent/disable', ids).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        }
        this.dialogVisible1 = false;
      },
      multiplePass() {
        let ids = this.multipleSelection.map(row => {
          return row.id
        });
        if (ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v1/agent/pass', ids).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        }
        this.dialogVisible2 = false;
      },
      multipleNoPass() {
        let ids = this.multipleSelection.map(row => {
          return row.id
        });
        if (ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v1/agent/noPass', ids).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        }
        this.dialogVisible3 = false;
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      }
    }
  }
</script>

<style>

</style>
