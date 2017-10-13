<template>
  <div style="height: 100%;" id="smialClick">
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
        <el-tab-pane label="已结束" name="AllFinished"></el-tab-pane>
        <el-tab-pane label="提前退租" name="RetirementFinished"></el-tab-pane>
      </el-tabs>
    </el-row>
    <el-row style="margin-bottom: -15px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input id="customerOrAppNoValue" v-model="searchForm.customerOrAppNoValue" placeholder="申请编号、租客姓名、台账号"></el-input>
        </el-form-item>
        <el-form-item  prop="applyDate">
          <el-date-picker
            v-model="searchForm.applyDate"
            @change="selectedData"
            placeholder="选择申请日期">
          </el-date-picker>
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
        <el-form-item style="float: right;margin-right: 0" v-if="importButton">
          <el-tooltip class="item" effect="dark" content="导出" placement="top-start">
            <el-button type="info" @click="exportCSV()"><i class="fa fa-download" aria-hidden="true"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row style="margin-bottom: 10px;height: 28px;" id="smialClick1">
      <el-checkbox-group v-model="checkboxList" @change="checkboxChange"
                         style="float: left;margin-top: 7px;min-width: 150px"
                         v-if="searchForm.status[0] === 'RetirementFinished'">
        <el-checkbox label="Inadvancefinished">未退款</el-checkbox>
        <el-checkbox label="EarlyRetirement">已退款</el-checkbox>
      </el-checkbox-group>
      <el-checkbox-group v-model="checkboxList2" @change="checkboxChange2"
                         style="float: left;margin-top: 7px;min-width: 150px"
                         v-if="searchForm.status[0] === 'AllFinished'">
        <el-checkbox label="Finished">合同结束</el-checkbox>
        <el-checkbox label="CanceledAndRejected">已取消/拒批</el-checkbox>
      </el-checkbox-group>
      <el-radio-group v-model="radio" @change="radioChange()" v-if="searchForm.status[0] === 'Unchecked'"
                      style="float: left;margin-top: 7px;">
        <el-radio label='Unchecked'>待补充</el-radio>
        <el-radio label='Returned'>待修改</el-radio>
      </el-radio-group>
      <div v-if="this.radio === 'Unchecked'" class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="total, prev, pager, next"
          :total="totalElements">
        </el-pagination>
      </div>
      <div v-if="this.radio === 'Returned'" class="pagination" style="position: absolute;right: 0;top: -1px;margin: 0">
        <el-pagination
          @current-change="handleCurrentChange1"
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
          v-if="searchForm.status[0] === 'Breach'"
          min-width="130"
          prop="overdueDays"
          label="逾期天数">
          <template scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag>{{ scope.row.overdueDays}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="searchForm.status[0] === 'Breach'"
          min-width="130"
          prop="overdueFee"
          label="逾期费用">
          <template scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag>{{ scope.row.overdueFee | currency }}</el-tag>
            </div>
          </template>
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
            {{ scope.row.applyDate | dateFormat}}
          </template>
        </el-table-column>
      </el-table>
    </el-row>



    <el-dialog
      id="showBig"
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
      title="提前退租"
      :visible.sync="dialogTermination"
      size="tiny">
      <p>确认进行提前退租操作？，该操作不可撤回</p>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogTermination=false">取 消</el-button>
                <el-button type="primary" @click="termination()">确 定</el-button>
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
    <el-form label-position="left" inline id="lashan"
             v-if="pullBloor"
             :model="currentRow"
             ref="currentRow"
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
        <div style="width: 100%;text-align: center;margin-bottom: 5px;height: 36px;">
          <el-button style="float: left;padding: 5px 15px" @click="prev()" :disabled="!tableData[currentIndex-1]"><i
            style="font-size: x-large;vertical-align: sub" class="fa fa-angle-left" aria-hidden="true"></i>上一条
          </el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="info" @click="currentSave">临时保存</el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="success" @click="submit('currentRow')">提交审批</el-button>
          <el-button v-if="searchForm.status[0] === 'Unchecked'" type="danger" @click="dialogVisible = true">取消申请</el-button>
          <el-button v-if="searchForm.status[0] === 'Unconfirmed'" type="info" style="width: 88px;" @click="revocation()">撤回</el-button>
          <el-button style="width: 88px;" v-if="searchForm.status[0] !== 'AllFinished' && searchForm.status[0] !== 'Inadvancefinished' && searchForm.status[0] !== 'RetirementFinished'" @click="dialogTransfer = true;transferId=''" type="warning">转单
          </el-button>
          <el-button v-if="searchForm.status[0] === 'Repayment' || searchForm.status[0] === 'Breach'" type="danger" @click="dialogTermination = true">
            提前退租
          </el-button>
          <el-button style="float: right;padding: 5px 15px" @click="next()" :disabled="!tableData[currentIndex+1]">下一条<i
            style="font-size: x-large;vertical-align: sub" class="fa fa-angle-right" aria-hidden="true"></i></el-button>
        </div>
        <div
          style="width: 100%;text-align: center;margin-bottom: 5px;border-bottom: 1px solid #D9D9D9;border-top: 1px solid #D9D9D9;padding: 10px 0">
          <span :class="getColor">{{currentRow.status | appStatusFormat}}</span>
        </div>
        <el-row>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="申请编号：">
              <span>{{ currentRow.applictionNo }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="每月租金：" prop="monthlyRent" id="monthRen">
              <el-input :disabled="statusDisabled" v-model="currentRow.monthlyRent"></el-input>
            </el-form-item>

          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="租客姓名：">
              <span>{{ currentRow.customerName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="起止日期：" prop="dateRange">
              <el-date-picker
                :disabled="statusDisabled"
                v-model="dateRange"
                type="daterange"
                :picker-options="pickerOptions"
                placeholder="选择日期范围">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="手机号码：">
              <span>{{ currentRow.mobile }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="租期合计：">
              <span>{{ currentRow.rentPeriod }}</span>
            </el-form-item>

          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" style="height: 43px;">
            <el-form-item label="身份证号：">
              <span>{{ currentRow.idCardNo }}</span>
            </el-form-item>
          </el-col>

          <el-col :span="12" style="height: 43px;">
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
                :data="billList"
                ref="multipleTable"
                highlight-current-row
                tooltip-effect="dark">
                <el-table-column
                  min-width="140"
                  prop="paymentDueDate"
                  label="应还款日期">
                  <template scope="scope">
                    {{ scope.row.paymentDueDate | dateFormat }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="100"
                  prop="amount"
                  label="账单金额">
                  <template scope="scope">
                    {{ scope.row.amount | currency }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="serviceFee"
                  label="手续费">
                  <template scope="scope">
                    {{ scope.row.serviceFee | currency }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="overdueFee"
                  label="逾期费">
                  <template scope="scope">
                    {{ scope.row.overdueFee | currency }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="180"
                  prop="status"
                  label="账单状态">
                  <template scope="scope">
                    {{ scope.row.status | billStatusFormat }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="130"
                  prop="monthlyRent"
                  label="实际还款日期">
                  <template scope="scope">
                    {{ scope.row.paymentDate | dateFormat }}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="房屋信息" name="houseInfo" id="houseInfo">
              <el-row>
                <el-col>
                  <el-form-item label="房屋信息：" :label-width="formLabelWidth" prop="selectedOptions">
                    <el-cascader
                      :disabled="statusDisabled"
                      :options="options"
                      v-model="selectedOptions">
                    </el-cascader>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label=" " :label-width="formLabelWidth" prop="address">
                    <el-input :disabled="statusDisabled" v-model="currentRow.address" placeholder="详细地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="台账号码：" :label-width="formLabelWidth" prop="apartmentNo">
                    <el-input :disabled="statusDisabled" v-model="currentRow.apartmentNo" placeholder="请输入台账号"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="租客其他信息" name="customerInfo" id="customerInfo">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="学历信息：" :label-width="formLabelWidth" prop="education">
                    <el-select v-model="currentRow.education" :disabled="statusDisabled">
                      <el-option label="专科及以下" value="CollegeDown"></el-option>
                      <el-option label="本科" value="Undergraduate"></el-option>
                      <el-option label="硕士及以上" value="PostgraduateUp"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="应急联系：" :label-width="formLabelWidth" prop="emergencyContact">
                    <el-input :disabled="statusDisabled" v-model="currentRow.emergencyContact"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="工作单位：" :label-width="formLabelWidth" prop="companyName">
                    <el-input :disabled="statusDisabled" v-model="currentRow.companyName"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系方式：" :label-width="formLabelWidth" prop="emergencyContactMobile">
                    <el-input :disabled="statusDisabled" v-model="currentRow.emergencyContactMobile"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="单位地址：" :label-width="formLabelWidth" prop="companyAddress">
                    <el-input :disabled="statusDisabled" v-model="currentRow.companyAddress"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="双方关系：" :label-width="formLabelWidth" prop="relation">
                    <el-select v-model="currentRow.relation" :disabled="statusDisabled">
                      <el-option label="父母" value="Parent"></el-option>
                      <el-option label="同事" value="Fellow"></el-option>
                      <el-option label="朋友" value="Friend"></el-option>
                      <el-option label="其他" value="Relatives"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="照片资料" name="picInfo" id="picInfo">
              <el-row :gutter="20">
                <el-col :span="3">
                  <el-form-item label="身份证照片：">
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    :disabled="statusDisabled"
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadFrontSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardFrontPhoto && this.searchForm.status[0] === 'Unchecked'" :src="photo(currentRow.idCardFrontPhoto)" class="avatar">
                    <img @click="showBigPhoto(currentRow.idCardFrontPhoto)" v-show="currentRow.idCardFrontPhoto && this.searchForm.status[0] !== 'Unchecked'" :src="photo(currentRow.idCardFrontPhoto)" class="avatar">
                    <i v-show="!currentRow.idCardFrontPhoto" class="el-icon-plus avatar-uploader-icon"></i>
                    <div class="el-upload__tip" slot="tip">身份证正面</div>
                  </el-upload>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    :disabled="statusDisabled"
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadVersoSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardVersoPhoto && this.searchForm.status[0] === 'Unchecked'" :src="photo(currentRow.idCardVersoPhoto)" class="avatar">
                    <img @click="showBigPhoto(currentRow.idCardVersoPhoto)" v-show="currentRow.idCardVersoPhoto && this.searchForm.status[0] !== 'Unchecked'" :src="photo(currentRow.idCardVersoPhoto)" class="avatar">
                    <i v-show="!currentRow.idCardVersoPhoto" class="el-icon-plus avatar-uploader-icon"></i>
                    <div class="el-upload__tip" slot="tip">身份证反面</div>
                  </el-upload>
                </el-col>
                <el-col :span="7">
                  <el-upload
                    :disabled="statusDisabled"
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :data="postData"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :on-success="uploadPersonSuccess"
                    :on-error="handleUploadError">
                    <img v-show="currentRow.idCardAndPersonPhoto && this.searchForm.status[0] === 'Unchecked'" :src="photo(currentRow.idCardAndPersonPhoto)" class="avatar">
                    <img @click="showBigPhoto(currentRow.idCardAndPersonPhoto)" v-show="currentRow.idCardAndPersonPhoto && this.searchForm.status[0] !== 'Unchecked'" :src="photo(currentRow.idCardAndPersonPhoto)" class="avatar">
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
                    :disabled="statusDisabled"
                    :file-list="fileList2"
                    :action="uploadUrl"
                    :data="postData"
                    list-type="picture-card"
                    :on-preview="handlePreview"
                    :before-upload="beforeUpload"
                    :on-success="uploadContractSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleRemove">
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane v-if="radio === 'Returned'" label="审批备注" name="remarks">
              <!--{{currentRow.confirmRemarks}}-->
              <span slot="label">审批备注<el-badge is-dot class="item"></el-badge></span>
              <span style="color: red;">{{currentRow.confirmRemarks}}</span>
            </el-tab-pane>
          </el-tabs>
        </el-row>
        <el-row  style="opacity: .5;position: fixed;bottom: 0;width: 98%;">
          <hr style="border-bottom-color: #d9d9d9; border-top: none;opacity: 1">
          <el-col :span="6" style="height: 40px;">
            <el-form-item label="经纪人：">
              <span>{{ currentRow.responsibleAgent }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6" style="height: 40px;">
            <el-form-item label="联系方式：">
              <span>{{currentRow.responsibleAgentPhone}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6" style="height: 40px;">
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
  import json from "static/city.json"
  import format from 'date-fns/format'
  import dateFns from 'date-fns'
  import {qiniu} from '../mixins/qiniu.js'
  import store from '@/store'
  export default {
    mixins: [qiniu],
    data() {
      let minDate;
      return {
        cityList: [],
        checkboxList2: ['Finished','CanceledAndRejected'],
        billList:[],
        statusDisabled: false,//不同状态下控制是否只读
        //按钮权限控制
        importButton: false,
        transferId: '',
        dateRange: [],
        currentIndex: 0,//选中当前行的索引
        checkboxList: ['Inadvancefinished', 'EarlyRetirement'],
        pullBloor: false,//控制拉扇是否显示
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
          applyDate: '',
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
          disabledDate(time) {
            return minDate<time.getTime()
          },
          onPick(val) {
            minDate = Number(format(dateFns.subDays(dateFns.addMonths(val.minDate,13),1),'x'));
          }
        },
        bigPhotoUrl: '',
        dialogTermination: false,
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
//          monthlyRent: [{required: true, message: '请输入月租金', trigger: 'blur'}],
//          dateRange: [{required: true, message: '请输入起止日期', trigger: 'change'}]
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
      if(this.button.button.indexOf('导出') >= 0) {
        this.importButton = true;
      }
    },
    computed: {
      getColor() {
        switch (this.searchForm.status[0]) {
          case 'Unchecked' : return 'Unchecked';
          case 'Unconfirmed' : return 'Unconfirmed';
          case 'Loan' : return 'Loan';
          case 'Repayment' : return 'Repayment';
          case 'Breach' : return 'Breach';
          case 'AllFinished' : return 'Finished';
          case 'RetirementFinished' : return 'RetirementFinished';
        }
      },
      button() {
        return store.state.button;
      },
      staff (){
        return this.$store.state.staff.staff
      }
    },
    filters: {
      billStatusFormat: function (value) {
        switch (value) {
          case 'NotRepayment': return '未还款';
          case 'EndRepayment': return '已还款';
          case 'OverdueRepayment': return '逾期未还款';
          case 'Exit': return '退租';
        }
      },
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
        } else if(value === "Repayment") {
          return "还款中"
        } else if(value === "Loan") {
          return "待放款"
        } else if(value === "Finished"){
          return "已结束"
        } else if(value === "EarlyRetirement" || value === "Inadvancefinished"){
          return "提前退租"
        } else if(value === "Breach"){
          return "已逾期"
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
      //撤回
      revocation() {
        this.axios.post('/counter/api/v2/request/revocation/'+this.currentRow.applicationNo).then((res) => {
          this.axios.post(this.url, {
            ...this.searchForm,
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("撤回成功！");
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          console.log(error.response.data);
          this.$message.error(error.response.data.message);
        })
      },
      //提前中退
      termination() {
        this.axios.post('/counter/api/v2/request/termination/'+this.currentRow.applicationNo).then((res) => {
          this.loading = true;
          this.axios.post(this.url, {
            ...this.searchForm,
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("退租成功！");
            this.dialogTermination = false;
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
            this.loading = false;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          console.log(error.response.data);
          this.$message.error(error.response.data.message);
        })
      },
      //转单确认
      transfer() {
        this.axios.post('/api/v2/applications/transfer/'+this.currentRow.applicationNo+'/'+this.transferId).then((res) => {
          this.axios.post(this.url, {
            ...this.searchForm,
            status: [this.radio],
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("转单成功！");
            this.dialogTransfer = false;
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
          }).catch((error) => {
            this.$message.error(error.response.data.message);
          });
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      //临时保存
      currentSave() {
        //把省市县的值带到后台
        this.currentRow.province = this.selectedOptions[0];
        this.currentRow.city = this.selectedOptions[1];
        this.currentRow.district = this.selectedOptions[2];
        this.currentRow.startDate = format(this.dateRange[0],'YYYY-MM-DD')+' 00:00:00';
        this.currentRow.endDate = format(this.dateRange[1],'YYYY-MM-DD')+' 00:00:00';
        this.axios.put('/api/v2/applications/apply/temp', this.currentRow).then((res) => {
          this.axios.post(this.url, {
            ...this.searchForm,
            status: [this.radio],
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.$message.success("保存成功！");
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
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
          this.axios.post(this.url, {
            ...this.searchForm,
            status: [this.radio],
            page: this.cur_page - 1,
            size: this.size
          }).then((res) => {
            this.tableData = res.data.data.content;
            this.currentRow = this.tableData[this.currentIndex];
            this.totalElements = res.data.data.totalElements;
            //跳转到下一条 请求成功时才执行
            if(this.tableData[this.currentIndex] === undefined) {
              this.hiddenClass();
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
      checkboxChange2() {
        let form = {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size,
          status: this.checkboxList2
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
      //为什么这里单独写了一个分页方法，主要是针对待处理下面的待修改状态单据。当点击待修改时候，实际上searchForm的status并没有改变，为了点击分页时候获取正确的数据，单独写一个方法。如果后台能分成三个状态就不用单独写方法，可惜后台忙的一比，还是自己来吧。。。
      handleCurrentChange1(val){
        this.cur_page = val;
        this.loading = true;
        this.axios.post(this.url, {
          ...this.searchForm,
          status:[this.radio],
          page: this.cur_page - 1,
          size: this.size
        }).then((res) => {
          this.tableData = res.data.data.content;
          this.totalElements = res.data.data.totalElements;
          this.loading = false;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      getData(){
        this.loading = true;
        this.axios.post(this.url, {
          ...this.searchForm,
          page: this.cur_page - 1,
          size: this.size
        }).then((res) => {
          this.tableData = res.data.data.content;
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
        let that = this;
        //点击关闭拉扇层
        Vue.nextTick(function () {
          $('#smialClick').click(function (e) {
            if(e.target === this || e.target === $('#smialClick1')[0]) {
                that.hiddenClass()
            }
          });
        });
        //获取省市区json
        this.options = json;
        //获取待处理、已逾期单据数量
        this.getCount();
        //获取城市列表
        this.axios.get('/api/v2/branchs/getCitys').then((res) => {
          let citysIds = res.data.filter(item => item !== null);
          let citys = [];
          let all = {id: ' ', name: '全部'};
          citys.push(all);
          json.forEach(item => {
            if (item.children) {
              item.children.forEach(i => {
                citysIds.forEach(j => {
                  if(j === i.value) {
                    citys.push({id: i.value, name: i.label});
                  }
                })
              })
            }
          });
          this.cityList = citys;
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      getCount() {
        this.axios.get('/api/v2/applications/status/count').then((res) => {
          this.pendingNumber = Number(res.data.data.Pending.count);
          if(res.data.data.Breach) {
            this.overdueNumber = Number(res.data.data.Breach.count);
          }
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
      },
      //显示大图
      showBigPhoto(token) {
        this.bigPhotoUrl = this.qiniu + token + '?imageMogr2/auto-orient';
        this.dialogBigPhoto = true;
      },
      submit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            //把省市县的值带到后台
            this.currentRow.province = this.selectedOptions[0];
            this.currentRow.city = this.selectedOptions[1];
            this.currentRow.district = this.selectedOptions[2];
            //加入验证
            if(!this.currentRow.monthlyRent) {
              this.$message.error("请输入月租金");
              return;
            }
            if(this.dateRange && this.dateRange[0] !== null) {
              this.currentRow.startDate = format(this.dateRange[0],'YYYY-MM-DD')+' 00:00:00';
              this.currentRow.endDate = format(this.dateRange[1],'YYYY-MM-DD')+' 00:00:00';
            } else {
              this.$message.error("请选择起止日期");
              return;
            }
            if(dateFns.differenceInCalendarMonths(this.currentRow.endDate,this.currentRow.startDate) < 2) {
              this.$message.error("起止日期不能小于2个月");
              return;
            }
            if(!this.currentRow.province || !this.currentRow.city|| !this.currentRow.district) {
              this.$message.error("请选择房屋城市");
              return;
            }
            if(!this.currentRow.address) {
              this.$message.error("请填写房屋详细地址");
              return;
            }
            if(!this.currentRow.apartmentNo) {
              this.$message.error("请输入台账号码");
              return;
            }
            if(!this.currentRow.emergencyContact) {
              this.$message.error("请输入应急联系人");
              return;
            }
            if(!this.currentRow.companyName) {
              this.$message.error("请输入工作单位");
              return;
            }
            if(!this.currentRow.emergencyContactMobile) {
              this.$message.error("请输入应急联系人联系方式");
              return;
            }
            if(!this.currentRow.companyAddress) {
              this.$message.error("请输入单位地址");
              return;
            }
            if(!this.currentRow.idCardFrontPhoto) {
              this.$message.error("请上传身份证正面");
              return;
            }
            if(!this.currentRow.idCardVersoPhoto) {
              this.$message.error("请上传身份证反面");
              return;
            }
            if(!this.currentRow.idCardAndPersonPhoto) {
              this.$message.error("请上传手持身份证照片");
              return;
            }
            if(this.currentRow.contractPhotos.length === 0) {
              this.$message.error("请上传合同照片");
              return;
            }

            this.axios.put('/api/v2/applications/apply', this.currentRow).then((res) => {
              this.axios.post(this.url, {
                ...this.searchForm,
                status: [this.radio],
                page: this.cur_page - 1,
                size: this.size
              }).then((res) => {
                this.tableData = res.data.data.content;
                this.totalElements = res.data.data.totalElements;
                if(this.tableData[this.currentIndex] === undefined) {
                  this.hiddenClass();
                  this.$message.success('提交成功,数据处理完毕！');
                } else {
                  this.handleCurrentRow(this.tableData[this.currentIndex]);
                  this.$message.success('提交成功！');
                }
              }).catch((error) => {
                this.$message.error(error.response.data.message);
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
        //更新单据数量
        this.getCount();
        this.radio = 'Unchecked';
        if (a === 'Unchecked') {
          this.statusDisabled = false;//只有待处理的单据，可以填写内容，其余都是只读
          this.radioChange();
        } else if (a === 'RetirementFinished') {
          this.statusDisabled = true;
          this.checkboxList = ['Inadvancefinished', 'EarlyRetirement'];
          this.getData();
        } else {
          this.statusDisabled = true;
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
        //TODO 先去掉遮罩层，分析原因可能是因为拉扇层还没有显示，就点击
//        this.cover = true;
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
        //请求账单列表
        this.axios.get('/api/v2/applications/'+this.currentRow.applicationNo).then((res) => {
          if(res.data.data.billDTOs) {
            this.billList = res.data.data.billDTOs;
          }
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        })
      },
      selectedData() {
        if(this.searchForm.applyDate) {
          this.searchForm.applyDate = format(this.searchForm.applyDate,'YYYY-MM-DD');
        } else {
          this.searchForm.applyDate = ""
        }
        console.log(this.searchForm.applyDate);
      },
      uploadFrontSuccess(response, file) {
        this.$set(this.currentRow,'idCardFrontPhoto',response.key);
      },
      uploadVersoSuccess(response, file) {
        this.$set(this.currentRow,'idCardVersoPhoto',response.key);
      },
      uploadPersonSuccess(response, file) {
        this.$set(this.currentRow,'idCardAndPersonPhoto',response.key);
      },
      handleUploadError(err, file) {
        console.log(err)
      },
      uploadContractSuccess(response, file) {
        //给currentRow合同照片赋值，带到后端
        this.currentRow.contractPhotos.push(response.key);
      },
      handleRemove(file, fileList) {
        this.currentRow.contractPhotos = this.currentRow.contractPhotos.filter(item => file.url.indexOf(item) === -1);
      },
      handlePreview(file) {
        this.bigPhotoUrl = file.url;
        this.dialogBigPhoto = true;
      },
      getBranchList(cityId) {
        if (cityId !== ' ') {
          this.searchForm.branchId = '';
          this.branchList = [];
          this.axios.get('/api/v2/agents/getByCityIdBranch/'+cityId).then((res) => {
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

  #monthRen .el-form-item__content {
    width: 220px
  }

  .hiddenForm {
    min-width: 700px;
    margin-top: -40px;
    box-shadow: -10px 0px 5px #888888;
    padding: 15px;
    overflow-y: scroll;
    width: 65%;
    height: 100%;
    z-index: 999;
    transition: all 0.5s;
    position: absolute;
    top: 40px;
    left: 200%;
  }

  .daveShow {
    min-width: 700px;
    margin-top: -40px;
    box-shadow: -10px 0px 5px #888888;
    padding: 15px;
    overflow-y: scroll;
    width: 65%;
    height: 100%;
    z-index: 999;
    background-color: #fff;
    position: absolute;
    top: 40px;
    left: 33.5%;
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
  #houseInfo .el-cascader {
    width: 300px;
  }
  #houseInfo .el-form-item__content {
    width: 300px;
  }
  #customerInfo .el-select {
    width: 220px;
  }
  #customerInfo .el-form-item__content {
    width: 220px;
  }
  #picInfo .el-form-item__label {
    min-width: 110px;
  }
  /*各状态下的颜色*/
  .Unchecked, .Loan,.RetirementFinished {
    color: #f7ba2a;
  }
  .Unconfirmed {
    color: blue;
  }
  .Repayment {
    color: green;
  }
  .Breach {
    color: red;
  }
  .name-wrapper .el-tag{
    font-size: 14px;
    background-color: transparent;
    color: red;
  }
  #showBig .el-dialog__body{
    height: 500px;
    overflow: auto;
  }
  #customerOrAppNoValue input{
    width: 204px;
  }
</style>
