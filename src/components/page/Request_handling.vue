<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 资金端</el-breadcrumb-item>
                <el-breadcrumb-item>分期申请审批</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-button type="primary" @click="dialogVisible = true">批量通过申请</el-button>
            <el-button type="primary" @click="showEodInfo">生成日结确认</el-button>
        </el-row>
        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="租客姓名：">
                    <el-input v-model="searchForm.customerName" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item label="申请日期：">
                    <el-date-picker
                            v-model="searchForm.applyDate"
                            align="right"
                            type="daterange"
                            placeholder="选择日期范围"
                            @change="selectedData"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="状态：">
                    <el-select v-model="searchForm.status">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="待处理" value="Unconfirmed"></el-option>
                        <el-option label="驳回-待确认" value="UnconfirmedReturned"></el-option>
                        <el-option label="拒绝-待确认" value="UnconfirmedRejected"></el-option>
                        <el-option label="通过-待确认" value="UnconfirmedAccepted"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row style="color: red;">
            <el-col :span="4" style="float: right">
                借款合计:{{ Totalorrowing | currency}}
            </el-col>
        </el-row>
        <el-row>
            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    highlight-current-row
                    @current-change="handleCurrentRow"
                    tooltip-effect="dark"
                    :default-sort = "{prop: 'libCommitDate', order: 'descending'}"
                    style="width: 100%"
                    @selection-change="handleSelectionChange">
                <el-table-column
                        fixed
                        type="selection"
                        width="40">
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="libCommitDate"
                        sortable
                        label="申请日期">
                    <template scope="scope">
                        {{ scope.row.libCommitDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="140"
                        prop="applictionNo"
                        label="申请编号">
                </el-table-column>
                <el-table-column
                        min-width="120"
                        prop="customerName"
                        label="租客姓名">
                </el-table-column>
                <el-table-column
                        min-width="125"
                        prop="mobile"
                        label="联系方式">
                </el-table-column>
                <el-table-column
                        min-width="171"
                        prop="startDate"
                        label="起止日期">
                    <template scope="scope">
                        {{ scope.row.startDate |  dateFormat}}-{{ scope.row.endDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="125"
                        prop=""
                        label="借款金额">
                    <template scope="scope">
                        {{ scope.row.totalAmount - scope.row.monthlyRent | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        fixed="right"
                        min-width="100"
                        label="操作">
                    <template scope="scope">
                        <el-tooltip class="item" effect="dark" content="通过申请" placement="top-end">
                            <el-button size="small" type="success" @click="openAccpetDailog(scope.row)"><i
                                    class="fa fa-check"></i>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="驳回修改" placement="top-end">
                            <el-button size="small" type="warning" @click="openReturnDailog(scope.row)"><i
                                    class="fa fa-share"></i>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="拒绝申请" placement="top-end">
                            <el-button size="small" type="danger" @click="openRejectDailog(scope.row)"><i
                                    class="fa fa-minus-circle"></i>
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
        <el-form label-position="left" inline>
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
                        <span>{{ currentRow.monthlyRent | currency }} 元／月</span>
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
                    <el-form-item label="退租日期：">
                        <span>{{ currentRow.endDate  | dateFormat }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="尾款：">
                        <span>{{ currentRow.retainage | currency }}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="房源编号：">
                        <span>{{ currentRow.apartmentNo }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <el-form-item label="省市区（县）：">
                        <span>{{ currentRow.provinceName }}{{ currentRow.cityName }}{{ currentRow.districtName }}</span>
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
                title="审批通过"
                :visible.sync="dialogVisible3"
                size="tiny">
            <span>此操作会将选中分期申请通过审批，是否继续？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible3 = false">取 消</el-button>
                <el-button type="primary" @click="handleAccpet">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="驳回修改"
                :visible.sync="dialogVisible4">
            <span style="margin-bottom: 24px;display: block">此操作会将选中分期申请驳回至中介修改，是否继续？</span>
            <el-form label-position="left" inline>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="审批备注：" class="reasonInputTextarea">
                            <el-input
                                    type="textarea"
                                    autosize
                                    placeholder="请输入内容"
                                    v-model="currentRow.confirmRemarks">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="待修改原因：">
                            <el-select v-model="reason" multiple placeholder="请选择">
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
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible4 = false">取 消</el-button>
                <el-button type="primary" @click="handleReturn">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                title="审批不通过"
                :visible.sync="dialogVisible5">
            <span style="margin-bottom: 24px;display: block">此操作会将选中分期申请拒绝通过审批，是否继续？</span>
            <el-form label-position="left" inline>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="审批备注：" class="reasonInputTextarea">
                            <el-input
                                    type="textarea"
                                    autosize
                                    placeholder="请输入内容"
                                    v-model="currentRow.confirmRemarks">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="待修改原因：">
                            <el-select v-model="reason" multiple placeholder="请选择">
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
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible5 = false">取 消</el-button>
                <el-button type="primary" @click="handleReject">确 定</el-button>
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
    import json from "../../../static/city.json";
    import format from 'date-fns/format'
    import { qiniu } from '../mixins/qiniu.js'
    export default {
        mixins: [qiniu],
        data() {
            return {
                totalItems:[],//总条目数
                tableData: [],
                cur_page: 1,
                size: 10,
                totalElements: 0,
                url: '/riskcontrol/loaner/api/v1/application/getApplicationPage',
                multipleSelection: [],
                searchForm: {
                    customerName: '',
                    applyDate: '',
                    startDate: '',
                    endDate: '',
                    status: ''
                },
                form: {},
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
                eodInfo: {},
                dialogVisible: false,
                dialogVisible2: false,
                dialogVisible3: false,
                dialogVisible4: false,
                dialogVisible5: false,
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
                if (value === "Unconfirmed") {
                    return "待处理";
                } else if (value === "UnconfirmedReturned") {
                    return "驳回-待确认";
                } else if (value === "UnconfirmedRejected") {
                    return "拒绝-待确认";
                } else if (value === "UnconfirmedAccepted") {
                    return "通过-待确认";
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
        computed: {
            Totalorrowing() {
                let Totalorrowing = 0;
                this.totalItems.forEach(item => {
                    Totalorrowing+=(item.totalAmount-item.monthlyRent);
                });
                return Totalorrowing;
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
                this.axios.post(this.url, {
                    ...this.searchForm,
                    page: this.cur_page - 1,
                    size: this.size
                }).then((res) => {
                    this.tableData = res.data.content;
                    this.totalElements = res.data.totalElements;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
                //新增不带分页查询全部，暂时最多查询999999条
                this.axios.post(this.url, {
                    ...this.searchForm,
                    page: 0,
                    size: 999999
                }).then((res) => {
                    this.totalItems = res.data.content;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            Search() {
                this.getData();
            },
            selectedData() {
                if (this.searchForm.applyDate[0] !== null) {
                    this.searchForm.startDate = format(this.searchForm.applyDate[0], 'YYYY-MM-DD');
                    this.searchForm.endDate = format(this.searchForm.applyDate[1], 'YYYY-MM-DD');
                } else {
                    this.searchForm.startDate = '';
                    this.searchForm.endDate = '';
                }
            },
            handleCurrentRow(val) {
                this.reason = [];
                let that = this;
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
                        confirmRemarks: '',
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
                    //这里处理省市县的id
                    json.forEach((item) => {
                        //省
                        if (that.currentRow.province === item.value) {
                            that.currentRow.provinceName = item.label + '/';
                            //市
                            item.children.forEach((item) => {
                                if (that.currentRow.city === item.value) {
                                    that.currentRow.cityName = item.label + '/';
                                    //县
                                    item.children.forEach((item) => {
                                        if (that.currentRow.district === item.value) {
                                            that.currentRow.districtName = item.label;
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            },
            showBigPhoto(token) {
                this.bigPhotoUrl = this.qiniu + token + '?imageMogr2/auto-orient';
                this.dialogBigPhoto = true;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            multipleAccept() {
                let ids = this.multipleSelection.map(row => {
                    return row.id
                });
                console.log(ids);
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
            openAccpetDailog(row) {
                this.dialogVisible3 = true;
            },
            openReturnDailog() {
                this.dialogVisible4 = true;
            },
            openRejectDailog() {
                this.dialogVisible5 = true;
            },
            handleAccpet() {
                let ids = [this.currentRow.id];
                this.axios.post('/riskcontrol/loaner/api/v1/application/loanerAccept', ids).then((res) => {
                    this.getData();
                    this.dialogVisible3 = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
            },
            checkParam(arr, param) {
                return arr.find(item => item === param) !== undefined;
            },
            handleReturn() {
                if(!this.currentRow.confirmRemarks && this.currentRow.confirmRemarks === '' || this.reason.length === 0) {
                    this.$message.error('请输入或选择修改原因');
                    return;
                }
                let form = {
                    id: this.currentRow.id,
                    confirmRemarks: this.currentRow.confirmRemarks,
                    idCardFrontOrVersoPhotoBlur: this.checkParam(this.reason, 'idCardFrontOrVersoPhotoBlur'),
                    idCardAndPersonPhotoBlur: this.checkParam(this.reason, 'idCardAndPersonPhotoBlur'),
                    contractPhotoBlur: this.checkParam(this.reason, 'contractPhotoBlur'),
                    addressBlur: this.checkParam(this.reason, 'addressBlur'),
                    customerInfoError: this.checkParam(this.reason, 'customerInfoError'),
                    otherException: this.checkParam(this.reason, 'otherException'),
                };
                this.axios.post('/riskcontrol/loaner/api/v1/application/loanerReturn', form).then((res) => {
                    this.getData();
                    this.reason = [];
                    this.dialogVisible4 = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
            },
            handleReject() {
                if(!this.currentRow.confirmRemarks && this.currentRow.confirmRemarks === '' || this.reason.length === 0) {
                    this.$message.error('请输入或选择拒绝原因');
                    return;
                }
                let form = {
                    id: this.currentRow.id,
                    confirmRemarks: this.currentRow.confirmRemarks,
                    idCardFrontOrVersoPhotoBlur: this.checkParam(this.reason, 'idCardFrontOrVersoPhotoBlur'),
                    idCardAndPersonPhotoBlur: this.checkParam(this.reason, 'idCardAndPersonPhotoBlur'),
                    contractPhotoBlur: this.checkParam(this.reason, 'contractPhotoBlur'),
                    addressBlur: this.checkParam(this.reason, 'addressBlur'),
                    customerInfoError: this.checkParam(this.reason, 'customerInfoError'),
                    otherException: this.checkParam(this.reason, 'otherException'),
                };
                this.axios.post('/riskcontrol/loaner/api/v1/application/loanerReject', form).then((res) => {
                    this.getData();
                    this.reason = [];
                    this.dialogVisible5 = false;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
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
    .reasonInputTextarea {
        width: 100%;
    }
    .reasonInputTextarea .el-form-item__label {
        width: 96px;
    }
    .reasonInputTextarea .el-form-item__content {
        width: 194px;
    }
</style>