<template>
  <div>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-date-picker
            v-model="searchForm.logDate"
            align="right"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchForm.logContent" placeholder="关键字"></el-input>
        </el-form-item>
        <!--<el-form-item>-->
          <!--<el-button type="primary" @click="Search">查询</el-button>-->
        <!--</el-form-item>-->
        <el-form-item style="float: right;margin-right: 0">
          <el-button type="success" @click="Search">查询日志</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px;height: 28px">
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
          prop="logDate"
          sortable
          width="130"
          label="日志时间">
          <template scope="scope">
            {{ scope.row.logDate | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="1110"
          prop="logContent"
          label="日志内容">
          <template scope="scope">
            {{ scope.row.logContent }}
          </template>
        </el-table-column>
      </el-table>
    </el-row>

  </div>
</template>

<script>
  import format from 'date-fns/format'
  import json from "../../../static/city.json";
  export default {
    data() {
      return {
        activeName: 'Rejected',
        loading: false,//加载动画
        tableData: [],
        cur_page: 1,
        size: 10,
        totalElements: 0,
        sumPayeeAmount: 0,
        url: '/api/v2/logs/getLogsPage',
        searchForm: {
          logDate: '',
          logContent: ''
        },
        formLabelWidth: '120px',
      }
    },
    filters: {
      dateFormat: function (value) {
        if (typeof value === "string") {
          let date = Date.parse(value.substring(0, value.length - 9));
          return format(date, 'YYYY-MM-DD');
        }
      },
    },
    created() {
      console.log('log');
      this.getData();
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
          if (res.data.sumPayeeAmount !== undefined) {
            this.sumPayeeAmount = res.data.sumPayeeAmount;
          } else {
            this.sumPayeeAmount = 0;
          }
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      Search() {
        this.searchForm.logDate = format(this.searchForm.logDate, 'YYYY-MM-DD');
        this.getData();
      }
    }
  }
</script>

<style>
</style>
