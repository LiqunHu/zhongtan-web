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
      Unusual Receipt
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Unusual Receipt">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-2">
              <input type="text" placeholder="Invoice No." v-model.trim="search_data.unusual_invoice_no" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <DatePicker type="daterange" :value="search_data.unusual_invoice_date" placeholder="Invoice Date" style="width: 180px" @on-change="searchInvoceRangeAct"></DatePicker>
            </div>
            <div class="input-group m-r-2">
              <input type="text" placeholder="Receipt No." v-model.trim="search_data.unusual_receipt_no" class="form-control">
            </div>
            <div class="input-group m-r-2">
              <DatePicker type="daterange" :value="search_data.unusual_receipt_date" placeholder="Invoice Date" style="width: 180px" @on-change="searchReceiptRangeAct"></DatePicker>
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
              <button type="button" class="btn btn-info" @click="getUnusualReceiptData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportAct">Export</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="unusualReceipt" :columns="table.unusualReceipt.rows" :data="table.unusualReceipt.data" :border="table.unusualReceipt.data && table.unusualReceipt.data.length > 0">
        <template slot-scope="{ row, index }" slot="unusual_receipt_no">
          {{row.unusual_receipt_no}}
          <a :href="row.unusual_receipt_files.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" v-if="row.unusual_receipt_no" title="unusual receipt">
            <i class="fa fa-download"></i>
          </a>
          <a href="#" class="btn btn-green btn-icon btn-sm" v-else v-on:click="showReceiptModal(row)">
            <i class="fa fa-money-bill-alt"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="unusual_invoice_no">
          {{row.unusual_invoice_no}}
          <a :href="row.unusual_invoice_files.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" title="unusual invoice">
            <i class="fa fa-download"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.unusualReceipt.total" :page-size="table.unusualReceipt.limit" :pageSizeOpts = "table.unusualReceipt.pageSizeOpts" show-total show-sizer show-elevator @on-change="getUnusualReceiptData" @on-page-size-change="changeUnusualReceiptPageSize"/>
    </panel>
    <Modal v-model="modal.receiptModal" title="RECEIPT" width="600">
      <Form ref="receiptForm" :model="workPara" :label-width="150" style="padding-right: 80px;">
        <FormItem label="Received From" style="margin-bottom: 0px;">
          <Input v-model="workPara.unusual_invoice_party_name" disabled/>
        </FormItem>
        <FormItem label="Amount" style="margin-bottom: 0px;">
          <Input v-model="workPara.unusual_invoice_amount" disabled/>
        </FormItem>
        <FormItem label="Cash/Cheque" style="margin-bottom: 0px;">
          <Select v-model="workPara.unusual_receipt_check_cash" >
            <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id" :disabled = "item.id === 'CASH'">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Row v-if="workPara.unusual_receipt_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Info" prop="unusual_receipt_bank_info">
              <Select v-model="workPara.unusual_receipt_bank_info">
                <Option v-for="item in pagePara.BANK_INFOS" :value="item.bank_code" :key="item.bank_code">
                  {{ item.bank_code }}
                  <span style="float:right;">{{ item.bank_name }}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="workPara.unusual_receipt_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Reference No" prop="unusual_receipt_bank_reference_no" >
              <Input placeholder="Bank Reference No" v-model="workPara.unusual_receipt_bank_reference_no"/>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="workPara.unusual_receipt_check_cash === 'CHEQUE'">
          <Col>
            <FormItem label="Check No" prop="overdue_invoice_check_no" >
              <Input placeholder="Check No" v-model="workPara.unusual_receipt_check_no"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.receiptModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="receiptAct" >Submit</Button>
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
import printJS from 'print-js'
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/payment/UnusualReceipt/'

export default {
  name: 'UnusualReceipt',
  data: function() {
    return {
      modal: { receiptModal: false, checkPasswordModal: false },
      table: {
        unusualReceipt: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'RECEIPT NO.',
              width: 180,
              slot: 'unusual_receipt_no',
            },
            {
              title: 'RECEIPT Date',
              width: 180,
              key: 'unusual_receipt_date',
            },
            {
              title: 'INVOICE NO.',
              width: 180,
              slot: 'unusual_invoice_no',
            },
            {
              title: 'INVOICE Date',
              width: 180,
              key: 'unusual_invoice_date',
            },
            {
              title: 'INVOICE PARTY',
              width: 200,
              key: 'unusual_invoice_party_name'
            },
            {
              title: 'VESSEL/VOYOGE',
              width: 160,
              key: 'unusual_invoice_vessel_voyage'
            },
            {
              title: 'ITEMS',
              width: 180,
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
        unusual_invoice_no: '',
        unusual_invoice_date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        unusual_receipt_no: '',
        unusual_receipt_date: [],
        unusual_invoice_party: '',
        unusual_invoice_items: '',
        unusual_invoice_cargo_type: '',
        unusual_invoice_bl: ''
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: '',
      checkPassword: '',
      checkPasswordType: ''
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
        this.getUnusualReceiptData(1)
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
    searchReceiptRangeAct: function(e) {
      this.search_data.unusual_receipt_date = JSON.parse(JSON.stringify(e))
    },
    changeUnusualReceiptPageSize: async function(pageSize) {
      this.table.unusualReceipt.limit = pageSize
      this.getUnusualReceiptData(1)
    },
    getUnusualReceiptData: async function(index) {
      try {
        if (index) {
          this.table.unusualReceipt.offset = (index - 1) * this.table.unusualReceipt.limit
        }
        let response = await this.$http.post(apiUrl + 'search', {
          search_data: this.search_data,
          offset: this.table.unusualReceipt.offset,
          limit: this.table.unusualReceipt.limit
        })
        let data = response.data.info
        this.table.unusualReceipt.total = data.total
        this.table.unusualReceipt.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    showReceiptModal: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.workPara.unusual_receipt_check_cash = 'TRANSFER'
      this.modal.receiptModal = true
    },
    receiptAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'receipt', this.workPara)
        printJS(response.data.info.url)
        this.$Message.success('Receipt Success')
        this.modal.receiptModal = false
        this.getUnusualReceiptData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let act = ''
          if (this.checkPasswordType === 'unusualReceiptExport') {
            act = 'PAYMENT_ADVICE_ACTION'
          }
          let param = {
            action: act,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'unusualReceiptExport') {
            await this.doExportAct()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    exportAct: async function() {
      // this.checkPassword = ''
      // this.checkPasswordType = 'unusualReceiptExport'
      // this.modal.checkPasswordModal = true
      await this.doExportAct()
    },
    doExportAct: async function() {
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
        a.download = 'Unusual Receipt.xlsx'
        a.href = e.target.result
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    }
  }
}
</script>