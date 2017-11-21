<template>
  <div>
    <el-row :gutter="30" style="min-width: 1174px">
      <el-col :span="6" style="min-width: 291px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="position: relative">
            <span style="line-height: 36px;text-align: center;width: 100%;display: inline-block;">申请总数</span>
          </div>
          <el-row style="text-align: center;margin-bottom: 5px">
            <span class="bigText">{{total.totalAmount}}</span>
          </el-row>
          <el-row class="text item">
            <el-col :span="11">
              <span style="line-height: 30px;float: left;">待审核：{{total.pendingAmount}}</span>
            </el-col>
            <el-col :span="13">
              <span style="line-height: 30px;float: right;">审批不通过：{{total.notPendingAmount}}</span>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6" style="min-width: 291px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="position: relative">
            <span style="line-height: 36px;text-align: center;width: 100%;display: inline-block;">今日申请</span>
          </div>
          <el-row style="text-align: center;margin-bottom: 5px">
            <span class="bigText">{{today.billAmount}}</span>
          </el-row>
          <el-row style="text-align: center;height: 30px">
            <span class="text">总金额：{{today.totalAmount | currency}}元</span>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6" style="min-width: 291px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="position: relative">
            <span style="line-height: 36px;text-align: center;width: 100%;display: inline-block;">本周申请</span>
          </div>
          <el-row style="text-align: center;margin-bottom: 5px">
            <span class="bigText">{{week.billAmount}}</span>
          </el-row>
          <el-row style="text-align: center;height: 30px">
            <span class="text">总金额：{{week.totalAmount | currency}}元</span>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6" style="min-width: 291px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="position: relative">
            <span style="line-height: 36px;text-align: center;width: 100%;display: inline-block;">本月申请</span>
          </div>
          <el-row style="text-align: center;margin-bottom: 5px">
            <span class="bigText">{{month.billAmount}}</span>
          </el-row>
          <el-row style="text-align: center;height: 30px">
            <span class="text">总金额：{{month.totalAmount | currency}}元</span>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <!--图表-->
    <el-row style="margin-top: 35px">
      <!--折线统计-->
      <el-radio-group v-model="radio3" @change="aaa()">
        <el-radio-button label="最近7天"></el-radio-button>
        <el-radio-button label="最近30天"></el-radio-button>
      </el-radio-group>
      <el-col id="line1">
        <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
        <div id="line" style="width: 100%;height:400px;"></div>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 50px;margin-top: 35px">
      <!--地图区域分布-->
      <el-radio-group v-model="radio2" @change="bbb()">
        <el-radio-button label="最近7天"></el-radio-button>
        <el-radio-button label="最近30天"></el-radio-button>
      </el-radio-group>
      <el-col :span="12" id="map1">
        <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
        <div id="map" style="width: auto;height:400px;"></div>
      </el-col>
      <el-col :span="12">
        <el-tabs v-model="tableStatus" type="card" @tab-click="handleChange(tableStatus)">
          <el-tab-pane label="地域" name="area">
            <el-table
              :data="tableData1"
              tooltip-effect="dark"
              :default-sort="{prop: 'value', order: 'descending'}"
              highlight-current-row
              maxHeight="300"
              row-class-name="myTable"
              style="width: 100%;">
              <el-table-column
                type="index"
                width="50">
              </el-table-column>
              <el-table-column
                prop="name"
                label="省份"
                min-width="50">
              </el-table-column>
              <el-table-column
                prop="value"
                sortable
                min-width="57"
                label="申请数量">
              </el-table-column>
              <el-table-column
                min-width="57"
                prop="percent"
                label="占比">
                <template slot-scope="scope">
                  {{ scope.row.percent}}%
                </template>
              </el-table-column>
              <el-table-column
                prop="total"
                label="总金额"
                min-width="100">
                <template slot-scope="scope">
                  {{ scope.row.total | currency}}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="门店" name="store">
            <el-table
              :data="tableData1"
              tooltip-effect="dark"
              :default-sort="{prop: 'value', order: 'descending'}"
              highlight-current-row
              maxHeight="300"
              row-class-name="myTable"
              style="width: 100%;">
              <el-table-column
                type="index"
                width="50">
              </el-table-column>
              <!--<el-table-column-->
                <!--prop="name"-->
                <!--label="省份"-->
                <!--min-width="50">-->
              <!--</el-table-column>-->
              <!--<el-table-column-->
                <!--v-if="tableStatus === 'store'"-->
                <!--prop="cityName"-->
                <!--label="市"-->
                <!--min-width="75">-->
              <!--</el-table-column>-->
              <el-table-column
                prop="responsible_branch"
                label="门店"
                min-width="100">
              </el-table-column>
              <el-table-column
                prop="value"
                sortable
                min-width="57"
                label="申请数量">
              </el-table-column>
              <el-table-column
                min-width="57"
                prop="percent"
                label="占比">
                <template slot-scope="scope">
                  {{ scope.row.percent}}%
                </template>
              </el-table-column>
              <el-table-column
                prop="total"
                label="总金额"
                min-width="100">
                <template slot-scope="scope">
                  {{ scope.row.total | currency}}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import json from "static/city.json";
  import dataFns from 'date-fns'
  import echarts from 'echarts';
  import chinaJson from 'echarts/map/json/china';
  export default {
    name: '',
    data () {
      return {
        currentTable1: [],//临时存放数组的中间数组
        currentTable2: [],//临时存放数组的中间数组
        tableStatus: 'area',
        currentRow: {},
        page: 1,
        size: 10,
        totalElements: '',
        tableData2: [],
        tableData1: [],
        radio2: '最近7天',
        radio3: '最近7天',
        total: {},//单据数量对象
        today: {},
        week: {},
        month: {},
        //折线图配置
        lineOption: {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['总申请量', '审批通过', '审批不通过']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.lastWeek(),
          },
          yAxis: {
            type: 'value'
          },
          series: []
        },
        //地图配置
        mapOption: {
          tooltip: {
            trigger: 'item'
          },
          visualMap: {
            min: 0,
            max: 0,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],           // 文本，默认为数值文本
            calculable: true
          },
          series: [
            {
              name: '申请数量',
              type: 'map',
              mapType: 'china',
              roam: false,
              label: {
                normal: {
                  show: true
                },
                emphasis: {
                  show: true
                }
              },
              data: []
            }
          ]
        },
        staff: {}
      }
    },
    filters: {
      dateFormat: function (value) {
        if (!value) {
          return ''
        }
        return dataFns.format(value, 'YYYY-MM-DD')
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
    created() {
      this.init();
      this.getWeekData();
      this.getMapByWeek();
    },
    methods: {
      //点击tabs事件
      handleChange(status) {
        //清掉table存在的高亮
        let items = document.getElementsByClassName('myTable');
        for (var i = 0; i < items.length; i++) {
          document.getElementsByClassName('myTable')[i].className = 'el-table__row myTable';
        }
        if (status === 'store') {
          this.tableData1 = this.currentTable2;
        } else {
          this.tableData1 = this.currentTable1;
        }
      },
      //每一条的明细
      getItemDetail() {
        if (this.currentRow === null) {
          return false
        }
        if (this.radio2 === '今日') {
          let now = dataFns.format(Date.now(), 'YYYY-MM-DD');
          let form = {
            startDay: now,
            endDay: now,
            province: this.currentRow.province,
            page: (this.page - 1) * this.size,
            size: this.size
          };
          this.axios.post('/api/getMapDetails', form).then((res) => {
            this.tableData2 = res.data.detail;
            this.totalElements = this.currentRow.value;
          })
        } else if (this.radio2 === '本周') {
          let weekStart = dataFns.format(dataFns.addDays(dataFns.startOfWeek(Date.now()), 1), 'YYYY-MM-DD');
          let weekEnd = dataFns.format(dataFns.addDays(dataFns.endOfWeek(Date.now()), 1), 'YYYY-MM-DD');
          let form = {
            startDay: weekStart,
            endDay: weekEnd,
            province: this.currentRow.province,
            page: (this.page - 1) * this.size,
            size: this.size
          };
          this.axios.post('/api/getMapDetails', form).then((res) => {
            this.tableData2 = res.data.detail;
            this.totalElements = this.currentRow.value;
          })
        } else {
          let monthStart = dataFns.format(dataFns.startOfMonth(Date.now()), 'YYYY-MM-DD');
          let monthEnd = dataFns.format(dataFns.endOfMonth(Date.now()), 'YYYY-MM-DD');
          let form = {
            startDay: monthStart,
            endDay: monthEnd,
            province: this.currentRow.province,
            page: (this.page - 1) * this.size,
            size: this.size
          };
          this.axios.post('/api/getMapDetails', form).then((res) => {
            this.tableData2 = res.data.detail;
            this.totalElements = this.currentRow.value;
          })
        }
      },
      handleCurrentChange(val){
        this.page = val;
        this.getItemDetail();
      },
      handleCurrentRow(currentRow) {
        this.currentRow = currentRow;
        if (currentRow !== null) {
          this.getItemDetail();
        } else {
          this.tableData2 = [];
          this.totalElements = 0;
        }
      },
      //周数据
      getWeekData() {
        //拉取数据
        let weekStart = dataFns.format(dataFns.subDays(Date.now(), 7), 'YYYY-MM-DD');
        let weekEnd = dataFns.format(Date.now(), 'YYYY-MM-DD');
        this.axios.post('/api/agency/getLine', {
          'startDay': weekStart,
          'endDay': weekEnd,
          'id': this.staff.id
        }).then((res) => {
          this.lineOption.series = [
            {
              name: '总申请量',
              type: 'line',
              stack: '总量1',
              data: res.data.all
            },
            {
              name: '审批通过',
              type: 'line',
              stack: '总量2',
              data: res.data.accep
            },
            {
              name: '审批不通过',
              type: 'line',
              stack: '总量3',
              data: res.data.notaccep
            }
          ];
          this.drawLine('line');
        }).catch((error) => {
          console.log(error);
        })
      },
      //月数据
      getMonthData() {
        let monthStart = dataFns.format(dataFns.subDays(Date.now(), 30), 'YYYY-MM-DD');
        let monthEnd = dataFns.format(Date.now(), 'YYYY-MM-DD');
        this.axios.post('/api/agency/getLine', {
          'startDay': monthStart,
          'endDay': monthEnd,
          'id': this.staff.id
        }).then((res) => {
          this.lineOption.series = [
            {
              name: '总申请量',
              type: 'line',
              stack: '总量1',
              data: res.data.all
            },
            {
              name: '审批通过',
              type: 'line',
              stack: '总量2',
              data: res.data.accep
            },
            {
              name: '审批不通过',
              type: 'line',
              stack: '总量3',
              data: res.data.notaccep
            }
          ];
          this.drawLine('line');
        }).catch((error) => {
          console.log(error);
        })
      },
      lastWeek() {
        let array = [];
        let monthStart1 = dataFns.subDays(Date.now(), 7);
        let monthEnd1 = Date.now();
        while (monthStart1 < monthEnd1) {
          array.push(dataFns.format(monthStart1, 'YYYY-MM-DD'));
          monthStart1 = dataFns.addDays(monthStart1, 1);
        }
        return array;
      },
      lastMonth() {
        let array = [];
        let monthStart1 = dataFns.subDays(Date.now(), 30);
        let monthEnd1 = Date.now();
        while (monthStart1 < monthEnd1) {
          array.push(dataFns.format(monthStart1, 'YYYY-MM-DD'));
          monthStart1 = dataFns.addDays(monthStart1, 1);
        }
        return array;
      },
      aaa() {
        if (this.radio3 === '最近7天') {
          document.getElementById('line').parentNode.removeChild(document.getElementById('line'));
          this.lineOption.xAxis.data = this.lastWeek();
          this.getWeekData();
          document.getElementById('line1').innerHTML += '<div id="line" style="width: 100%;height:400px;"></div>';
          this.drawLine('line');
        } else {
          document.getElementById('line').parentNode.removeChild(document.getElementById('line'));
          this.lineOption.xAxis.data = this.lastMonth();
          this.getMonthData();
          document.getElementById('line1').innerHTML += '<div id="line" style="width: 100%;height:400px;"></div>';
          this.drawLine('line');
        }
      },
      //地图
      getMapByWeek() {
        let weekStart = dataFns.format(dataFns.subDays(Date.now(), 7), 'YYYY-MM-DD');
        let weekEnd = dataFns.format(Date.now(), 'YYYY-MM-DD');
        let totalAdd = 0;
        let totalAdd2 = 0;
        this.axios.post('/api/agency/getMap', {startDay: weekStart, endDay: weekEnd}).then((res) => {
          //处理数据
          res.data.area.forEach(function (item) {
            totalAdd += item.value;
          });
          res.data.area.forEach(item => {
            json.forEach(function (obj) {
              if (item.province === obj.value) {
                item.name = obj.label.substr(0, 2);
                item.percent = ((item.value / totalAdd) * 100).toFixed(2);
                if (item.name === '内蒙') {
                  item.name = '内蒙古'
                } else if (item.name === '黑龙') {
                  item.name = '黑龙江'
                }
              }
            });
          });
          res.data.branch.forEach(function (item) {
            totalAdd2 += item.value;
          });
          res.data.branch.forEach(item => {
            json.forEach(function (obj) {
              if (item.province === obj.value) {
                item.name = obj.label.substr(0, 2);
                item.percent = ((item.value / totalAdd2) * 100).toFixed(2);
                if (item.name === '内蒙') {
                  item.name = '内蒙古'
                } else if (item.name === '黑龙') {
                  item.name = '黑龙江'
                }
                obj.children.forEach(function (city) {
                  if (item.city === city.value) {
                    item.cityName = city.label
                  }
                })
              }
            });
          });
          //显示数据
          this.tableData1 = res.data.area;
          //临时存储返回数据
          this.currentTable1 = res.data.area;
          this.currentTable2 = res.data.branch;
          //画图
          this.mapOption.series[0].data = res.data.area;
          this.mapOption.visualMap.max = 200;
          this.drawMap('map');
        }).catch((error) => {
          console.log(error);
        });
      },
      getMapByMonth() {
        let monthStart = dataFns.format(dataFns.subDays(Date.now(), 30), 'YYYY-MM-DD');
        let monthEnd = dataFns.format(Date.now(), 'YYYY-MM-DD');
        let totalAdd = 0;
        let totalAdd2 = 0;
        this.axios.post('/api/agency/getMap', {startDay: monthStart, endDay: monthEnd}).then((res) => {
          res.data.area.forEach(function (item) {
            totalAdd += item.value;
          });
          res.data.area.forEach(item => {
            json.forEach(function (obj) {
              if (item.province === obj.value) {
                item.name = obj.label.substr(0, 2);
                item.percent = ((item.value / totalAdd) * 100).toFixed(2);
                if (item.name === '内蒙') {
                  item.name = '内蒙古'
                } else if (item.name === '黑龙') {
                  item.name = '黑龙江'
                }
              }
            });
          });
          res.data.branch.forEach(function (item) {
            totalAdd2 += item.value;
          });
          res.data.branch.forEach(item => {
            json.forEach(function (obj) {
              if (item.province === obj.value) {
                item.name = obj.label.substr(0, 2);
                item.percent = ((item.value / totalAdd2) * 100).toFixed(2);
                if (item.name === '内蒙') {
                  item.name = '内蒙古'
                } else if (item.name === '黑龙') {
                  item.name = '黑龙江'
                }
                obj.children.forEach(function (city) {
                  if (item.city === city.value) {
                    item.cityName = city.label
                  }
                })
              }
            });
          });
          //显示数据
          this.tableData1 = res.data.area;
          //临时存储返回数据
          this.currentTable1 = res.data.area;
          this.currentTable2 = res.data.branch;
          //画图
          this.mapOption.series[0].data = res.data.area;
          this.mapOption.visualMap.max = 500;
          this.drawMap('map');
        }).catch((error) => {
          console.log(error);
        });
      },
      bbb() {
        //清掉table存在的高亮
        let items = document.getElementsByClassName('myTable');
        for (var i = 0; i < items.length; i++) {
          document.getElementsByClassName('myTable')[i].className = 'el-table__row myTable';
        }
        if (this.radio2 === '最近7天') {
          this.tableStatus = 'area';
          document.getElementById('map').parentNode.removeChild(document.getElementById('map'));
          document.getElementById('map1').innerHTML += '<div id="map" style="width: 100%;height:400px;"></div>';
          this.getMapByWeek();
        } else {
          this.tableStatus = 'area';
          document.getElementById('map').parentNode.removeChild(document.getElementById('map'));
          document.getElementById('map1').innerHTML += '<div id="map" style="width: 100%;height:400px;"></div>';
          this.getMapByMonth();
        }
      },
      init() {
        //申请总数
        this.axios.post("/api/agency/getTotalAmount").then((res) => {
          this.total = res.data;
        }).catch((error) => {
          console.log(error);
        });
        //今日新增
        let startDay = dataFns.format(Date.now(),'YYYY-MM-DD');
        this.axios.post("/api/agency/getAmountByDate", {startDay: startDay, endDay: startDay}).then((res) => {
          this.today = res.data;
        }).catch((error) => {
          console.log(error);
        });
        //本周新增
        let startWeekDay = dataFns.format(dataFns.startOfWeek(Date.now()),'YYYY-MM-DD');
        let endWeekDay = dataFns.format(dataFns.endOfWeek(Date.now()),'YYYY-MM-DD');
        this.axios.post("/api/agency/getAmountByDate", {startDay: startWeekDay, endDay: endWeekDay}).then((res) => {
          this.week = res.data;
        }).catch((error) => {
          console.log(error);
        });
        //本月新增
        let startMonDay = dataFns.format(dataFns.startOfMonth(Date.now()),'YYYY-MM-DD');
        let endMonDay = dataFns.format(dataFns.endOfMonth(Date.now()),'YYYY-MM-DD');
        this.axios.post("/api/agency/getAmountByDate", {startDay: startMonDay, endDay: endMonDay}).then((res) => {
          this.month = res.data;
        }).catch((error) => {
          console.log(error);
        });
      },
      drawLine(id) {
        let that = this;
        Vue.nextTick(function () {
          // 基于准备好的dom，初始化echarts实例
          let myChart = echarts.init(document.getElementById(id));
          // 使用刚指定的配置项和数据显示图表。
          myChart.setOption(that.lineOption, true);
        });
      },
      drawMap(id) {
        let that = this;
        Vue.nextTick(function () {
          echarts.registerMap('china', chinaJson);
          // 基于准备好的dom，初始化echarts实例
          let myChart = echarts.init(document.getElementById(id));
          // 使用刚指定的配置项和数据显示图表。
          myChart.setOption(that.mapOption, true);
          myChart.on('mouseover', function (params) {
            //利用排他法，处理右侧表格高亮
            let items = document.getElementsByClassName('myTable');
            for (var i = 0; i < items.length; i++) {
              document.getElementsByClassName('myTable')[i].className = 'el-table__row myTable';
              if (items[i].children[1].firstChild.innerText === params.name) {
                document.getElementsByClassName('myTable')[i].className += ' current-row';
              }
            }

          });
        });
      }
    }
  }
</script>
<style scoped>
  .el-radio-group {
    display: block;
  }

  .text {
    font-size: 15px;
  }

  .bigText {
    font-size: 24px;
  }

  .item {

  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
