<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Unusual</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Unusual Invoice
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Unusual Invoice">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-2">
              <input type="text" placeholder="Invoice No." v-model.trim="search_data.unusual_invoice_no" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <DatePicker type="daterange" :value="search_data.unusual_invoice_date" placeholder="Invoice Date" style="width: 200px" @on-change="searchInvoceRangeAct"></DatePicker>
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="CARGO TYPE" clearable filterable v-model="search_data.unusual_invoice_cargo_type">
                <Option v-for="item in pagePara.CARGO_TYPE" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="ITEMS" clearable filterable v-model="search_data.unusual_invoice_items">
                <Option v-for="item in pagePara.UNUSUAL_ITEMS" :value="item.payment_items_code" :key="item.payment_items_code" :label="item.payment_items_name">
                  <span>{{item.payment_items_name}}</span>
                  <span style="float:right;color:#ccc">{{item.payment_items_code}}</span>
                </Option>
              </Select>
            </div>
            <div class="input-group m-r-2">
              <input type="text" placeholder="B/L#" v-model.trim="search_data.unusual_invoice_bl" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <Select placeholder="PARTY" clearable filterable v-model="search_data.unusual_invoice_party">
                <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getUnusualInvoiceData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addUnusualInvoiceModal">Add</button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportAct">Export</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="unusualInvoice" :columns="table.unusualInvoice.rows" :data="table.unusualInvoice.data" :border="table.unusualInvoice.data && table.unusualInvoice.data.length > 0">
        <template slot-scope="{ row, index }" slot="action" v-if="row.unusual_invoice_status === '1'">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyUnusualInvoiceModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteUnusualInvoice(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="unusual_invoice_no">
          <span v-if="row.unusual_receipt_no" style="color:#19be6b;">{{row.unusual_invoice_no}}</span>
          <span v-else>{{row.unusual_invoice_no}}</span>
          <a :href="row.unusual_files.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" v-if="row.unusual_files" title="unusual invoice">
            <i class="fa fa-download"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" v-if="row.unusual_files && !row.unusual_receipt_no" title="delete unusual invoice" @click="deleteUnusualInvoiceNo(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="atta_files">
          <span v-if="row.atta_files">
            <a v-for="(item, index) in row.atta_files" v-bind:key="index" :href="item.uploadfile_url" target="_blank">
              <i class="fa fa-file-pdf" style="color:purple; font-size: 18px; margin-right: 7px;" v-if="getFileExtension(item.uploadfile_url) === 'PDF'"></i>
              <i class="fa fa-file-excel" style="color:blue; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'XLS' || getFileExtension(item.uploadfile_url) === 'XLSX'"></i>
              <i class="fa fa-file-word" style="color:aqua; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'DOC' || getFileExtension(item.uploadfile_url) === 'DOCX'"></i>
              <i class="fa fa-envelope" style="color:green; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'EML'"></i>
              <i class="fa fa-download" style="color:orange; font-size: 18px; margin-right: 7px;" v-else></i>
            </a>
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.unusualInvoice.total" :page-size="table.unusualInvoice.limit" :pageSizeOpts = "table.unusualInvoice.pageSizeOpts" show-total show-sizer show-elevator @on-change="getUnusualInvoiceData" @on-page-size-change="changeUnusualInvoicePageSize"/>
    </panel>
    <Modal v-model="modal.unusualInvoiceModal" title="Unusual Invoice" width="600px;">
      <Form :model="workPara" :label-width="160" :rules="formRule.ruleUnusualInvoiceModal" ref="formUnusualInvoice" style="padding-right: 50px;">
        <FormItem label="Invoice Party" prop="unusual_invoice_party">
          <Select placeholder="Invoice Party" clearable filterable v-model="workPara.unusual_invoice_party" @on-change="changeInvoiceParty">
            <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Party Address">
          <Input placeholder="Party Address" v-model="workPara.unusual_invoice_party_address" disabled/>
        </FormItem>
        <FormItem label="Party TIN#">
          <Input placeholder="Party TIN#" v-model="workPara.unusual_invoice_party_tin" disabled/>
        </FormItem>
        <FormItem label="Unusual Vessel" prop="unusual_invoice_vessel_voyage">
          <Select placeholder="Unusual Vessel" clearable filterable v-model="workPara.unusual_invoice_vessel_voyage">
            <Option v-for="item in pagePara.VESSELS" :value="item.vessel_voyage" :key="item.vessel_voyage">{{ item.vessel_voyage }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Items" prop="unusual_invoice_items">
          <Select placeholder="Items" clearable filterable v-model="workPara.unusual_invoice_items">
            <Option v-for="item in pagePara.UNUSUAL_ITEMS" :value="item.payment_items_code" :key="item.payment_items_code" :label="item.payment_items_name">
              <span>{{item.payment_items_name}}</span>
              <span style="float:right;color:#ccc">{{item.payment_items_code}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="Cargo Type" prop="unusual_invoice_cargo_type">
          <Select placeholder="Cargo Type" clearable filterable v-model="workPara.unusual_invoice_cargo_type">
            <Option v-for="item in pagePara.CARGO_TYPE" :value="item.id" :key="item.id">{{item.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="Unusual B/L#" prop="unusual_invoice_bl">
          <Input placeholder="Unusual B/L#" v-model="workPara.unusual_invoice_bl"/>
        </FormItem>
        <FormItem label="AMOUNT" prop="unusual_invoice_amount">
          <Input placeholder="AMOUNT" v-model="workPara.unusual_invoice_amount" @keyup.native='keyupNumberFormat($event, "unusual_invoice_amount")'></INput>
        </FormItem>
        <FormItem label="Attachment">
          <Upload
            ref="upload"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            type="drag"
            action="/api/zhongtan/payment/UnusualInvoice/upload">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.unusualInvoiceModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitUnusualInvoicePort">Submit</Button>
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
const moment = require('moment')
const apiUrl = '/api/zhongtan/payment/UnusualInvoice/'

export default {
  name: 'UnusualInvoice',
  data: function() {
    return {
      modal: { unusualInvoiceModal: false, checkPasswordModal: false },
      table: {
        unusualInvoice: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Action',
              width: 100,
              slot: 'action'
            },
            {
              title: 'INVOICE NO.',
              width: 200,
              slot: 'unusual_invoice_no',
            },
            {
              title: 'INVOICE Date',
              width: 180,
              key: 'unusual_invoice_date',
            },
            {
              title: 'INVOICE PARTY',
              width: 240,
              key: 'unusual_invoice_party_name'
            },
            {
              title: 'VESSEL/VOYOGE',
              width: 200,
              key: 'unusual_invoice_vessel_voyage'
            },
            {
              title: 'ITEMS',
              width: 200,
              key: 'unusual_invoice_items_name'
            },
            {
              title: 'CARGO TYPE',
              width: 200,
              key: 'unusual_invoice_cargo_type'
            },
            {
              title: 'B/L#',
              width: 200,
              key: 'unusual_invoice_bl'
            },
            {
              title: 'Amount',
              width: 160,
              key: 'unusual_invoice_amount'
            },
            {
              title: 'ATTACHMENT',
              width: 200,
              slot: 'atta_files'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          pageSizeOpts: [10, 20, 40, 60, 80, 100]
        }
      },
      search_data: {
        unusual_invoice_date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        unusual_invoice_party: '',
        unusual_invoice_items: '',
        unusual_invoice_cargo_type: '',
        unusual_invoice_bl: ''
      },
      formRule: {
        ruleUnusualInvoiceModal: {
          unusual_invoice_party: [{ required: true, trigger: 'change', message: 'Please Enter Party' }],
          unusual_invoice_items: [{ required: true, trigger: 'change', message: 'Please Enter Items' }],
          unusual_invoice_cargo_type: [{ required: true, trigger: 'change', message: 'Please Enter Cargo Type' }],
          unusual_invoice_amount: [{ required: true, trigger: 'change', message: 'Please Enter Amount' }],
          unusual_invoice_bl: [{ required: true, trigger: 'change', message: 'Please Enter B/L#' }]
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
        this.getUnusualInvoiceData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
    initPage()
  },
  methods: {
    searchInvoceRangeAct: function(e) {
      this.search_data.unusual_invoice_date = JSON.parse(JSON.stringify(e))
    },
    changeUnusualInvoicePageSize: async function(pageSize) {
      this.table.unusualInvoice.limit = pageSize
      this.getUnusualInvoiceData(1)
    },
    getUnusualInvoiceData: async function(index) {
      try {
        if (index) {
          this.table.unusualInvoice.offset = (index - 1) * this.table.unusualInvoice.limit
        }
        let response = await this.$http.post(apiUrl + 'search', {
          search_data: this.search_data,
          offset: this.table.unusualInvoice.offset,
          limit: this.table.unusualInvoice.limit
        })
        let data = response.data.info
        this.table.unusualInvoice.total = data.total
        this.table.unusualInvoice.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetWorkPara: async function() {
      this.workPara = {
        unusual_invoice_party: '',
        unusual_invoice_vessel_voyage: '',
        unusual_invoice_items: '',
        unusual_invoice_cargo_type: '',
        unusual_invoice_bl: '',
        unusual_invoice_amount: '',
        unusual_atta_files: []
      }
      this.$refs.upload.fileList = []
    },
    addUnusualInvoiceModal: async function() {
      this.resetWorkPara()
      this.action = 'add'
      this.$refs.formUnusualInvoice.resetFields()
      this.modal.unusualInvoiceModal = true
    },
    changeInvoiceParty: async function(value) {
      if(value) {
        for(let c of this.pagePara.COMMON_CUSTOMER) {
          if(c.user_id === value) {
            this.workPara.unusual_invoice_party_address = c.user_address
            this.workPara.unusual_invoice_party_tin = c.user_tin
          }
        }
      } else {
        this.workPara.unusual_invoice_party_address = ''
        this.workPara.unusual_invoice_party_tin = ''
      }
    },
    modifyUnusualInvoiceModal: async function(row) {
      this.$refs.formUnusualInvoice.resetFields()
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.workPara.unusual_atta_files = []
      this.$refs.upload.fileList = []
      this.action = 'modify'
      this.modal.unusualInvoiceModal = true
    },
    submitUnusualInvoicePort: function() {
      this.$refs.formUnusualInvoice.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
                this.$Message.success('add unusual invoice success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify unusual invoice success')
            }
            this.modal.unusualInvoiceModal = false
            this.getUnusualInvoiceData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteUnusualInvoice: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          let actrow = JSON.parse(JSON.stringify(row))
          delete actrow._index
          delete actrow._rowKey     
          this.workPara = actrow
          if(row.payment_advice_check) {
            this.checkPassword = ''
            this.checkPasswordType = 'unusualInvoiceDelete'
            this.modal.checkPasswordModal = true
          } else {
            await this.$http.post(apiUrl + 'delete', { unusual_invoice_id: row.unusual_invoice_id })
            this.$Message.success('delete success')
            this.getUnusualInvoiceData()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    deleteUnusualInvoiceNo: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          let actrow = JSON.parse(JSON.stringify(row))
          delete actrow._index
          delete actrow._rowKey     
          this.workPara = actrow
          this.checkPassword = ''
          this.checkPasswordType = 'unusualInvoiceDeleteNo'
          this.modal.checkPasswordModal = true
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let act = ''
          if (this.checkPasswordType === 'unusualInvoiceDelete' 
              || this.checkPasswordType === 'unusualInvoiceExport'
              || this.checkPasswordType === 'unusualInvoiceDeleteNo') {
            act = 'PAYMENT_ADVICE_ACTION'
          }
          let param = {
            action: act,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'unusualInvoiceDelete') {
            await this.$http.post(apiUrl + 'delete', { unusual_invoice_id: this.workPara.unusual_invoice_id })
            this.$Message.success('delete success')
            this.getUnusualInvoiceData()
          } else if (this.checkPasswordType === 'unusualInvoiceExport') {
            let response = await this.$http.request({
                url: apiUrl + 'export',
                method: 'post',
                data: {search_data: this.search_data},
                responseType: 'blob'
              })
            let blob = response.data
            let reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = e => {
              let a = document.createElement('a')
              a.download = 'Unusual Invoice.xlsx'
              a.href = e.target.result
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }
          }else if (this.checkPasswordType === 'unusualInvoiceDeleteNo') {
            await this.$http.post(apiUrl + 'deleteInvoice', { unusual_invoice_id: this.workPara.unusual_invoice_id })
            this.$Message.success('delete success')
            this.getUnusualInvoiceData()
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
      this.checkPasswordType = 'unusualInvoiceExport'
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
      this.workPara.unusual_atta_files = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
      const index = this.workPara.unusual_atta_files.indexOf(file)
      this.workPara.unusual_atta_files.splice(index, 1)
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