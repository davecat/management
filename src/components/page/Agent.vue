<template>
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="form">
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable @change="getBranchList(searchForm.cityId)"
                     placeholder="选择城市">
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.branchId" placeholder="选择城市下的门店">
            <el-option v-for="branch in branchList" :key="branch.id" :label="branch.name"
                       :value="branch.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchForm.name" placeholder="经纪人姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0" v-if="importButton">
          <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
            <el-button type="info" @click="exportCSV()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="searchForm.status" @change="Search"
                         style="float: left;margin-top: 7px;min-width: 280px">
        <el-checkbox label="Pending">待审批</el-checkbox>
        <el-checkbox label="Enabled">启用</el-checkbox>
        <el-checkbox label="Disable">停用</el-checkbox>
        <el-checkbox label="NoPass">拒绝</el-checkbox>
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
      <el-table
        v-loading.body="loading"
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
      >
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
        <el-table-column min-width="80" label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-end"
                        v-if="scope.row.status === 'Enabled' || scope.row.status === 'Disable'">
              <el-button size="small" type="primary"
                         @click="handleEdit(scope.row)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="通过" placement="top-end"
                        v-if="scope.row.status === 'Pending'">
              <el-button size="small" type="success"
                         @click="pass(scope.row.id)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="拒绝" placement="top-end"
                        v-if="scope.row.status === 'Pending'">
              <el-button size="small" type="danger"
                         @click="noPass(scope.row.id)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="停用" placement="top-end"
                        v-if="scope.row.status === 'Enabled'">
              <el-button size="small" type="danger"
                         @click="disabledEdit(scope.row.id)"><i class="fa fa-lock" aria-hidden="true"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="启用" placement="top-end"
                        v-if="scope.row.status === 'Disable'">
              <el-button size="small" type="primary"
                         @click="openEdit(scope.row.id)"><i class="fa fa-unlock" aria-hidden="true"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="修改" :visible.sync="formVisible" size="tiny">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="人员姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" :label-width="formLabelWidth" prop="tel">
          <el-input v-model="form.tel"></el-input>
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
      title="审批拒绝"
      :visible.sync="dialogVisible3"
      size="tiny">
      <span>此操作将审批拒绝选中人员，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="multipleNoPass">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  import {pagination} from '../mixins/pagination.js'
  import json from "../../../static/city.json";
  import store from '@/store'
  export default {
    mixins: [pagination],
    data() {
      return {
        cityList: [],
        //按钮权限控制
        importButton: false,
        url: '/api/v2/agents/getAgentListPage',
        branchList: [],
        searchForm: {
          name: '',
          branchId: '',
          cityId: '',
          status: ["Pending", "NoPass", "Enabled", "Disable"],
        },
        form: {
          id: '',
          name: '',
          tel: ''
        },
        formVisible: false,
        dialogVisible: false,
        dialogVisible1: false,
        dialogVisible2: false,
        dialogVisible3: false,
        passId: '',
        noPassId: '',
        disabledId: '',
        openId: '',
        formLabelWidth: '100px',
        rules: {
          name: [{required: true, message: '请输入经纪人姓名', trigger: 'blur'}],
          tel: [{required: true, message: '请输入经纪人电话', trigger: 'blur'}]
        }
      }
    },
    created(){
      if(this.button.button.indexOf('导出') >= 0) {
        this.importButton = true;
      }

      //获取城市列表
      this.axios.get('/api/v2/branchs/getCitys').then((res) => {
        let citysIds = res.data.filter(item => item !== null);
        let citys = [];
        let all = {id: ' ', name: '全部'};
        citys.push(all);
        json.forEach(item => {
          if (item.children) {
            item.children.forEach(i => {
              citysIds.forEach(j => {
                if(j === i.value) {
                  citys.push({id: i.value, name: i.label});
                }
              })
            })
          }
        });
        this.cityList = citys;
      }).catch((error) => {
        this.$message.error(error.response.data.message);
      });
    },
    computed: {
      button() {
        return store.state.button;
      },
      staff (){
        return this.$store.state.staff.staff
      },
    },
    filters: {
      agentStatusFormat: function (value) {
        if (value === "Pending") {
          return "待审批";
        } else if (value === "NoPass") {
          return "审批不通过";
        } else if (value === "Enabled") {
          return "启用";
        } else if (value === "Disable") {
          return "停用";
        }
      },
      districtFormat: function (value) {
        if (!value) {
          return ''
        }
        let district = {};
        let findLabel = (item, value) => {
          if (item) {
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
        if (cityId !== ' ') {
          this.searchForm.branchId = '';
          this.branchList = [];
          this.axios.get('/api/v2/agents/getByCityIdBranch/'+cityId).then((res) => {
            this.branchList = res.data;
          }).catch((error) => {
            this.$message.error(error.response.data.error.data.message);
          })
        } else {
          this.searchForm.branchId = '';
          this.branchList = [{id: '', name: '全部'}];
        }
      },
      handleEdit(row) {
        this.form.id = row.id;
        this.form.tel = row.tel;
        this.form.name = row.name;
        this.formVisible = true;
      },
      //修改确认
      submitAgent(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.put('/api/v2/agents/update', this.form).then((res) => {
              this.getData();
              this.$message.success("修改成功！");
              this.$refs[formName].resetFields();
              this.formVisible = false;
            }).catch((error) => {
              this.$message.error(error.response.data.error.data.message);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      //通过
      pass(id) {
        this.passId = id;
        this.dialogVisible2 = true;
      },
      //拒绝
      noPass(id) {
        this.noPassId = id;
        this.dialogVisible3 = true;
      },
      //停用
      disabledEdit(id) {
        this.disabledId = id;
        this.dialogVisible1 = true;
      },
      //启用
      openEdit(id) {
        this.openId = id;
        this.dialogVisible = true;
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.formVisible = false;
      },
//      启用确认
      multipleEnable() {
        let form = {
          ids: [this.openId],
          enabled: 'true'
        };
        this.axios.put('/api/v2/agents/enabled', form).then((res) => {
          this.getData();
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible = false;
      },
      //停用确认
      multipleDisable() {
        let form = {
          ids: [this.disabledId],
          enabled: 'false'
        };
        this.axios.put('/api/v2/agents/enabled', form).then((res) => {
          this.getData();
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible1 = false;
      },
      //审批通过确认
      multiplePass() {
        let form = {
          ids: [this.passId],
          pass: 'true'
        };
        this.axios.put('/api/v2/agents/passAndNopass', form).then((res) => {
          this.getData();
          this.$message.success("已通过！");
        }).catch((error) => {
          this.$message.error(error.response.data.error);
        });
        this.dialogVisible2 = false;
      },
      //审批拒绝确认
      multipleNoPass() {
        let form = {
          ids: [this.noPassId],
          pass: 'false'
        };
        this.axios.put('/api/v2/agents/passAndNopass', form).then((res) => {
          this.getData();
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible3 = false;
      },
      districtFormat(value) {
        if (!value) {
          return ''
        }
        let district = {};
        let findLabel = (item, value) => {
          if (item) {
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
      },
      exportCSV() {
        var head = [["姓名", "联系电话", "城市", "门店", "人员状态"]];
        this.axios.post('/api/v2/agents/getAgentList', this.searchForm).then((res) => {
            var rowData = res.data;
            for (let i = 0; i < rowData.length; i++) {
              let Status;
              switch (rowData[i].status) {
                case 'Pending':
                  Status = '待审批';
                  break;
                case 'NoPass':
                  Status = '审批不通过';
                  break;
                case 'Enabled':
                  Status = '启用';
                  break;
                case 'Disable':
                  Status = '停用';
                  break;
              }
              let proName = this.districtFormat(rowData[i].province) + '-' + this.districtFormat(rowData[i].city) + '-' + this.districtFormat(rowData[i].district);
              head.push([rowData[i].name, rowData[i].tel, proName,rowData[i].branchName,Status]);
            }
            ;
            var csvRows = [];
            head.forEach(item => csvRows.push(item.join(', ')));
            var csvString = csvRows.join('\n');
            //BOM的方式解决EXCEL乱码问题
            var BOM = '\uFEFF';
            csvString = BOM + csvString;
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + encodeURI(csvString);
            a.target = '_blank';
            a.download = "经纪人" + ".csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        ).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      }
    }
  }
</script>

<style>

</style>
