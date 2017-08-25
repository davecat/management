<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="fa fa-dashboard"></i> 分期管理</el-breadcrumb-item>
                <el-breadcrumb-item>分期申请</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-row>
            <el-button type="primary" @click="approval()">审批模式</el-button>
        </el-row>
        <el-row>
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="所属中介：">
                    <el-select v-model="searchForm.agencyId" @change="getBranchList(searchForm.agencyId)">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="agency in agencyList" :key="agency.id" :label="agency.name" :value="agency.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属门店：">
                    <el-select v-model="searchForm.branchId">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="branch in branchList" :key="branch.id" :label="branch.name" :value="branch.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="申请编号：">
                    <el-input v-model="searchForm.applictionNo" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item label="起租日期：">
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
                <el-form-item label="租客联系方式：">
                    <el-input v-model="searchForm.mobile" placeholder="支持模糊查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <el-tabs v-model="searchForm.status" type="card" @tab-click="handleChange(searchForm.status)">
                <el-tab-pane label="待审核" name="Unconfirmed">
                    <span slot="label">待审核<el-badge :value="unconfirmedNumber" class="item"></el-badge></span>
                </el-tab-pane>
                <el-tab-pane label="已提交" name="Commited"></el-tab-pane>
                <el-tab-pane label="审批通过" name="Accepted"></el-tab-pane>
                <el-tab-pane label="审批不通过（待确认）" name="LoanerRejected">
                    <span slot="label">审批不通过（待确认）<el-badge :value="loanerRejectedNumber" class="item"></el-badge></span>
                </el-tab-pane>
                <el-tab-pane label="审批不通过（已确认）" name="LibRejected"></el-tab-pane>
                <el-tab-pane label="待修改（待确认）" name="LoanerReturned">
                    <span slot="label">待修改（待确认）<el-badge :value="loanerReturnedNumber" class="item"></el-badge></span>
                </el-tab-pane>
                <el-tab-pane label="待修改（已确认）" name="LibReturned"></el-tab-pane>
            </el-tabs>
            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    highlight-current-row
                    @current-change="handleCurrentRow"
                    :default-sort="{prop: 'id', order: 'descending'}"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @selection-change="handleSelectionChange">
                <el-table-column
                        min-width="40"
                        fixed
                        type="selection">
                </el-table-column>
                <el-table-column
                        min-width="100"
                        prop="id"
                        sortable
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
                        min-width="80"
                        prop="monthlyRent"
                        label="月租金">
                    <template scope="scope">
                        {{ scope.row.monthlyRent |  currency}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="131"
                        prop="startDate"
                        label="起止日期">
                    <template scope="scope">
                        {{ scope.row.startDate |  dateFormat}}-{{ scope.row.endDate |  dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="rentPeriod"
                        label="租期">
                </el-table-column>
                <el-table-column
                        min-width="80"
                        prop="totalAmount"
                        label="房租总额">
                    <template scope="scope">
                        {{ scope.row.totalAmount | currency }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="180"
                        prop="city"
                        label="租房城市">
                    <template scope="scope">
                        {{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
                        scope.row.district | districtFormat }}
                    </template>
                </el-table-column>
                <el-table-column
                        min-width="207"
                        prop="responsibleAgent"
                        label="经纪人">
                    <template scope="scope">
                        {{ scope.row.agencyName }}-{{ scope.row.responsibleBranch }}-{{ scope.row.responsibleAgent }}
                    </template>
                </el-table-column>
                <el-table-column v-if="searchForm.status !== 'Unconfirmed'"
                        min-width="100"
                        prop="loanerName"
                        label="提交资金端">
                </el-table-column>
                <el-table-column v-if="searchForm.status !== 'Unconfirmed' && searchForm.status !== 'Commited'"
                        min-width="80"
                        prop="loanerApprovalDate"
                        label="审批日期">
                    <template scope="scope">
                        {{ scope.row.loanerApprovalDate | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column v-if="searchForm.status === 'LibRejected' || searchForm.status === 'LibReturned'"
                        min-width="80"
                        prop="libApprovalDate"
                        label="确认日期">
                    <template scope="scope">
                        {{ scope.row.libApprovalDate | dateFormat }}
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
                        <span>{{ currentRow.monthlyRent | currency }} 元／月</span>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="租期：">
                        <span>{{ currentRow.rentPeriod }}</span>
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
                title="配置默认提交资金端"
                :visible.sync="dialogVisible4"
                size="tiny">
            <el-form :model="form" ref="form">
                <el-form-item label="资金端：">
                    <el-select v-model="form.loanerId">
                        <el-option v-for="loaner in loanerList" :key="loaner.id" :label="loaner.name" :value="loaner.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible4 = false;dialogVisible5 = true">跳 过</el-button>
                <el-button type="primary" @click="dialogVisible4 = false;dialogVisible5 = true">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
                title="提交至资金端"
                :visible.sync="dialogVisible"
                size="tiny">
            <el-form :model="form" ref="form" :rules="rules">
                <el-form-item label="资金端：" prop="loanerId">
                    <el-select v-model="form.loanerId">
                        <el-option v-for="loaner in loanerList" :key="loaner.id" :label="loaner.name" :value="loaner.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="multipleCommit">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog
                :visible.sync="dialogVisible5"
                size="large">
            <div id="dialog-body">
                <div class="left">
                    <el-button type="primary" @click="dialogVisible5 = false" style="margin-bottom: 10px">结束审核</el-button>
                    <el-row>
                        <div class="leftSpan">申请编号：{{currentRow.id}}</div>
                    </el-row>
                    <el-row>
                        <div class="leftSpan">姓名：{{currentRow.customerName}}</div>
                        <div class="leftSpan">手机号：{{currentRow.mobile}}</div>
                        <div class="leftSpan">身份证号：{{currentRow.idCardNo}}</div>
                    </el-row>
                    <el-row>
                        <div class="leftSpan">月租金：{{currentRow.monthlyRent}}</div>
                        <div class="leftSpan">起止日期：{{ currentRow.startDate |  dateFormat}}-{{ currentRow.endDate |  dateFormat}}</div>
                        <div class="leftSpan">租期：{{currentRow.rentPeriod}}</div>
                        <div class="leftSpan">尾款：{{currentRow.retainage | currency}}</div>
                    </el-row>
                    <el-row>
                        <div class="leftSpan">经纪人：{{currentRow.responsibleAgent}}</div>
                        <div class="leftSpan">联系电话：{{currentRow.responsibleAgentPhone}}</div>
                        <div class="leftSpan">申请日期：{{currentRow.applyDate | dateFormat}}</div>
                    </el-row>
                    <el-form label-position="left" inline>
                        <el-row>
                            <el-form-item label="审批备注：" class="reasonInputTextarea">
                                <el-input
                                        type="textarea"
                                        autosize
                                        placeholder="请输入内容"
                                        v-model="currentRow.confirmRemarks">
                                </el-input>
                            </el-form-item>
                        </el-row>
                        <el-row>
                            <el-form-item label="待修改原因：" class="reasonInputTextarea">
                                <el-select v-model="reason" multiple placeholder="请选择">
                                    <el-option
                                            v-for="item in reasonOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-row>
                    </el-form>
                    <el-collapse>
                        <el-collapse-item title="房屋信息" name="1">
                            <div>{{currentRow.address}}</div>
                            <div>详细地址：{{ currentRow.provinceName }}{{ currentRow.cityName }}{{ currentRow.districtName }}</div>
                            <div>台账号：{{currentRow.apartmentNo}}</div>
                        </el-collapse-item>
                        <el-collapse-item title="租客其他信息" name="2">
                            <div>学历：{{currentRow.education | educationFormat}}</div>
                            <div>工作单位：{{currentRow.companyName}}</div>
                            <div>单位地址：{{currentRow.companyAddress}}</div>
                        </el-collapse-item>
                        <el-collapse-item title="应急联系人" name="3">
                            <div>应急联系人：{{currentRow.emergencyContact}}</div>
                            <div>联系方式：{{currentRow.emergencyContactMobile}}</div>
                            <div>关系：{{currentRow.relation | relationFormat}}</div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
                <div class="right">
                    <div style="width: 100%;text-align: center;margin-bottom: 5px">
                        <el-button style="float: left" @click="prev()" :disabled="!tableData[index-1]">上一条</el-button>
                        <el-button type="success" @click="dialogVisible = true">提 交</el-button>
                        <el-button type="warning" @click="multipleReturn">驳 回</el-button>
                        <el-button type="danger" @click="multipleReject">拒 绝</el-button>
                        <el-button style="float: right" @click="next()" :disabled="!tableData[index+1]">下一条</el-button>
                    </div>
                    <div style="width: 100%;text-align: center;margin-bottom: 15px">
                        <el-button @click="hashClick('slide1')" :class="a">身份证正面</el-button>
                        <el-button @click="hashClick('slide2')" :class="b">身份证反面</el-button>
                        <el-button @click="hashClick('slide3')" :class="c">手持身份证</el-button>
                        <el-button @click="hashClick('slide4')" :class="d">房租合同</el-button>
                    </div>
                    <!-- swiper -->
                    <swiper :options="swiperOption">
                        <swiper-slide data-hash="slide1" style="overflow-y: scroll">
                            <div class="swiper-zoom-container">
                                <img :src="showquanPhoto(currentRow.idCardFrontPhoto)" alt="" @click="imgClick1()" id="idCardFrontPhoto">
                            </div>
                        </swiper-slide>
                        <swiper-slide data-hash="slide2" style="overflow-y: scroll">
                            <div class="swiper-zoom-container">
                                <img :src="showquanPhoto(currentRow.idCardVersoPhoto)" alt="" @click="imgClick2()" id="idCardVersoPhoto">
                            </div>
                        </swiper-slide>
                        <swiper-slide data-hash="slide3" style="overflow-y: scroll">
                            <div class="swiper-zoom-container">
                                <img :src="showquanPhoto(currentRow.idCardAndPersonPhoto)" alt="" @click="imgClick3()" id="idCardAndPersonPhoto">
                            </div>
                        </swiper-slide>
                        <swiper-slide v-for="(item,index) in currentRow.contractPhotos" :key="item" data-hash="slide4" style="overflow-y: scroll">
                            <div class="imgContainer">
                                <img :src="showquanPhoto(item)" alt="" @click="imgClick4(index)" class="contractPhotos" width="80%" height="100%">
                            </div>
                        </swiper-slide>
                        <div class="swiper-pagination" slot="pagination"></div>
                        <div class="swiper-button-prev" slot="button-prev" @click="prevClick()"></div>
                        <div class="swiper-button-next" slot="button-next" @click="nextClick()"></div>
                    </swiper>
                </div>
            </div>
        </el-dialog>

        <el-dialog
                title="大图"
                :visible.sync="dialogBigPhoto"
                size="small">
            <span><img :src="bigPhotoUrl" width="100%"></span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogBigPhoto = false">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import VueAwesomeSwiper from 'vue-awesome-swiper'
    import { swiper, swiperSlide } from 'vue-awesome-swiper'
    import json from "../../../static/city.json";
    import format from 'date-fns/format'
    import { qiniu } from '../mixins/qiniu.js'
    export default {
        components: {
            swiper,
            swiperSlide
        },
        name: 'carrousel',
        mixins: [qiniu],
        data() {
            return {
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
                current1: 0,
                current2: 0,
                current3: 0,
                current4: 0,
                index: 0,//默认审阅模式从第一条开始
                //控制右边内容tab样式
                a: 'is-active',
                b: '',
                c: '',
                d: '',
                //初始化seiper
                swiperOption: {
                    pagination: '.swiper-pagination',
                    paginationClickable: true,
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                    spaceBetween: 100,
                    hashnav: true,
                    hashnavWatchState: true
                },
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
                tableData: [],
                cur_page: 1,
                size: 10,
                totalElements: 0,
                url: '/riskcontrol/lib/api/v1/application/getApplicationPage',
                agencyList: {},
                branchList: {},
                loanerList: {},
                searchForm: {
                    applictionNo: '',
                    applyDate: '',
                    startDate: '',
                    endDate: '',
                    customerName: '',
                    agencyId: '',
                    branchId: '',
                    mobile: '',
                    status: 'Unconfirmed'
                },
                form: {
                    loanerId: '',
                    applicationNo: ''
                },
                rules: {
                    loanerId: [{required: true, message: '请选择资金端', trigger: 'change'}],
                },
                currentRow: {
                    confirmRemarks: '',
                    responsibleAgent: '',
                    responsibleAgentPhone: '',
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
                bigPhotoUrl: '',
                dialogBigPhoto: false,
                dialogVisible: false,
                dialogVisible4: false,
                dialogVisible5: false,
                idCardFrontPhoto: '',
                idCardVersoPhoto: '',
                idCardAndPersonPhoto: '',
                contractPhotos: [],
                unconfirmedNumber: 0,//待审核单据数量
                loanerRejectedNumber: 0,//审批不通过（待确认）单据数量
                loanerReturnedNumber: 0//待修改（待确认）单据数量
            }
        },
        created(){
            this.getData();
            this.getAgencyList();
            this.getLoanerList();
            //获取单据数量
            this.axios.post(this.url, {
                ...this.searchForm,
                page: this.cur_page - 1,
                size: this.size
            }).then((res) => {
                this.unconfirmedNumber = res.data.totalElements;
            }).catch((error) => {
                this.$message.error(error.response.data.message);
            });
            //审批不通过(待确认)单据
            let searchForm1 = {
                applictionNo: '',
                applyDate: '',
                startDate: '',
                endDate: '',
                customerName: '',
                agencyId: '',
                branchId: '',
                mobile: '',
                status: 'LoanerRejected'
            };
            this.axios.post(this.url, {
                ...searchForm1,
                page: this.cur_page - 1,
                size: this.size
            }).then((res) => {
                this.loanerRejectedNumber = res.data.totalElements;
            }).catch((error) => {
                this.$message.error(error.response.data.message);
            });
            //待修改(待确认)单据
            let searchForm2 = {
                applictionNo: '',
                applyDate: '',
                startDate: '',
                endDate: '',
                customerName: '',
                agencyId: '',
                branchId: '',
                mobile: '',
                status: 'LoanerReturned'
            };
            this.axios.post(this.url, {
                ...searchForm2,
                page: this.cur_page - 1,
                size: this.size
            }).then((res) => {
                this.loanerReturnedNumber = res.data.totalElements;
            }).catch((error) => {
                this.$message.error(error.response.data.message);
            })
        },
        filters: {
            appStatusFormat: function (value) {
                if (value === "Unconfirmed") {
                    return "待审核";
                } else if (value === "Accepted") {
                    return "审核通过";
                } else if (value === "LibReturned") {
                    return "待修改（已确认）";
                } else if (value === "LoanerRejected") {
                    return "审批不通过-待确认";
                } else if (value === "LoanerReturned") {
                    return "待修改-待确认";
                } else if (value === "LibRejected") {
                    return "审批不通过-已确认";
                } else if (value === "Commited") {
                    return "已提交";
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
            districtFormat: function (value) {
                if(!value){
                    return ''
                }
                let district = {};
                let findLabel = (item, value) => {
                    if(item) {
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
        methods: {
            //上一条
            prev() {
                //跳转到上一条
                this.index = this.index - 1;
                this.approvalDetail();
            },
            //下一条
            next() {
                //跳转到下一条
                this.index = this.index + 1;
                this.approvalDetail();
            },
            //照片旋转
            imgClick1() {
                this.current1 = (this.current1+90)%360;
                document.getElementById('idCardFrontPhoto').style.transform = 'rotate('+this.current1+'deg)';
            },
            imgClick2() {
                this.current2 = (this.current2+90)%360;
                document.getElementById('idCardVersoPhoto').style.transform = 'rotate('+this.current2+'deg)';
            },
            imgClick3() {
                this.current3 = (this.current3+90)%360;
                document.getElementById('idCardAndPersonPhoto').style.transform = 'rotate('+this.current3+'deg)';
            },
            imgClick4(index) {
                this.current4 = (this.current4+90)%360;
                document.getElementsByClassName('contractPhotos')[index].style.transform = 'rotate('+this.current4+'deg)';
            },
            //获取审批数据
            approvalDetail() {
                //初始化数据
                this.current1 = 0;
                this.current2 = 0;
                this.current3 = 0;
                this.current4 = 0;
                let that = this;
                this.reason = [];
                this.currentRow = this.tableData[this.index];
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
                    if(that.currentRow.province === item.value){
                        that.currentRow.provinceName = item.label+'/';
                        //市
                        item.children.forEach((item) => {
                            if(that.currentRow.city === item.value){
                                that.currentRow.cityName = item.label+'/';
                                //县
                                item.children.forEach((item) => {
                                    if(that.currentRow.district === item.value){
                                        that.currentRow.districtName = item.label;
                                    }
                                })
                            }
                        })
                    }
                });
            },
            //审批模式
            approval() {
                if(this.tableData.length === 0){
                    this.$message({
                        message: '当前没有要审批的单据',
                        type: 'warning'
                    });
                    return;
                }
                //重置hash
                this.index = 0;
                window.location.hash = '#slide1';
                this.a = 'is-active';
                this.b = '';
                this.c = '';
                this.d = '';
                this.dialogVisible4 = true;
                this.approvalDetail();
            },
            prevClick() {
                console.log(window.location.hash);
                if(window.location.hash === '#slide4') {
                    this.a = '';
                    this.b = '';
                    this.c = 'is-active';
                    this.d = ''
                }
                if(window.location.hash === '#slide3') {
                    this.a = '';
                    this.b = 'is-active';
                    this.c = '';
                    this.d = ''
                }
                if(window.location.hash === '#slide2') {
                    this.a = 'is-active';
                    this.b = '';
                    this.c = '';
                    this.d = ''
                }
            },
            nextClick() {
                console.log(window.location.hash);
                if(window.location.hash === '#slide1') {
                    this.a = '';
                    this.b = 'is-active';
                    this.c = '';
                    this.d = ''
                }
                if(window.location.hash === '#slide2') {
                    this.a = '';
                    this.b = '';
                    this.c = 'is-active';
                    this.d = ''
                }
                if(window.location.hash === '#slide3') {
                    this.a = '';
                    this.b = '';
                    this.c = '';
                    this.d = 'is-active'
                }
                if(window.location.hash === '#slide4') {
                    this.a = '';
                    this.b = '';
                    this.c = '';
                    this.d = 'is-active'
                }
            },
            //根据hash来跳转
            hashClick(a) {
                if(a === 'slide1') {
                    window.location.hash='#slide1';
                    this.a = 'is-active';
                    this.b = '';
                    this.c = '';
                    this.d = ''
                }
                if(a === 'slide2') {
                    window.location.hash='#slide2';
                    this.a = '';
                    this.b = 'is-active';
                    this.c = '';
                    this.d = ''
                }
                if(a === 'slide3') {
                    window.location.hash='#slide3';
                    this.a = '';
                    this.b = '';
                    this.c = 'is-active';
                    this.d = ''
                }
                if(a === 'slide4') {
                    window.location.hash='#slide4';
                    this.a = '';
                    this.b = '';
                    this.c = '';
                    this.d = 'is-active'
                }
            },
            getData(a){
                this.axios.post(this.url, {
                    ...this.searchForm,
                    page: this.cur_page - 1,
                    size: this.size
                }).then((res) => {
                    this.tableData = res.data.content;
                    this.totalElements = res.data.totalElements;
                    //获取单据数量
                    if(a === 'Unconfirmed'){
                        this.unconfirmedNumber = res.data.totalElements;
                    }
                    if(a === 'LoanerRejected'){
                        this.loanerRejectedNumber = res.data.totalElements;
                    }
                    if(a === 'LoanerReturned'){
                        this.loanerReturnedNumber = res.data.totalElements;
                    }
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            handleCurrentChange(val){
                this.cur_page = val;
                this.getData();
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
            showBigPhoto(token) {
                this.bigPhotoUrl = this.qiniu + token + '?imageMogr2/auto-orient';
                this.dialogBigPhoto = true;
            },
            showquanPhoto(token) {
                if (token !== undefined && token !== '' && token !== null) {
                    return this.qiniu + token + '?imageMogr2/auto-orient|imageView2/1';
                }
            },
            handleChange(a) {
                this.getData(a);
            },
            getAgencyList() {
                this.axios.get('/api/v1/admin/agency/getAgencyList').then((res) => {
                    this.agencyList = res.data;
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                })
            },
            getBranchList(agencyId) {
                if(agencyId !== '') {
                    this.axios.get('/api/v1/admin/branch/getBranchListByAgencyId/' + agencyId).then((res) => {
                        this.branchList = res.data;
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    })
                } else {
                    this.searchForm.branchId = '';
                    this.branchList = [];
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
            //点击查看明细
            handleCurrentRow(val) {
                let that = this;
                if (val === null) {
                    this.currentRow = {
                        confirmRemarks: '',
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
                    this.reason = [];
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
                        if(that.currentRow.province === item.value){
                            that.currentRow.provinceName = item.label+'/';
                            //市
                            item.children.forEach((item) => {
                                if(that.currentRow.city === item.value){
                                    that.currentRow.cityName = item.label+'/';
                                    //县
                                    item.children.forEach((item) => {
                                        if(that.currentRow.district === item.value){
                                            that.currentRow.districtName = item.label;
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            multipleCommit() {
                this.form.applicationNo = this.currentRow.id;
                    this.axios.post('/riskcontrol/lib/api/v1/application/commitToLoaner', this.form).then((res) => {
                        this.getData();

                        //跳转到下一条 请求成功时才执行
                        this.index = this.index + 1;
                        if(this.tableData[this.index] === undefined) {
                            this.$message.error('没有下一条数据');
                            return;
                        } else {
                            window.location.hash = '#slide1';
                            this.a = 'is-active';
                            this.b = '';
                            this.c = '';
                            this.d = '';
                            this.approvalDetail();
                        }
                    }).catch((error) => {
                        this.$message.error(error.response.data.message);
                    });
                this.dialogVisible = false;
            },
            checkParam(arr, param) {
                return arr.find(item => item === param) !== undefined;
            },
            multipleReturn() {
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
                this.axios.post('/riskcontrol/lib/api/v1/application/libReturn', form).then((res) => {
                    this.getData();

                    //跳转到下一条 请求成功时才执行
                    this.index = this.index + 1;
                    if(this.tableData[this.index] === undefined) {
                        this.$message.error('没有下一条数据');
                        return;
                    } else {
                        window.location.hash = '#slide1';
                        this.a = 'is-active';
                        this.b = '';
                        this.c = '';
                        this.d = '';
                        this.approvalDetail();
                    }
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
            },
            multipleReject() {
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
                this.axios.post('/riskcontrol/lib/api/v1/application/libReject', form).then((res) => {
                    this.getData();

                    //跳转到下一条 请求成功时才执行
                    this.index = this.index + 1;
                    if(this.tableData[this.index] === undefined) {
                        this.$message.error('没有下一条数据');
                        return;
                    } else {
                        window.location.hash = '#slide1';
                        this.a = 'is-active';
                        this.b = '';
                        this.c = '';
                        this.d = '';
                        this.approvalDetail();
                    }
                }).catch((error) => {
                    this.$message.error(error.response.data.message);
                });
            }
        }
    }
</script>

<style>
    .image {
        width:100%;
    }
    .leftSpan {
        margin-bottom: 8px;
    }
    .demo-table-expand {
        font-size: 0;
    }

    .demo-table-expand label {
        width: 110px;
        color: #99a9bf;
    }
    .item {
        margin-left: 4px;
        vertical-align: sub;
    }
    .reasonInputTextarea {
        width: 100%;
        margin-bottom: 0;
    }
    .reasonInputTextarea .el-textarea {
        margin-left: 13px;
    }

    .reasonInputTextarea .el-form-item__content {
        width: 60%;
    }
    .left {
        background: none repeat scroll 0 0 #fff;
        padding:40px;
        box-sizing: border-box;
        overflow-y: scroll;
        display: block;
        position: absolute;
        width: 350px;
        height: 720px;
        left: 0;
        top: 0;
        bottom: 0;
        border-right: 1px dashed black;
    }
    .right{
        height: 720px;
        background: none repeat scroll 0 0 #fff;
        position: absolute;
        left: 350px;
        right: 0;
        top: 0;
        bottom:0;
        width: 71%;
        padding:40px;
        box-sizing: border-box;
        overflow-y: scroll;
    }
    .swiper-container {
        height:85%;
        width:100%;
    }

    .swiper-pagination-bullet-custom {
        width: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        font-size: 12px;
        color: #000;
        opacity: 1;
        background: rgba(0,0,0,0.2);
    }
    .swiper-pagination-bullet-custom.swiper-pagination-bullet-active {
        color:#fff;
        background: #007aff;
    }
    .swiper-pagination-bullet {
        width: 71px;
        height: 8px;
        display: inline-block;
        border-radius: 100%;
        background: #000;
        opacity: .2;

    }
    .el-dialog--large {
        width: 1200px;
    }
    .imgContainer {
        width:100%;
        text-align: center;
    }
</style>
