<template xmlns="http://www.w3.org/1999/html">
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable placeholder="选择城市">
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item id="dave">
          <el-input v-model="searchForm.name" placeholder="小区名称、台账号、门牌号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0">
          <el-button type="success" @click="add()" v-if="addButton">新增房源</el-button>
          <el-tooltip class="item" effect="dark" content="批量导入" placement="top-start">
            <el-button type="info" @click="batchImport()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px">
      <el-checkbox-group v-model="searchForm.rentalType" @change="Search"
                         style="float: left; margin-top: 7px; min-width: 150px;">
        <el-checkbox label="Entire">整租</el-checkbox>
        <el-checkbox label="Joint">合租</el-checkbox>
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
          min-width="215"
          prop="city"
          label="城市">
          <template scope="scope">
            {{ scope.row.province}}-{{ scope.row.city}}-{{
            scope.row.district }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="accountCode"
          label="台账号">
        </el-table-column>
        <el-table-column
          min-width="300"
          label="出租类型">
          <template scope="scope">
            {{ scope.row.rentalType | rentalType}}
          </template>
        </el-table-column>
        <el-table-column
          min-width="300"
          prop="communityName"
          label="小区名称">
        </el-table-column>
        <el-table-column
          min-width="80"
          prop="houseNumber"
          label="门牌号">
        </el-table-column>
        <el-table-column
          min-width="300"
          prop="roomAmount"
          label="房间数">
        </el-table-column>
        <el-table-column min-width="123" label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
              <el-button size="small" type="warning"
                         :disabled="scope.row.enabled === 'false'"
                         @click="handleEdit(scope.row)"><i
                class="fa fa-pencil-square-o"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top-end">
              <el-button size="small" type="danger"
                         :disabled="scope.row.enabled === 'false'"
                         @click="rowDelete(scope.row.id)"><i class="fa fa-trash"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增房源" :visible.sync="formVisible" size="tiny">
      <el-form :model="form" ref="form" :rules="rules">
        <el-radio-group v-model="form.rentalType">
          <el-radio label='Entire'>整租</el-radio>
          <el-radio label='Joint'>合租</el-radio>
        </el-radio-group>
        <!--只有当登录人为内部员工时候才显示-->
        <el-form-item label="所属中介" :label-width="formLabelWidth" prop="agencyId">
          <el-select v-model="form.agencyId">
            <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name"
                       :value="agency.id"></el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item label="城市：" :label-width="formLabelWidth" prop="selectedOptions">-->
          <!--<el-cascader-->
            <!--:options="options"-->
            <!--v-model="selectedOptions">-->
          <!--</el-cascader>-->
        <!--</el-form-item>-->
        <el-form-item label="省：" :label-width="formLabelWidth" prop="province">
          <el-col :span="24">
            <el-input v-model="form.province"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="市：" :label-width="formLabelWidth" prop="city">
          <el-col :span="24">
            <el-input v-model="form.city"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="区(县)：" :label-width="formLabelWidth" prop="district">
          <el-col :span="24">
            <el-input v-model="form.district"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="详细地址：" :label-width="formLabelWidth" prop="address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="小区名称：" :label-width="formLabelWidth" prop="communityName">
          <el-input v-model="form.communityName"></el-input>
        </el-form-item>
        <el-form-item label="门牌号：" :label-width="formLabelWidth" prop="houseNumber">
          <el-input v-model="form.houseNumber"></el-input>
        </el-form-item>
        <el-form-item label="房间数：" :label-width="formLabelWidth" prop="roomAmount" v-if="form.rentalType !== 'Entire'">
          <el-select v-model="form.roomAmount">
            <el-option value="2">2</el-option>
            <el-option value="3">3</el-option>
            <el-option value="4">4</el-option>
            <el-option value="5">5</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="台账号：" :label-width="formLabelWidth" prop="accountCode">
          <el-input v-model="form.accountCode"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitBranch('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改房源" :visible.sync="formVisible2">
      <el-form :model="form2" ref="form2" :rules="rules">
        <el-radio-group v-model="form2.rentalType">
          <el-radio label='Entire'>整租</el-radio>
          <el-radio label='Joint'>合租</el-radio>
        </el-radio-group>
        <!--只有当登录人为内部员工时候才显示-->
        <el-form-item label="所属中介" :label-width="formLabelWidth" prop="agencyId">
          <el-select v-model="form2.agencyId">
            <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name"
                       :value="agency.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市：" :label-width="formLabelWidth" prop="selectedOptions">
          <el-cascader
            :options="options"
            v-model="selectedOptions">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" :label-width="formLabelWidth" prop="address">
          <el-input v-model="form2.address"></el-input>
        </el-form-item>
        <el-form-item label="小区名称：" :label-width="formLabelWidth" prop="communityName">
          <el-input v-model="form2.communityName"></el-input>
        </el-form-item>
        <el-form-item label="门牌号：" :label-width="formLabelWidth" prop="houseNumber">
          <el-input v-model="form2.houseNumber"></el-input>
        </el-form-item>
        <el-form-item label="房间数：" :label-width="formLabelWidth" prop="roomAmount" v-if="form2.rentalType !== 'Entire'">
          <el-select v-model="form2.roomAmount">
            <el-option value="2">2</el-option>
            <el-option value="3">3</el-option>
            <el-option value="4">4</el-option>
            <el-option value="5">5</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="台账号：" :label-width="formLabelWidth" prop="accountCode">
          <el-input v-model="form2.accountCode"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm2('form2')">取 消</el-button>
        <el-button type="primary" @click="submitBranch2('form2')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="删除房源"
      :visible.sync="dialogVisible"
      size="tiny">
      <span>此操作将删除当前房源，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleDelete">确 定</el-button>
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

    <el-dialog
      title="批量导入"
      :visible.sync="importVisible"
      size="tiny">
      <span style="display: block">1，使用“下载模板”填写房源数据</span><br>
      <div style="margin-bottom: 10px">2，保存后点击“上传”进行数据批量导入</div>
      <el-select v-model="form3.agencyId" placeholder="请选择中介">
        <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name"
                   :value="agency.id"></el-option>
      </el-select>
      <el-upload
        class="upload-demo"
        :data="form3"
        action="/api/v2/apartments/uploadBatchApartment"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-success="uploadSuccess"
        :file-list="fileList">
        <el-button size="small" type="primary">上传</el-button>
      </el-upload>
      <span slot="footer" class="dialog-footer">
                <el-button @click="importVisible = false">取 消</el-button>
                <el-button type="primary" @click="exportCSV">下载模板</el-button>
                <!--<el-button type="primary" @click="importCSV">上传</el-button>-->
            </span>
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
        cityList: [],
        //按钮权限控制
        addButton:false,
        form3:{agencyId: ''},
        fileList: [],
        url: '/api/v2/apartments/getBranchListPage',
        //省市县
        selectedOptions: [],
        agencyList: [],
        searchForm: {
          cityId: '',
          rentalType: ['Entire', 'Joint']
        },
        form: {
          id: '',
          accountCode: '',
          communityName: '',
          houseNumber: '',
          agencyId: '',
          name: '',
          address: '',
          roomAmount: '2',
          rentalType: 'Entire',
          city: '',
          district: '',
          province: ''
        },
        form2: {
          id: '',
          accountCode: '',
          communityName: '',
          houseNumber: '',
          agencyId: '',
          name: '',
          address: '',
          roomAmount: '',
          rentalType: '',
          city: '',
          district: '',
          province: ''
        },
        importVisible: false,
        formVisible: false,
        formVisible2: false,
        dialogVisible: false,
        dialogQRCode: false,
        deleteId: '',
        qrCodeUrl: 'http://images.tmtpost.com/uploads/images/2014/14/report/30519/mac600.jpg',
        formLabelWidth: '156px',
        rules: {
          agencyId: [{required: true, message: '请选择中介', trigger: 'change'}],
          accountCode: [{required: true, message: '请输入台账号', trigger: 'blur'}],
          address: [{required: true, message: '请输入门店地址', trigger: 'blur'}],
          communityName: [{required: true, message: '请输入小区名称', trigger: 'blur'}],
          houseNumber: [{required: true, message: '请输入门牌号', trigger: 'blur'}]
        }
      }
    },
    created(){
      this.init();
      this.getAgencyList();
      if(this.button.button.indexOf('新增') >= 0) {
        this.addButton = true;
      }
    },
    computed: {
      button() {
        return store.state.button;
      },
      staff() {
          return this.$store.state.staff.staff
      },
      staff() {
        return store.state.staff.staff
      }
    },
    filters: {
      rentalType: function (value) {
        switch (value) {
          case 'Entire': return '整租';
          case 'Joint': return '合租';
        }
      }
    },
    methods: {
      uploadSuccess() {
          this.importVisible = false;
          this.getData();
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      },
      batchImport() {
          this.importVisible = true

      },
      init() {
        //获取城市列表
        this.axios.get('/api/v2/branchs/getCitys').then((res) => {
          let citys = [];
          let all = {id: ' ', name: '全部'};
          citys.push(all);
          this.cityList = citys;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      getAgencyList() {
        this.axios.get('/api/v2/agencys/adminAndLib/getIdNameAgencyList').then((res) => {
          this.agencyList = res.data;
          console.log(this.agencyList);
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //新增确认
      submitBranch(formName) {
        //把省市县的值带到后台
        this.$refs[formName].validate((valid) => {
          if (valid) {
            console.log(this.form);
            this.axios.post('/api/v2/apartments/add', this.form).then((res) => {
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
        //把省市县的值带到后台
        this.form2.province = this.selectedOptions[0];
        this.form2.city = this.selectedOptions[1];
        this.form2.district = this.selectedOptions[2];
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.put('/api/v2/apartments/update', this.form2).then((res) => {
              this.getData();
              this.$message({
                message: "修改成功",
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
        this.selectedOptions = [row.province, row.city, row.district];
        this.form2 = Object.assign({},row);
        this.formVisible2 = true;
      },
      rowDelete(id) {
        this.dialogVisible = true;
        this.deleteId = id;
      },
      //删除
      multipleDelete() {
        this.axios.put('/api/v2/apartments/del',[this.deleteId]).then((res) => {
          this.getData();

        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible = false;
      },
      exportCSV() {
        var head = [["小区名称", "门牌号", "省","市","区","详细地址","房间数量","台账号","整租或合租（“0”表示整租“1”表示合租）"]];
        var csvRows = [];
        head.forEach(item => csvRows.push(item.join(', ')));
        var csvString = csvRows.join('\n');
        //BOM的方式解决EXCEL乱码问题
        var BOM = '\uFEFF';
        csvString = BOM + csvString;
        var a = document.createElement('a');
        a.href = 'data:attachment/csv,' + encodeURI(csvString);
        a.target = '_blank';
        a.download = "模板" + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      importCSV() {
        console.log(document.getElementById("import").files[0]);
        this.axios.post('/api/v2/apartments/uploadBatchApartment ',{file:document.getElementById("import").files[0]}).then((res) => {


        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      }
    }
  }
</script>

<style>
  #dave .el-form-item__content{
    width: 200px;
  }
 .el-upload--text {
   width: 50px;
   height: 33px;
 }
  .upload-demo {
    display: inline-block;
    vertical-align: middle;
  }
</style>
