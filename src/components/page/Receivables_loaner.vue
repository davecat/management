<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 内部管理</el-breadcrumb-item>
                <el-breadcrumb-item>资金端放款</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="应收款日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="付款方（资金端）：">
                    <el-select v-model="searchForm.loanerId">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="loaner in loanerList" :key="loaner.id" :label="loaner.name" :value="loaner.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="实际收款日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate2"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData2"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="合同审批日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate3"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData3"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="状态：">
                    <el-select v-model="searchForm.status">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="待确认" value="Unconfirmed"></el-option>
                        <el-option label="已确认" value="Accepted"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="租客姓名：">
                    <el-input v-model="searchForm.customerName" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row style="position: absolute;width: 100%;height: 42px;line-height: 42px;color: red;">
            <el-col :span="4" style="position: absolute;right: 20%">
                合计金额: {{ totalAmount | currency}}
            </el-col>
            <el-col :span="4" style="position: absolute;right: 5%">
                待确认: {{ totalConfirm | currency}}
            </el-col>
        </el-row>
        <el-row>
            <el-tabs v-model="searchForm.type" type="card" @tab-click="handleChangeTab">
                <el-tab-pane label="应收款" name="receivables"></el-tab-pane>
                <el-tab-pane label="异常款项" name="exception"></el-tab-pane>
            </el-tabs>
            <el-table
                    :data="tableData"
                    max-height="500"
                    tooltip-effect="dark"
                    highlight-current-row
                    :default-sort = "{prop: 'payeeDate', order: 'descending'}"
                    @current-change="handleCurrentRow"
                    style="width: 100%">
                <el-table-column
                        min-width="100"
                        prop="payeeDate"
                        sortable
                        label="应收款日期">
                    <template scope="scope">
                        {{ scope.row.payeeDate | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="85"
                        prop="loanerName"
                        label="付款方">
                </el-table-column>
                <el-table-column
                        min-width="100"
                        class-name="payerAmountFont"
                        prop="payeeTotalAmount"
                        label="付款金额">
                    <template scope="scope">
                        {{ scope.row.payeeTotalAmount | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="70"
                        prop="contractCount"
                        label="合同数量">
                </el-table-column>
                <el-table-column
                        min-width="220"
                        prop="payeeBankAccount"
                        label="收款账号">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        class-name="statusGood"
                        prop="status"
                        label="状态">
                    <template scope="scope">
                        <p :class="{statusAlert:scope.row.status === 'Unconfirmed'}" :id="scope.row.status === 'Termination'?'statusAlert1':'statusAlert2'">{{ scope.row.status | statusFilter}}</p>
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
            <!--<div class="pagination">-->
                <!--<el-pagination-->
                        <!--@current-change="handleCurrentChange"-->
                        <!--layout="prev, pager, next"-->
                        <!--:total="totalElements">-->
                <!--</el-pagination>-->
            <!--</div>-->
        </el-row>

        <el-row>
            <el-table
                    :data="receivablesDetail"
                    style="width: 100%">
                <el-table-column
                        min-width="100"
                        prop="contractNo"
                        label="合同编号">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="customerName"
                        label="租客姓名">
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="payeeAmount"
                        label="分期总金额">
                    <template scope="scope">
                        {{ scope.row.payeeAmount |  currency}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="payeeDate"
                        label="应收款日期">
                    <template scope="scope">
                        {{ scope.row.payeeDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="factPayeeDate"
                        label="实际收款日期">
                    <template scope="scope">
                        {{ scope.row.factPayeeDate |  dateFormat}}
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        @current-change="handleChange"
                        layout="total, prev, pager, next"
                        :total="detailTotalElements">
                </el-pagination>
            </div>
        </el-row>

        <el-dialog
                title="确认收款"
                :visible.sync="dialogVisible"
                size="tiny">
            <el-row>付款方： {{ selectedRow.loanerName }}</el-row>
            <el-row>付款金额： {{ selectedRow.payeeTotalAmount }}</el-row>
            <el-row>收款账号： {{ selectedRow.payeeBankAccount }}</el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
//    import { pagination } from '../mixins/pagination.js'
    import format from 'date-fns/format'
    export default {
//        mixins: [pagination],
        data() {
            return {
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
                url: '/postlending/api/v1/payee/loaner/getPayeeLoanerPage',
                searchForm: {
                    customerName: '',
                    applyDate: '',
                    applyDate2: '',
                    applyDate3: '',
                    payeeDateStart: '',
                    payeeDateEnd: '',
                    factPayeeDateStart: '',
                    factPayeeDateEnd: '',
                    contractApprovalDateStart: '',
                    contractApprovalDateEnd: '',
                    loanerId: '',
                    status: '',
                    type: 'receivables'
                },
                receivablesDetail: [],
                detailCurPage: 1,
                detailSize: 10,
                detailTotalElements: 0,
                detailPage: 0,
                loanerList: {},
                dialogVisible: false,
                selectedRow: {},
                currentRow: {}
            }
        },
        created(){
            this.getData();
            this.getLoanerList();
        },
        filters: {
            dateFormat: function (value) {
                if(value) {
                    return format(value, 'YYYY-MM-DD');
                }
            },
            statusFilter: function (value) {
                switch (value) {
                    case 'Unconfirmed': return '待确认';
                    case 'Accepted': return '已确认';
                    case 'Termination': return '已退租';
                }
            }
        },
        computed: {
            totalAmount() {
                let totalAmount = 0;
                this.tableData.forEach(item => {
                    totalAmount+=item.payeeTotalAmount;
                });
                return totalAmount;
            },
            totalConfirm() {
                let totalConfirm = 0;
                this.tableData.forEach((item) =>{
                    if(item.status === "Unconfirmed"){
                        totalConfirm += item.payeeTotalAmount;
                    }
                });
                return totalConfirm;
            }
        },
        methods: {
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
                    this.searchForm.payeeDateStart = format(this.searchForm.applyDate[0], 'YYYY-MM-DD');
                    this.searchForm.payeeDateEnd = format(this.searchForm.applyDate[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.payeeDateStart = '';
                    this.searchForm.payeeDateEnd = '';
                }
            },
            selectedData2() {
                if (this.searchForm.applyDate2[0] !== null) {
                    this.searchForm.factPayeeDateStart = format(this.searchForm.applyDate2[0], 'YYYY-MM-DD');
                    this.searchForm.factPayeeDateEnd = format(this.searchForm.applyDate2[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.factPayeeDateStart = '';
                    this.searchForm.factPayeeDateEnd = '';
                }
            },
            selectedData3() {
                if (this.searchForm.applyDate3[0] !== null) {
                    this.searchForm.contractApprovalDateStart = format(this.searchForm.applyDate3[0], 'YYYY-MM-DD');
                    this.searchForm.contractApprovalDateEnd = format(this.searchForm.applyDate3[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.contractApprovalDateStart = '';
                    this.searchForm.contractApprovalDateEnd = '';
                }
            },
            getLoanerList() {
                let self = this;
                this.axios.get('/riskcontrol/api/v1/loaner/getLoanerList').then((res) => {
                    self.loanerList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            handleChangeTab() {
                this.getData();
                this.receivablesDetail = [];
            },
            handleEdit(row) {
                this.selectedRow = Object.assign({},row);
                this.dialogVisible = true;
            },
            handleCurrentRow(row) {
                if(row) {
                    this.currentRow = row;
                    this.detailCurPage = 1;
                    this.detailTotalElements = 0;
                    this.getDetail();
                }
            },
            handleChange(val){
                this.detailCurPage = val;
                this.getDetail();
            },
            getDetail() {
                let param = {
                    loanerId: this.currentRow.loanerId,
                    payeeDate: format(this.currentRow.payeeDate, 'YYYY-MM-DD'),
                    status: this.currentRow.status,
                    contractApprovalDateStart: this.searchForm.contractApprovalDateStart,
                    contractApprovalDateEnd: this.searchForm.contractApprovalDateEnd,
                    factPayeeDateStart: this.searchForm.factPayeeDateStart,
                    factPayeeDateEnd: this.searchForm.factPayeeDateEnd,
                    customerName: this.searchForm.customerName,
                    page: this.detailCurPage - 1,
                    size: this.detailSize
                };
                this.axios.post('/postlending/api/v1/payee/loaner/getPayeeLoanerDetailPage', param).then((res) => {
                    this.receivablesDetail = res.data.content;
                    this.detailTotalElements = res.data.totalElements;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            confirm() {
                let form = {
                    loanerId: this.selectedRow.loanerId,
                    payeeDate: format(this.selectedRow.payeeDate, 'YYYY-MM-DD'),
                };
                this.axios.post('/postlending/api/v1/payee/loaner/confirm', form).then((res) => {
                    this.getData();
                    this.dialogVisible = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
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
    #statusAlert1 {
        color: red;
    }
    .statusGood {
        color: #13CE66
    }
</style>