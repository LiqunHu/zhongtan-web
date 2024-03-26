<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">System Configuration</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Customer Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="Search Name Phone" v-model="table.userTable.search_text" class="form-control">
              <input type="text" placeholder="Search TIN" v-model="table.userTable.search_tin" class="form-control">
              <input type="text" placeholder="Search Finance Info" v-model="table.userTable.search_finance" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getUserData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addUserModal">Add Customer</button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportUserReport">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="userTable" :columns="table.userTable.rows" :data="table.userTable.data">
        <template slot-scope="{ row, index }" slot="user_customer_type">
          <div v-for="item in pagePara.USER_CUSTOMER_TYPE" v-bind:key="item.id">
            <Tag :color="item.color" v-if="row.user_customer_type == item.id">{{item.text}}</Tag>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="user_rate">
          <Rate v-model="row.user_rate" @on-change="changeUserRate(row)"></Rate>
        </template>
        <template slot-scope="{ row, index }" slot="export_split_shipment">
          <Tag v-if="row.export_split_shipment" v-for="item in row.export_split_shipment" v-bind:key="item">{{item}}</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="user_blacklist">
          <i-switch v-model="row.user_blacklist" @on-change="changeBlacklist(row)" size="large" true-value="1" false-value="0">
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </template>
        <template slot-scope="{ row, index }" slot="user_attachment">
          <span v-if="row.user_attachment">
            <a v-for="(item, index) in row.user_attachment" v-bind:key="index" :href="item" target="_blank">
              <i class="fa fa-file-pdf" style="color:purple; font-size: 18px; margin-right: 7px;" v-if="getFileExtension(item) === 'PDF'"></i>
              <i class="fa fa-file-excel" style="color:blue; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item) === 'XLS' || getFileExtension(item) === 'XLSX'"></i>
              <i class="fa fa-file-word" style="color:aqua; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item) === 'DOC' || getFileExtension(item) === 'DOCX'"></i>
              <i class="fa fa-envelope" style="color:green; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item) === 'EML'"></i>
              <i class="fa fa-download" style="color:orange; font-size: 18px; margin-right: 7px;" v-else></i>
            </a>
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyUserModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteUser(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.userTable.total" :page-size="table.userTable.limit" @on-change="getUserData"/>
    </panel>
    <Modal v-model="modal.userModal" title="Customer" width="1000">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleUserModal" ref="formUser">
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="Username" prop="user_username" style="margin-bottom: 7px;">
              <Input placeholder="Username" v-model="workPara.user_username" :disabled="action === 'modify'"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Name" prop="user_name" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="Name" v-model="workPara.user_name"> </Input>
              <Input v-else placeholder="Name" v-model="workPara.user_name" :disabled="!editCustomerName"> 
                <Button v-if="editCustomerName" slot="append" icon="ios-unlock" @click="cancelEditCustomerName"></Button>
                <Button v-else slot="append" icon="ios-lock" @click="authEditCustomerName"></Button>
              </Input>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="Email" prop="user_email" style="margin-bottom: 7px;">
              <Input placeholder="Email" v-model="workPara.user_email"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Phone" prop="user_phone" style="margin-bottom: 7px;">
              <Input placeholder="Phone" v-model="workPara.user_phone"/>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="Address" prop="user_address" style="margin-bottom: 7px;">
              <Input placeholder="Address" v-model="workPara.user_address"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Type" prop="user_type" style="margin-bottom: 7px;">
              <Select v-model="workPara.user_customer_type">
                <Option v-for="item in pagePara.USER_CUSTOMER_TYPE" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="Rate" prop="user_rate" style="margin-bottom: 7px;">
              <Rate v-model="workPara.user_rate"></Rate>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="TIN" prop="user_tin" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="TIN" v-model="workPara.user_tin"> </Input>
              <Input v-else placeholder="TIN" v-model="workPara.user_tin" :disabled="!editCustomerName"> </Input>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="VRN" prop="user_vrn" style="margin-bottom: 7px;">
              <Input placeholder="VRN" v-model="workPara.user_vrn"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="BANK USD" prop="user_bank_account_usd" style="margin-bottom: 7px;">
              <Input placeholder="BANK USD" v-model="workPara.user_bank_account_usd"/>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="BANK TZS" prop="user_bank_account_tzs" style="margin-bottom: 7px;">
              <Input placeholder="BANK TZS" v-model="workPara.user_bank_account_tzs"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="EXPORT SPLIT" prop="export_split_shipment" style="margin-bottom: 7px;">
              <Select v-model="workPara.export_split_shipment" multiple>
                <Option v-for="item in pagePara.EXPORT_SHIPMENTS" :value="item.fee_data_code" :key="item.fee_data_code" :label="item.fee_data_code">
                  <span>{{item.fee_data_code}}</span>
                  <span style="float:right;color:#ccc">{{item.fee_data_name}}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="24">
            <FormItem label="Attachment">
              <Upload
                ref="upload"
                :headers="uploadHeaders"
                :on-success="handleUploadSuccess"
                :on-remove="handleUploadRemove"
                type="drag"
                action="/api/zhongtan/payment/PaymentAdvice/upload">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>Click or drag files here to upload</p>
                </div>
              </Upload>
              <Row v-if="action !== 'add'" type="flex" justify="start" v-for="item in workPara.user_attachment" :key="item" style="background-color:#f8f8f9">
                <Col span="20">
                  {{item}}
                </Col>
                <Col span="4">
                  <a :href="item" target="_blank">
                    <i class="fa fa-download"></i>
                  </a>
                  <a href="#" style="color:red; margin-left: 10px;" @click="removeAttachment(item)">
                    <i class="fa fa-times"></i>
                  </a>
                </Col>
              </Row>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="U8 CUSTOMER CODE" prop="u8_code" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="U8 CUSTOMER CODE" v-model="workPara.u8_code"/>
              <Input v-else placeholder="U8 CUSTOMER CODE" v-model="workPara.u8_code" :disabled="!editCustomerFinance"> 
                <Button v-if="editCustomerFinance" slot="append" icon="ios-unlock" @click="cancelEditCustomerFinance"></Button>
                <Button v-else slot="append" icon="ios-lock" @click="authEditCustomerFinance"></Button>
              </Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="U8 CUSTOMER ALIAS" prop="u8_alias" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="U8 CUSTOMER ALIAS" v-model="workPara.u8_alias"/>
              <Input v-else placeholder="U8 CUSTOMER ALIAS" v-model="workPara.u8_alias" :disabled="!editCustomerFinance"/>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="U8 VENDOR CODE" prop="u8_code" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="U8 VENDOR CODE" v-model="workPara.u8_vendor_code"/>
              <Input v-else placeholder="U8 VENDOR CODE" v-model="workPara.u8_vendor_code" :disabled="!editCustomerFinance"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="U8 VENDOR ALIAS" prop="u8_alias" style="margin-bottom: 7px;">
              <Input v-if="action === 'add'" placeholder="U8 VENDOR ALIAS" v-model="workPara.u8_vendor_alias"/>
              <Input v-else placeholder="U8 VENDOR ALIAS" v-model="workPara.u8_vendor_alias" :disabled="!editCustomerFinance"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.userModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitUser">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :mask-closable="false" :closable="false">
      <Form :label-width="120">
          <FormItem v-show="false">
              <Input type="password" style='width:0;opacity:0;'></Input>
          </FormItem>
          <FormItem label="Password" prop="checkPassword">
              <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
          </FormItem>
      </Form>
      <div slot="footer">
          <Button type="text" size="large" @click="checkPasswordCancel">Cancel</Button>
          <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/CustomerAdmin/'

export default {
  name: 'CustomerAdmin',
  data: function() {
    return {
      modal: { userModal: false, checkPasswordModal: false },
      table: {
        userTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Username',
              key: 'user_username',
              width: 200,
            },
            {
              title: 'Name',
              key: 'user_name',
              width: 300,
            },
            {
              title: 'Type',
              slot: 'user_customer_type',
              width: 150,
            },
            {
              title: 'Rate',
              slot: 'user_rate',
              width: 180,
            },
            {
              title: 'Phone',
              key: 'user_phone',
              width: 150,
            },
            {
              title: 'Email',
              key: 'user_email',
              width: 200,
            },
            {
              title: 'Address',
              key: 'user_address',
              width: 300,
            },
            {
              title: 'TIN',
              key: 'user_tin',
              width: 150,
            },
            {
              title: 'VRN',
              key: 'user_vrn',
              width: 150,
            },
            {
              title: 'BANK USD',
              key: 'user_bank_account_usd',
              width: 150,
            },
            {
              title: 'BANK TZS',
              key: 'user_bank_account_tzs',
              width: 150,
            },
            {
              title: 'EXPORT SPLIT',
              slot: 'export_split_shipment',
              width: 200,
            },
            {
              title: 'Blacklist',
              slot: 'user_blacklist',
              width: 100,
            },
            {
              title: 'ATTACHMENT',
              width: 200,
              slot: 'user_attachment'
            },
            {
              title: 'U8 Customer Code',
              key: 'u8_code',
              width: 200,
            },
            {
              title: 'U8 Customer Alias',
              key: 'u8_alias',
              width: 200,
            },
            {
              title: 'U8 Vendor Code',
              key: 'u8_vendor_code',
              width: 100,
            },
            {
              title: 'U8 Vendor Alias',
              key: 'u8_vendor_alias',
              width: 200,
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100,
              fixed: 'right'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_text: '',
          search_tin: '',
          search_finance: ''
        }
      },
      formRule: {
        ruleUserModal: {
          user_username: [{ required: true, trigger: 'change', message: 'Enter Username' }],
          user_name: [{ required: true, trigger: 'change', message: 'Enter Name' }],
          user_phone: [{ required: true, trigger: 'change', message: 'Enter Phone' }],
          user_email: [{ required: true, rigger: 'change', message: 'Enter Email' }],
          user_address: [{ required: true, rigger: 'change', message: 'Enter Address' }]
        }
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: '',
      checkPassword: '',
      checkPasswordType: '',
      editCustomerName: false,
      editCustomerFinance: false,
      uploadHeaders: common.uploadHeaders()
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    const initPage = async () => {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
    this.getUserData(1)
  },
  methods: {
    getUserData: async function(index) {
      try {
        if (index) {
          this.table.userTable.offset = (index - 1) * this.table.userTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.userTable.search_text,
          search_tin: this.table.userTable.search_tin,
          search_finance: this.table.userTable.search_finance,
          offset: this.table.userTable.offset,
          limit: this.table.userTable.limit
        })
        let data = response.data.info
        this.table.userTable.total = data.total
        this.table.userTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addUserModal: async function() {
      this.workPara = {
        user_customer_type: '1',
        user_rate: 1
      }
      this.action = 'add'
      this.$refs.formUser.resetFields()
      this.workPara.customer_atta_files = []
      this.$refs.upload.fileList = []
      this.modal.userModal = true
    },
    modifyUserModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formUser.resetFields()
      this.cancelEditCustomerName()
      this.cancelEditCustomerFinance()
      this.workPara.customer_atta_files = []
      this.$refs.upload.fileList = []
      this.modal.userModal = true
    },
    submitUser: function() {
      this.$refs.formUser.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('Add Customer Success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('Modify Customer Success')
            }
            this.getUserData()
            this.modal.userModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteUser: function(row) {
      this.$commonact.confirm('Delete Customer?', async () => {
        this.workPara = JSON.parse(JSON.stringify(row))
        this.checkPassword = ''
        this.checkPasswordType = 'customerDelete'
        this.modal.checkPasswordModal = true
      })
    },
    doDeleteUser: async function() {
      try {
        await this.$http.post(apiUrl + 'delete', { user_id: this.workPara.user_id })
        this.$Message.success('Delete Success')
        this.getUserData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    changeBlacklist: async function(row) {
      try {
        await this.$http.post(apiUrl + 'changeBlacklist', row)
        if(row.user_blacklist === '1'){
          this.$Message.success('add blacklist Success')
        } else {
          this.$Message.success('remove blacklist Success')
        }
        this.getUserData()
      } catch (error) {
        if(row.user_blacklist === '1'){
          row.user_blacklist = '0'
        } else {
          row.user_blacklist = '1'
        }
        this.$commonact.fault(error)
      }
    },
    changeUserRate: async function(row) {
      try {
        await this.$http.post(apiUrl + 'changeRate', row)
        this.getUserData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    exportUserReport: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'exportCustomer',
            method: 'post',
            data: {search_data: this.search_data},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'customer user ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'customerDelete' || this.checkPasswordType === 'customerNameEdit') {
            action = 'CUSTOMER_ADMIN_OPERATE'
          } else if(this.checkPasswordType === 'customerFinanceEdit') {
            action = 'CUSTOMER_FINANCE_OPERATE'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'customerDelete') {
            this.doDeleteUser()
          } else if (this.checkPasswordType === 'customerNameEdit') {
            this.editCustomerName = true
          } else if (this.checkPasswordType === 'customerFinanceEdit') {
            this.editCustomerFinance = true
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    authEditCustomerName: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'customerNameEdit'
      this.modal.checkPasswordModal = true
    },
    cancelEditCustomerName: async function() {
      this.editCustomerName = false
    },
    authEditCustomerFinance: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'customerFinanceEdit'
      this.modal.checkPasswordModal = true
    },
    cancelEditCustomerFinance: async function() {
      this.editCustomerFinance = false
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.workPara.customer_atta_files = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
      const index = this.workPara.customer_atta_files.indexOf(file)
      this.workPara.customer_atta_files.splice(index, 1)
    },
    removeAttachment: async function(item) {
      try {
        let response = await this.$http.post(apiUrl + 'removeAttachment', {user_id: this.workPara.user_id, atta_path: item})
        this.$Message.success('delete success')
        this.workPara.user_attachment = JSON.parse(JSON.stringify(response.data.info.user_attachment))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    getFileExtension: function(filename){
      let ext = /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : ''
      if(ext) {
        return ext.toLocaleUpperCase()
      }
      return ext
    }
  }
}
</script>