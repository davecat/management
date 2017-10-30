<template>
  <div>
    <el-row>
      <el-tabs v-model="activeName" @tab-click="tabChange()">
        <el-tab-pane label="应收款" name="Rejected">
          <el-row style="margin-bottom: -15px">
            <el-form :inline="true" :model="searchForm">
              <el-form-item>
                <el-date-picker
                  type="daterange"
                  @change="dateChange"
                  v-model="applyDate"
                  align="right"
                  placeholder="应收款日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-input v-model="searchForm.applicationNoOrCustomnerName" placeholder="申请编号或租客姓名" @keyup.enter.native="Search"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="Search">查询</el-button>
              </el-form-item>
              <el-form-item style="float: right;margin-right: 0" v-if="importButton">
                <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
                  <el-button type="info" @click="exportCSV()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :span="4" style="float: left;margin-top: 7px;color: red;min-width: 190px">
              应收合计:{{ sumPayeeAmount | currency}}
            </el-col>
            <div class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
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
              :data="tableData"
              :default-sort="{prop: 'payeeDate', order: 'descending'}"
              style="width: 100%">
              <el-table-column
                prop="payeeDate"
                sortable
                min-width="130"
                label="应收款日期">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.payeeDate | dateFormat }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="payeeAmount"
                label="应收金额">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-blue">
                    <el-tag>{{ scope.row.payeeAmount | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="136"
                prop="applicationNo"
                label="申请编号">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.applicationNo }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="totalAmount"
                label="分期总金额">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.totalAmount | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                prop="customerName"
                label="租客姓名">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.customerName}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="150"
                prop="mobile"
                label="联系方式">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.mobile}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="150"
                prop="apartmentNo"
                label="台账号">
                <template scope="scope">
                  {{ scope.row.apartmentNo?scope.row.apartmentNo:'无'}}
                </template>
              </el-table-column>
              <el-table-column
                min-width="115"
                prop="rentPeriod"
                label="租期">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.rentPeriod}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="180"
                prop="startDate"
                label="起止时间">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.startDate | dateFormat}}-{{ scope.row.endDate | dateFormat}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="月租金">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.monthlyRent | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="180"
                prop="city"
                label="城市">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
                      scope.row.district | districtFormat }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="130"
                prop="responsibleAgent"
                label="经纪人">
                <template scope="scope">
                  {{ scope.row.responsibleBranch }}-{{ scope.row.responsibleAgent }}
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="中退清算" name="Canceled">
          <el-row style="margin-bottom: -15px">
            <el-form :inline="true" :model="searchForm2">
              <el-form-item>
                <el-date-picker
                  @change="dateChange2"
                  v-model="searchForm2.refundDate"
                  align="right"
                  type="date"
                  placeholder="报违约日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-input v-model="searchForm2.applicationNoOrCustomnerName" placeholder="申请编号或租客姓名" @keyup.enter.native="Search2"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="Search2">查询</el-button>
              </el-form-item>
              <el-form-item style="float: right;margin-right: 0" v-if="importButton">
                <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
                  <el-button type="info" @click="exportCSV2()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :span="4" style="float: left;margin-top: 7px;color: red;min-width: 190px">
              应退合计:{{ sumRefundAmount | currency}}
            </el-col>
            <div class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
              <el-pagination
                @current-change="handleCurrentChange2"
                layout="total, prev, pager, next"
                :total="totalElements2">
              </el-pagination>
            </div>
          </el-row>
          <el-row>
            <el-table
              v-loading.body="loading"
              :data="tableData2"
              :default-sort="{prop: 'payeeDate', order: 'descending'}"
              style="width: 100%">
              <el-table-column
                prop="refundDate"
                sortable
                min-width="130"
                label="报违约日期">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-refundDate">
                    <el-tag>{{ scope.row.refundDate | dateFormat }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="refundAmount"
                label="应退金额">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-blue">
                    <el-tag>{{ scope.row.refundAmount | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="136"
                prop="applicationNo"
                label="申请编号">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.applicationNo }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                prop="customerName"
                label="租客姓名">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.customerName}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="150"
                prop="apartmentNo"
                label="台账号">
                <template scope="scope">
                  {{ scope.row.apartmentNo?scope.row.apartmentNo:'无'}}
                </template>
              </el-table-column>
              <el-table-column
                min-width="180"
                prop="startDate"
                label="起止时间">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.startDate | dateFormat}}-{{ scope.row.endDate | dateFormat}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="115"
                prop="rentPeriod"
                label="租期">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.rentPeriod}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="月租金">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.monthlyRent | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="180"
                prop="city"
                label="城市">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
                      scope.row.district | districtFormat }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="130"
                prop="responsibleAgent"
                label="经纪人">
                <template scope="scope">
                  {{ scope.row.responsibleBranch }}-{{ scope.row.responsibleAgent }}
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="租客账单" name="customerBill">
          <el-row style="margin-bottom: -15px">
            <el-form :inline="true" :model="searchForm2">
              <el-form-item>
                <el-date-picker
                  @change="dateChange2"
                  v-model="searchForm2.refundDate"
                  align="right"
                  type="date"
                  placeholder="报违约日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-input v-model="searchForm2.applicationNoOrCustomnerName" placeholder="申请编号或租客姓名" @keyup.enter.native="Search2"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="Search2">查询</el-button>
              </el-form-item>
              <el-form-item style="float: right;margin-right: 0" v-if="importButton">
                <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
                  <el-button type="info" @click="exportCSV2()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :span="4" style="float: left;margin-top: 7px;color: red;min-width: 190px">
              应退合计:{{ sumRefundAmount | currency}}
            </el-col>
            <div class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
              <el-pagination
                @current-change="handleCurrentChange2"
                layout="total, prev, pager, next"
                :total="totalElements2">
              </el-pagination>
            </div>
          </el-row>
          <el-row>
            <el-table
              v-loading.body="loading"
              :data="tableData2"
              :default-sort="{prop: 'payeeDate', order: 'descending'}"
              style="width: 100%">
              <el-table-column
                prop="refundDate"
                sortable
                min-width="130"
                label="应还款日期">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-refundDate">
                    <el-tag>{{ scope.row.refundDate | dateFormat }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="136"
                prop="applicationNo"
                label="申请编号">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.applicationNo }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                prop="customerName"
                label="租客姓名">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.customerName}}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="150"
                prop="apartmentNo"
                label="台账号">
                <template scope="scope">
                  {{ scope.row.apartmentNo?scope.row.apartmentNo:'无'}}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="账单金额">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.monthlyRent | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="月租金">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.monthlyRent | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="逾期费">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.monthlyRent | currency }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                prop="monthlyRent"
                label="状态">
                <template scope="scope">
                  <div slot="reference" class="name-wrapper-normal">
                    <el-tag>{{ scope.row.status }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column min-width="80" label="操作">
                <template scope="scope">
                  <el-tooltip class="item" effect="dark" content="上传凭证" placement="top-end">
                    <el-button size="small" type="primary" @click="upload(scope.row)"><i class="fa fa-pencil-square-o"></i>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="查看" placement="top-end">
                    <el-button size="small" type="primary" @click="query(scope.row)"><i class="fa fa-pencil-square-o"></i>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-row>

    <!--弹出框-->
    <el-dialog
      title="上传凭证"
      :visible.sync="dialogVisible"
      size="tiny">
      <el-row>
        <el-col :span="12">
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus
        avatar-uploader-icon"></i>
          </el-upload>
        </el-col>
        <el-col :span="12">
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus
        avatar-uploader-icon"></i>
          </el-upload>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleEnable">确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
  import format from 'date-fns/format'
  import json from "../../../static/city.json";
  import store from '@/store'
  export default {
    data() {
      return {
        imageUrl: '',
        dialogVisible: false,
        applyDate: [format(Date.now(), 'YYYY-MM-DD'),format(Date.now(), 'YYYY-MM-DD')],
        //按钮权限控制
        importButton: false,
        activeName: 'Rejected',
        loading: false,//加载动画
        tableData: [],
        tableData2: [],
        cur_page: 1,
        cur_page2: 1,
        size: 10,
        totalElements: 0,
        totalElements2: 0,
        sumPayeeAmount: 0,
        sumRefundAmount: 0,
        url: '/api/v2/payeeLibs/getPayeeLibPage',
        url2: '/api/v2/agencyRefunds/getAgencyRefundPage',
        searchForm: {
          applyDate: format(Date.now(), 'YYYY-MM-DD'),
          applyEndDate: format(Date.now(), 'YYYY-MM-DD'),
          applicationNoOrCustomnerName: ''
        },
        searchForm2: {
          refundDate: '',
          applicationNoOrCustomnerName: ''
        },
        formLabelWidth: '120px',
      }
    },
    filters: {
      dateFormat: function (value) {
        if (typeof value === "string") {
          let date = Date.parse(value.substring(0, value.length - 9));
          return format(date, 'YYYYMMDD');
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
      },
    },
    computed: {
      button() {
        return store.state.button;
      }
    },
    created() {
      this.getData();
      if(this.button.button.indexOf('导出') >= 0) {
        this.importButton = true;
      }
    },
    methods: {
      upload(row) {
        console.log(row.applicationNo);
        this.dialogVisible = true;
      },
      query() {

      },
      tabChange() {
        if(this.activeName === 'Rejected') {
          this.searchForm.applicationNoOrCustomnerName = '';
          this.applyDate = [format(Date.now(), 'YYYY-MM-DD'),format(Date.now(), 'YYYY-MM-DD')];
          this.searchForm.applyDate = format(Date.now(), 'YYYY-MM-DD');
          this.searchForm.applyEndDate = format(Date.now(), 'YYYY-MM-DD');
          this.getData();
        } else {
          this.searchForm2.refundDate = '';
          this.searchForm2.applicationNoOrCustomnerName = '';
          this.getData2();
        }
      },
      //导出全部
      exportCSV() {
        var head = [["应收款日期","申请编号","应收金额","分期总金额", "租客姓名", "联系方式", "租期", "起租时间","结束时间", "月租金","所属店","经纪人"]];
        let param = {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size
        };
        this.axios.post('/api/v2/payeeLibs/getPayeeLibList',param).then((res) => {
            var rowData = res.data;
            console.log(rowData);
            for (let i = 0; i < rowData.length; i++) {
              let payeeType;
              switch (rowData[i].payeeType){
                case 'WeChat': payeeType =  '微信';break;
                case 'Alipay': payeeType = '支付宝';break;
                case 'DepositCard': payeeType = '储蓄卡';break;
                case 'CreditCard': payeeType = '信用卡';break;
                case 'Cash': payeeType = '现金';break;
                case 'Other': payeeType = '其他';break
              }
              head.push([rowData[i].payeeDate, rowData[i].applicationNo, rowData[i].payeeAmount, rowData[i].totalAmount, rowData[i].customerName, rowData[i].mobile,rowData[i].rentPeriod,rowData[i].startDate,rowData[i].endDate,rowData[i].monthlyRent,rowData[i].responsibleBranch, rowData[i].responsibleAgent]);
            };
            var csvRows = [];
            head.forEach(item => csvRows.push(item.join(',')));
            var csvString = csvRows.join('\n');
            //BOM的方式解决EXCEL乱码问题
            var BOM = '\uFEFF';
            csvString = BOM + csvString;
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + encodeURI(csvString);
            a.target = '_blank';
            a.download = '用户还款' +".csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        ).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      exportCSV2() {
        var head = [["报违约日期","申请编号","应退金额", "租客姓名", "租期", "起租时间","结束时间", "月租金","所属店","经纪人"]];
        let param = {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size
        };
        this.axios.post('/api/v2/agencyRefunds/getAgencyRefundList',param).then((res) => {
            var rowData = res.data;
            console.log(rowData);
            for (let i = 0; i < rowData.length; i++) {
              let payeeType;
              switch (rowData[i].payeeType){
                case 'WeChat': payeeType =  '微信';break;
                case 'Alipay': payeeType = '支付宝';break;
                case 'DepositCard': payeeType = '储蓄卡';break;
                case 'CreditCard': payeeType = '信用卡';break;
                case 'Cash': payeeType = '现金';break;
                case 'Other': payeeType = '其他';break
              }
              head.push([rowData[i].refundDate, rowData[i].applicationNo, rowData[i].payerAmount, rowData[i].customerName, rowData[i].rentPeriod,rowData[i].startDate,rowData[i].endDate,rowData[i].monthlyRent,rowData[i].responsibleBranch, rowData[i].responsibleAgent]);
            };
            var csvRows = [];
            head.forEach(item => csvRows.push(item.join(',')));
            var csvString = csvRows.join('\n');
            //BOM的方式解决EXCEL乱码问题
            var BOM = '\uFEFF';
            csvString = BOM + csvString;
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + encodeURI(csvString);
            a.target = '_blank';
            a.download = '用户还款' +".csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        ).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      handleCurrentChange(val){
        this.cur_page = val;
        this.getData();
      },
      handleCurrentChange2(val){
        this.cur_page2 = val;
        this.getData2();
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
          if (res.data.sumPayeeAmount !== undefined) {
            this.sumPayeeAmount = res.data.sumPayeeAmount;
          } else {
            this.sumPayeeAmount = 0;
          }
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      getData2(){
        this.loading = true;
        this.axios.post(this.url2, {
          ...this.searchForm2,
          page: this.cur_page2 - 1,
          size: this.size
        }).then((res) => {
          this.tableData2 = res.data.content;
          this.totalElements2 = res.data.totalElements;
          this.loading = false;
          if (res.data.sumRefundAmount !== undefined) {
            this.sumRefundAmount = res.data.sumRefundAmount;
          } else {
            this.sumRefundAmount = 0;
          }
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      dateChange() {
        if(this.applyDate === undefined || this.applyDate[0] === null) {
          this.searchForm.applyDate = '';
          this.searchForm.applyEndDate = '';
        } else {
          this.searchForm.applyDate = format(this.applyDate[0], 'YYYY-MM-DD');
          this.searchForm.applyEndDate = format(this.applyDate[1], 'YYYY-MM-DD');
        }
      },
      Search() {
        this.getData();
      },
      dateChange2() {
        if(this.searchForm2.refundDate) {
          this.searchForm2.refundDate = format(this.searchForm2.refundDate, 'YYYY-MM-DD');
        }
      },
      Search2() {
        this.searchForm2.refundDate = format(this.searchForm2.refundDate, 'YYYY-MM-DD');
        this.getData2();
      },
      handleAvatarSuccess(res, file) {
        this.imageUrl = URL.createObjectURL(file.raw);
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      }
    }
  }
</script>

<style>
  .payerAmountFont {
    color: #1D8CE0
  }

  .statusAlert {
    color: #F7BA2A
  }

  .statusGood {
    color: #13CE66
  }

  .name-wrapper-normal .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: black;
  }
  .name-wrapper-refundDate .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: red;
  }
  .name-wrapper-blue .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: #1D8CE0;
  }
  /*upload*/
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }
  .el-upload--text {
    width: 100%;
  }
</style>
