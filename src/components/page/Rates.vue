<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>费率设置</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-button type="primary" @click="formVisible = true">新增</el-button>
        </el-row>

        <el-row>
            <el-table :data="tableData"  width="100%">
                <el-table-column prop="rate" label="费率">
                    <template scope="scope">
                        {{scope.row.rate}}%
                    </template>
                </el-table-column>
                <el-table-column prop="rateType" label="费率类型">
                    <template scope="scope">
                        {{scope.row.rateType | rateTypeFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="320">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="修改" placement="top-end">
                            <el-button size="small" type="primary"
                                       @click="handleEdit(scope.row)"><i class="fa fa-pencil-square-o"></i>
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

        <el-dialog title="新增费率" :visible.sync="formVisible">
            <el-form :model="form" ref="form" :rules="rules">
                <el-form-item label="费率" :label-width="formLabelWidth" prop="rate">
                    <el-input v-model="form.rate"></el-input>
                </el-form-item>
                <el-form-item label="费率类型" :label-width="formLabelWidth" prop="rateType">
                    <el-select v-model="form.rateType" @change="rateChange(form.rateType)">
                        <el-option label="中介费率" value="LibToAgency"></el-option>
                        <el-option label="资金端费率" value="LibToLoaner"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属资金端" :label-width="formLabelWidth" prop="operationId" v-if="loanerDisable">
                    <el-select v-model="form.operationId">
                        <el-option v-for="loaner in loanerList" :value="loaner.id" :key="loaner.id" :label="loaner.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="管辖中介：" :label-width="formLabelWidth" prop="operationId" v-if="agenciesDisable">
                    <el-select v-model="form.operationId">
                        <el-option v-for="agency in agencyList" :value="agency.id" :label="agency.name"  :key="agency.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm('form')">取 消</el-button>
                <el-button type="primary" @click="submitUser('form')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改费率" :visible.sync="formVisible2">
            <el-form :model="form2" ref="form2" :rules="rules2">
                <el-form-item label="费率" :label-width="formLabelWidth" prop="rate">
                    <el-input v-model="form2.rate"></el-input>
                </el-form-item>
                <el-form-item label="费率类型" :label-width="formLabelWidth" prop="rateType">
                    <el-select v-model="form2.rateType" @change="rateChange(form.rateType)">
                        <el-option label="中介费率" value="LibToAgency"></el-option>
                        <el-option label="资金端费率" value="LibToLoaner"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属资金端" :label-width="formLabelWidth" prop="operationId" v-if="loanerDisable">
                    <el-select v-model="form2.operationId">
                        <el-option v-for="loaner in loanerList" :value="loaner.id" :key="loaner.id" :label="loaner.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="管辖中介：" :label-width="formLabelWidth" prop="operationId" v-if="agenciesDisable">
                    <el-select v-model="form2.operationId">
                        <el-option v-for="agency in agencyList" :value="agency.id" :label="agency.name"  :key="agency.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm2('form2')">取 消</el-button>
                <el-button type="primary" @click="submitUser2('form2')">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { pagination } from '../mixins/pagination.js'
    export default {
        mixins: [pagination],
        data() {
            return {
                loanerDisable: false,//用来控制资金端是否显示
                agenciesDisable: true,//用来控制中介和门店是否显示
                formVisible: false,
                formVisible2: false,
                formLabelWidth: '120px',
                agencyList: [],
                loanerList: [],
                form: {
                    operationId: '',
                    rate: '',
                    rateType: 'LibToAgency'
                },
                form2: {
                    operationId: '',
                    rate: '',
                    rateType: ''
                },
                rules: {
                    rateType: [{required: true, message: '请输入费率类型', trigger: 'change'}],
                    rate: [{required: true, message: '请输入费率', trigger: 'blur'}],
                    operationId: [{required: true, message: '请选择中介或资金端', trigger: 'change'}]
                },
                rules2: {
                    rateType: [{required: true, message: '请输入费率类型', trigger: 'change'}],
                    rate: [{required: true, message: '请输入费率', trigger: 'blur'}],
                    operationId: [{required: true, message: '请选择中介或资金端', trigger: 'change'}]
                },
                url: '/riskcontrol/api/v1/rate/getRatePage'
            }
        },
        created(){
            this.getAgencyList();
            this.getLoanerList();
        },
        filters: {
            rateTypeFormat: function (value) {
                if (value === "LibToAgency") {
                    return "中介费率";
                } else if (value === "LibToLoaner") {
                    return "资金端费率";
                }
            }
        },
        methods: {
            //获取中介
            getAgencyList() {
                this.axios.get('/api/v1/admin/agency/getAgencyList').then((res) => {
                    this.agencyList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            //当费率类型选项变化时
            rateChange(value) {
                if(value === "LibToAgency"){
                    //中介
                    this.loanerDisable = false;
                    this.agenciesDisable = true;
                } else {
                    this.loanerDisable = true;
                    this.agenciesDisable = false;
                }
            },
            //获取资金端
            getLoanerList() {
                let self = this;
                this.axios.get('/riskcontrol/api/v1/loaner/getLoanerList').then((res) => {
                    self.loanerList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            //修改费率
            handleEdit(row) {
                this.form2 = Object.assign({}, row);
                this.formVisible2 = true;
            },
            //确定新增
            submitUser(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.axios.post('/riskcontrol/api/v1/rate', this.form).then((res) => {
                            this.getData();
                            this.$refs[formName].resetFields();
                            this.formVisible = false;
                            this.$message({
                                message: '新增成功！',
                                type: 'success'
                            });
                        }).catch((error) => {
                            this.$message.error(error.response.data.message);
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            //重置新增form
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.formVisible = false;
            },
            //修改提交
            submitUser2(formName) {
                let that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.axios.put('/riskcontrol/api/v1/rate', that.form2).then((res) => {
                            this.getData();
                            this.$refs[formName].resetFields();
                            this.formVisible2 = false;
                            this.$message({
                                message: '修改成功！',
                                type: 'success'
                            });
                        }).catch((error) => {
                            this.$message.error(error.response.data.message);
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            //重置新增form
            resetForm2(formName) {
                this.$refs[formName].resetFields();
                this.formVisible2 = false;
            },
        }
    }
</script>

<style>
</style>