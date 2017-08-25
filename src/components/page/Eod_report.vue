<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 资金端</el-breadcrumb-item>
                <el-breadcrumb-item>日结查询</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="租客姓名：">
                    <el-input v-model="searchForm.customerName" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item label="日结日期：">
                    <el-date-picker
                            v-model="searchForm.eodDate"
                            align="right"
                            type="date"
                            placeholder="选择日期"
                            @change="selectedData"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row style="position: absolute;width: 100%;height: 42px;line-height: 42px;color: red;">
            <el-col :span="4" style="position: absolute;right: 5%">
                借款合计: {{ tatleAmountAll | currency}}
            </el-col>
        </el-row>
        <el-row>
            <el-tabs v-model="searchForm.status" type="card" @tab-click="handleChange">
                <el-tab-pane label="审批通过" name="Accepted"></el-tab-pane>
                <el-tab-pane label="审批不通过" name="Rejected"></el-tab-pane>
                <el-tab-pane label="驳回修改" name="Returned"></el-tab-pane>
            </el-tabs>
            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    highlight-current-row
                    @current-change="handleCurrentRow"
                    :default-sort="{prop: 'approvalDate', order: 'descending'}"
                    tooltip-effect="dark"
                    style="width: 100%">
                <el-table-column
                        min-width="150"
                        prop="eodDate"
                        sortable
                        label="日结日期">
                    <template scope="scope">
                        {{ scope.row.eodDate | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="applictionNo"
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
                        prop="startDate"
                        label="起止日期">
                    <template scope="scope">
                        {{ scope.row.startDate |  dateFormat}}-{{ scope.row.endDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop=""
                        label="借款金额">
                    <template scope="scope">
                        {{ scope.row.totalAmount - scope.row.monthlyRent | currency }}
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
        <el-form label-position="left" inline
                 class="demo-table-expand">
            <el-row>
                <el-col :span="10">
                    <el-form-item label="审批备注：" id="reasonInputTextarea">
                        <el-input
                                disabled
                                type="textarea"
                                autosize
                                placeholder="请输入内容"
                                v-model="currentRow.confirmRemarks">
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="待修改原因：">
                        <el-select v-model="reason" multiple placeholder="请选择" disabled>
                            <el-option
                                    v-for="item in reasonOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="经纪人：">
                        <span>{{ currentRow.responsibleAgent }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="申请日期：">
                        <span>{{ currentRow.applyDate | dateFormat }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="申请状态：">
                        <span>{{ currentRow.status | appStatusFormat }}</span>
                    </el-form-item>
                </el-col>
                <hr style="border-bottom-color: #d9d9d9; border-top: none;">
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="月租金：">
                        <span>{{ currentRow.monthlyRent }} 元／月</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="租期：">
                        <span>{{ currentRow.rentPeriod }} 个月</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="起租日期：">
                        <span>{{ currentRow.startDate | dateFormat }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="房源编号：">
                        <span>{{ currentRow.apartmentNo }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="房屋信息：">
                        <span>{{ currentRow.address }}</span>
                    </el-form-item>
                </el-col>
                <hr style="border-bottom-color: #d9d9d9; border-top: none;">
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="租客姓名：">
                        <span>{{ currentRow.customerName }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="身份证号：">
                        <span>{{ currentRow.idCardNo }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="手机号：">
                        <span>{{ currentRow.mobile }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="最高学历：">
                        <span>{{ currentRow.education | educationFormat }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="工作单位：">
                        <span>{{ currentRow.companyName }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="单位地址：">
                        <span>{{ currentRow.companyAddress }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="开户银行：">
                        <span>{{ currentRow.bankAccount }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="银行卡号：">
                        <span>{{ currentRow.bankCard }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="应急联系人：">
                        <span>{{ currentRow.emergencyContact }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="手机号：">
                        <span>{{ currentRow.emergencyContactMobile }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="关系：">
                        <span>{{ currentRow.relation | relationFormat }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="3">
                    <el-form-item label="身份证照片：">
                    </el-form-item>
                </el-col>
                <el-col :span="7">
                    <el-card :body-style="{ padding: '0px' }">
                        <img :src="photo(currentRow.idCardFrontPhoto)" class="image">
                        <div style="padding: 14px;">
                            <span>身份证正面</span>
                            <div class="bottom clearfix">
                                <el-button type="text" class="button"
                                           @click="showBigPhoto(currentRow.idCardFrontPhoto)">看大图
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="7">
                    <el-card :body-style="{ padding: '0px' }">
                        <img :src="photo(currentRow.idCardVersoPhoto)" class="image">
                        <div style="padding: 14px;">
                            <span>身份证反面</span>
                            <div class="bottom clearfix">
                                <el-button type="text" class="button"
                                           @click="showBigPhoto(currentRow.idCardVersoPhoto)">看大图
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="7">
                    <el-card :body-style="{ padding: '0px' }">
                        <img :src="photo(currentRow.idCardAndPersonPhoto)" class="image">
                        <div style="padding: 14px;">
                            <span>手持身份证照片</span>
                            <div class="bottom clearfix">
                                <el-button type="text" class="button"
                                           @click="showBigPhoto(currentRow.idCardAndPersonPhoto)">看大图
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="3">
                    <el-form-item label="租房合同照片：">
                    </el-form-item>
                </el-col>
                <el-col :span="4" v-for="(o, index) in currentRow.contractPhotos" :key="o">
                    <el-card :body-style="{ padding: '0px' }">
                        <img :src="photo(currentRow.contractPhotos[index])" class="image">
                        <div style="padding: 14px;">
                            <span>租房合同照片</span>
                            <div class="bottom clearfix">
                                <el-button type="text" class="button"
                                           @click="showBigPhoto(currentRow.contractPhotos[index])">看大图
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </el-form>

        <el-dialog
                title="大图"
                :visible.sync="dialogBigPhoto"
                size="small">
            <span><img :src="bigPhotoUrl" width="100%"></span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogBigPhoto = false">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="审批通过"
                :visible.sync="dialogVisible"
                size="tiny">
            <span>此操作会将选中分期申请通过审批，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleAccept">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="日结确认"
                :visible.sync="dialogVisible2"
                size="tiny">
            <el-row>今日共审批 {{ eodInfo.acceptedCount + eodInfo.rejectedCount + eodInfo.returnedCount }} 条申请：</el-row>
            <el-row>审批通过：{{ eodInfo.acceptedCount }} 条</el-row>
            <el-row>驳回修改：{{ eodInfo.rejectedCount }} 条</el-row>
            <el-row>拒绝申请：{{ eodInfo.returnedCount }} 条</el-row>
            <el-row>确认后不可修改审批结果，是否确认？</el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取 消</el-button>
                <el-button type="primary" @click="eod">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import format from 'date-fns/format'
    import { qiniu } from '../mixins/qiniu.js'
    export default {
        mixins: [qiniu],
        data() {
            return {
                // 借款金额合计
                tatleAmountAll: 0,
                tableData: [],
                cur_page: 1,
                size: 10,
                totalElements: 0,
                reason: [],
                reasonOption: [
                    {
                        value: 'idCardFrontOrVersoPhotoBlur',
                        label: '身份证正反面照片不清晰'
                    },
                    {
                        value: 'idCardAndPersonPhotoBlur',
                        label: '手持身份证照片不清晰'
                    },
                    {
                        value: 'contractPhotoBlur',
                        label: '合同照片不清晰或不完整'
                    },
                    {
                        value: 'addressBlur',
                        label: '房屋地址不规范或不详细'
                    },
                    {
                        value: 'customerInfoError',
                        label: '租客信息有误'
                    },
                    {
                        value: 'otherException',
                        label: '其他问题'
                    }],
                url: '/riskcontrol/loaner/api/v1/application/eod/getApplicationPage',
                searchForm: {
                    customerName: '',
                    eodDate: format(Date.now(), 'YYYY-MM-DD'),
                    status: 'Accepted'
                },
                form: {},
                eodInfo: {},
                dialogVisible: false,
                dialogVisible2: false,
                pickerOptions: {},
                currentRow: {
                    responsibleAgent: '',
                    applyDate: '',
                    status: '',
                    monthlyRent: '',
                    rentPeriod: '',
                    startDate: '',
                    address: '',
                    customerName: '',
                    idCardNo: '',
                    mobile: '',
                    education: '',
                    companyName: '',
                    companyAddress: '',
                    bankAccount: '',
                    bankCard: '',
                    emergencyContact: '',
                    emergencyContactMobile: '',
                    relation: '',
                    idCardFrontPhoto: '',
                    idCardVersoPhoto: '',
                    idCardAndPersonPhoto: '',
                    contractPhotos: []
                },
                bigPhotoUrl: '',
                dialogBigPhoto: false,
                idCardFrontPhoto: '',
                idCardVersoPhoto: '',
                idCardAndPersonPhoto: '',
                contractPhotos: []
            }
        },
        filters: {
            appStatusFormat: function (value) {
                if (value === "Accepted") {
                    return "审批通过";
                } else if (value === "Rejected") {
                    return "审批不通过";
                } else if (value === "Returned") {
                    return "驳回修改";
                }
            },
            educationFormat: function (value) {
                if (value === "CollegeDown") {
                    return "专科及以下";
                } else if (value === "Undergraduate") {
                    return "本科";
                } else if (value === "PostgraduateUp") {
                    return "硕士及以上";
                }
            },
            relationFormat: function (value) {
                if (value === "Parent") {
                    return "父母";
                } else if (value === "Fellow") {
                    return "同事";
                } else if (value === "Friend") {
                    return "朋友";
                } else if (value === "Relatives") {
                    return "其他";
                }
            },
            dateFormat: function (value) {
                if (typeof value === "string") {
                    let date = Date.parse(value.substring(0, value.length - 9))
                    return format(date, 'YYYYMMDD')
                }
            },
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
                this.axios.post(this.url, {
                    ...this.searchForm,
                    page: this.cur_page - 1,
                    size: this.size
                }).then((res) => {
                    this.tableData = res.data.content;
                    this.totalElements = res.data.totalElements;
                    //借款金额合计
                    this.tatleAmountAll = res.data.borrowAmount || 0;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
            },
            Search() {
                this.searchForm.eodDate = format(this.searchForm.eodDate, 'YYYY-MM-DD');
                this.getData();
            },
            selectedData() {
                if (this.searchForm.eodDate) {
                    this.searchForm.eodDate = format(this.searchForm.eodDate, 'YYYY-MM-DD');
                } else {
                    this.searchForm.eodDate = format(Date.now(), 'YYYY-MM-DD');
                }
            },
            handleCurrentRow(val) {
                //清空reason
                this.reason = [];
                if (val === null) {
                    this.currentRow = {
                        responsibleAgent: '',
                        applyDate: '',
                        status: '',
                        monthlyRent: '',
                        rentPeriod: '',
                        startDate: '',
                        address: '',
                        customerName: '',
                        idCardNo: '',
                        mobile: '',
                        education: '',
                        companyName: '',
                        companyAddress: '',
                        bankAccount: '',
                        bankCard: '',
                        emergencyContact: '',
                        emergencyContactMobile: '',
                        relation: '',
                    }
                } else {
                    this.currentRow = val;
                    if(this.currentRow.idCardFrontOrVersoPhotoBlur) {
                        this.reason.push('idCardFrontOrVersoPhotoBlur')
                    }
                    if(this.currentRow.idCardAndPersonPhotoBlur) {
                        this.reason.push('idCardAndPersonPhotoBlur')
                    }
                    if(this.currentRow.contractPhotoBlur) {
                        this.reason.push('contractPhotoBlur')
                    }
                    if(this.currentRow.addressBlur) {
                        this.reason.push('addressBlur')
                    }
                    if(this.currentRow.customerInfoError) {
                        this.reason.push('customerInfoError')
                    }
                    if(this.currentRow.otherException) {
                        this.reason.push('otherException')
                    }
                }
            },
            handleChange() {
              this.getData();
            },
            showBigPhoto(token) {
                this.bigPhotoUrl = this.qiniu + token + '?imageMogr2/auto-orient';
                this.dialogBigPhoto = true;
            },
            multipleAccept() {
                let ids = this.multipleSelection.map(row => {
                    return row.id
                });
                if (ids.length === 0) {
                    console.log('ids is null');
                } else {
                    this.axios.post('/riskcontrol/loaner/api/v1/application/loanerAccept', ids).then((res) => {
                        this.getData();
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    })
                }
                this.dialogVisible = false;
            },
            showEodInfo() {
                this.axios.get('/riskcontrol/loaner/api/v1/application/eod/info').then((res) => {
                    this.eodInfo = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
                this.dialogVisible2 = true;
            },
            eod() {
                this.axios.post('/riskcontrol/loaner/api/v1/application/eod').then((res) => {
                    this.getData();
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
                this.dialogVisible2 = false;
            },
        }
    }
</script>

<style>
    #reasonInputTextarea {
        width: 100%;
    }

    #reasonInputTextarea .el-form-item__content {
        width: 80%;
    }
</style>