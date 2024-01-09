<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Equipment Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      CONTAINER MNR LEDGER 
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="CONTAINER MNR LEDGER RECEIPT">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Create Date" style="width: 200px" @on-change="searchDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.mnr_ledger_bl" placeholder="BL#" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.container_no" placeholder="Container#" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-pink btn-icon btn-sm" v-if="row.mnr_ledger_receipt_date" :title="row.mnr_ledger_receipt_date" @click.prevent="receiptModalAct(row)" title="RECEIPT" :disabled="row.receipt_disabled">
            <i class="fa fa-money-bill-alt "/>
          </a>
          <a href="#" class="btn btn-green btn-icon btn-sm" v-else @click.prevent="receiptModalAct(row)" title="RECEIPT" :disabled="row.receipt_disabled">
            <i class="fa fa-money-bill-alt "/>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="mnr_files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" v-if="row.mnr_files && row.mnr_files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.mnr_files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.mnr_files">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download" v-if="row.state === 'AP' || row.filetype === 'MNR Receipt'">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="vessel">
          {{row.mnr_ledger_vessel_name}} / {{row.mnr_ledger_vessel_voyage}}
        </template>   
        <template slot-scope="{ row, index }" slot="size_type">
          {{row.mnr_ledger_container_size}} 
          <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.mnr_ledger_container_size">[{{item.container_size_name}}]</span>
        </template>
        <template slot-scope="{ row, index }" slot="mnr_atts">
          <Poptip trigger="hover" placement="bottom" :transfer="true" v-if="row.mnr_atts && row.mnr_atts.length > 0">
            <Button type="text" style="text-decoration:underline">Atta [{{row.mnr_atts.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.attachmentsTable.columns" :data="row.mnr_atts">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download">
                      <a :href="row.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" show-sizer :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.receiptModal" title="Receipt" width="600">
        <Form ref="receiptForm" :model="receiptForm" :label-width="150" style="padding-right: 80px;">
          <FormItem label="Received From" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="receiptForm.received_from_id" filterable clearable remote :remote-method="handleSearchCustomer" :loading="customerLoading" @on-change="handleChangeCustomer" placeholder="Received From" disabled>
              <Option v-for="item in customerList" :value="item.user_id" :key="item.user_id">{{item.user_name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="Amount" style="margin-bottom: 0px;">
            <Input v-model="receiptForm.uploadfile_amount" disabled/>
          </FormItem>
          <FormItem label="Cash/Cheque" style="margin-bottom: 0px;">
            <Select v-model="receiptForm.mnr_invoice_check_cash" >
              <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id" :disabled = "item.id === 'CASH'">{{ item.text }}</Option>
            </Select>
          </FormItem>
          <FormItem label="Bank Info" prop="receipt_bank_info" v-if="receiptForm.mnr_invoice_check_cash === 'TRANSFER'">
            <Select v-model="receiptForm.receipt_bank_info">
              <Option v-for="item in pagePara.BANK_INFOS" :value="item.bank_code" :key="item.bank_code">
                {{ item.bank_code }}
                <span style="float:right;">{{ item.bank_name }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="Bank Reference No" prop="mnr_invoice_bank_reference_no" v-if="receiptForm.mnr_invoice_check_cash === 'TRANSFER'">
            <Input placeholder="Bank Reference No" v-model="receiptForm.mnr_invoice_bank_reference_no"/>
          </FormItem>
          <FormItem label="Check No" prop="mnr_invoice_check_no" v-if="receiptForm.mnr_invoice_check_cash === 'CHEQUE'">
            <Input placeholder="Check No" v-model="receiptForm.mnr_invoice_check_no"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.receiptModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="receiptAct">Submit</Button>
        </div>
      </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import printJS from 'print-js'
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/equipment/ContainerMNRLedgerReceipt/'

export default {
  name: 'ContainerMNRLedgerReceipt',
  data: function() {
    return {
      modal: { receiptModal: false },
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'Receipt',
              slot: 'action',
              width: 100,
              align: 'center',
            },
            {
              title: 'Container#',
              key: 'mnr_ledger_container_no',
              width: 130,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'mnr_ledger_bl',
              width: 150,
              align: 'center'
            },
             {
              title: 'MNR Invoice',
              slot: 'mnr_files',
              width: 120
            },
            {
              title: 'Vessel',
              slot: 'vessel',
              width: 150,
              align: 'center',
            },
            {
              title: 'Arrival Date',
              key: 'mnr_ledger_vessel_ata',
              width: 130,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'size_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Description',
              key: 'mnr_ledger_description',
              width: 120,
              align: 'center'
            },
            {
              title: 'D/V Amount USD',
              key: 'mnr_ledger_dv_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Actual Charge Amount',
              key: 'mnr_ledger_actual_charge_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Loss Declaring Date',
              key: 'mnr_ledger_loss_declaring_date',
              width: 120,
              align: 'center'
            },
            {
              title: 'Corresponding Payer',
              key: 'mnr_ledger_corresponding_payer',
              width: 120,
              align: 'center'
            },
            {
              title: 'Payment Date',
              key: 'mnr_ledger_payment_date',
              width: 120,
              align: 'center'
            },
            {
              title: 'Termination',
              key: 'mnr_ledger_termination',
              width: 120,
              align: 'center'
            },
            {
              title: 'MNR Attachments',
              slot: 'mnr_atts',
              width: 100
            },
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight(),
          limit: 10,
          offset: 0,
          total: 0,
          current: 1
        },
        attachmentsTable: {
          columns: [
            {
                title: 'Act',
                slot: 'act',
                width: 80
            },
            {
                title: 'Create Date',
                key: 'created_at',
                width: 200
            },
          ]
        },
        filesTable: {
          columns: [
              {
                  title: 'Create Date',
                  key: 'date',
                  width: 120
              },
              {
                  title: 'Type',
                  key: 'filetype',
                  width: 150
              },
              {
                  title: 'State',
                  key: 'state',
                  render: common.selectRender(this, 'UPLOAD_STATE'),
                  width: 150
              },
              {
                  title: 'Action',
                  slot: 'act',
                  width: 150
              },
              {
                  title: 'Release Date',
                  key: 'release_date',
                  width: 150
              },
              {
                  title: 'Release User',
                  key: 'release_user',
                  width: 150
              }
          ]
        }
      },
      search_data: {
        date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        mnr_ledger_bl: '',
        container_no: ''
      },
      receiptForm: {
        received_from_id: '',
        uploadfile_id: '',
        uploadfile_amount: '',
        mnr_invoice_check_cash: 'CHEQUE',
        receipt_bank_info: '',
        mnr_invoice_bank_reference_no: '',
        mnr_invoice_check_no: '',
      },
      customerList: [],
      customerLoading: false,
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    try {
      this.getPara()
      this.getTableData(1)
    } catch (error) {
      this.$commonact.fault(error)
    }
  },
  methods: {
    getPara: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchDate: function(e) {
        this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.containerTable.current = index
          this.table.containerTable.offset = (index - 1) * this.table.containerTable.limit
        }
        let searchPara = {
          search_data: this.search_data,
          offset: this.table.containerTable.offset,
          limit: this.table.containerTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.containerTable.total = data.total
        this.table.containerTable.data = JSON.parse(JSON.stringify(data.rows))
        if(this.table.containerTable.data) {
          for(let d of this.table.containerTable.data) {
            if((d.invoice_containers_laden_release_date && d.invoice_containers_laden_release_overdue_amount && parseInt(d.invoice_containers_laden_release_overdue_amount) > 0) || (d.invoice_containers_empty_return_date && d.invoice_containers_empty_return_overdue_amount && parseInt(d.invoice_containers_empty_return_overdue_amount) > 0)) {
              d._disabled = false
            } else {
              d._disabled = true
            }
          }
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetTableSizer: function(pageSizer) {
        this.table.containerTable.limit = pageSizer
        this.getTableData(1)
    },
    receiptModalAct: async function(row) {
      this.customerLoading = true
      this.customerList = [
        {
          user_id: row.receipts.customers[0].user_id,
          user_name: row.receipts.customers[0].user_name,
        }
      ]
      this.customerLoading = false
      this.$nextTick(function() {
      // this.receiptForm = Object.assign({}, row.receipts)
        this.receiptForm.received_from_id =  row.receipts.customers[0].user_id
        this.receiptForm.received_from =  row.receipts.customers[0].user_name
        this.receiptForm.uploadfile_id = row.receipts.uploadfile_id
        this.receiptForm.uploadfile_amount = row.receipts.uploadfile_amount
        this.receiptForm.mnr_invoice_check_cash = 'CHEQUE'
      })
      this.modal.receiptModal =  true
    },
    receiptAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'receipt', this.receiptForm)
        printJS(response.data.info.url)
        this.modal.receiptModal = false
        this.getTableData(1)
        this.$Message.success('Receipt success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    handleSearchCustomer: async function(value) {
      if(value) {
        try {
          this.customerLoading = true
          let response = await this.$http.post(apiUrl + 'searchCustomer', {search_text: value})
          this.customerList = JSON.parse(JSON.stringify(response.data.info))
          this.customerLoading = false
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        this.customerList = []
      }
    },
    handleChangeCustomer: async function(value) {
      for(let item of this.customerList) {
        if(item.user_id === value) {
          this.receiptForm.received_from = item.user_name
          break
        }
      }
    },
  }
}
</script>
