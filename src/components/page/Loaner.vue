<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 内部管理</el-breadcrumb-item>
                <el-breadcrumb-item>资金端管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-button type="primary" @click="formVisible = true">新增</el-button>
            <el-button type="primary" :disabled="multipleEditButton" @click="multipleEdit" >修改</el-button>
            <el-button type="primary" @click="dialogVisible = true">删除</el-button>
            <el-button type="primary" @click="dialogVisible2 = true">停用</el-button>
        </el-row>
        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="资金端名称：">
                    <el-input v-model="searchForm.name" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item label="还款方式：">
                    <el-select v-model="searchForm.repaymentType">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="等额本息" value="EqualityPrincipal"></el-option>
                        <el-option label="等额本金" value="EqualityCorpus"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50">
                </el-table-column>
                <el-table-column
                        min-width="86"
                        prop="name"
                        label="资金端名称">
                </el-table-column>
                <el-table-column
                        min-width="70"
                        prop="repaymentType"
                        label="还款方式">
                    <template scope="scope">
                        {{ scope.row.repaymentType == 'EqualityCorpus' ? '等额本金':'等额本息' }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="103"
                        prop="collectionBankCard"
                        label="银行帐号（收款)">
                </el-table-column>
                <el-table-column
                        min-width="150"
                        prop="collectionBankAccount"
                        label="开户行（收款）">
                </el-table-column>
                <el-table-column
                        min-width="142"
                        prop="paymentBankAccount"
                        label="银行账号（付款至LIB)">
                </el-table-column>
                <el-table-column
                        min-width="150"
                        prop="paymentBankCard"
                        label="开户行（付款）">
                </el-table-column>
                <el-table-column
                        min-width="50"
                        prop="enabled"
                        label="状态"
                        show-overflow-tooltip>
                    <template scope="scope">
                        {{ scope.row.enabled ? '启用':'停用' }}
                    </template>
                </el-table-column>
                <el-table-column  min-width="81" label="操作">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
                            <el-button size="small" type="primary"
                                       @click="handleEdit(scope.row)"><i
                                    class="fa fa-pencil-square-o"></i>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top-end">
                            <el-button size="small" type="warning"
                                       @click="rowDelete(scope.row.id)"><i class="fa fa-trash"></i>
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

        <el-dialog title="新增" :visible.sync="formVisible">
            <el-form :model="form" ref="form" :rules="rules">
                <el-form-item label="资金端名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="还款方式" :label-width="formLabelWidth" prop="repaymentType">
                    <el-select v-model="form.repaymentType">
                        <el-option label="等额本金" value="EqualityCorpus"></el-option>
                        <el-option label="等额本息" value="EqualityPrincipal"></el-option>
                        <el-option label="到期还本付息" value="MaturityRepaymentInterest"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="银行帐号（收款)" :label-width="formLabelWidth" prop="collectionBankCard">
                    <el-input v-model="form.collectionBankCard"></el-input>
                </el-form-item>
                <el-form-item label="开户行（收款）" :label-width="formLabelWidth" prop="collectionBankAccount">
                    <el-input v-model="form.collectionBankAccount"></el-input>
                </el-form-item>
                <el-form-item label="银行账号（付款至LIB)" :label-width="formLabelWidth" prop="paymentBankAccount">
                    <el-input v-model="form.paymentBankAccount"></el-input>
                </el-form-item>
                <el-form-item label="开户行（付款）" :label-width="formLabelWidth" prop="paymentBankCard">
                    <el-input v-model="form.paymentBankCard"></el-input>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth" prop="enabled">
                    <el-select v-model="form.enabled">
                        <el-option label="启用" value="true"></el-option>
                        <el-option label="停用" value="false"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm('form')">取 消</el-button>
                <el-button type="primary" @click="submitLoaner('form')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改资金端" :visible.sync="formVisible2">
            <el-form :model="form2" ref="form2" :rules="rules">
                <el-form-item label="资金端名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="form2.name"></el-input>
                </el-form-item>
                <el-form-item label="还款方式" :label-width="formLabelWidth" prop="repaymentType">
                    <el-select v-model="form2.repaymentType">
                        <el-option label="等额本金" value="EqualityCorpus"></el-option>
                        <el-option label="等额本息" value="EqualityPrincipal"></el-option>
                        <el-option label="到期还本付息" value="MaturityRepaymentInterest"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="银行帐号（收款)" :label-width="formLabelWidth" prop="collectionBankCard">
                    <el-input v-model="form2.collectionBankCard"></el-input>
                </el-form-item>
                <el-form-item label="开户行（收款）" :label-width="formLabelWidth" prop="collectionBankAccount">
                    <el-input v-model="form2.collectionBankAccount"></el-input>
                </el-form-item>
                <el-form-item label="银行账号（付款至LIB)" :label-width="formLabelWidth" prop="paymentBankAccount">
                    <el-input v-model="form2.paymentBankAccount"></el-input>
                </el-form-item>
                <el-form-item label="开户行（付款）" :label-width="formLabelWidth" prop="paymentBankCard">
                    <el-input v-model="form2.paymentBankCard"></el-input>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth" prop="enabled">
                    <el-select v-model="form2.enabled">
                        <el-option label="启用" value="true"></el-option>
                        <el-option label="停用" value="false"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm2('form2')">取 消</el-button>
                <el-button type="primary" @click="submitLoaner2('form2')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog
                title="删除"
                :visible.sync="dialogVisible"
                size="tiny">
            <span>此操作将删除选中资金端，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleDelete">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="停用"
                :visible.sync="dialogVisible2"
                size="tiny">
            <span>此操作将停用选中资金端，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="multipleDisable">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="删除"
                :visible.sync="dialogVisible3"
                size="tiny">
            <span>此操作将删除选中资金端，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="handleDelete">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                tableData: [],
                multipleSelection: [],
                multipleEditButton: false,
                cur_page: 1,
                size: 10,
                totalElements: 0,
                agencyList: {},
                searchForm: {
                    name: '',
                    repaymentType: ''
                },
                form: {
                    name: '',
                    repaymentType: '',
                    collectionBankCard: '',
                    collectionBankAccount: '',
                    paymentBankAccount: '',
                    paymentBankCard: '',
                    enabled: 'true'
                },
                form2: {
                    name: '',
                    repaymentType: '',
                    collectionBankCard: '',
                    collectionBankAccount: '',
                    paymentBankAccount: '',
                    paymentBankCard: '',
                    enabled: 'true'
                },
                formVisible: false,
                formVisible2: false,
                dialogVisible: false,
                dialogVisible2: false,
                dialogVisible3: false,
                deleteId: '',
                formLabelWidth: '180px',
                rules: {
                    name: [{required: true, message: '请输入资金端名称', trigger: 'blur'}],
                    repaymentType: [{required: true, message: '请选择还款方式', trigger: 'change'}],
                    collectionBankCard: [{required: true, message: '请输入银行帐号', trigger: 'blur'}],
                    collectionBankAccount: [{required: true, message: '请输入开户行', trigger: 'blur'}],
                    paymentBankAccount: [{required: true, message: '请输入银行帐号', trigger: 'blur'}],
                    paymentBankCard: [{required: true, message: '请输入银行帐号', trigger: 'blur'}],
                    enabled: [{required: true, message: '请选择状态', trigger: 'change'}]
                }
            }
        },
        created(){
            this.getData();
        },
        methods: {
            handleCurrentChange(val){
                this.cur_page = val;
                this.getData();
            },
            getData(){
                let self = this;
                this.axios.post('/riskcontrol/api/v1/loaner/getLoanerPage', {
                    name: self.searchForm.name,
                    repaymentType: self.searchForm.repaymentType,
                    page: self.cur_page - 1,
                    size: self.size
                }).then((res) => {
                    self.tableData = res.data.content;
                    self.totalElements = res.data.totalElements;
                }).catch((error) => {
                    console.log(error);
                })
            },
            submitLoaner(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.post('/riskcontrol/api/v1/loaner', this.form).then((res) => {
                            this.getData();
                            this.$refs[formName].resetFields();
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
            submitLoaner2(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.put('/riskcontrol/api/v1/loaner', this.form2).then((res) => {
                            this.getData();
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
                this.formVisible = false;
            },
            resetForm2(formName) {
                this.$refs[formName].resetFields();
                this.formVisible2 = false;
            },
            handleEdit(row) {
                this.form2 = Object.assign({},row);
                this.form2.enabled = String(row.enabled);
                this.formVisible2 = true;
            },
            rowDelete(id) {
                this.dialogVisible3 = true;
                this.deleteId = id;
            },
            handleDelete() {
                this.axios.put('/riskcontrol/api/v1/loaner/delete', [this.deleteId]).then((res) => {
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
                    this.axios.put('/riskcontrol/api/v1/loaner/delete', ids).then((res) => {
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
                    this.axios.put('/riskcontrol/api/v1/loaner/disable', ids).then((res) => {
                        this.getData();
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    })
                }
                this.dialogVisible2 = false;
            },
            Search() {
                this.getData();
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