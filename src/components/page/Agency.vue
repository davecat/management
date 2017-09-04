<template>
    <div>
        <!--<el-row>-->
            <!--<el-button type="primary" @click="formVisible = true">新增</el-button>-->
            <!--<el-button type="primary" :disabled="multipleEditButton" @click="multipleEdit" >修改</el-button>-->
            <!--<el-button type="primary" @click="dialogVisible = true">删除</el-button>-->
            <!--<el-button type="primary" @click="dialogVisible4 = true">启用</el-button>-->
            <!--<el-button type="primary" @click="dialogVisible2 = true">停用</el-button>-->
        <!--</el-row>-->
        <el-row>
          <el-form  :inline="true" :model="searchForm">
            <el-form-item>
              <el-input v-model="searchForm.name" placeholder="中介名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="Search">查询</el-button>
            </el-form-item>
            <el-form-item style="float: right">
              <el-button type="primary" @click="add()">新增</el-button>
            </el-form-item>
          </el-form>
        </el-row>
        <el-row style="margin-bottom: 10px;height: 33px;">
          <el-checkbox-group v-model="searchForm.enabled" @change="Search"
                             style="float: left; margin-top: 12px; min-width: 150px;">
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
                        label="中介名称">
                </el-table-column>
                <el-table-column
                        min-width="70"
                        prop="branchAmount"
                        label="门店数量">
                </el-table-column>
                <el-table-column
                        min-width="135"
                        prop="payeeBank"
                        label="收款银行">
                </el-table-column>
                <el-table-column
                        min-width="150"
                        prop="payeeAccountNumber"
                        label="收款账号">
                </el-table-column>
                <el-table-column
                        min-width="135"
                        prop="payerBank"
                        label="付款银行">
                </el-table-column>
                <el-table-column
                        min-width="150"
                        prop="payerAccountNumber"
                        label="付款账号">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        label="状态"
                        show-overflow-tooltip>
                    <template scope="scope">
                        {{ scope.row.enabled ? '启用':'停用' }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" min-width="81">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
                            <el-button size="small" type="primary"
                                       @click="handleEdit(scope.row)"><i
                                    class="fa fa-pencil-square-o"></i>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="停用" placement="top-end">
                            <el-button size="small" type="warning"
                                       @click="rowDelete(scope.row.id)"><i class="fa fa-trash"></i>
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <el-dialog title="新增中介" :visible.sync="formVisible">
            <el-form :model="form" ref="form" :rules="rules">
                <el-form-item label="中介编号" :label-width="formLabelWidth" prop="code">
                    <el-input v-model="form.code"></el-input>
                </el-form-item>
                <el-form-item label="中介名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="开户行（收款）" :label-width="formLabelWidth" prop="payeeBank">
                    <el-input v-model="form.payeeBank"></el-input>
                </el-form-item>
                <el-form-item label="银行卡号（收款）" :label-width="formLabelWidth" prop="payeeAccountNumber">
                    <el-input v-model="form.payeeAccountNumber"></el-input>
                </el-form-item>
                <el-form-item label="开户行（付款）" :label-width="formLabelWidth" prop="payerBank">
                    <el-input v-model="form.payerBank"></el-input>
                </el-form-item>
                <el-form-item label="银行卡号（付款）" :label-width="formLabelWidth" prop="payerAccountNumber">
                    <el-input v-model="form.payerAccountNumber"></el-input>
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
                <el-button type="primary" @click="submitAgency('form')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改中介" :visible.sync="formVisible2">
            <el-form :model="form2" ref="form2" :rules="rules">
                <el-form-item label="中介编号" :label-width="formLabelWidth" prop="code">
                    <el-input v-model="form2.code"></el-input>
                </el-form-item>
                <el-form-item label="中介名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model="form2.name"></el-input>
                </el-form-item>
                <el-form-item label="开户行（收款）" :label-width="formLabelWidth" prop="payeeBank">
                    <el-input v-model="form2.payeeBank"></el-input>
                </el-form-item>
                <el-form-item label="银行卡号（收款）" :label-width="formLabelWidth" prop="payeeAccountNumber">
                    <el-input v-model="form2.payeeAccountNumber"></el-input>
                </el-form-item>
                <el-form-item label="开户行（付款）" :label-width="formLabelWidth" prop="payerBank">
                    <el-input v-model="form2.payerBank"></el-input>
                </el-form-item>
                <el-form-item label="银行卡号（付款）" :label-width="formLabelWidth" prop="payerAccountNumber">
                    <el-input v-model="form2.payerAccountNumber"></el-input>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth">
                    <span>{{ form2.enabled ? '启用':'停用' }}</span>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm2('form2')">取 消</el-button>
                <el-button type="primary" @click="submitAgency2('form2')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog
                title="删除"
                :visible.sync="dialogVisible"
                size="tiny">
            <span>此操作将删除选中中介，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleDelete">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="停用"
                :visible.sync="dialogVisible2"
                size="tiny">
            <span>此操作将停用选中中介，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="multipleDisable">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="删除"
                :visible.sync="dialogVisible3"
                size="tiny">
            <span>此操作将删除选中中介，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="handleDelete">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="启用"
                :visible.sync="dialogVisible4"
                size="tiny">
            <span>此操作将启用选中中介，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible4 = false">取 消</el-button>
                <el-button type="primary" @click="multipleEnable">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import { pagination } from '../mixins/pagination.js'
    export default {
        mixins: [pagination],
        data() {
            return {
                multipleSelection: [],
                multipleEditButton: false,
                searchForm: {
                    code: '',
                    name: '',
                    enabled: 'true'
                },
                form: {
                    code: '',
                    name: '',
                    payeeBank: '',
                    payeeAccountNumber: '',
                    payerBank: '',
                    payerAccountNumber: '',
                    enabled: 'true'
                },
                form2: {
                    code: '',
                    name: '',
                    payeeBank: '',
                    payeeAccountNumber: '',
                    payerBank: '',
                    payerAccountNumber: '',
                    enabled: 'true'
                },
                formVisible: false,
                formVisible2: false,
                dialogVisible: false,
                dialogVisible2: false,
                dialogVisible3: false,
                dialogVisible4: false,
                deleteId: '',
                formLabelWidth: '180px',
                rules: {
                    code: [{required: true, message: '请输入中介编号', trigger: 'blur'}],
                    name: [{required: true, message: '请输入中介名称', trigger: 'blur'}],
                    payeeBank: [{required: true, message: '请输入开户行', trigger: 'blur'}],
                    payeeAccountNumber: [{required: true, message: '请输入账号', trigger: 'blur'}],
                    payerBank: [{required: true, message: '请输入开户行', trigger: 'blur'}],
                    payerAccountNumber: [{required: true, message: '请输入账号', trigger: 'blur'}],
                    enabled: [{required: true, message: '请选择状态', trigger: 'blur'}],
                },
                url: '/api/v1/agency/getAgencyPage'
            }
        },
        methods: {
            submitAgency(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.post('/api/v1/agency', this.form).then((res) => {
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
            submitAgency2(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.put('/api/v1/agency', this.form2).then((res) => {
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
                this.form2 = Object.assign({}, row);
                this.formVisible2 = true;
            },
            rowDelete(id) {
                this.dialogVisible3 = true;
                this.deleteId = id;
            },
            handleDelete() {
                this.axios.put('/api/v1/agency/delete', [this.deleteId]).then((res) => {
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
                    this.axios.put('/api/v1/agency/delete', ids).then((res) => {
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
                    this.axios.put('/api/v1/agency/disable', ids).then((res) => {
                        this.getData();
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    })
                }
                this.dialogVisible2 = false;
            },
            multipleEnable() {
                let ids = this.multipleSelection.map(row => {
                    return row.id
                });
                if (ids.length === 0) {
                    console.log('ids is null');
                } else {
                    this.axios.put('/api/v1/agency/enabled', ids).then((res) => {
                        this.getData();
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    })
                }
                this.dialogVisible4 = false;
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
