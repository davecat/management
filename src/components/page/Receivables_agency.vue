<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 内部管理</el-breadcrumb-item>
                <el-breadcrumb-item>中退清算</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="报违约日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="租客姓名：">
                    <el-input v-model="searchForm.customerName" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item label="状态：">
                    <el-select v-model="searchForm.status">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="待确认" value="Unconfirmed"></el-option>
                        <el-option label="已确认" value="Accepted"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row style="color: red;">
            <el-col :span="4" style="float: right;height: 36px;line-height: 36px;">
                合计金额: {{ totalAmount | currency}}
            </el-col>
            <el-col :span="4" style="float: right;height: 36px;line-height: 36px;">
                待确认: {{ totalConfirm | currency}}
            </el-col>
            <el-button  type="primary" @click="exportCSV()">导出全部</el-button>
        </el-row>
        <el-row>
            <el-table
                    :data="tableData"
                    tooltip-effect="dark"
                    highlight-current-row
                    @current-change="handleCurrentRow"
                    style="width: 100%">
                <el-table-column
                        min-width="100"
                        prop="refundDate"
                        sortable
                        label="报违约日期">
                    <template scope="scope">
                        <div slot="reference" class="name-wrapper-1">
                            <el-tag>{{ scope.row.refundDate | dateFormat }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="refundAmount"
                        label="应退款金额">
                    <template scope="scope">
                        <div slot="reference" class="name-wrapper-2">
                            <el-tag> {{ scope.row.refundAmount | currency }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="applicationNo"
                        label="申请编号">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="customerName"
                        label="租客姓名">
                </el-table-column>
                <el-table-column
                        min-width="86"
                        prop="mobile"
                        label="联系方式">
                </el-table-column>
                <el-table-column
                        min-width="150"
                        label="起止日期">
                    <template scope="scope">
                        {{ scope.row.startDate |  dateFormat}} - {{ scope.row.endDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="totalAmount"
                        label="分期总金额">
                    <template scope="scope">
                        {{ scope.row.totalAmount | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="monthlyRent"
                        label="月租金">
                    <template scope="scope">
                        {{ scope.row.monthlyRent | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="progress"
                        label="租客已付账单">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="payerAmount"
                        label="代付金额">
                    <template scope="scope">
                        {{ scope.row.payerAmount | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="serviceFee"
                        label="服务费">
                    <template scope="scope">
                        {{ scope.row.serviceFee | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        class-name="statusGood"
                        prop="status"
                        label="状态">
                    <template scope="scope">
                        <p :class="{ statusAlert: scope.row.status === 'Unconfirmed' }">{{ scope.row.status === 'Unconfirmed'?'待确认':'已确认' }}</p>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="50"
                        label="操作">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="确认收款" placement="top-end">
                            <el-button size="small" type="primary"
                                       @click="handleEdit(scope.row)"><i
                                    class="fa fa-pencil-square-o"></i>
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        @current-change="handleCurrentChange"
                        layout="total, prev, pager, next"
                        :total="totalElements">
                </el-pagination>
            </div>
        </el-row>



        <el-dialog
                title="确认收款"
                :visible.sync="dialogVisible"
                size="tiny">
            <span>该操作不可撤销，是否确认收款？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import format from 'date-fns/format'
    export default {
        data() {
            return {
                contractNo: '',
                pickerOptions: {
                    shortcuts: [
                        {
                            text: '今日',
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: '最近三天',
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: '最近七天',
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: '最近三十天',
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ]
                },
                tableData: [],
                cur_page: 1,
                size: 10,
                totalElements: 0,
                url: '/postlending/api/v1/agency/refund/getAgencyRefundPage',
                searchForm: {
                    customerName: '',
                    applyDate: '',
                    refundDateStart: '',
                    refundDateEnd: '',
                    status: ''
                },
                detailSize: 10,
                detailPage: 0,
                dialogVisible: false,
                selectedRow: {}
            }
        },
        created(){
            this.getData();
        },
        filters: {
            dateFormat: function (value) {
                if(value) {
                    return format(value, 'YYYY-MM-DD');
                }
            }
        },
        computed: {
            totalAmount() {
                let totalAmount = 0;
                this.tableData.forEach(item => {
                    totalAmount+=item.refundAmount;
                });
                return totalAmount;
            },
            totalConfirm() {
                let totalConfirm = 0;
                this.tableData.forEach((item) =>{
                    if(item.status === "Unconfirmed"){
                        totalConfirm += item.refundAmount;
                    }
                });
                return totalConfirm;
            }
        },
        methods: {
            //导出全部
            exportCSV() {
                var head = [["报违约日期","应退款金额","申请编号", "租客姓名", "联系方式", "起租时间","结束时间", "分期总金额","月租金","租客已付账单","代付金额","服务费","状态"]];
                let param = {
                    ...this.searchForm,
                    page: this.cur_page - 1,
                    size: 999999
                };
                this.axios.post('/postlending/api/v1/agency/refund/getAgencyRefundPage',param).then((res) => {
                        var rowData = res.data.content;
                        for (let i = 0; i < rowData.length; i++) {
                            if(rowData[i].status === 'Unconfirmed') {
                                rowData[i].statusName = '待确认'
                            } else {
                                rowData[i].statusName = '已确认'
                            }
                            head.push([rowData[i].refundDate, rowData[i].refundAmount, rowData[i].applicationNo, rowData[i].customerName, rowData[i].mobile,rowData[i].startDate,rowData[i].endDate,rowData[i].totalAmount,rowData[i].monthlyRent, rowData[i].progress, rowData[i].payerAmount, rowData[i].serviceFee, rowData[i].statusName]);
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
                        a.download = '中退清算' +".csv";
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
            getData(){
                this.axios.post(this.url, {
                    ...this.searchForm,
                    page: this.cur_page - 1,
                    size: this.size
                }).then((res) => {
                    this.tableData = res.data.content;
                    this.totalElements = res.data.totalElements;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            Search() {
                this.getData();
            },
            selectedData() {
                if (this.searchForm.applyDate[0] !== null) {
                    this.searchForm.refundDateStart = format(this.searchForm.applyDate[0], 'YYYY-MM-DD');
                    this.searchForm.refundDateEnd = format(this.searchForm.applyDate[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.refundDateStart = '';
                    this.searchForm.refundDateEnd = '';
                }
            },
            handleChangeTab() {
                this.getData();
            },
            handleEdit(row) {
                this.selectedRow = Object.assign({},row);
                this.dialogVisible = true;
            },
            handleCurrentRow(row) {
                if(row) {
                    this.contractNo = row.contractNo;
                }
            },
            confirm() {
                this.axios.post('/postlending/api/v1/agency/refund/confirm/'+this.contractNo).then((res) => {
                    this.getData();
                    this.dialogVisible = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                    this.dialogVisible = false;
                })
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
    .name-wrapper-1 .el-tag {
        font-size: 14px;
        background-color: transparent;
        color: red;
    }
    .name-wrapper-2 .el-tag {
        font-size: 14px;
        background-color: transparent;
        color: #1D8CE0;
    }
</style>