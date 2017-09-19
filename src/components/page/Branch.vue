<template>
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable placeholder="选择城市">
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button  @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0">
          <el-button type="success" @click="add()" v-if="addButton">新增门店</el-button>
          <el-tooltip class="item" effect="dark" content="导出" placement="top-start" v-if="importButton">
            <el-button type="info" @click="exportCSV()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="searchForm.enabled" @change="Search"
                         style="float: left; margin-top: 7px; min-width: 150px;">
        <el-checkbox label="true">启用</el-checkbox>
        <el-checkbox label="false">停用</el-checkbox>
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
        style="width: 100%">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="name"
          label="门店名称">
        </el-table-column>
        <el-table-column
          min-width="215"
          prop="city"
          label="门店城市">
          <template scope="scope">
            {{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
            scope.row.district | districtFormat }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="300"
          prop="address"
          label="门店地址">
        </el-table-column>
        <el-table-column
          min-width="80"
          prop="enabled"
          label="门店状态"
          show-overflow-tooltip>
          <template scope="scope">
            <div slot="reference" :class="scope.row.enabled === 'false'? 'name-wrapper-1':'name-wrapper-normal'">
              <el-tag>{{ scope.row.enabled === 'true' ? '启用' : '停用' }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="123" label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
              <el-button size="small" type="primary"
                         :disabled="scope.row.enabled === 'false'"
                         @click="handleEdit(scope.row)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="停用" placement="top-end">
              <el-button size="small" type="warning"
                         :disabled="scope.row.enabled === 'false'"
                         @click="rowDisabled(scope.row.id)"><i class="fa fa-trash"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="查看二维码" placement="top-end">
              <el-button size="small" type="success"
                         :disabled="scope.row.enabled === 'false'"
                         @click="showQRCode(scope.row)"><i class="fa fa-qrcode"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增门店" :visible.sync="formVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <!--只有当登录人为内部员工时候才显示-->
        <el-form-item label="所属中介：" :label-width="formLabelWidth" prop="agencyId" v-if="staff.staffType === 'Interior'">
          <el-select v-model="form.agencyId">
            <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name"
                       :value="agency.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门店名称：" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="省市区（县）：" :label-width="formLabelWidth" prop="selectedOptions">
          <el-cascader
            :options="options"
            v-model="selectedOptions">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" :label-width="formLabelWidth" prop="address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitBranch('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改门店" :visible.sync="formVisible2">
      <el-form :model="form2" ref="form2" :rules="rules">
        <el-form-item label="门店名称：" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item label="省市区（县）：" :label-width="formLabelWidth" prop="selectedOptions">
          <el-cascader
            :options="options"
            v-model="selectedOptions">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" :label-width="formLabelWidth" prop="address">
          <el-input v-model="form2.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm2('form2')">取 消</el-button>
        <el-button type="primary" @click="submitBranch2('form2')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="停用"
      :visible.sync="dialogVisible"
      size="tiny">
      <span>此操作将停用选中门店，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleDisabled">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="门店二维码"
      :visible.sync="dialogQRCode"
      size="tiny">
      <span><img :src="qrCodeUrl" width="100%"></span>
      <span style="text-align:center;display:block;">经纪人注册专用</span>
      <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogQRCode = false">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  import json from "static/city.json";
  import {pagination} from '../mixins/pagination.js'
  import store from '@/store'
  export default {
    mixins: [pagination],
    data() {
      return {
        //按钮权限控制
        importButton: false,
        addButton:false,
        url: '/api/v2/branchs/getBranchListPageByAgencyId',
        //省市县
        selectedOptions: [],
        agencyList: {},
        searchForm: {
          name: '',
          cityId: '',
          enabled: ['true', 'false']
        },
        form: {
          id: '',
          agencyId: '',
          name: '',
          address: '',
          enabled: 'true'
        },
        form2: {
          id: '',
          name: '',
          address: ''
        },
        formVisible: false,
        formVisible2: false,
        dialogVisible: false,
        dialogQRCode: false,
        disabledId: '',
        qrCodeUrl: 'http://images.tmtpost.com/uploads/images/2014/14/report/30519/mac600.jpg',
        formLabelWidth: '120px',
        rules: {
          agencyId: [{required: true, message: '请选择中介', trigger: 'change'}],
          name: [{required: true, message: '请输入门店名称', trigger: 'blur'}],
          address: [{required: true, message: '请输入门店地址', trigger: 'blur'}],
          enabled: [{required: true, message: '请选择状态', trigger: 'change'}]
        }
      }
    },
    created(){
      this.init();
      this.getAgencyList();
    },
    computed: {
      button() {
        return store.state.button;
      },
      getBranchList(cityId) {
        if (cityId !== '') {
          let param = {city: [cityId]};
          this.axios.post('/api/v1/branch/getBranchListByLocation', param).then((res) => {
            this.branchList = res.data;
          }).catch((error) => {
            this.$message.error(error.response.data.error.message);
          })
        } else {
          this.searchForm.branchId = '';
          this.branchList = [];
        }
      },
      //获取城市列表
      cityList () {
        let citys = [];
        let all = {id: ' ', name: '全部'};
        citys.push(all);
        json.forEach(item => {
          if (item.children) {
            item.children.forEach(i => {
              citys.push({id: i.value, name: i.label});
            })
          }
        });
        return citys;
      },
//      Interior, //内部员工
//      Boss,     // 中介公司负责人
//      Branch,   // 门店管理员
//      Loaner,   // 资金端管理员
      staff() {
        return store.state.staff.staff
      }
    },
    filters: {
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
      init: function () {
        let that = this;
        this.options = json;
        console.log(this.button.button);
        console.log(this.button.button.indexOf('导出'));
        if(this.button.button.indexOf('新增') >= 0) {
            this.addButton = true;
        }
        if(this.button.button.indexOf('导出') >= 0) {
          this.importButton = true;
        }
      },
      getAgencyList() {
        this.axios.get('/api/v2/agencys/adminAndLib/getIdNameAgencyList').then((res) => {
          this.agencyList = res.data;
        }).catch((error) => {
          this.$message.error(error.response.data.error.message);
        })
      },
      //新增确认
      submitBranch(formName) {
        //把省市县的值带到后台
        this.form.province = this.selectedOptions[0];
        this.form.city = this.selectedOptions[1];
        this.form.district = this.selectedOptions[2];
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.post('/api/v2/branchs/add', this.form).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              //清空省市区
              this.selectedOptions = [];
              this.formVisible = false;
            }).catch((error) => {
              this.$message.error(error.response.data.error.message);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      //修改确认
      submitBranch2(formName) {
        //把省市县的值带到后台
        this.form2.province = this.selectedOptions[0];
        this.form2.city = this.selectedOptions[1];
        this.form2.district = this.selectedOptions[2];
        console.log(this.form2);
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.put('/api/v2/branchs/update', this.form2).then((res) => {
              this.getData();
              this.$message({
                message: "修改成功",
                type: 'success'
              });
              this.$refs[formName].resetFields();
              this.formVisible2 = false;
            }).catch((error) => {
              this.$message.error(error.response.data.error.message);
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        //清空省市区
        this.selectedOptions = [];
        this.formVisible = false;
      },
      resetForm2(formName) {
        this.$refs[formName].resetFields();
        this.formVisible2 = false;
      },
      //新增
      add() {
        this.formVisible = true;
      },
      handleEdit(row) {
        //带过来默认的省市区
        this.selectedOptions = [row.province, row.city, row.district];
        this.form2.id = row.id;
        this.form2.name = row.name;
        this.form2.address = row.address;
        this.formVisible2 = true;
      },
      rowDisabled(id) {
        this.dialogVisible = true;
        this.disabledId = id;
      },
      //禁用
      multipleDisabled() {
        let form = {
          ids: [],
          enabled: 'false'
        };
        form.ids.push(this.disabledId);
        if (form.ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v2/branchs/updateEnabled', form).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.error.message);
          })
        }
        this.dialogVisible = false;
      },
      showQRCode(row) {
        this.axios.get('/admin/api/branch/getBranchQRCode', {
          params: {
            branchId: row.id,
            branchName: row.name
          }
        }).then((res) => {
          this.qrCodeUrl = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + res.data.ticket;
          this.dialogQRCode = true;
        }).catch((error) => {
          this.$message.error(error.response.data.error.message);
        });
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
        var head = [["门店名称", "门店城市", "门店地址", "门店状态"]];
        let param = {};
        if (this.staff.staffType === 'Interior') {
          param = {
            agencyId: '',
            ...this.searchForm
          }
        } else {
          param = {
            agencyId: this.staff.agencies[0].id,
            ...this.searchForm
          }
        }
        this.axios.post('/api/v2/branchs/getBranchListByAgencyId', param).then((res) => {
            var rowData = res.data;
            for (let i = 0; i < rowData.length; i++) {
              let enabledStatus;
              switch (rowData[i].enabled) {
                case 'true':
                  enabledStatus = '启用';
                  break;
                case 'false':
                  enabledStatus = '停用';
                  break;
              }
              let proName = this.districtFormat(rowData[i].province) + '-' + this.districtFormat(rowData[i].city) + '-' + this.districtFormat(rowData[i].district);
              head.push([rowData[i].name, proName, rowData[i].address, enabledStatus]);
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
            a.download = "代客还房租" + ".csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        ).catch((error) => {
          this.$message.error(error.response.data.error.message);
        });
      }
    }
  }
</script>

<style scoped>
  .name-wrapper-1 .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: red;
  }
  .name-wrapper-normal .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: #000;
  }
  .el-cascader {
    width: 100%;
  }
</style>
