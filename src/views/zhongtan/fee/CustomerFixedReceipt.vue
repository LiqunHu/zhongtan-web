<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Fixed Container Receipt</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Fixed Container Receipt
      <small>Fixed Container Receipt...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Fixed Container Receipt">
        <template slot="beforeBody">
            <div class="panel-toolbar">
            <div class="form-inline">
                <div class="form-group m-r-2">
                    <Select v-model="search_data.fixed_deposit_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="customer.loading" placeholder="Select Customer" style="width:240px">
                        <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
                    </Select>
                </div>
                <div class="form-group m-r-2">
                    <Select v-model="search_data.fixed_deposit_type" clearable style="width:180px" placeholder="Select Deposit Type">
                        <Option v-for="item in pagePara.DEPOSIT_TYPE" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </div>
                <div class="form-group m-r-2">
                    <Select v-model="search_data.deposit_work_state" clearable style="width:180px" placeholder="Select Work State">
                        <Option v-for="item in pagePara.WORK_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </div>
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="getTableData">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
            </div>
            </div>
        </template>
        <Table stripe size="small" ref="fixedDepositTable" :columns="table.fixedDepositTable.columns" :data="table.fixedDepositTable.data" :height="table.fixedDepositTable.height">
            <template slot-scope="{ row, index }" slot="working">
                <span>{{row.deposit_begin_date}}</span> TO 
                <span v-if="row.deposit_long_term === '1'">Long Term</span>
                <span v-else>{{row.deposit_expire_date}}</span>
            </template>
            <template slot-scope="{ row, index }" slot="files">
                <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
                    <Button type="text" style="text-decoration:underline">Files</Button>
                    <template slot="content">
                      <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                        <template slot-scope="{ row, index }" slot="act">
                          <template>
                            <Tooltip content="Download">
                              <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                <i class="fa fa-download"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Release" v-if="row.filetype === 'Fixed Receipt' && row.deposit_work_state !=='I' && !row.release_date">
                              <a href="#" class="btn btn-primary btn-icon btn-sm" @click="realseFixedReceiptAct(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip>
                          </template>
                        </template>
                      </Table>
                    </template>
                </Poptip>
            </template>
            <template slot-scope="{ row, index }" slot="workState">
                <Tag v-for="item in pagePara.WORK_STATE" v-bind:key="item.id" :color="item.color" v-if="row.deposit_work_state === item.id">{{item.text}}</Tag>
            </template>
            <template slot-scope="{ row, index }" slot="action" v-if="row.deposit_work_state !=='I'">
                <a href="#" v-if="!row.deposit_invoice_release_date && row.fixed_deposit_type === 'FD'" class="btn btn-green btn-icon btn-sm disabled">
                    <i class="fa fa-money-bill-alt"></i>
                </a>
                <Tooltip :content="row.deposit_receipt_release_date_fm" v-else-if="row.deposit_receipt_release_date && row.fixed_deposit_type === 'FD'">
                    <a href="#" v-if="row.deposit_invoice_release_date" class="btn btn-green btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_receipt_date_fm" v-else-if="row.deposit_receipt_date && row.fixed_deposit_type === 'FD'">
                    <a href="#" v-if="row.deposit_invoice_release_date" class="btn btn-green btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_invoice_release_date_fm" v-else-if="row.deposit_invoice_release_date && row.fixed_deposit_type === 'FD'">
                    <a href="#" v-if="row.deposit_invoice_release_date" class="btn btn-green btn-icon btn-sm" @click="receiptFixedDepositModal(row)">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <a href="#" class="btn btn-danger btn-icon btn-sm" @click="invalidFixedDepositAct(row)" title="INVALID">
                    <i class="fa fa-times"></i>
                </a>
            </template>
        </Table>
        <Page class="m-t-10" :total="table.fixedDepositTable.total" :page-size="table.fixedDepositTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.fixedReceipt" title="Fixed Receipt" width="800">
        <Form ref="receiptForm" :model="receiptForm" :label-width="160" style="padding-right: 80px;">
            <FormItem label="Received From">
                <Select ref="customer" v-model="receiptForm.fixed_deposit_customer_id" filterable remote :remote-method="searchCustomer" :loading="customer.loading"  disabled>
                    <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
                </Select>
            </FormItem>
            <FormItem label="Working Range">
                <Row>
                    <Col span="8">
                        <FormItem prop="deposit_begin_date">
                            <DatePicker type="date" placeholder="Select begin date" v-model="receiptForm.deposit_begin_date" format="yyyy-MM-dd" disabled></DatePicker>
                         </FormItem> 
                    </Col>
                    <Col span="2" style="padding-left: 6px;">
                        TO
                    </Col>
                    <Col span="8">
                        <FormItem prop="deposit_expire_date" v-if="!receiptForm.deposit_long_term">
                            <DatePicker type="date" placeholder="Select expire date" v-model="receiptForm.deposit_expire_date" format="yyyy-MM-dd" disabled></DatePicker>
                         </FormItem> 
                    </Col>
                    <Col span="6">
                        <Checkbox v-model="receiptForm.deposit_long_term" disabled>Long Term</Checkbox>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="Amount">
                <Input v-model="receiptForm.deposit_amount" disabled>
                    <Select slot="prepend" v-model="receiptForm.deposit_check_cash" style="width: 100px" disabled>
                        <Option v-for="item in pagePara.CASH_BANK" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                    <Select slot="append" v-model="receiptForm.deposit_currency" style="width: 100px" disabled>
                        <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </Input>
            </FormItem>
            <FormItem label="Check No." v-if="receiptForm.deposit_check_cash === 'CHEQUE'">
                <Input v-model="receiptForm.deposit_check_cash_no"></Input>
            </FormItem>
            <FormItem label="Bank Reference" v-if="receiptForm.deposit_check_cash === 'TRANSFER'">
                <Input v-model="receiptForm.deposit_bank_reference_no"></Input>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.fixedReceipt=false">Cancel</Button>
            <Button type="primary" size="large" @click="receiptFixedDepositAct">Submit</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import printJS from 'print-js'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/fee/CustomerFixedReceipt/'

export default {
  data: function() {
    return {
        table: {
            fixedDepositTable: {
                columns: [
                    {
                        title: 'Customer',
                        key: 'user_name',
                        render: common.tooltipCellLengthRender(20),
                        width: 200
                    },
                    {
                        title: 'Fixed Deposit Type',
                        key: 'fixed_deposit_type',
                        render: common.selectRender(this, 'DEPOSIT_TYPE'),
                        width: 150
                    },
                    {
                        title: 'Working Range',
                        slot: 'working',
                        width: 200
                    },
                    {
                        title: 'Amount',
                        key: 'deposit_amount',
                        width: 150
                    },
                    {
                        title: 'Check/Cash',
                        key: 'deposit_check_cash',
                        render: common.selectRender(this, 'CASH_BANK'),
                        width: 150
                    },
                    {
                        title: 'Deposit Currency',
                        key: 'deposit_currency',
                        render: common.selectRender(this, 'RECEIPT_CURRENCY'),
                        width: 150
                    },
                    {
                        title: 'Guarantee Letter No.',
                        key: 'deposit_guarantee_letter_no',
                        render: common.tooltipCellLengthRender(20),
                        width: 180
                    },
                    {
                        title: 'Check No.',
                        key: 'deposit_check_cash_no',
                        render: common.tooltipCellLengthRender(20),
                        width: 150
                    },
                    {
                        title: 'Files',
                        slot: 'files',
                        width: 100
                    },
                    {
                        title: 'Working State',
                        slot: 'workState',
                        width: 150
                    },
                    {
                        title: 'Action',
                        slot: 'action',
                        width: 150
                    }
                ],
                data: [],
                height: common.getTableHeight() - 80,
                limit: 10,
                offset: 0,
                total: 0
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
        pagePara: {},
        search_data: {
            fixed_deposit_customer_id: '',
            fixed_deposit_type: '',
            deposit_work_state: ''
        },
        customer: {
          options: [],
          loading: false
        },
        files: {
            fileList: []
        },
        modal: { fixedReceipt: false},
        receiptForm: {
            fixed_deposit_id: '',
            fixed_deposit_customer_id: '',
            fixed_deposit_type: '',
            deposit_begin_date: '',
            deposit_expire_date: '',
            deposit_long_term: false,
            deposit_guarantee_letter_no: '',
            deposit_guarantee_letter_list: '',
            deposit_amount: '',
            deposit_check_cash: 'CASH',
            deposit_check_cash_no: '',
            deposit_currency: 'USD'
        }
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
    searchData: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.fixedDepositTable.offset = (index - 1) * this.table.fixedDepositTable.limit
        }
        let searchPara = {
          fixed_deposit_customer_id: this.search_data.fixed_deposit_customer_id,
          fixed_deposit_type: this.search_data.fixed_deposit_type,
          deposit_work_state: this.search_data.deposit_work_state,
          offset: this.table.fixedDepositTable.offset,
          limit: this.table.fixedDepositTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.fixedDepositTable.total = data.total
        this.table.fixedDepositTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetReceiptForm: function() {
        this.receiptForm = {
            fixed_deposit_id: '',
            fixed_deposit_customer_id: '',
            fixed_deposit_type: '',
            deposit_begin_date: '',
            deposit_expire_date: '',
            deposit_long_term: false,
            deposit_guarantee_letter_no: '',
            deposit_guarantee_letter_list: '',
            deposit_amount: '',
            deposit_check_cash: 'CASH',
            deposit_check_cash_no: '',
            deposit_currency: 'USD'
        }
    },
    receiptFixedDepositModal: async function(row) {
        this.resetReceiptForm()
        this.$refs.customer.reset()
        this.customer.loading = true
        this.customer.options = JSON.parse(JSON.stringify(row.customerINFO))
        this.customer.loading = false
        this.$nextTick(() => {
            this.receiptForm = Object.assign({}, row)
            this.receiptForm.deposit_long_term = row.deposit_long_term == '1'
            this.modal.fixedReceipt = true
        })
    },
    receiptFixedDepositAct: async function() {
        try {
            let response = await this.$http.post(apiUrl + 'receipt', this.receiptForm)
            this.$Message.success('Receipt Fixed Deposit Success')
            this.modal.fixedReceipt = false
            this.getTableData()
            printJS(response.data.info.url)
        } catch (error) {
            this.$commonact.fault(error)
        }
    },
    realseFixedReceiptAct: async function(row, index) {
        try {
            await this.$http.post(apiUrl + 'release', row)
            this.getTableData()
            this.$Message.success('Fixed Receipt Release Success')
        } catch (error) {
            this.$commonact.fault(error)
        }
    },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.customer.loading = false
      } else {
        this.customer.options = []
      }
    },
    invalidFixedDepositAct: async function(row) {
        try {
            let _self = this
            _self.$commonact.confirm(`Invalid the fixed deposit?`, async () => {
                try {
                    await _self.$http.post(apiUrl + 'invalid', row)
                    _self.getTableData()
                    _self.$Message.success('Invalid Fixed Deposit Success')
                } catch (error) {
                    this.$commonact.fault(error)
                }
            })
        } catch (error) {
            this.$commonact.fault(error)
        }
    },
  }
}
</script>
<style>
.timeline-time{
  font-size: 14px;
  font-weight: bold;
}
.timeline-content{
  padding-left: 5px;
}
</style>