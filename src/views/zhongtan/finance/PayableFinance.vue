<template>
    <div>
      <!-- begin breadcrumb -->
      <ol class="breadcrumb pull-right">
        <li class="breadcrumb-item active">
          <a href="javascript:;">Finance</a>
        </li>
      </ol>
      <!-- end breadcrumb -->
      <!-- begin page-header -->
      <h1 class="page-header">
        Payable/Paymnet
        <small></small>
      </h1>
      <!-- end page-header -->
      <panel title="Payable/Paymnet">
        <Tabs @on-click="changeTabAct">
            <TabPane label="Payable" name="PayableTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Receipt Date: <DatePicker type="daterange" :value="search_data.receipt_date" style="width:200px"  placeholder="Receipt Date" @on-change="changeReceivableReceiptDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            <Select filterable clearable placeholder="Payment Items" v-model="search_data.items_type" style="width:200px"  @on-change="getPayableData(1)">
                                <Option v-for="item in pagePara.PAYMENT_ITEMS" :value="item.payment_items_code" :key="item.payment_items_code" :label="item.payment_items_name">
                                    <span style="float:left">{{ item.payment_items_name }}</span>
                                    <span style="float:right; color:black; font-weight: bold;">{{item.payment_items_code}}<span v-if="item.payment_items_type"> /{{ item.payment_items_type }}</span></span>
                                </Option>
                            </Select>
                        </div>
                        <div class="form-group m-r-2">
                            Inv/Cntrl: <Input v-model="search_data.inv_cntrl" style="width:200px"  placeholder="Inv/Cntrl"></Input>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getPayableData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-success" @click="submitPayable()" :disabled="buttonAuth.sendPayable"><i class="fa fa-check"></i> Send Payable</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="payableTable" :columns="payableTable.columns" :data="payableTable.data" :height="payableTable.height" :border="payableTable.data && payableTable.data.length > 0" @on-selection-change="selectReceivableAct">
                    <template slot-scope="{ row, index }" slot="payment_advice_no">
                        <span style="float: left;">{{ row.payment_advice_no }}</span>
                        <span style="float: right;">
                            <Poptip v-if="row._disabled" word-wrap trigger="hover" placement="right" width="300" :content="row._disabled_message">
                                <i class="fa fa-question" style="color:red; margin-right: 7px;"/>
                            </Poptip>
                            <Tooltip content="PAYMENT">
                                <a :href="row.payment_advice_file_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="vessel_voyage">
                        <span style="float: left;">
                            {{ row.payment_advice_vessel }}/{{ row.payment_advice_voyage }}
                        </span>
                        <span style="float: right; color:black;">
                            {{ row.payment_advice_vessel_date }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_items">
                        {{ row.payment_advice_items_name }}
                        <span style="float: right; color:black; font-weight: bold;">{{ row.payment_advice_items }}<span v-if="row.payment_advice_items_type">/{{ row.payment_advice_items_type }}</span></span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payable_subject_code">
                        <span style="float: left;"><span style="color:blue; font-weight: bold;">Cr: </span>{{ row.item_code_payable_credit }}</span>
                        <span style="float: right;"><span style="color:red; font-weight: bold;">Dr: </span>{{ row.item_code_payable_debit }}</span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_amount">
                        <span style="float: left;">
                            {{ row.payment_advice_currency }}
                            <span style="color:green; font-weight: bold;">{{ row.payment_advice_amount }}</span> 
                        </span>
                        <span style="float: right;">
                            <span v-if="row.payment_advice_currency === 'TZS'">[{{ row.payment_advice_rate }}]</span>
                            {{ row.payment_advice_method }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_beneficiary">
                        <span style="color:green; font-weight: bold;" v-if="row.payment_advice_beneficiary_u8_vendor_code">V:{{row.payment_advice_beneficiary_u8_vendor_code}}</span> 
                        {{ row.payment_advice_beneficiary_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_remark">
                        <span style="color:green; font-weight: bold;" v-if="row.payment_advice_remarks_u8_vendor_code">V:{{row.payment_advice_remarks_u8_vendor_code}}</span> 
                        <span style="color:black; font-weight: bold;">BILLS TO</span> 
                        {{ row.payment_advice_remarks_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_from">
                        {{ row.receipt_from }}
                        <span style="color:green;">{{ row.receipt_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="payableTable.current" :total="payableTable.total" show-sizer show-total show-elevator :page-size="payableTable.limit" @on-change="getPayableData" @on-page-size-change="resetReceivableTableSize"/>
            </TabPane>
            <TabPane label="Payment" name="PaymentTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Payable Date: <DatePicker type="daterange" :value="payment_search_data.payable_date" style="width:200px"  placeholder="Payable Date" @on-change="changePaymentPayableDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            Inv/Cntrl: <Input v-model="payment_search_data.inv_cntrl" style="width:200px"  placeholder="Inv/Cntrl"></Input>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getPaymentData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-success" @click="submitPayment()" :disabled="buttonAuth.sendPayment"><i class="fa fa-check"></i> Send Payment</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="paymentTable" :columns="paymentTable.columns" :data="paymentTable.data" :height="paymentTable.height" :border="paymentTable.data && paymentTable.data.length > 0" @on-selection-change="selectPaymnetAct">
                    <template slot-scope="{ row, index }" slot="payment_advice_no">
                        <span style="float: left;">{{ row.payment_advice_no }}</span>
                        <span style="float: right;">
                            <Poptip v-if="row._disabled" word-wrap trigger="hover" placement="right" width="300" :content="row._disabled_message">
                                <i class="fa fa-question" style="color:red; margin-right: 7px;"/>
                            </Poptip>
                            <Tooltip content="Payable">
                                <a  href="#" class="btn btn-info btn-icon btn-sm" @click="watchU8Payable(row)">
                                    <i class="fa fa-eye "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="PAYMENT">
                                <a :href="row.payment_advice_file_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="vessel_voyage">
                        <span style="float: left;">
                            {{ row.payment_advice_vessel }}/{{ row.payment_advice_voyage }}
                        </span>
                        <span style="float: right; color:black;">
                            {{ row.payment_advice_vessel_date }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_items">
                        {{ row.payment_advice_items_name }}
                        <span style="float: right; color:black; font-weight: bold;">{{ row.payment_advice_items }}<span v-if="row.payment_advice_items_type">/{{ row.payment_advice_items_type }}</span></span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payable_subject_code">
                        <span style="float: right;"><span style="color:red; font-weight: bold;">Dr: </span>{{ row.item_code_payment_debit }}</span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_amount">
                        <span style="float: left;">
                            {{ row.payment_advice_currency }}
                            <span style="color:green; font-weight: bold;">{{ row.payment_advice_amount }}</span> 
                        </span>
                        <span style="float: right;">
                            <span v-if="row.payment_advice_currency === 'TZS'">[{{ row.payment_advice_amount_rate }}]</span>
                            {{ row.payment_advice_method }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_beneficiary">
                        <span style="color:green; font-weight: bold;">V:{{row.payment_advice_beneficiary_u8_vendor_code}}</span> 
                        {{ row.payment_advice_beneficiary_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_remark">
                        <span style="color:green; font-weight: bold;">V:{{row.payment_advice_remarks_u8_vendor_code}}</span> 
                        <span style="color:black; font-weight: bold;">BILLS TO</span> 
                        {{ row.payment_advice_remarks_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_from">
                        {{ row.receipt_from }}
                        <span style="color:green;">{{ row.receipt_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="paymentTable.current" :total="paymentTable.total" show-sizer show-total show-elevator :page-size="paymentTable.limit" @on-change="getPaymentData" @on-page-size-change="resetReceivedTableSize"/>
            </TabPane>
            <TabPane label="Complete" name="CompleteTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Payable Date: <DatePicker type="daterange" :value="complete_search_data.payable_date" style="width:200px"  placeholder="Payable Date" @on-change="changeCompletePayableDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            Payment Date: <DatePicker type="daterange" :value="complete_search_data.payment_date" style="width:200px"  placeholder="Payment Date" @on-change="changeCompletePaymentDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            Inv/Cntrl: <Input v-model="complete_search_data.inv_cntrl" style="width:200px"  placeholder="Inv/Cntrl"></Input>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getCompleteData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="completeTable" :columns="completeTable.columns" :data="completeTable.data" :height="completeTable.height" :border="completeTable.data && completeTable.data.length > 0">
                    <template slot-scope="{ row, index }" slot="payment_advice_no">
                        <span style="float: left;">{{ row.payment_advice_no }}</span>
                        <span style="float: right;">
                            <Tooltip content="U8 PAYABLE">
                                <a  href="#" class="btn btn-info btn-icon btn-sm" @click="watchU8Payable(row)">
                                    <i class="fa fa-eye "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="U8 PAYMENT">
                                <a href="#" class="btn btn-primary btn-icon btn-sm" @click="watchU8Payment(row)">
                                    <i class="fa fa-eye-dropper "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="PAYMENT">
                                <a :href="row.payment_advice_file_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="vessel_voyage">
                        <span style="float: left;">
                            {{ row.payment_advice_vessel }}/{{ row.payment_advice_voyage }}
                        </span>
                        <span style="float: right; color:black;">
                            {{ row.payment_advice_vessel_date }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_items">
                        {{ row.payment_advice_items_name }}
                        <span style="float: right; color:black; font-weight: bold;">{{ row.payment_advice_items }}<span v-if="row.payment_advice_items_type">/{{ row.payment_advice_items_type }}</span></span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_amount">
                        <span style="float: left;">
                            {{ row.payment_advice_currency }}
                            <span style="color:green; font-weight: bold;">{{ row.payment_advice_amount }}</span> 
                        </span>
                        <span style="float: right;">
                            <span v-if="row.payment_advice_currency === 'TZS'">[{{ row.payment_advice_amount_rate }}]</span>
                            {{ row.payment_advice_method }}
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_advice_beneficiary">
                        <span style="color:green; font-weight: bold;">C:{{row.payment_advice_beneficiary_u8_customerr_code}}</span> 
                        {{ row.payment_advice_beneficiary_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="payment_remark">
                        <span style="color:green; font-weight: bold;">V:{{row.payment_advice_remarks_u8_vendor_code}}</span> 
                        <span style="color:black; font-weight: bold;">BILLS TO</span> 
                        {{ row.payment_advice_remarks_name }}
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_from">
                        {{ row.receipt_from }}
                        <span style="color:green;">{{ row.receipt_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="completeTable.current" :total="completeTable.total" show-sizer show-total show-elevator :page-size="completeTable.limit" @on-change="getCompleteData" @on-page-size-change="resetCompleteTableSize"/>
            </TabPane>
        </Tabs>
      </panel>
      <Modal v-model="modal.u8OughtPayModal" title="U8 Ought Pay" width="800" >
        <Form ref="u8OughtPayForm" :model="watchOughtPay" :label-width="120">
            <FormItem label="CODE">{{ watchOughtPay.code }}</FormItem>
            <FormItem label="CUSTOMER">{{ watchOughtPay.cusname }}</FormItem>
            <FormItem label="SUBJECT CODE">{{ watchOughtPay.subjectcode }}</FormItem>
            <FormItem label="AMOUNT">{{ watchOughtPay.amount }}</FormItem>
            <FormItem label="DIGEST">{{ watchOughtPay.digest }}</FormItem>
            <FormItem label="DATE">{{ watchOughtPay.date }}</FormItem>
            <FormItem label="ENTRY">
                <Table :columns="u8OughtPayTable.columns" :data="watchOughtPay.entry"></Table>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.u8OughtPayModal=false">Cancel</Button>
        </div>
      </Modal>
      <Modal v-model="modal.u8PaymnetModal" title="U8 Ought Payment" width="800" >
        <Form ref="u8OughtPaymentForm" :model="watchPayment" :label-width="120">
            <FormItem label="CODE">{{ watchPayment.vouchcode }}</FormItem>
            <FormItem label="VENDOR">{{ watchPayment.vendorname }}</FormItem>
            <FormItem label="SUBJECT CODE">{{ watchPayment.balanceitemcode }}</FormItem>
            <FormItem label="AMOUNT">Amount: {{ watchPayment.amount }}/Original: {{ watchPayment.originalamount }}</FormItem>
            <FormItem label="DIGEST">{{ watchPayment.digest }}</FormItem>
            <FormItem label="DATE">{{ watchPayment.vouchdate }}</FormItem>
            <FormItem label="ENTRY">
                <Table :columns="u8PaymnetTable.columns" :data="watchPayment.entry">
                    <template slot-scope="{ row, index }" slot="amount">
                        <div>Amount: {{ row.amount }}</div>
                        <div>Original: {{ row.originalamount }}</div>
                    </template>
                </Table>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.u8PaymnetModal=false">Cancel</Button>
        </div>
      </Modal>
    </div>
  </template>
  <script>
  const common = require('@/lib/common')
  const moment = require('moment')
  import PageOptions from '../../../config/PageOptions.vue'
  const apiUrl = '/api/zhongtan/finance/PayableFinance/'
  
  export default {
    name: 'PayableFinance',
    data: function() {
      return {
        pagePara: {},
        modal: {
            receivedBankEditModal: false, u8OughtPayModal: false, u8PaymnetModal: false
        },
        search_data: {
            receipt_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            items_type: '',
            inv_cntrl: ''
        },
        payableTable: {
            columns: [
                {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Payment No.',
                    slot: 'payment_advice_no',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Vessel/Voyage',
                    slot: 'vessel_voyage',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Item',
                    slot: 'payment_advice_items',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Subject Code',
                    slot: 'payable_subject_code',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Payment Amount',
                    slot: 'payment_amount',
                    width: 280,
                    align: 'center'
                },
                {
                    title: 'Payment Beneficiary',
                    slot: 'payment_advice_beneficiary',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Remark',
                    slot: 'payment_remark',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Inv/Cntrl#	',
                    key: 'payment_advice_inv_cntrl',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Date',
                    key: 'create_date',
                    width: 160,
                    align: 'left'
                },
            ],
            data: [],
            height: common.getTableHeight(),
            limit: 10,
            offset: 0,
            total: 0,
            current: 1
        },
        buttonAuth: {
            sendPayable: true, sendPayment: true
        },
        payment_search_data: {
            payable_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            inv_cntrl: ''
        },
        paymentTable: {
            columns: [
                {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Payment No.',
                    slot: 'payment_advice_no',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Vessel/Voyage',
                    slot: 'vessel_voyage',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Payment Item',
                    slot: 'payment_advice_items',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Subject Code',
                    slot: 'payable_subject_code',
                    width: 120,
                    align: 'left'
                },
                {
                    title: 'Payment Amount',
                    slot: 'payment_amount',
                    width: 280,
                    align: 'center'
                },
                {
                    title: 'Payment Beneficiary',
                    slot: 'payment_advice_beneficiary',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Remark',
                    slot: 'payment_remark',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Inv/Cntrl#	',
                    key: 'payment_advice_inv_cntrl',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payable Date',
                    key: 'create_date',
                    width: 160,
                    align: 'left'
                },
            ],
            data: [],
            height: common.getTableHeight(),
            limit: 10,
            offset: 0,
            total: 0,
            current: 1
        },
        watchOughtPay: {},
        u8OughtPayTable: {
            columns: [
                {
                    title: 'Subject Code',
                    key: 'subjectcode',
                    width: 140,
                    align: 'center'
                },
                {
                    title: 'Amount',
                    key: 'amount',
                    width: 100,
                    align: 'right'
                },
                {
                    title: 'Currency',
                    key: 'currency_name',
                    width: 100,
                    align: 'center'
                },
                {
                    title: 'Rate',
                    key: 'currency_rate',
                    width: 80,
                    align: 'center'
                },
                {
                    title: 'Digest',
                    key: 'digest',
                    align: 'left'
                },
            ]
        },
        complete_search_data: {
            payable_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            payment_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            inv_cntrl: ''
        },
        completeTable: {
            columns: [
            {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Payment No.',
                    slot: 'payment_advice_no',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Vessel/Voyage',
                    slot: 'vessel_voyage',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Payment Item',
                    slot: 'payment_advice_items',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Amount',
                    slot: 'payment_amount',
                    width: 280,
                    align: 'center'
                },
                {
                    title: 'Payment Beneficiary',
                    slot: 'payment_advice_beneficiary',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Remark',
                    slot: 'payment_remark',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payment Inv/Cntrl#	',
                    key: 'payment_advice_inv_cntrl',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Payable Date',
                    key: 'finance_payable_at',
                    width: 160,
                    align: 'left'
                },
                {
                    title: 'Payment Date',
                    key: 'finance_payment_at',
                    width: 160,
                    align: 'left'
                },
            ],
            data: [],
            height: common.getTableHeight(),
            limit: 10,
            offset: 0,
            total: 0,
            current: 1
        },
        watchPayment: {},
        u8PaymnetTable: {
            columns: [
                {
                    title: 'Subject Code',
                    key: 'itemcode',
                    width: 140,
                    align: 'center'
                },
                {
                    title: 'Amount',
                    slot: 'amount',
                    width: 200,
                    align: 'right'
                },
                {
                    title: 'Currency',
                    key: 'currency_name',
                    width: 100,
                    align: 'center'
                },
                {
                    title: 'Rate',
                    key: 'currency_rate',
                    width: 80,
                    align: 'center'
                },
                {
                    title: 'Digest',
                    key: 'digest',
                    align: 'left'
                },
            ]
        },
        splitReceivedList: []
      }
    },
    created() {
      PageOptions.pageEmpty = false
    },
    mounted: function() {
      this.handleInitData()
      this.getPayableData(1)
    },
    methods: {
      handleInitData: async function() {
        try {
          let response = await this.$http.post(apiUrl + 'init', {})
          this.pagePara = JSON.parse(JSON.stringify(response.data.info))
        } catch (error) {
          this.$commonact.fault(error)
        }
      },
      changeTabAct: function(name) {
        if(name === 'PayableTab') {
            this.getPayableData()
        } else if (name === 'PaymentTab'){
            this.getPaymentData()
        } else if(name === 'CompleteTab') {
            this.getCompleteData()
        }
      },
      changeReceivableReceiptDate: function(e) {
        this.search_data.receipt_date = JSON.parse(JSON.stringify(e))
        this.getPayableData(1)
      },
      getPayableData: async function(index) {
        try {
            if (index) {
            this.payableTable.current = index
            this.payableTable.offset = (index - 1) * this.payableTable.limit
            }
            let searchPara = {
                search_data: this.search_data,
                offset: this.payableTable.offset,
                limit: this.payableTable.limit
            }
            let response = await this.$http.post(apiUrl + 'queryPayable', searchPara)
            let data = response.data.info
            this.payableTable.total = data.total
            this.payableTable.data = JSON.parse(JSON.stringify(data.rows))
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      resetReceivableTableSize: function(pageSize) {
        this.payableTable.limit = pageSize
        this.getPayableData(1)
      },
      selectReceivableAct: async function(selection) {
        if(selection && selection.length > 0) {
            this.buttonAuth.sendPayable = false
        } else {
            this.buttonAuth.sendPayable = true
        }
      },
      submitPayable: async function() {
        let submit_payable_list = this.$refs.payableTable.getSelection()
        if(submit_payable_list && submit_payable_list.length > 0) {
            this.$commonact.confirm('Confirm Send Payable to U8 System?', async () => {
                try {
                    let response = await this.$http.post(apiUrl + 'submitPayable', {payable_list: submit_payable_list})
                    let data = response.data.info
                    this.getPayableData()
                    if(data.code === '1') {
                        this.$Message.success('Submit Payable success')
                    } else {
                        this.$Message.error(data.errMessage)
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            })
        } else {
            return this.$Message.error('Please select Payable order')
        }
      },
      changePaymentPayableDate: function(e) {
        this.payment_search_data.payable_date = JSON.parse(JSON.stringify(e))
        this.getPaymentData(1)
      },
      getPaymentData: async function(index) {
        try {
            if (index) {
                this.paymentTable.current = index
                this.paymentTable.offset = (index - 1) * this.paymentTable.limit
            }
            let searchPara = {
                search_data: this.payment_search_data,
                offset: this.paymentTable.offset,
                limit: this.paymentTable.limit
            }
            let response = await this.$http.post(apiUrl + 'queryPayment', searchPara)
            let data = response.data.info
            this.paymentTable.total = data.total
            this.paymentTable.data = JSON.parse(JSON.stringify(data.rows))
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      resetReceivedTableSize: function(pageSize) {
        this.paymentTable.limit = pageSize
        this.getPaymentData(1)
      },
      selectPaymnetAct: async function(selection) {
        if(selection && selection.length > 0) {
            let _disabled = true
            for(let s of selection) {
                _disabled = _disabled && !s._disabled_received
            }
            this.buttonAuth.sendPayment = !_disabled
        } else {
            this.buttonAuth.sendPayment = true
        }
      },
      watchU8Payable: async function(row) {
        try {
            let response = await this.$http.post(apiUrl + 'watchU8Payable', row)
            this.watchOughtPay = response.data.info
            this.modal.u8OughtPayModal = true
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      submitPayment: async function() {
        let submit_payment_list = this.$refs.paymentTable.getSelection()
        if(submit_payment_list && submit_payment_list.length > 0) {
            this.$commonact.confirm('Confirm Send Payment to U8 System?', async () => {
                try {
                    let response = await this.$http.post(apiUrl + 'submitPayment', {payment_list: submit_payment_list})
                    let data = response.data.info
                    this.getPaymentData()
                    if(data.code === '1') {
                        this.$Message.success('Submit Payment success')
                    } else {
                        this.$Message.error(data.errMessage)
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            })
        } else {
            return this.$Message.error('Please select Payment order')
        }
      },
      changeCompletePayableDate: function(e) {
        this.complete_search_data.payable_date = JSON.parse(JSON.stringify(e))
        this.getCompleteData(1)
      },
      changeCompletePaymentDate: function(e) {
        this.complete_search_data.received_date = JSON.parse(JSON.stringify(e))
        this.getCompleteData(1)
      },
      getCompleteData: async function(index) {
        try {
            if (index) {
                this.completeTable.current = index
                this.completeTable.offset = (index - 1) * this.completeTable.limit
            }
            let searchPara = {
                search_data: this.complete_search_data,
                offset: this.completeTable.offset,
                limit: this.completeTable.limit
            }
            let response = await this.$http.post(apiUrl + 'queryComplete', searchPara)
            let data = response.data.info
            this.completeTable.total = data.total
            this.completeTable.data = JSON.parse(JSON.stringify(data.rows))
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      resetCompleteTableSize: function(pageSize) {
        this.completeTable.limit = pageSize
        this.getCompleteData(1)
      },
      watchU8Payment: async function(row) {
        try {
            let response = await this.$http.post(apiUrl + 'watchPayment', row)
            this.watchPayment = response.data.info
            this.modal.u8PaymnetModal = true
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
    }
  }
  </script>