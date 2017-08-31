<template>
  <div>
    <el-row>
      <el-form  :inline="true" :model="searchForm">
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable placeholder="选择城市">
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" @click="add()">新增</el-button>
          <el-button type="primary" >导出</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="searchForm.enabled" @change="Search" style="float: left; margin-top: 12px; min-width: 150px;">
        <el-checkbox label="true">启用</el-checkbox>
        <el-checkbox label="false">停用</el-checkbox>
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
            {{ scope.row.enabled ? '启用':'停用' }}
          </template>
        </el-table-column>
        <el-table-column  min-width="123" label="操作">
          <template scope="scope">
            <el-tooltip v-if="staff.staffType !== 'Branch'" class="item" effect="dark" content="修改" placement="top-end">
              <el-button size="small" type="primary"
                         @click="handleEdit(scope.row)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="staff.staffType !== 'Branch'" class="item" effect="dark" content="停用" placement="top-end">
              <el-button size="small" type="warning"
                         @click="rowDelete(scope.row.id)"><i class="fa fa-trash"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="查看二维码" placement="top-end">
              <el-button size="small" type="success"
                         @click="showQRCode(scope.row)"><i class="fa fa-qrcode"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增门店" :visible.sync="formVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="所属中介" :label-width="formLabelWidth" prop="agencyId">
          <el-select v-model="form.agencyId">
            <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name" :value="agency.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门店名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="省市区（县）" :label-width="formLabelWidthCity" prop="selectedOptions">
          <el-cascader
            :options="options"
            v-model="selectedOptions"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" :label-width="formLabelWidth" prop="address">
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
        <el-form-item label="门店名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item label="省市区（县）" :label-width="formLabelWidthCity" prop="selectedOptions">
          <el-cascader
            :options="options"
            v-model="selectedOptions"
            @change="handleChange2">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" :label-width="formLabelWidth" prop="address">
          <el-input v-model="form2.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm2('form2')">取 消</el-button>
        <el-button type="primary" @click="submitBranch2('form2')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="删除"
      :visible.sync="dialogVisible"
      size="tiny">
      <span>此操作将删除选中门店，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleDelete">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="停用"
      :visible.sync="dialogVisible2"
      size="tiny">
      <span>此操作将停用选中门店，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="multipleDisable">确 定</el-button>
            </span>
    </el-dialog>

    <el-dialog
      title="删除"
      :visible.sync="dialogVisible3"
      size="tiny">
      <span>此操作将删除选中门店，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="handleDelete">确 定</el-button>
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
  import { pagination } from '../mixins/pagination.js'
  import store from '@/store'
  export default {
    mixins: [pagination],
    data() {
      return {
        url: '/api.wezebra.com/v2/branchs/getBranchListPageByAgencyId',
        //省市县
        selectedOptions: [],
        formLabelWidthCity: '156px',
        multipleSelection: [],
        multipleEditButton: false,
        agencyList: {},
        searchForm: {
          name: '',
          cityId: '',
          enabled: ['true','false']
        },
        form: {
          id: '',
          agencyId: '',
          name: ''
        },
        form2:{
          id: '',
          name: '',
          address: ''
        },
        formVisible: false,
        formVisible2: false,
        dialogVisible: false,
        dialogVisible2: false,
        dialogVisible3: false,
        dialogQRCode: false,
        deleteId: '',
        qrCodeUrl: 'http://images.tmtpost.com/uploads/images/2014/14/report/30519/mac600.jpg',
        formLabelWidth: '156px',
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
      //获取城市列表
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
      staff (){
        return store.state.staff.staff
      },
      cityList () {
        let citys = [];
        let all = {id: ' ',name: '全部'};
        citys.push(all);
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
      init: function () {
        this.options = json;
      },
      //切换省市区
      handleChange(value) {
        //把省市县的值带到后台
        this.form.province = this.selectedOptions[0];
        this.form.city = this.selectedOptions[1];
        this.form.district = this.selectedOptions[2];
      },
      handleChange2() {
        //把省市县的值带到后台
        this.form2.province = this.selectedOptions[0];
        this.form2.city = this.selectedOptions[1];
        this.form2.district = this.selectedOptions[2];
      },
      getAgencyList() {
        this.axios.get('/api/v1/agency/getAgencyList').then((res) => {
          this.agencyList = res.data;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //新增确认
      submitBranch(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.post('/api/v1/branch', this.form).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              //清空省市区
              this.selectedOptions = [];
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
      //修改确认
      submitBranch2(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.put('/api.wezebra.com/v2/branchs', this.form2).then((res) => {
              this.getData();
              this.$message({
                message:"修改成功",
                type: 'success'
              });
              this.$refs[formName].resetFields();
              this.formVisible2 = false;
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
        this.selectedOptions = [row.province,row.city,row.district];
        this.form2.id = row.id;
        this.form2.code = row.code;
        this.form2.name = row.name;
        this.form2.address = row.address;
        this.form2.enabled = String(row.enabled);
        this.formVisible2 = true;
      },
      rowDelete(id) {
        this.dialogVisible3 = true;
        this.deleteId = id;
      },
      handleDelete() {
        this.axios.put('/api/v1/branch/delete', [this.deleteId]).then((res) => {
          this.getData();
          this.dialogVisible3 = false;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      multipleEdit() {
        let row = this.multipleSelection[0];
        if(row !== undefined) {
          this.handleEdit(row);
        }
      },
      multipleDelete() {
        let ids = this.multipleSelection.map(row => {
          return row.id
        });
        if (ids.length === 0) {
          console.log('ids is null');
        } else {
          this.axios.put('/api/v1/branch/delete', ids).then((res) => {
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
          this.axios.put('/api/v1/branch/disable', ids).then((res) => {
            this.getData();
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        }
        this.dialogVisible2 = false;
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
          this.$message.error(error.response.data.message);
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
        this.multipleEditButton = val.length > 1;
      }
    }
  }
</script>

<style>

</style>
