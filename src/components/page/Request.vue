<template>
  <div style="height: 100%;">
    <el-row>
      <el-tabs v-model="searchForm.status[0]" @tab-click="handleChangeTab(searchForm.status[0])">
        <el-tab-pane label="待处理" name="Unchecked">
          <span slot="label">待处理<el-badge :value="pendingNumber" class="item"></el-badge></span>
        </el-tab-pane>

        <el-tab-pane label="待审核" name="Unconfirmed"></el-tab-pane>
        <el-tab-pane label="待放款" name="Loan"></el-tab-pane>
        <el-tab-pane label="还款中" name="Repayment"></el-tab-pane>
        <el-tab-pane label="已逾期" name="Breach">
          <span slot="label">已逾期<el-badge :value="overdueNumber" class="item"></el-badge></span>
        </el-tab-pane>
        <el-tab-pane label="已结束" name="Finished"></el-tab-pane>
        <el-tab-pane label="提前退租" name="RetirementFinished"></el-tab-pane>
      </el-tabs>
    </el-row>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.customerOrAppNoValue" placeholder="申请编号或租客姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.cityId" filterable @change="getBranchList(searchForm.cityId)"
                     placeholder="选择城市">
            <el-option v-for="city in cityList" :key="city.id" :label="city.name"
                       :value="city.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.branchId" placeholder="选择城市下的门店">
            <el-option v-for="branch in branchList" :key="branch.id" :label="branch.name"
                       :value="branch.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right;margin-right: 0">
          <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
            <el-button type="info" @click="exportCSV()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px;height: 28px;">
      <el-checkbox-group v-model="checkboxList" @change="checkboxChange"
                         style="float: left;margin-top: 7px;min-width: 150px"
                         v-if="searchForm.status[0] === 'RetirementFinished'">
        <el-checkbox label="Inadvancefinished">未退款</el-checkbox>
        <el-checkbox label="EarlyRetirement">已退款</el-checkbox>
      </el-checkbox-group>
      <el-radio-group v-model="radio" @change="radioChange()" v-if="searchForm.status[0] === 'Unchecked'"
                      style="float: left;margin-top: 7px;">
        <el-radio label='Unchecked'>待补充</el-radio>
        <el-radio label='Returned'>待修改</el-radio>
      </el-radio-group>
      <div class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </div>
    </el-row>
    <el-row>
      <el-table
        v-loading.body="loading"
        ref="multipleTable"
        :data="tableData"
        highlight-current-row
        @row-click="handleCurrentRow"
        tooltip-effect="dark">
        <el-table-column
          fixed
          min-width="140"
          prop="id"
          label="申请编号">
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="customerName"
          label="租客姓名">
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="mobile"
          label="联系方式">
        </el-table-column>
        <el-table-column
          min-width="180"
          prop="startDate"
          label="起止日期">
          <template scope="scope">
            {{ scope.row.startDate | dateFormat}}-{{ scope.row.endDate | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="monthlyRent"
          label="月租金">
          <template scope="scope">
            {{ scope.row.monthlyRent | currency}}
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="rentPeriod"
          label="租期">
        </el-table-column>
        <el-table-column
          min-width="130"
          prop="totalAmount"
          label="房租总额">
          <template scope="scope">
            {{ scope.row.totalAmount | currency }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="radio === 'Returned' || searchForm.status[0] !== 'Unchecked'"
          min-width="180"
          prop="apartmentNo"
          label="台账号">
        </el-table-column>
        <el-table-column
          v-if="radio === 'Returned' || searchForm.status[0] !== 'Unchecked'"
          min-width="180"
          prop="city"
          label="租房城市">
          <template scope="scope">
            {{ scope.row.province | districtFormat }}-{{ scope.row.city | districtFormat }}-{{
            scope.row.district | districtFormat }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="200"
          prop="responsibleAgent"
          label="经纪人">
          <template scope="scope">
            {{ scope.row.responsibleBranch }}-{{ scope.row.responsibleAgent }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="startDate"
          label="申请日期">
          <template scope="scope">
            {{ scope.row.startDate | dateFormat}}
          </template>
        </el-table-column>
      </el-table>
    </el-row>



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
      title="取消申请"
      :visible.sync="dialogVisible"
      size="tiny">
      <p>此操作将取消该申请，确认操作？</p>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="cancel()">确 定</el-button>
            </span>
    </el-dialog>
    <el-dialog
      title="转单"
      :visible.sync="dialogTransfer"
      size="tiny">
      <el-form>
        <el-form-item label="转单给：" :label-width="formLabelWidth"  prop="agencies">
          <el-select v-model="transferId">
            <el-option v-for="item in agentList" :key="item.agentId" :label="item.agentName" :value="item.agentId"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogTransfer=false">取 消</el-button>
                <el-button type="primary" @click="transfer()">确 定</el-button>
            </span>
    </el-dialog>
    <!--遮罩层-->
    <div v-if="cover"
         style="width: 100%;height: 100%;opacity: .1;background-color: #666;position: absolute;left: 0;top: 0;z-index: 888"></div>
    <!--拉扇层-->
    <el-form label-position="left" inline
             v-if="pullBloor"
             class="demo-table-expand hiddenForm">
      <div>
        <el-row style="position: absolute;top: 50%;left: -12px;z-index: 999;margin-top: -24px">
          <el-tooltip class="item" effect="dark" content="隐藏" placement="top-end">
            <el-button size="small" type="primary"
                       @click="hiddenClass()"><i
              class="fa fa-chevron-right"
              style="margin-right: -7px"
            ></i>
            </el-button>
          </el-tooltip>
        </el-row>
      </div>
      <content>
        <div style="width: 100%;text-align: center;margin-bottom: 5px">
          <el-button style="float: left;padding: 5px 15px" @click="prev()" :disabled="!tableData[currentIndex-1]"><i
            style="font-size: x-large;vertical-align: sub" class="fa fa-angle-left" aria-hidden="true"></i>上一条
          </el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="info" @click="currentSave">临时保存</el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="success" @click="submit">提交审批</el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="warning" @click="dialogVisible = true">取消申请</el-button>
          <el-button v-if="searchForm.status[0] === 'Unconfirmed'" type="warning">撤回</el-button>
          <el-button v-if="searchForm.status[0] === 'Repayment' || searchForm.status[0] === 'Breach' || searchForm.status[0] === 'Loan'" type="warning">
            提前退租
          </el-button>
          <el-button v-if="searchForm.status[0] !== 'Finished' && searchForm.status[0] !== 'Inadvancefinished'" @click="dialogTransfer = true;transferId=''">转单
          </el-button>
          <el-button style="float: right;padding: 5px 15px" @click="next()" :disabled="!tableData[currentIndex+1]">下一条<i
            style="font-size: x-large;vertical-align: sub" class="fa fa-angle-right" aria-hidden="true"></i></el-button>
        </div>
        <div
          style="width: 100%;text-align: center;margin-bottom: 5px;border-bottom: 1px solid #D9D9D9;border-top: 1px solid #D9D9D9;padding: 10px 0">
          <span style="color: red;">{{currentRow.status | appStatusFormat}}</span>
        </div>
        <el-row>
          <el-col :span="6">
            <el-form-item label="申请编号：">
              <span>{{ currentRow.applictionNo }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="租客姓名：">
              <span>{{ currentRow.customerName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="手机号码：">
              <span>{{ currentRow.mobile }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="身份证号：">
              <span>{{ currentRow.idCardNo }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="每月租金：">
              <el-input v-model="currentRow.monthlyRent"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="起止日期：">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                placeholder="选择日期范围">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="租期合计：">
              <span>{{ currentRow.rentPeriod }}</span>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="尾款合计：">
              <span>{{ currentRow.retainage | currency }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <hr style="border-bottom-color: #d9d9d9; border-top: none;">
        <el-row>
          <el-tabs v-model="infoTab">
            <el-tab-pane v-if="searchForm.status[0] !== 'Unchecked' && searchForm.status[0] !== 'Unconfirmed'"
                         label="还款账单" name="order">
              <!--@current-change="handleCurrentRow1"-->
              <el-table
                ref="multipleTable"
                highlight-current-row
                tooltip-effect="dark">
                <el-table-column
                  min-width="140"
                  prop="id"
                  label="应还款日期">
                </el-table-column>
                <el-table-column
                  min-width="100"
                  prop="customerName"
                  label="账单金额">
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="mobile"
                  label="手续费">
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="mobile"
                  label="逾期费">
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="mobile"
                  label="手续费">
                </el-table-column>
                <el-table-column
                  min-width="180"
                  prop="startDate"
                  label="账单状态">
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="monthlyRent"
                  label="实际还款日期">
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="房屋信息" name="houseInfo">
              <el-row>
                <el-col>
                  <el-form-item label="房屋信息：" :label-width="formLabelWidth" prop="selectedOptions">
                    <el-cascader
                      :options="options"
                      v-model="selectedOptions">
                    </el-cascader>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label=" " :label-width="formLabelWidth" prop="address">
                    <el-input v-model="currentRow.address" placeholder="详细地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="台账号码：" :label-width="formLabelWidth" prop="apartmentNo">
                    <el-input v-model="currentRow.apartmentNo"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="租客其他信息" name="customerInfo">
              <el-row>
                <el-col :span="10">
                  <el-form-item label="学历信息：" :label-width="formLabelWidth" prop="education">
                    <el-select v-model="currentRow.education">
                      <el-option label="专科及以下" value="CollegeDown"></el-option>
                      <el-option label="本科" value="Undergraduate"></el-option>
                      <el-option label="硕士及以上" value="PostgraduateUp"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="应急联系：" :label-width="formLabelWidth" prop="emergencyContact">
                    <el-input v-model="currentRow.emergencyContact"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-form-item label="工作单位：" :label-width="formLabelWidth" prop="companyName">
                    <el-input v-model="currentRow.companyName"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="联系方式：" :label-width="formLabelWidth" prop="emergencyContactMobile">
                    <el-input v-model="currentRow.emergencyContactMobile"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-form-item label="单位地址：" :label-width="formLabelWidth" prop="companyAddress">
                    <el-input v-model="currentRow.companyAddress"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="双方关系：" :label-width="formLabelWidth" prop="relation">
                    <el-select v-model="currentRow.relation">
                      <el-option label="父母" value="Parent"></el-option>
                      <el-option label="同事" value="Fellow"></el-option>
                      <el-option label="朋友" value="Friend"></el-option>
                      <el-option label="其他" value="Relatives"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane v-if="searchForm.status[0] === 'Unchecked'" label="照片资料" name="picInfo">
              <el-row :gutter="20">
                <el-col :span="3">
                  <el-form-item label="身份证照片：">
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadFrontSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardFrontPhoto" :src="photo(currentRow.idCardFrontPhoto)" class="avatar">
                    <i v-show="!currentRow.idCardFrontPhoto" class="el-icon-plus avatar-uploader-icon"></i>
                    <div class="el-upload__tip" slot="tip">身份证正面</div>
                  </el-upload>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadVersoSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardVersoPhoto" :src="photo(currentRow.idCardVersoPhoto)" class="avatar">
                    <i v-show="!currentRow.idCardVersoPhoto" class="el-icon-plus avatar-uploader-icon"></i>
                    <div class="el-upload__tip" slot="tip">身份证反面</div>
                  </el-upload>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadPersonSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardAndPersonPhoto" :src="photo(currentRow.idCardAndPersonPhoto)" class="avatar">
                    <i v-show="!currentRow.idCardAndPersonPhoto" class="el-icon-plus avatar-uploader-icon"></i>
                    <div class="el-upload__tip" slot="tip">手持身份证照片</div>
                  </el-upload>
                </el-col>
              </el-row>
              <el-row :gutter="20" style="margin: 10px -10px">
                <el-col :span="3">
                  <el-form-item label="租房合同照片：">
                  </el-form-item>
                </el-col>
                <el-col :span="20">
                  <el-upload
                    :file-list="fileList2"
                    :action="uploadUrl"
                    :data="postData"
                    list-type="picture-card"
                    :on-preview="handlePreview"
                    :before-upload="beforeUpload"
                    :on-success="uploadContractSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleRemove">
                    <!--<img v-show="contractPhotos" :src="photo(item)" class="avatar">-->
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane v-else="searchForm.status[0] === 'Unchecked'" label="照片资料" name="picInfo">
              <div style="width: 500px;height: 400px;margin: 0 auto">
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
                      <i class="fa fa-search-plus" aria-hidden="true"
                         style="font-size: x-large;position: absolute;top: 0;right: 0"
                         @click="showBigPhoto(currentRow.idCardFrontPhoto)"></i>
                      <img :src="showquanPhoto(currentRow.idCardFrontPhoto)" alt="" @click="imgClick1()"
                           id="idCardFrontPhoto">
                    </div>
                  </swiper-slide>
                  <swiper-slide data-hash="slide2" style="overflow-y: scroll">
                    <div class="swiper-zoom-container">
                      <i class="fa fa-search-plus" aria-hidden="true"
                         style="font-size: x-large;position: absolute;top: 0;right: 0"
                         @click="showBigPhoto(currentRow.idCardVersoPhoto)"></i>
                      <img :src="showquanPhoto(currentRow.idCardVersoPhoto)" alt="" @click="imgClick2()"
                           id="idCardVersoPhoto">
                    </div>
                  </swiper-slide>
                  <swiper-slide data-hash="slide3" style="overflow-y: scroll">
                    <div class="swiper-zoom-container">
                      <i class="fa fa-search-plus" aria-hidden="true"
                         style="font-size: x-large;position: absolute;top: 0;right: 0"
                         @click="showBigPhoto(currentRow.idCardAndPersonPhoto)"></i>
                      <img :src="showquanPhoto(currentRow.idCardAndPersonPhoto)" alt="" @click="imgClick3()"
                           id="idCardAndPersonPhoto">
                    </div>
                  </swiper-slide>
                  <swiper-slide v-for="(item,index) in currentRow.contractPhotos" :key="item" data-hash="slide4"
                                style="overflow-y: scroll">
                    <div class="imgContainer">
                      <i class="fa fa-search-plus" aria-hidden="true"
                         style="font-size: x-large;position: absolute;top: 0;right: 0" @click="showBigPhoto(item)"></i>
                      <img :src="showquanPhoto(item)" alt="" @click="imgClick4(index)" class="contractPhotos"
                           width="80%" height="100%">
                    </div>
                  </swiper-slide>
                  <div class="swiper-pagination" slot="pagination"></div>
                  <div class="swiper-button-prev" slot="button-prev" @click="prevClick()"></div>
                  <div class="swiper-button-next" slot="button-next" @click="nextClick()"></div>
                </swiper>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="radio === 'Returned'" label="审批备注" name="remarks">
              <!--{{currentRow.confirmRemarks}}-->
              <span style="color: red;">{{currentRow.confirmRemarks}}</span>
            </el-tab-pane>
          </el-tabs>
        </el-row>
        <hr style="border-bottom-color: #d9d9d9; border-top: none;">
        <el-row style="margin-top: 20px;opacity: .5">
          <el-col :span="6">
            <el-form-item label="经纪人：">
              <span>{{ currentRow.responsibleAgent }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="联系方式：">
              <span>{{currentRow.responsibleAgentPhone}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请日期：">
              <span>{{ currentRow.applyDate | dateFormat }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </content>
    </el-form>
  </div>
</template>

<script>
  import VueAwesomeSwiper from 'vue-awesome-swiper'
  import {swiper, swiperSlide} from 'vue-awesome-swiper'
  import json from "static/city.json";
  import format from 'date-fns/format'
  import {qiniu} from '../mixins/qiniu.js'
  export default {
    components: {
      swiper,
      swiperSlide
    },
    name: 'carrousel',
    mixins: [qiniu],
    data() {
      return {
        transferId: '',
        dateRange: [],
        currentIndex: 0,//选中当前行的索引
        checkboxList: ['Inadvancefinished', 'EarlyRetirement'],
        pullBloor: false,//控制拉扇是否显示
        current1: 0,//照片初始化旋转角度默认0
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
        infoTab: 'houseInfo',//拉扇层tab
        cover: false,//拉扇层
        radio: 'Unchecked',//单选按钮
        fileList2: [],
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
        loading: false,//加载动画
        tableData: [],
        cur_page: 1,
        size: 10,
        totalElements: 0,
        url: '/api/v2/applications',
        agentList: [],
        branchList: [],
        //省市县
        selectedOptions: [],
        options: [],
        searchForm: {
          customerOrAppNoValue: '',
          branchId: '',
          cityId: '',
          status: ['Unchecked']
        },
        form: {
          applicationNo: '',
          address:'',
          apartmentNo:'',
          education: '',
          emergencyContact: '',
          companyName: '',
          emergencyContactMobile: '',
          companyAddress: '',
          relation: '',
          idCardAndPersonPhoto: '',
          idCardVersoPhoto: '',
          contractPhotos: [],
          province:'',
          city: '',
          district: ''
        },
        formLabelWidth: '82px',
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
        dialogTransfer: false,
        formVisible: false,
        dialogBigPhoto: false,
        dialogVisible: false,
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
        rules: {
          name: [{required: true, message: '请输入经纪人姓名', trigger: 'blur'}],
          tel: [{required: true, message: '请输入经纪人电话', trigger: 'blur'}],
          staffNo: [{required: true, message: '请输入经纪人工号', trigger: 'blur'}],
          status: [{required: true, message: '请选择状态', trigger: 'change'}]
        },
        idCardFrontPhoto: '',
        idCardVersoPhoto: '',
        idCardAndPersonPhoto: '',
        contractPhotos: [],
        pendingNumber: 0,//待处理单据数量
        overdueNumber: 0//已逾期单据数量
      }
    },
    created(){
      this.getData();
      this.init();
    },
    computed: {
      staff (){
        return this.$store.state.staff.staff
      },
      cityList () {
        let citys = [];
        let all = {id: ' ', name: '全部'};
        citys.push(all);
        json.forEach(item => {
          if (item.children) {
            item.children.forEach(i => {
              citys.push({id: i.value, name: i.label});
            })
          }
        });
        return citys;
      }
    },
    filters: {
      appStatusFormat: function (value) {
        if (value === "Unchecked") {
          return "待补充";
        } else if (value === "Unconfirmed") {
          return "待审核";
        } else if (value === "Accepted") {
          return "审核通过";
        } else if (value === "Returned") {
          return "待修改";
        } else if (value === "Canceled") {
          return "已取消";
        } else if (value === "Rejected") {
          return "审核不通过";
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
          let date = Date.parse(value.substring(0, value.length - 9));
          return format(date, 'YYYY-MM-DD');
        }
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
    methods: {
      //转单确认
      transfer() {
        this.axios.post('/api/v2/applications/transfer/'+this.currentRow.applicationNo+'/'+this.transferId).then((res) => {
          this.loading = true;
          this.axios.post(this.url, {
            ...this.searchForm,
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("转单成功！");
            this.dialogTransfer = false;
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
            this.loading = false;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //临时保存
      currentSave() {
        this.currentRow.startDate = format(this.dateRange[0],'YYYY-MM-DD')+' 00:00:00';
        this.currentRow.endDate = format(this.dateRange[1],'YYYY-MM-DD')+' 00:00:00';
        this.axios.put('/api/v2/applications/apply/temp', this.currentRow).then((res) => {
          this.loading = true;
          this.axios.post(this.url, {
            ...this.searchForm,
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("保存成功！");
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
            this.loading = false;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //上一条
      prev() {
        //跳转到上一条
        this.currentIndex = this.currentIndex - 1;
        this.currentRow = this.tableData[this.currentIndex]
      },
      //下一条
      next() {
        //跳转到下一条
        this.currentIndex = this.currentIndex + 1;
        this.currentRow = this.tableData[this.currentIndex]
      },
      //取消申请
      cancel() {
        this.axios.put('/api/v2/applications/cancle/'+this.currentRow.id).then((res) => {
          this.dialogVisible = false;
          this.loading = true;
          this.axios.post(this.url, {
            ...this.searchForm,
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
            this.loading = false;
            console.log(this.currentIndex);
            console.log(this.currentRow);
            //跳转到下一条 请求成功时才执行
            if(this.tableData[this.currentIndex] === undefined) {
              this.$message.success('数据处理完毕！');
            }
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //切换多选框
      checkboxChange() {
        let form = {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size,
          status: this.checkboxList
        };
        this.loading = true;
        if(form.status.length >0) {
          this.axios.post(this.url, form).then((res) => {
            this.tableData = res.data.data.content;
            this.totalElements = res.data.data.totalElements;
            this.loading = false;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        } else {
          this.tableData = [];
          this.loading = false;
        }
      },
      prevClick() {
        console.log(window.location.hash);
        if (window.location.hash === '#slide4') {
          this.a = '';
          this.b = '';
          this.c = 'is-active';
          this.d = ''
        }
        if (window.location.hash === '#slide3') {
          this.a = '';
          this.b = 'is-active';
          this.c = '';
          this.d = ''
        }
        if (window.location.hash === '#slide2') {
          this.a = 'is-active';
          this.b = '';
          this.c = '';
          this.d = ''
        }
      },
      nextClick() {
        console.log(window.location.hash);
        if (window.location.hash === '#slide1') {
          this.a = '';
          this.b = 'is-active';
          this.c = '';
          this.d = ''
        }
        if (window.location.hash === '#slide2') {
          this.a = '';
          this.b = '';
          this.c = 'is-active';
          this.d = ''
        }
        if (window.location.hash === '#slide3') {
          this.a = '';
          this.b = '';
          this.c = '';
          this.d = 'is-active'
        }
        if (window.location.hash === '#slide4') {
          this.a = '';
          this.b = '';
          this.c = '';
          this.d = 'is-active'
        }
      },
      //根据hash来跳转
      hashClick(a) {
        if (a === 'slide1') {
          window.location.hash = '#slide1';
          this.a = 'is-active';
          this.b = '';
          this.c = '';
          this.d = ''
        }
        if (a === 'slide2') {
          window.location.hash = '#slide2';
          this.a = '';
          this.b = 'is-active';
          this.c = '';
          this.d = ''
        }
        if (a === 'slide3') {
          window.location.hash = '#slide3';
          this.a = '';
          this.b = '';
          this.c = 'is-active';
          this.d = ''
        }
        if (a === 'slide4') {
          window.location.hash = '#slide4';
          this.a = '';
          this.b = '';
          this.c = '';
          this.d = 'is-active'
        }
      },
      //照片旋转
      imgClick1() {
        this.current1 = (this.current1 + 90) % 360;
        document.getElementById('idCardFrontPhoto').style.transform = 'rotate(' + this.current1 + 'deg)';
      },
      imgClick2() {
        this.current2 = (this.current2 + 90) % 360;
        document.getElementById('idCardVersoPhoto').style.transform = 'rotate(' + this.current2 + 'deg)';
      },
      imgClick3() {
        this.current3 = (this.current3 + 90) % 360;
        document.getElementById('idCardAndPersonPhoto').style.transform = 'rotate(' + this.current3 + 'deg)';
      },
      imgClick4(index) {
        this.current4 = (this.current4 + 90) % 360;
        document.getElementsByClassName('contractPhotos')[index].style.transform = 'rotate(' + this.current4 + 'deg)';
      },
      //隐藏右侧内容
      hiddenClass() {
        let that = this;
        clearTimeout(a);//清除延时
        this.cover = false;
        document.querySelector('.hiddenForm').className = 'hiddenForm el-form demo-table-expand el-form--label-left el-form--inline';
        var a = setTimeout(function () {
          that.pullBloor = false;
        }, 500);
      },
      handleCurrentChange(val){
        this.cur_page = val;
        this.getData();
      },
      getData(){
        this.loading = true;
        this.axios.post(this.url, {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size
        }).then((res) => {
          this.tableData = res.data.data.content;
          console.log(this.tableData);
          this.totalElements = res.data.data.totalElements;
          this.loading = false;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      Search() {
        this.getData();
      },
      init: function () {
        //获取省市区json
        this.options = json;
        //获取待处理、已逾期单据数量
        this.axios.get('/api/v2/applications/status/count').then((res) => {
          this.pendingNumber = Number(res.data.data.Pending.count);
          this.overdueNumber = Number(res.data.data.Breach.count);
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      //显示大图
      showBigPhoto(token) {
        this.bigPhotoUrl = this.qiniu + token + '?imageMogr2/auto-orient';
        this.dialogBigPhoto = true;
      },
      //显示全图
      showquanPhoto(token) {
        if (token !== undefined && token !== '' && token !== null) {
          return this.qiniu + token + '?imageMogr2/auto-orient|imageView2/1';
        }
      },
      submit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            //把省市县的值带到后台
            this.form.province = this.selectedOptions[0];
            this.form.city = this.selectedOptions[1];
            this.form.district = this.selectedOptions[2];
            let application = this.form;
            application.idCardFrontPhoto = this.idCardFrontPhoto;
            application.idCardVersoPhoto = this.idCardVersoPhoto;
            application.idCardAndPersonPhoto = this.idCardAndPersonPhoto;
            application.contractPhotos = this.contractPhotos;
            application.startDate = format(this.form.startDate, 'YYYY-MM-DD');
            application.endDate = format(this.form.endDate, 'YYYY-MM-DD');
            this.axios.put('/api/v1/application', application).then((res) => {
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
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.formVisible = false;
      },
      //切换radio
      radioChange() {
        let form = {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size,
          status: [this.radio]
        };
        this.loading = true;
        this.axios.post(this.url, form).then((res) => {
          this.tableData = res.data.data.content;
          this.totalElements = res.data.data.totalElements;
          this.loading = false;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //切换tab
      handleChangeTab(a) {
        if (a === 'Unchecked') {
          this.radio = 'Unchecked';
          this.radioChange();
        } else if (a === 'RetirementFinished') {
          this.checkboxList = ['Inadvancefinished', 'EarlyRetirement'];
          this.getData();
        } else {
          this.getData();
        }
      },
      //点击每一行
      handleCurrentRow(val) {
        this.fileList2 = [];//清空已有数据，防止合同照片累加
        this.currentIndex = this.tableData.indexOf(val);
        this.reason = [];
        let that = this;
        this.pullBloor = true;
        this.cover = true;
        Vue.nextTick(function () {
          document.querySelector('.hiddenForm').className = 'daveShow hiddenForm el-form demo-table-expand el-form--label-left el-form--inline';
        });
        if (this.currentRow.idCardFrontOrVersoPhotoBlur) {
          this.reason.push('idCardFrontOrVersoPhotoBlur')
        }
        if (this.currentRow.idCardAndPersonPhotoBlur) {
          this.reason.push('idCardAndPersonPhotoBlur')
        }
        if (this.currentRow.contractPhotoBlur) {
          this.reason.push('contractPhotoBlur')
        }
        if (this.currentRow.addressBlur) {
          this.reason.push('addressBlur')
        }
        if (this.currentRow.customerInfoError) {
          this.reason.push('customerInfoError')
        }
        if (this.currentRow.otherException) {
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
        console.log(val);
        this.currentRow = Object.assign({}, val);
        //获取该人所属门店下的所有经纪人
        this.axios.get('api/v2/agents/getByAgentIdAgents/'+this.currentRow.agentId).then((res) => {
          this.agentList = res.data;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        //日期默认值
        this.dateRange=[this.currentRow.startDate,this.currentRow.endDate];
        //回显省市区
        this.selectedOptions = [this.currentRow.province,this.currentRow.city,this.currentRow.district];
        //照片回显
        if(val.contractPhotos) {
          val.contractPhotos.forEach(item => {
            let obj = {};
            obj.url = that.photo(item);
            that.fileList2.push(obj);
          });
        }
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
      uploadFrontSuccess(response, file) {
        this.idCardFrontPhoto = response.key;
      },
      uploadVersoSuccess(response, file) {
        this.idCardVersoPhoto = response.key;
      },
      uploadPersonSuccess(response, file) {
        this.idCardAndPersonPhoto = response.key;
      },
      handleUploadError(err, file) {
        console.log(err)
      },
      uploadContractSuccess(response, file) {
        this.contractPhotos.push(response.key);
      },
      handleRemove(file, fileList) {
        this.contractPhotos = this.contractPhotos.filter(item => file.url.indexOf(item) === -1);
      },
      handlePreview(file) {
        console.log(file);
      },
      getBranchList(cityId) {
        if (cityId !== ' ') {
          this.searchForm.branchId = '';
          this.branchList = [];
          let param = {city: [cityId]};
          this.axios.post('/api/v1/branch/getBranchListByLocation', param).then((res) => {
            this.branchList = res.data;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          })
        } else {
          this.searchForm.branchId = '';
          this.branchList = [{id: '', name: '全部'}];
        }
      },
      exportCSV() {
        var head = [["申请编号", "租客姓名", "联系方式", "起止日期", "月租金", "租期", "房租总额", "经纪人", "申请日期"]];
        this.axios.post('/api/v2/applications/export', this.searchForm).then((res) => {
            var rowData = res.data.data;
            for (let i = 0; i < rowData.length; i++) {
              let startEnd = format(rowData[i].startDate, 'YYYY-MM-DD') + '--' + format(rowData[i].endDate, 'YYYY-MM-DD');
              head.push([rowData[i].id, rowData[i].customerName, rowData[i].mobile, startEnd, rowData[i].monthlyRent, rowData[i].rentPeriod, rowData[i].totalAmount, rowData[i].responsibleAgent, rowData[i].applyDate]);
            }
            ;
            var csvRows = [];
            head.forEach(item => csvRows.push(item.join(', ')));
            var csvString = csvRows.join('\n');
            //BOM的方式解决EXCEL乱码问题
            var BOM = '\uFEFF';
            csvString = BOM + csvString;
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + encodeURI(csvString);
            a.target = '_blank';
            a.download = "分期申请" + ".csv";
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
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }

  .item {
    margin-left: 4px;
    vertical-align: sub;
  }

  #reasonInputTextarea {
    width: 100%;
  }

  #reasonInputTextarea .el-form-item__content {
    width: 60%;
  }

  #reasonInputTextarea .el-form-item__content textarea {
    color: red;
  }

  .hiddenForm {
    min-width: 1100px;
    margin-top: -40px;
    box-shadow: -10px 0px 5px #888888;
    padding: 15px;
    overflow-y: scroll;
    width: 80%;
    height: 100%;
    z-index: 999;
    transition: all 0.5s;
    position: absolute;
    top: 40px;
    left: 200%;
  }

  .daveShow {
    min-width: 1100px;
    margin-top: -40px;
    box-shadow: -10px 0px 5px #888888;
    padding: 15px;
    overflow-y: scroll;
    width: 80%;
    height: 100%;
    z-index: 999;
    background-color: #fff;
    position: absolute;
    top: 40px;
    left: 18%;
  }

  .content {
    overflow-y: hidden;
    overflow-x: scroll;
  }

  /*swiper样式*/
  .swiper-container {
    height: 85%;
    width: 100%;
  }

  .swiper-pagination-bullet-custom {
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
    color: #000;
    opacity: 1;
    background: rgba(0, 0, 0, 0.2);
  }

  .swiper-pagination-bullet-custom.swiper-pagination-bullet-active {
    color: #fff;
    background: #007aff;
  }

  .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    display: inline-block;
    border-radius: 100%;
    background: #000;
    opacity: .2;

  }

  .imgContainer {
    width: 100%;
    text-align: center;
  }
</style>
