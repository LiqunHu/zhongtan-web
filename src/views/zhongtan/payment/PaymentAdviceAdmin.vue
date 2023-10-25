<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Payment</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Payment Advice Admin
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Payment Advice">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-2">
              <input type="text" placeholder="ADVICE No." v-model="search_data.payment_advice_no" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="PAYMENT METHOD" clearable filterable v-model="search_data.payment_advice_method">
                <Option v-for="item in pagePara.PAYMENT_METHOD" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="ITEMS" clearable filterable v-model="search_data.payment_advice_items">
                <Option v-for="item in pagePara.PAYMENT_ITEMS" :value="item.payment_items_code" :key="item.payment_items_code" :label="item.payment_items_name">
                  <span>{{item.payment_items_name}}</span>
                  <span style="float:right;color:#ccc">{{item.payment_items_code}}</span>
                </Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <input type="text" placeholder="INV/CNTRL#" v-model="search_data.payment_advice_inv_cntrl" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="BENEFICIARY" clearable filterable v-model="search_data.payment_advice_beneficiary">
                <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="REMARKS" clearable filterable v-model="search_data.payment_advice_remarks">
                <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="VESSEL VOYAGE" clearable filterable v-model="search_data.payment_advice_vessel_voyage">
                <Option v-for="item in pagePara.VESSELS" :value="item.vessel_voyage" :key="item.vessel_voyage">{{ item.vessel_voyage }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getPaymentAdviceData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addPaymentAdviceModal">Add</button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportAct">Export</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="paymentAdvice" :columns="table.paymentAdvice.rows" :data="table.paymentAdvice.data" :border="table.paymentAdvice.data && table.paymentAdvice.data.length > 0" :height="table.paymentAdvice.height">
        <template slot-scope="{ row, index }" slot="action">
          <Tag color="green" v-if="row.payment_advice_status === '2'">COMPLETED</Tag>
          <div v-else>
            <Tag v-if="row.payment_verification_status === 'PE'">Edit</Tag>
            <Tag color="blue" v-if="row.payment_verification_status === 'PS'">Section Manager</Tag>
            <Tag color="magenta" v-if="row.payment_verification_status === 'PB'">Commercial</Tag>
            <Tag color="volcano" v-if="row.payment_verification_status === 'PSM'">Shipping Manager</Tag>
            <Tag color="orange" v-if="row.payment_verification_status === 'PM'">Financial Manager</Tag>
            <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyPaymentAdviceModal(row)">
              <i class="fa fa-edit"></i>
            </a>
            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deletePaymentAdvice(row)">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_no">
          {{row.payment_advice_no}}
          <a :href="row.advice_files.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" v-if="row.advice_files" title="payment advice">
            <i class="fa fa-download"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_items">
          {{row.payment_advice_items_name}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_beneficiary">
          {{row.payment_advice_beneficiary_name}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_amount">
          {{row.payment_advice_amount}}{{row.payment_advice_currency}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_remarks">
          <font style="font-weight: bold;">BILLS TO</font> {{row.payment_advice_remarks_name}}
        </template>
        <template slot-scope="{ row, index }" slot="atta_files">
          <span v-if="row.atta_files">
            <a v-for="(item, index) in row.atta_files" v-bind:key="index" :href="item.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
              <i class="fa fa-file-pdf" style="color:purple; font-size: 18px; margin-right: 7px;" v-if="getFileExtension(item.url) === 'PDF'"></i>
              <i class="fa fa-file-excel" style="color:blue; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.url) === 'XLS' || getFileExtension(item.url) === 'XLSX'"></i>
              <i class="fa fa-file-word" style="color:aqua; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.url) === 'DOC' || getFileExtension(item.url) === 'DOCX'"></i>
              <i class="fa fa-envelope" style="color:green; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.url) === 'EML'"></i>
              <i class="fa fa-download" style="color:orange; font-size: 18px; margin-right: 7px;" v-else></i>
            </a>
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.paymentAdvice.total" :current="table.paymentAdvice.current" :pageSizeOpts = "table.paymentAdvice.pageSizeOpts" :page-size="table.paymentAdvice.limit" @on-change="getPaymentAdviceData"/>
    </panel>
    <Modal v-model="modal.paymentAdviceModal" :title="action==='add' ? 'Add Payment Advice' : 'Edit Payment Advice'" width="600px;">
      <Form :model="workPara" :label-width="160" :rules="formRule.rulePaymentAdviceModal" ref="formPaymentAdvice" style="padding-right: 50px;">
        <FormItem label="PAYMENT METHOD" prop="payment_advice_method">
          <Select placeholder="PAYMENT METHOD" clearable filterable v-model="workPara.payment_advice_method">
            <Option v-for="item in pagePara.PAYMENT_METHOD" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="PAYMENT VESSELS" prop="payment_advice_vessel_voyage">
          <Select placeholder="VESSEL VOYAGE" clearable filterable v-model="workPara.payment_advice_vessel_voyage">
            <Option v-for="item in pagePara.VESSELS" :value="item.vessel_voyage" :key="item.vessel_voyage">{{ item.vessel_voyage }}</Option>
          </Select>
        </FormItem>
        <FormItem label="ITEMS" prop="payment_advice_items">
          <Select placeholder="ITEMS" clearable filterable v-model="workPara.payment_advice_items">
            <Option v-for="item in pagePara.PAYMENT_ITEMS" :value="item.payment_items_code" :key="item.payment_items_code" :label="item.payment_items_name">
              <span>{{item.payment_items_name}}</span>
              <span style="float:right;color:#ccc">{{item.payment_items_code}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="INV/CNTRL#" prop="payment_advice_inv_cntrl">
          <Input placeholder="INV/CNTRL" v-model="workPara.payment_advice_inv_cntrl"/>
        </FormItem>
        <FormItem label="BENEFICIARY" prop="payment_advice_beneficiary">
          <Select placeholder="BENEFICIARY" clearable filterable v-model="workPara.payment_advice_beneficiary" @on-change="changeBeneficiary">
            <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="AMOUNT" prop="payment_advice_amount">
          <Input placeholder="AMOUNT" v-model="workPara.payment_advice_amount" @keyup.native='keyupNumberFormat($event, "payment_advice_amount")'>
            <Select slot="append" v-model="workPara.payment_advice_currency" style="width: 100px" @on-change="changeCurrency">
              <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
            </Select>
          </INput>
        </FormItem>
        <FormItem label="BANK ACCOUNT" prop="payment_advice_bank_account">
          <Input placeholder="BANK ACCOUNT" v-model="workPara.payment_advice_bank_account" disabled/>
        </FormItem>
        <FormItem label="REMARKS" prop="payment_advice_remarks">
          <Input value="BILLS TO" disabled>
            <Select slot="append" placeholder="REMARKS" clearable filterable v-model="workPara.payment_advice_remarks" style="width: 240px">
              <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
            </Select>
          </INput>
        </FormItem>
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
          <Row v-if="action === 'modify'" type="flex" justify="start" v-for="item in workPara.atta_files" :key="item.uploadfile_id" style="background-color:#f8f8f9">
            <Col span="20">
              {{item.uploadfile_name}}
            </Col>
            <Col span="4">
              <a :href="item.uploadfile_url" target="_blank">
                <i class="fa fa-download"></i>
              </a>
              <a href="#" style="color:red; margin-left: 10px;" @click="removeAttachment(item)">
                <i class="fa fa-times"></i>
              </a>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.paymentAdviceModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitPaymentAdvicePort">Submit</Button>
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
        <Button type="text" size="large" @click="modal.checkPasswordModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/payment/PaymentAdviceAdmin/'

export default {
  name: 'PaymentAdviceAdmin',
  data: function() {
    return {
      modal: { paymentAdviceModal: false, checkPasswordModal: false },
      table: {
        paymentAdvice: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Action',
              width: 220,
              slot: 'action'
            },
            {
              title: 'PAYMENT NO.',
              width: 180,
              slot: 'payment_advice_no',
            },
            {
              title: 'PAYMENT METHOD',
              width: 180,
              key: 'payment_advice_method'
            },
            {
              title: 'VESSEL/VOYOGE',
              width: 160,
              key: 'payment_advice_vessel_voyage'
            },
            {
              title: 'ITEMS',
              width: 180,
              slot: 'payment_advice_items'
            },
            {
              title: 'INV/CNTRL#',
              width: 200,
              key: 'payment_advice_inv_cntrl'
            },
            {
              title: 'BENEFICIARY',
              width: 200,
              slot: 'payment_advice_beneficiary'
            },
            {
              title: 'BANK ACCOUNT',
              width: 160,
              key: 'payment_advice_bank_account'
            },
            {
              title: 'AMOUNT',
              width: 160,
              slot: 'payment_advice_amount'
            },
            {
              title: 'REMARKS',
              width: 200,
              slot: 'payment_advice_remarks'
            },
            {
              title: 'ATTACHMENT',
              width: 200,
              slot: 'atta_files'
            },
            {
              title: 'Create By',
              width: 200,
              key: 'payment_advice_create_by_name'
            },
            {
              title: 'Create At',
              width: 200,
              key: 'payment_advice_create_at'
            },
          ],
          pageSizeOpts: [20, 40, 60, 80, 100],
          data: [],
          limit: 20,
          offset: 0,
          total: 0,
          height: common.getTableHeight() - 100,
          current: 1
        }
      },
      search_data: {
        payment_advice_no: '',
        payment_advice_method: '',
        payment_advice_items: '',
        payment_advice_inv_cntrl: '',
        payment_advice_beneficiary: '',
        payment_advice_remarks: ''
      },
      formRule: {
        rulePaymentAdviceModal: {
          payment_advice_method: [{ required: true, trigger: 'change', message: 'Enter payment method' }],
          payment_advice_items: [{ required: true, trigger: 'change', message: 'Enter payment items' }],
          payment_advice_inv_cntrl: [{ required: true, trigger: 'change', message: 'Enter payment inv/cntrl' }],
          payment_advice_beneficiary: [{ required: true, trigger: 'change', message: 'Enter payment beneficiary' }],
          payment_advice_amount: [{ required: true, trigger: 'change', message: 'Enter payment amount' }],
          payment_advice_remarks: [{ required: true, trigger: 'change', message: 'Enter payment remarks' }],
          payment_atta_files: [{ type: 'array', min: 1, required: true, trigger: 'change', message: 'upload Attachment'}]
        }
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: '',
      checkPassword: '',
      checkPasswordType: '',
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
        this.getPaymentAdviceData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getPaymentAdviceData: async function(index) {
      try {
        if (index) {
          this.table.paymentAdvice.offset = (index - 1) * this.table.paymentAdvice.limit
          this.table.paymentAdvice.current = index
        }
        let response = await this.$http.post(apiUrl + 'searchAdmin', {
          search_data: this.search_data,
          offset: this.table.paymentAdvice.offset,
          limit: this.table.paymentAdvice.limit
        })
        let data = response.data.info
        this.table.paymentAdvice.total = data.total
        this.table.paymentAdvice.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetWorkPara: async function() {
      this.workPara = {
        payment_advice_method: 'REMITTANCE',
        payment_advice_vessel_voyage: '',
        payment_advice_items: '',
        payment_advice_inv_cntrl: '',
        payment_advice_beneficiary: '',
        payment_advice_amount: '',
        payment_advice_currency: 'USD',
        payment_advice_bank_account: '',
        payment_advice_remarks: '',
        payment_atta_files: []
      }
      this.$refs.upload.fileList = []
    },
    addPaymentAdviceModal: async function() {
      this.resetWorkPara()
      this.action = 'add'
      this.$refs.formPaymentAdvice.resetFields()
      this.modal.paymentAdviceModal = true
    },
    changeBeneficiary: async function(value) {
      if(value && this.workPara.payment_advice_currency) {
        for(let c of this.pagePara.COMMON_CUSTOMER) {
          if(c.user_id === value) {
            if(this.workPara.payment_advice_currency === 'USD') {
              this.workPara.payment_advice_bank_account = c.user_bank_account_usd
            } else {
              this.workPara.payment_advice_bank_account = c.user_bank_account_tzs
            }
            return
          }
        }
      }
    },
    changeCurrency: async function(value) {
      if(value && this.workPara.payment_advice_beneficiary) {
        for(let c of this.pagePara.COMMON_CUSTOMER) {
          if(c.user_id === this.workPara.payment_advice_beneficiary) {
            if(value === 'USD') {
              this.workPara.payment_advice_bank_account = c.user_bank_account_usd
            } else {
              this.workPara.payment_advice_bank_account = c.user_bank_account_tzs
            }
            return
          }
        }
      }
    },
    modifyPaymentAdviceModal: async function(row) {
      this.$refs.formPaymentAdvice.resetFields()
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.workPara.payment_atta_files = []
      this.$refs.upload.fileList = []
      this.action = 'modify'
      if(row.payment_advice_check) {
        this.checkPassword = ''
        this.checkPasswordType = 'paymentAdviceModify'
        this.modal.checkPasswordModal = true
      } else {
        this.modal.paymentAdviceModal = true
      }
    },
    submitPaymentAdvicePort: function() {
      this.$refs.formPaymentAdvice.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              if(this.workPara.payment_atta_files && this.workPara.payment_atta_files.length > 0) {
                await this.$http.post(apiUrl + 'add', this.workPara)
                this.$Message.success('add payment item success')
              } else {
                return this.$Message.error('Please upload Attachment file')
              }
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify payment item success')
            }
            this.modal.paymentAdviceModal = false
            this.getPaymentAdviceData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deletePaymentAdvice: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          let actrow = JSON.parse(JSON.stringify(row))
          delete actrow._index
          delete actrow._rowKey     
          this.workPara = JSON.parse(JSON.stringify(actrow))
          if(row.payment_advice_check) {
            this.checkPassword = ''
            this.checkPasswordType = 'paymentAdviceDelete'
            this.modal.checkPasswordModal = true
          } else {
            await this.$http.post(apiUrl + 'delete', { payment_advice_id: row.payment_advice_id })
            this.$Message.success('delete success')
            this.getPaymentAdviceData()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let act = ''
          if (this.checkPasswordType === 'paymentAdviceModify' 
              || this.checkPasswordType === 'paymentAdviceDelete' 
              || this.checkPasswordType === 'paymentAdviceExport') {
            act = 'PAYMENT_ADVICE_ACTION'
          }
          let param = {
            action: act,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'paymentAdviceModify') {
            this.modal.paymentAdviceModal = true
          } else if (this.checkPasswordType === 'paymentAdviceDelete') {
            await this.$http.post(apiUrl + 'delete', { payment_advice_id: this.workPara.payment_advice_id })
            this.$Message.success('delete success')
            this.getPaymentAdviceData()
          } else if (this.checkPasswordType === 'paymentAdviceExport') {
            let response = await this.$http.request({
                url: apiUrl + 'exportAdmin',
                method: 'post',
                data: {search_data: this.search_data},
                responseType: 'blob'
              })
            let blob = response.data
            let reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = e => {
              let a = document.createElement('a')
              a.download = 'Payment Advice.xlsx'
              a.href = e.target.result
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    exportAct: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'paymentAdviceExport'
      this.modal.checkPasswordModal = true
    },
    keyupNumberFormat: async function(e, key) {
      if(e.target.value) {
          e.target.value = e.target.value.replace(/\s+/g, '')
          let nagtiveFlg = e.target.value.indexOf('-') === 0
          e.target.value = e.target.value.replace(/[^\d.]/g, '')
          e.target.value = e.target.value.replace(/\.{2,}/g, '.')
          e.target.value = e.target.value.replace(/^\./g, '0.')
          e.target.value = e.target.value.replace(/^\d*\.\d*\./g, e.target.value.substring(0,e.target.value.length-1))
          e.target.value = e.target.value.replace(/^0[^\\.]+/g, '0')
          e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
          e.target.value = nagtiveFlg ? '-' + e.target.value : e.target.value
          this.workPara[key] = e.target.value
      } else {
          this.workPara[key] = ''
      }
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.workPara.payment_atta_files = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
      const index = this.workPara.payment_atta_files.indexOf(file)
      this.workPara.payment_atta_files.splice(index, 1)
    },
    removeAttachment: async function(item) {
      try {
        let response = await this.$http.post(apiUrl + 'removeAttachment', item)
        this.$Message.success('delete success')
        this.workPara.atta_files = JSON.parse(JSON.stringify(response.data.info.atta_files))
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