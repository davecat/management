<template>
  <div>
    <el-row>
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.name" placeholder="中介名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="Search">查询</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" @click="formVisible = true">新增</el-button>
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
        style="width: 100%">
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
            <div slot="reference" :class="scope.row.enabled === 'false'? 'name-wrapper-1':'name-wrapper-normal'">
              <el-tag>{{ scope.row.enabled === 'true' ? '启用' : '停用' }}</el-tag>
            </div>
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
            <el-tooltip class="item" effect="dark" content="停用" placement="top-end" v-if="scope.row.enabled === 'true'">
              <el-button size="small" type="danger"
                         @click="rowDisabled(scope.row.id)"><i class="fa fa-lock" aria-hidden="true"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="启用" placement="top-end" v-if="scope.row.enabled === 'false'">
              <el-button size="small" type="warning"
                         @click="rowOpen(scope.row.id)"><i class="fa fa-unlock" aria-hidden="true"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog title="新增中介" :visible.sync="formVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="中介名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="收款银行" :label-width="formLabelWidth" prop="payeeBank">
          <el-input v-model="form.payeeBank"></el-input>
        </el-form-item>
        <el-form-item label="收款账号" :label-width="formLabelWidth" prop="payeeAccountNumber">
          <el-input v-model="form.payeeAccountNumber"></el-input>
        </el-form-item>
        <el-form-item label="付款银行" :label-width="formLabelWidth" prop="payerBank">
          <el-input v-model="form.payerBank"></el-input>
        </el-form-item>
        <el-form-item label="付款账号" :label-width="formLabelWidth" prop="payerAccountNumber">
          <el-input v-model="form.payerAccountNumber"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">取 消</el-button>
        <el-button type="primary" @click="submitAgency('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改中介" :visible.sync="formVisible2">
      <el-form :model="form2" ref="form2" :rules="rules">
        <el-form-item label="中介名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item label="收款银行" :label-width="formLabelWidth" prop="payeeBank">
          <el-input v-model="form2.payeeBank"></el-input>
        </el-form-item>
        <el-form-item label="收款账号" :label-width="formLabelWidth" prop="payeeAccountNumber">
          <el-input v-model="form2.payeeAccountNumber"></el-input>
        </el-form-item>
        <el-form-item label="付款银行" :label-width="formLabelWidth" prop="payerBank">
          <el-input v-model="form2.payerBank"></el-input>
        </el-form-item>
        <el-form-item label="付款账号" :label-width="formLabelWidth" prop="payerAccountNumber">
          <el-input v-model="form2.payerAccountNumber"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm2('form2')">取 消</el-button>
        <el-button type="primary" @click="submitAgency2('form2')">确 定</el-button>
      </div>
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
      title="启用"
      :visible.sync="dialogVisible4"
      size="tiny">
      <span>此操作将启用选中中介，是否继续？</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible4 = false">取 消</el-button>
                <el-button type="primary" @click="multipleOpen">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  import {pagination} from '../mixins/pagination.js'
  export default {
    mixins: [pagination],
    data() {
      return {
        searchForm: {
          name: '',
          enabled: ['true', 'false']
        },
        form: {
          name: '',
          payeeBank: '',
          payeeAccountNumber: '',
          payerBank: '',
          payerAccountNumber: ''
        },
        form2: {
          name: '',
          payeeBank: '',
          payeeAccountNumber: '',
          payerBank: '',
          payerAccountNumber: ''
        },
        formVisible: false,
        formVisible2: false,
        dialogVisible2: false,
        dialogVisible4: false,
        disabledId: '',
        openId: '',
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
        url: '/api/v2/agencys/getAgencyPage'
      }
    },
    methods: {
      //新增中介
      submitAgency(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.axios.post('/api/v2/agencys/add', this.form).then((res) => {
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
            this.axios.put('/api/v2/agencys/update', this.form2).then((res) => {
              this.getData();
              this.$refs[formName].resetFields();
              this.formVisible2 = false;
              this.$message.success("修改成功！");
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
//          修改
      handleEdit(row) {
        this.form2 = Object.assign({}, row);
        this.formVisible2 = true;
      },
      rowDisabled(id) {
        this.dialogVisible2 = true;
        this.disabledId = id;
      },
      rowOpen(id) {
        this.dialogVisible4 = true;
        this.openId = id;
      },
      //停用
      multipleDisable() {
        let form = {
          agencyIds: [this.disabledId],
          enabled: 'false'
        };
        this.axios.put('/api/v2/agencys/enabled', form).then((res) => {
          this.getData();
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible2 = false;
      },
      //启用
      multipleOpen() {
        let form = {
          agencyIds: [this.openId],
          enabled: 'true'
        };
        this.axios.put('/api/v2/agencys/enabled', form).then((res) => {
          this.getData();
        }).catch((error) => {
          this.$message.error(error.response.data.message);
        });
        this.dialogVisible4 = false;
      }
    }
  }
</script>

<style scoped>
  .name-wrapper-1 .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: red;
  }
  .name-wrapper-normal .el-tag {
    font-size: 14px;
    background-color: transparent;
    color: #000;
  }
</style>
