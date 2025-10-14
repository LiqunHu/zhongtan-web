<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Fixed Container Deposit</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Fixed Container Deposit
      <small>Fixed Container Deposit...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Fixed Container Deposit">
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
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="addFixedDepositModal">ADD FIXED DEPOSIT</button>
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
            <template slot-scope="{ row, index }" slot="files" v-if="row.deposit_work_state !== 'I'">
                <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
                    <Button type="text" style="text-decoration:underline">Files</Button>
                    <template slot="content">
                      <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                        <template slot-scope="{ row, index }" slot="act">
                          <template>
                            <Tooltip content="Download" v-if="row.filetype === 'Fixed Invoice' && row.state === 'AP' && row.release_date">
                              <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                <i class="fa fa-download"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Download" v-if="row.filetype === 'Guarantee Letter' && row.state === 'AP' && row.release_date">
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
            <template slot-scope="{ row, index }" slot="workState">
                <Tag v-for="item in pagePara.WORK_STATE" v-bind:key="item.id" :color="item.color" v-if="row.deposit_work_state === item.id">{{item.text}}</Tag>
            </template>
            <template slot-scope="{ row, index }" slot="action" v-if="row.deposit_work_state !=='I'">
                <Tooltip :content="row.deposit_approve_date_fm" v-if="row.fixed_deposit_type === 'GU' && row.deposit_approve_date">
                    <a href="#" v-if="row.deposit_approve_date" class="btn btn-pink btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_receipt_release_date_fm" v-else-if="row.fixed_deposit_type === 'FD' && row.deposit_receipt_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_receipt_date_fm" v-else-if="row.fixed_deposit_type === 'FD' && row.deposit_receipt_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm disabled" title="INVOICE">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_invoice_release_date_fm" v-else-if="row.fixed_deposit_type === 'FD' && row.deposit_invoice_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_invoice_date_fm" v-else-if="row.fixed_deposit_type === 'FD' && row.deposit_invoice_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <Tooltip :content="row.deposit_approve_date_fm" v-else-if="row.fixed_deposit_type === 'FD' && row.deposit_approve_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm disabled">
                        <i class="fa fa-money-bill-alt"></i>
                    </a>
                </Tooltip>
                <a v-else-if="row.fixed_deposit_type === 'FD'" href="#" class="btn btn-pink btn-icon btn-sm" @click="invoiceFixedDepositAct(row)">
                    <i class="fa fa-money-bill-alt"></i>
                </a>
                <a href="#" v-if="!row.deposit_approve_date" class="btn btn-primary btn-icon btn-sm" @click="updateFixedDepositModal(row)" title="EDIT">
                    <i class="fa fa-edit"></i>
                </a>
                <!-- <a href="#" class="btn btn-danger btn-icon btn-sm" @click="invalidFixedDepositAct(row)" title="INVALID">
                    <i class="fa fa-times"></i>
                </a> -->
            </template>
        </Table>
        <Page class="m-t-10" :total="table.fixedDepositTable.total" :page-size="table.fixedDepositTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.addOrUpdateDeposit" :title="textMap[dialogStatus]" width="800">
        <Form ref="depositForm" :model="depositForm" :rules="depositRule" :label-width="160" style="padding-right: 80px;">
            <FormItem label="Customer" prop="fixed_deposit_customer_id">
                <Select ref="customer" v-model="depositForm.fixed_deposit_customer_id" filterable remote :remote-method="searchCustomer" :loading="customer.loading" placeholder="Select Customer" :disabled ="dialogStatus === 'update'">
                    <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
                </Select>
            </FormItem>
            <FormItem label="Deposit Type" prop="fixed_deposit_type">
                <RadioGroup v-model="depositForm.fixed_deposit_type">
                    <Radio v-for="item in pagePara.DEPOSIT_TYPE" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;" :disabled ="dialogStatus === 'update'">{{item.text}}</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem label="Working Range">
                <Row>
                    <Col span="8">
                        <FormItem prop="deposit_begin_date">
                            <DatePicker type="date" placeholder="Select begin date" v-model="depositForm.deposit_begin_date" format="yyyy-MM-dd" :options="dateOptions" @on-change="beginDateChange"></DatePicker>
                         </FormItem> 
                    </Col>
                    <Col span="2" style="padding-left: 6px;">
                        TO
                    </Col>
                    <Col span="8">
                        <FormItem prop="deposit_expire_date" v-if="!depositForm.deposit_long_term">
                            <DatePicker type="date" placeholder="Select expire date" v-model="depositForm.deposit_expire_date" format="yyyy-MM-dd" :options="dateOptions" @on-change="expireDateChange"></DatePicker>
                         </FormItem> 
                    </Col>
                    <Col span="6">
                        <Checkbox v-model="depositForm.deposit_long_term">Long Term</Checkbox>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="Guarantee Letter No." prop="deposit_guarantee_letter_no" v-if="depositForm.fixed_deposit_type === 'GU'">
                <Input v-model="depositForm.deposit_guarantee_letter_no" placeholder="Enter your guarantee letter no."></Input>
            </FormItem>
            <FormItem label="Guarantee Letter" prop="deposit_guarantee_letter_list" v-if="depositForm.fixed_deposit_type === 'GU'">
                <Upload
                    ref="upload"
                    :headers="uploadHeaders"
                    :on-success="handleUploadSuccess"
                    :on-error="handleError"
                    :on-remove="handleUploadRemove"
                    type="drag"
                    action="/api/zhongtan/fee/CustomerFixedDeposit/upload">
                    <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>Click or drag files here to upload</p>
                    </div>
                </Upload>
            </FormItem>
            <FormItem label="Amount" prop="deposit_amount" v-if="depositForm.fixed_deposit_type === 'FD'">
                <Input v-model="depositForm.deposit_amount" placeholder="Enter your amount">
                    <Select slot="prepend" v-model="depositForm.deposit_check_cash" style="width: 100px" :disabled ="dialogStatus === 'update'">
                        <Option v-for="item in pagePara.CASH_BANK" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                    <Select slot="append" v-model="depositForm.deposit_currency" style="width: 100px" :disabled ="dialogStatus === 'update'">
                        <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </Input>
            </FormItem>
            <FormItem label="Check No." v-if="depositForm.fixed_deposit_type === 'FD' && depositForm.deposit_check_cash === 'CHEQUE'">
                <Input v-model="depositForm.deposit_check_cash_no" placeholder="Enter your Check No."></Input>
            </FormItem>
            <FormItem label="Bank Reference" v-if="depositForm.fixed_deposit_type === 'FD' && depositForm.deposit_check_cash === 'TRANSFER'">
                <Input v-model="depositForm.deposit_bank_reference_no" placeholder="Enter your Bank Reference"></Input>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.addOrUpdateDeposit=false">Cancel</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'create'" @click="addFixedDepositAct">Submit</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'update'" @click="updateFixedDepositAct">Submit</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/fee/CustomerFixedDeposit/'

export default {
  data: function() {
    return {
        dateOptions: {
            shortcuts: [
                {
                    text: 'Today',
                    value () {
                        return moment().toDate()
                    }
                },
                {
                    text: 'Tomorrow',
                    value () {
                        return moment().add(1, 'day').toDate()
                    }
                },
                {
                    text: 'One week',
                    value () {
                        return moment().add(1, 'week').toDate()
                    }
                },
                {
                    text: 'One month',
                    value () {
                        return moment().add(1, 'month').toDate()
                    }
                }
            ]
        },
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
                height: common.getTableHeight(),
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
        modal: { addOrUpdateDeposit: false},
        dialogStatus: 'create',
        textMap: {
            update: 'Edit Fee',
            create: 'Add Fee'
        },
        depositForm: {
            fixed_deposit_id: '',
            fixed_deposit_customer_id: '',
            fixed_deposit_type: '',
            deposit_begin_date: moment().format('YYYY-MM-DD'),
            deposit_expire_date: '',
            deposit_long_term: false,
            deposit_guarantee_letter_no: '',
            deposit_guarantee_letter_list: '',
            deposit_amount: '',
            deposit_check_cash: 'TRANSFER',
            deposit_check_cash_no: '',
            deposit_currency: 'USD'
        },
        depositRule: {
            fixed_deposit_customer_id: [
                { required: true, message: 'The customer cannot be empty', trigger: 'change' }
            ],
            fixed_deposit_type: [
                { required: true, message: 'The deposit type cannot be empty', trigger: 'change' }
            ],
            deposit_guarantee_letter_no: [
                { required: true, message: 'The guarantee letter No. cannot be empty', trigger: 'blur' }
            ],
            deposit_amount: [
                { required: true, message: 'The amount cannot be empty', trigger: 'blur' },
                { type: 'number', message: 'The amount must be number', trigger: 'blur' , transform(value) { return Number(value)}}
            ]
        },
        customer: {
          options: [],
          loading: false
        },
        uploadHeaders: common.uploadHeaders(),
        files: {
            fileList: []
        },
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
    resetDepositForm: function() {
        this.depositForm = {
            fixed_deposit_id: '',
            fixed_deposit_customer_id: '',
            fixed_deposit_type: '',
            deposit_begin_date: moment().format('YYYY-MM-DD'),
            deposit_expire_date: '',
            deposit_long_term: false,
            deposit_guarantee_letter_no: '',
            deposit_guarantee_letter_list: '',
            deposit_amount: '',
            deposit_check_cash: 'TRANSFER',
            deposit_check_cash_no: '',
            deposit_currency: 'USD'
        }
    },
    addFixedDepositModal: async function() {
        this.$nextTick(() => {
            this.resetDepositForm()
            this.dialogStatus = 'create'
            this.$refs['depositForm'].resetFields()
            this.modal.addOrUpdateDeposit = true
        })
    },
    addFixedDepositAct: function() {
        this.$refs['depositForm'].validate(async valid => {
            if (valid) {
                try {
                    if(this.depositForm.fixed_deposit_type === 'GU' && (!this.depositForm.deposit_guarantee_letter_list || this.depositForm.deposit_guarantee_letter_list.length < 1)) {
                        this.$Message.error('Please upload guarantee letter')
                        return
                    }
                    await this.$http.post(apiUrl + 'create', this.depositForm)
                    this.getTableData()
                    this.$Message.success('Add Fee Success')
                    this.modal.addOrUpdateDeposit = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    updateFixedDepositModal: async function(row) {
        this.resetDepositForm()
        this.dialogStatus = 'update'
        this.$refs.customer.reset()
        this.customer.loading = true
        this.customer.options = JSON.parse(JSON.stringify(row.customerINFO))
        this.customer.loading = false
        this.$nextTick(function() {
            this.$refs['depositForm'].resetFields()
            this.depositForm = Object.assign({}, row)
            this.depositForm.deposit_long_term = row.deposit_long_term == '1'
            this.modal.addOrUpdateDeposit = true
        })
    },
    updateFixedDepositAct: async function() {
        this.$refs['depositForm'].validate(async valid => {
            if (valid) {
                try {
                    if(this.depositForm.fixed_deposit_type === 'GU' && (!this.depositForm.deposit_guarantee_letter_list || this.depositForm.deposit_guarantee_letter_list.length < 1)) {
                        this.$Message.error('Please upload guarantee letter')
                        return
                    }
                    await this.$http.post(apiUrl + 'update', this.depositForm)
                    this.getTableData()
                    this.$Message.success('Update Fee Success')
                    this.modal.addOrUpdateDeposit = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    invoiceFixedDepositAct: async function(row) {
        try {
            await this.$http.post(apiUrl + 'invoice', row)
            this.getTableData()
            this.$Message.success('Fixed Deposit Invoice Success')
        } catch (error) {
            this.$commonact.fault(error)
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
    realseFixedDepositAct: async function(row, index) {
        try {
            await this.$http.post(apiUrl + 'release', row)
            this.getTableData()
            this.$Message.success('Fixed Deposit Release Success')
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
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.depositForm.deposit_guarantee_letter_list = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleError(err, res, file) {
      console.log(err)
      let msg = ''
      if(res && res.msg) {
        msg = res.msg
      } else {
        msg = 'unknown error'
      }
      let name = ''
      if(file && file.name) {
        name = file.name
      }
      this.$Notice.error({
        title: 'Upload Failed',
        desc: 'File: ' + name + msg
      })
    },
    handleUploadRemove(file, fileList) {
        const index = this.depositForm.deposit_guarantee_letter_list.indexOf(file)
        this.depositForm.deposit_guarantee_letter_list.splice(index, 1)
    },
    beginDateChange: async function(date) {
      this.depositForm.deposit_begin_date = date
    },
    expireDateChange: async function(date) {
      this.depositForm.deposit_expire_date = date
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