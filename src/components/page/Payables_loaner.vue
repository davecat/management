<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 内部管理</el-breadcrumb-item>
                <el-breadcrumb-item>代客还房租</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="应付款日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="收款方：">
                    <el-select v-model="searchForm.loanerId">
                        <el-option v-for="loaner in loanerList" :key="loaner.id" :label="loaner.name" :value="loaner.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row style="position: absolute;width: 100%;height: 42px;line-height: 42px;color: red;">
            <el-col :span="4" style="position: absolute;right: 5%">
                代付合计: {{ totalPayment | currency}}
            </el-col>
        </el-row>
        <el-row>
            <el-tabs v-model="searchForm.type" type="card" @tab-click="handleChangeTab">
                <el-tab-pane label="应付款" name="receivables"></el-tab-pane>
                <el-tab-pane label="异常款项" name="exception"></el-tab-pane>
            </el-tabs>
            <el-table
                    :data="tableData"
                    max-height="250"
                    :default-sort="{prop: 'payerDate', order: 'descending'}"
                    highlight-current-row
                    @current-change="handleCurrentRow"
                    style="width: 100%">
                <el-table-column
                        min-width="100"
                        prop="payerDate"
                        sortable
                        label="应付款日期">
                    <template scope="scope">
                        {{ scope.row.payerDate | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="85"
                        prop="loanerName"
                        label="收款方">
                </el-table-column>
                <el-table-column
                        min-width="110"
                        class-name="payerAmountFont"
                        prop="payerAmount"
                        label="代付金额">
                    <template scope="scope">
                        {{ scope.row.payerAmount | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="plan"
                        label="进度">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        class-name="statusGood"
                        prop="status"
                        label="状态">
                    <template scope="scope">
                        <p :class="{statusAlert:scope.row.status === '待确认'}" :id="scope.row.status === '未完成'?'statusAlert1':'statusAlert2'">{{ scope.row.status }}</p>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="50"
                        label="操作">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="导出" placement="top-end">
                            <el-button size="small" type="success"
                                       @click="exportCSV(scope.row)"><i class="fa fa-save"></i>
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <el-row>
            <el-col :span="4">
                应付款明细:
            </el-col>
        </el-row>
        <el-row>
            <el-table
                    :data="payablesDetail"
                    style="width: 100%">
                <el-table-column
                        min-width="100"
                        prop="contractNo"
                        label="合同编号">
                </el-table-column>
                <el-table-column
                        min-width="106"
                        prop="billNo"
                        label="账单编号">
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="customerName"
                        label="租客姓名">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="monthlyRent"
                        label="月租金">
                    <template scope="scope">
                        {{ scope.row.monthlyRent | currency}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="110"
                        prop="interest"
                        label="贷款利息">
                    <template scope="scope">
                        {{ scope.row.interest | currency}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="110"
                        prop="payerAmount"
                        label="代还合计">
                    <template scope="scope">
                        <div slot="reference" class="name-wrapper-normal">
                            <el-tag>{{ scope.row.payerAmount | currency}}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        class-name="statusGood"
                        prop="libPayerStatus"
                        label="代还状态">
                    <template scope="scope">
                        <p :class="{statusAlert:scope.row.libPayerStatus === 'Unconfirmed'}" :id="scope.row.libPayerStatus === 'Termination'?'statusAlert1':'statusAlert2'">{{ scope.row.libPayerStatus | statusFilter }}</p>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="85"
                        class-name="statusGood"
                        prop="customPayerStatus"
                        label="客户还款状态">
                    <template scope="scope">
                        <p :class="{statusAlert:scope.row.customPayerStatus === 'Unconfirmed'}" :id="scope.row.customPayerStatus === 'Termination'?'statusAlert1':'statusAlert2'">{{ scope.row.customPayerStatus | statusFilter }}</p>
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="payerType"
                        label="（代还）支付方式">
                    <template scope="scope">
                        {{ scope.row.payerType?'银行转账':''}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="payer.bank"
                        label="（代还）付款银行">
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="payer.accountNumber"
                        label="（代还）付款账号">
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="factPayerDate"
                        label="实际付款日期">
                    <template scope="scope">
                        {{ scope.row.factPayerDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="50"
                        label="操作">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="确认付款" placement="top-end" v-if="scope.row.libPayerStatus === 'Unconfirmed'">
                            <el-button size="small" type="primary"
                                       @click="handleEdit(scope.row)"><i
                                    class="fa fa-pencil-square-o"></i>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="修改确认付款" placement="top-end" v-else>
                            <el-button size="small" type="warning"
                                       @click="unConfirmShow(scope.row)"><i
                                    class="fa fa-repeat"></i>
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        @current-change="handleCurrentChange"
                        layout="total, prev, pager, next"
                        :total="detailTotalElements">
                </el-pagination>
            </div>
        </el-row>

        <el-dialog title="确认还款" :visible.sync="dialogVisible">
            <el-form :model="form" ref="form" :rules="rules">
                <!--<el-form-item label="开户人：" :label-width="formLabelWidth" prop="name">-->
                    <!--<el-input v-model="form.name"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="实际付款日期：" :label-width="formLabelWidth" prop="factPayerDate">
                    <el-date-picker
                            v-model="form.factPayerDate"
                            type="date"
                            placeholder="选择日期"
                            :default-value="form.factPayerDate"
                            :picker-options="pickerOptions0">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="支付方式：" :label-width="formLabelWidth" prop="payerType">
                    <el-select v-model="form.payerType">
                        <el-option label="银行转账" value="BankTransfer"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="付款银行：" :label-width="formLabelWidth" prop="bank">
                    <el-input v-model="form.bank"></el-input>
                </el-form-item>
                <el-form-item label="付款账号：" :label-width="formLabelWidth" prop="accountNumber">
                    <el-input v-model="form.accountNumber"></el-input>
                </el-form-item>
                <el-form-item label="备注：" :label-width="formLabelWidth" prop="remarks">
                    <el-input type="textarea" v-model="form.remarks"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm('form')">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="修改确认还款" :visible.sync="dialogVisible2">
            <el-form :model="form" ref="form" :rules="rules">
                <!--<el-form-item label="开户人：" :label-width="formLabelWidth" prop="name">-->
                    <!--<el-input v-model="form.name"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="实际付款日期：" :label-width="formLabelWidth" prop="factPayerDate">
                    <el-date-picker
                            v-model="form.factPayerDate"
                            type="date"
                            placeholder="选择日期"
                            :default-value="form.factPayerDate"
                            :picker-options="pickerOptions0">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="支付方式：" :label-width="formLabelWidth" prop="payerType">
                    <el-select v-model="form.payerType">
                        <el-option label="银行转账" value="BankTransfer"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="付款银行：" :label-width="formLabelWidth" prop="bank">
                    <el-input v-model="form.bank"></el-input>
                </el-form-item>
                <el-form-item label="付款账号：" :label-width="formLabelWidth" prop="accountNumber">
                    <el-input v-model="form.accountNumber"></el-input>
                </el-form-item>
                <el-form-item label="备注：" :label-width="formLabelWidth" prop="remarks">
                    <el-input type="textarea" v-model="form.remarks"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2=false">取 消</el-button>
                <el-button type="primary" @click="unConfirm">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import format from 'date-fns/format'
    export default {
        data() {
            return {
                loanerList: [],
                contractNo: '',//存放单据id
                advanceRent: false,
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
                url: '/postlending/api/v1/payer/loaner/getPayerLoanerPage',
                searchForm: {
                    loanerId: '',
                    applyDate: '',
                    payerDateStart: '',
                    payerDateEnd: '',
                    type: 'receivables',
                },
                currentRow: {
                    payer: {
                        bank: '',
                        accountNumber: '',
                    }
                },
                form: {
                    name: '',
                    payer:{
                        bank: '',
                        accountNumber: ''
                    },
                    billNo: '',
                    payerType: '',
                    factPayerDate: Date.now(),
                    remarks: ''
                },
                agencyList: {},
                dialogVisible: false,
                dialogVisible2: false,
                dialogVisible3: false,
                unConfirmRow: {},
                payablesDetail: [],
                detailCurPage: 1,
                detailSize: 10,
                detailTotalElements: 0,
                detailPage: 0,
                formLabelWidth: '120px',
                rules: {
                    factPayerDate: [{type: 'date', required: true, message: '请选择日期', trigger: 'blur'}],
                    bank: [{required: true, message: '请输入银行', trigger: 'blur'}],
                    accountNumber: [{required: true, message: '请输入账号', trigger: 'blur'}],
                    payerType: [{required: true, message: '请选择类型', trigger: 'change'}]
                },
                pickerOptions0: {
                    disabledDate(time) {
                        return time.getTime() < Date.now() - 8.64e7;
                    }
                },
            }
        },
        created(){
            this.getData();
            this.getAgencyList();
            this.getLoanerList();
        },
        filters: {
            dateFormat: function (value) {
                if (typeof value === "string") {
                    return value.substring(0, value.length - 9)
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
            totalRent() {
                let totalRent = 0;
                this.tableData.forEach(item => {
                    totalRent+=item.totalAmount;
                });
                return totalRent;
            },
            totalPayment() {
                let totalPayment = 0;
                this.tableData.forEach((item) =>{
                    totalPayment += item.payerAmount;
                });
                return totalPayment;
            }
        },
        methods: {
            //获取资金端
            getLoanerList() {
                let self = this;
                this.axios.get('/riskcontrol/api/v1/loaner/getLoanerList').then((res) => {
                    self.loanerList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            handleEdit3(row) {
                this.dialogVisible3 = true;
                this.contractNo = row.contractNo;
            },
            //确认提前退租
            confirm3() {
                this.axios.post('/postlending/api/v1/payer/agency/termination/'+this.contractNo).then(() => {
                    this.getData();
                    this.advanceRent = false;
                    this.dialogVisible3 = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            handleCurrentChange(val){
                this.detailCurPage = val;
                this.getDetail();
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
            getAgencyList() {
                this.axios.get('/api/v1/admin/agency/getAgencyList').then((res) => {
                    this.agencyList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            selectedData() {
                if (this.searchForm.applyDate[0] !== null) {
                    this.searchForm.payerDateStart = format(this.searchForm.applyDate[0], 'YYYY-MM-DD');
                    this.searchForm.payerDateEnd = format(this.searchForm.applyDate[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.payerDateStart = '';
                    this.searchForm.payerDateEnd = '';
                }
            },
            handleChangeTab() {
                this.getData();
                this.currentRow = {
                    payer: {
                        bank: '',
                        accountNumber: '',
                    }
                };
                this.payablesDetail = [];
                this.detailTotalElements = 0;
            },
            handleEdit(row) {
                this.form.remarks = row.remarks || '';
                this.form.payer = row.payer || {};
                this.form.name = this.form.payer.name || '';
                this.form.accountNumber = this.form.payer.accountNumber || '';
                this.form.bank = this.form.payer.bank || '';
                this.form.billNo = row.billNo || '';
                this.form.factPayerDate = row.factPayerDate || Date.now();
                this.form.payerType = row.payerType || 'BankTransfer';

                this.dialogVisible = true;
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.form = {factPayerDate: Date.now()};
                this.dialogVisible = false;
            },
            handleCurrentRow(row) {
                if (row) {
                    this.currentRow.factPayerDate = row.factPayerDate || '';
                    this.currentRow.payerType = row.payerType || '';
                    this.currentRow.payer = row.payer || '';
                    this.currentRow.loanerId = row.loanerId || '';
                    this.currentRow.payerDate = row.payerDate || '';
                    this.currentRow.status = row.status || '';
                    this.getDetail();
                } else {
                    this.currentRow = {
                        payer: {
                            bank: '',
                            accountNumber: '',
                        }
                    };
                    this.detailCurPage = 1;
                    this.payablesDetail = [];
                    this.detailTotalElements = 0;
                }
            },
            handleChange(val){
                this.detailCurPage = val;
                this.getDetail();
            },
            getDetail() {
                let param = {
                    loanerId: this.currentRow.loanerId,
                    payerDate: format(this.currentRow.payerDate, 'YYYY-MM-DD'),
                    page: this.detailCurPage - 1,
                    size: this.detailSize
                };
                this.axios.post('/postlending/api/v1/payer/loaner/getPayerLoanerDetailPage', param).then((res) => {
                    this.payablesDetail = res.data.content;
                    this.detailTotalElements = res.data.totalElements;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            confirm() {
                let form = {
                    name: this.form.name,
                    bank: this.form.bank,
                    accountNumber: this.form.accountNumber,
                    payerType: this.form.payerType,
                    factPayerDate: format(this.form.factPayerDate, 'YYYY-MM-DD'),
                    billNo: this.form.billNo,
                    remarks: this.form.remarks
                };
                this.axios.post('/postlending/api/v1/payer/loaner/confirm', form).then((res) => {
                    this.getData();
                    this.dialogVisible = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            unConfirmShow(row) {
                this.form.remarks = row.remarks || '';
                this.form.payer = row.payer || {};
                this.form.name = this.form.payer.name || '';
                this.form.accountNumber = this.form.payer.accountNumber || '';
                this.form.bank = this.form.payer.bank || '';
                this.form.billNo = row.billNo || '';
                this.form.factPayerDate = row.factPayerDate || Date.now();
                this.form.payerType = row.payerType || 'BankTransfer';
                this.dialogVisible2 = true;
            },
            unConfirm() {
                let form = {
                    name: this.form.name,
                    bank: this.form.bank,
                    accountNumber: this.form.accountNumber,
                    payerType: this.form.payerType,
                    factPayerDate: format(this.form.factPayerDate, 'YYYY-MM-DD'),
                    billNo: this.form.billNo,
                    remarks: this.form.remarks
                };
                this.axios.post('/postlending/api/v1/payer/loaner/modify', form).then((res) => {
                    this.getData();
                    this.dialogVisible2 = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            exportCSV(row) {
                var head = [["合同编号","账单编号", "租客姓名", "月租金", "贷款利息", "代还合计", "代还状态", "客户还款状态","（代还）支付方式"]];
                let param = {
                    loanerId: row.loanerId,
                    payerDate: format(row.payerDate, 'YYYY-MM-DD'),
                    page: this.detailCurPage - 1,
                    size: 999999
                };
                this.axios.post('/postlending/api/v1/payer/loaner/getPayerLoanerDetailPage', param).then((res) => {
                        var rowData = res.data.content;
                        for (let i = 0; i < rowData.length; i++) {
                            if(rowData[i].payerType) {
                                rowData[i].payerTypeName = '银行转账'
                            }
                            let libPayerStatus;
                            switch (rowData[i].libPayerStatus) {
                                case 'Unconfirmed': libPayerStatus = '待确认';break;
                                case 'Accepted': libPayerStatus = '已确认';break;
                                case 'Termination': libPayerStatus =  '已退租';break;
                            }
                            let customPayerStatus;
                            switch (rowData[i].customPayerStatus) {
                                case 'Unconfirmed': customPayerStatus = '待确认';break;
                                case 'Accepted': customPayerStatus = '已确认';break;
                                case 'Termination': customPayerStatus =  '已退租';break;
                            }
                            head.push([rowData[i].contractNo, rowData[i].billNo,rowData[i].customerName,rowData[i].monthlyRent, rowData[i].interest, rowData[i].payerAmount, libPayerStatus, customPayerStatus, rowData[i].payerTypeName]);
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
                        a.download = row.payerDate + "代客还房租" +".csv";
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
    .el-tag {
        font-size: 14px;
        background-color: transparent;
        color: #1D8CE0
    }
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