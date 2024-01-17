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
        Receivable/Received
        <small></small>
      </h1>
      <!-- end page-header -->
      <panel title="Receivable/Received">
        <Tabs @on-click="changeTabAct">
            <TabPane label="Receivable" name="ReceivableTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Receipt Date: <DatePicker type="daterange" :value="search_data.receipt_date" style="width:200px"  placeholder="Receipt Date" @on-change="changeReceivableReceiptDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            <Select clearable v-model="search_data.receipt_type" style="width:200px"  @on-change="getReceivableData(1)">
                                <Option v-for="item in pagePara.RECEIPT_TYPES" :value="item.value" :key="item.value">{{ item.name }}</Option>
                            </Select>
                        </div>
                        <div class="form-group m-r-2">
                            <Select clearable v-model="search_data.receipt_carrier" style="width:200px"  @on-change="getReceivableData(1)">
                                <Option v-for="item in pagePara.RECEIPT_CARRIER" :value="item.id" :key="item.id">{{ item.text }}</Option>
                            </Select>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getReceivableData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-success" @click="submitReceivable()" :disabled="buttonAuth.sendReceivable"><i class="fa fa-check"></i> Send Receivable</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="receivableTable" :columns="receivableTable.columns" :data="receivableTable.data" :height="receivableTable.height" :border="receivableTable.data && receivableTable.data.length > 0" @on-selection-change="selectReceivableAct">
                    <template slot-scope="{ row, index }" slot="receipt_no">
                        <span style="float: left;">{{ row.receipt_no }}</span>
                        <span style="float: right;">
                            <Tooltip content="SYNC">
                                <a href="#" class="btn btn-warning btn-icon btn-sm" @click="syncU8Receivable(row)">
                                    <i class="fa fa-sync "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="RECEIPT">
                                <a  :href="row.receipt_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_type">
                        <span style="float: left;">{{ row.receipt_type }}</span>
                        <span style="float: right;" v-if="row._disabled">
                            <Poptip word-wrap trigger="hover" placement="right" width="300" :content="row._disabled_message">
                                <i class="fa fa-question" style="color:red;"/>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_amount">
                        <span style="float: left;">
                            {{ row.receipt_currency }}
                            <span v-if="row.receipt_amount === row.receipt_detail_total" style="color:green; font-weight: bold;">{{ row.receipt_amount }}</span> 
                            <span v-else style="color:red; font-weight: bold;">{{ row.receipt_amount }}</span> 
                            [{{ row.parent_code }}]
                        </span>
                        <span style="float: right;">
                            <Poptip placement="right" width="300">
                                <a  href="#" class="btn btn-icon btn-sm">
                                    <i class="fa fa-list"/>
                                </a>
                                <template #content>
                                    <List>
                                        <ListItem v-for="(item, index) in row.receipt_detail" :key="index">
                                            <div style="width: 100%;">
                                                <span style="float: left;">{{ item.fee_name }}[<span style="color:green; font-weight: bold;">{{ item.fee_code }}</span>]</span>
                                                <span style="float: right;">{{ item.fee_amount }}</span>
                                            </div>
                                        </ListItem>
                                    </List>
                                </template>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="receipt_reference_no">
                        <span style="float: left;">{{ row.receipt_bank }}</span>
                        <span style="float: right; color:green;">{{ row.receipt_reference_no }}</span> 
                    </template>
                    
                    <template slot-scope="{ row, index }" slot="receipt_from">
                        {{ row.receipt_from }}
                        <span style="color:green;">{{ row.receipt_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="receivableTable.current" :total="receivableTable.total" show-sizer show-total show-elevator :page-size="receivableTable.limit" @on-change="getReceivableData" @on-page-size-change="resetReceivableTableSize"/>
            </TabPane>
            <TabPane label="Received" name="ReceivedTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Receivable Date: <DatePicker type="daterange" :value="received_search_data.receivable_date" style="width:200px"  placeholder="Receivable Date" @on-change="changeReceivedReceivableDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            <Select clearable v-model="received_search_data.receipt_carrier" style="width:200px"  @on-change="getReceivedData(1)">
                                <Option v-for="item in pagePara.RECEIPT_CARRIER" :value="item.id" :key="item.id">{{ item.text }}</Option>
                            </Select>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getReceivedData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="showReceivedBankEdit" :disabled="buttonAuth.receivedEdit"><i class="fa fa-edit"></i> Bank Edit</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-success" @click="submitReceived()" :disabled="buttonAuth.sendReceived"><i class="fa fa-check"></i> Send Received</button>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-success" @click="splitReceived()" :disabled="buttonAuth.sendReceived"><i class="fa fa-check"></i> Split Send Received</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="receivedTable" :columns="receivedTable.columns" :data="receivedTable.data" :height="receivedTable.height" :border="receivedTable.data && receivedTable.data.length > 0" @on-selection-change="selectReceivedAct">
                    <template slot-scope="{ row, index }" slot="ought_receive_no">
                        <span style="float: left;">{{ row.ought_receive_no }}</span>
                        <span style="float: right;">
                            <Tooltip content="RECEIVABLE">
                                <a  href="#" class="btn btn-info btn-icon btn-sm" @click="watchU8Receviable(row)">
                                    <i class="fa fa-eye "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="RECEIPT">
                                <a  :href="row.receipt_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_type">
                        <span style="float: left;">{{ row.ought_receive_type }}</span>
                        <span style="float: right;" v-if="row._disabled_received">
                            <Poptip word-wrap trigger="hover" placement="right" width="300" :content="row._disabled_message">
                                <i class="fa fa-question" style="color:red;"/>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_amount">
                        <span style="float: left;">
                            {{ row.ought_receive_currency }}
                            <span style="color:green; font-weight: bold;">{{ row.ought_receive_amount }}</span> 
                            [{{ row.parent_code }}]
                        </span>
                        <span style="float: right;">
                            <Poptip placement="right" width="300">
                                <a  href="#" class="btn btn-icon btn-sm">
                                    <i class="fa fa-list"/>
                                </a>
                                <template #content>
                                    <List>
                                        <ListItem v-for="(item, index) in row.receive_detail" :key="index">
                                            <div style="width: 100%;">
                                                <span style="float: left;">{{ item.ought_receive_detail_fee_name }}(<span style="color:green; font-weight: bold;">{{ item.received_fee_code }}</span>)</span>
                                                <span style="float: right;">{{ item.ought_receive_detail_amount }}</span>
                                            </div>
                                        </ListItem>
                                    </List>
                                </template>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_reference_no">
                        <span style="float: left;">{{ row.ought_receive_bank }}</span>
                        <span style="float: right; color:green;">{{ row.ought_receive_reference_no }}</span> 
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_from">
                        {{ row.ought_receive_from }}
                        <span style="color:green;">{{ row.ought_receive_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="receivedTable.current" :total="receivedTable.total" show-sizer show-total show-elevator :page-size="receivedTable.limit" @on-change="getReceivedData" @on-page-size-change="resetReceivedTableSize"/>
            </TabPane>
            <TabPane label="Complete" name="CompleteTab">
                <div class="panel-toolbar">
                    <div class="form-inline">
                        <div class="form-group m-r-2">
                            Receivable Date: <DatePicker type="daterange" :value="complete_search_data.receivable_date" style="width:200px"  placeholder="Receivable Date" @on-change="changeCompleteReceivableDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            Received Date: <DatePicker type="daterange" :value="complete_search_data.received_date" style="width:200px"  placeholder="Received Date" @on-change="changeCompleteReceivedDate"></DatePicker>
                        </div>
                        <div class="form-group m-r-2">
                            <Select clearable v-model="complete_search_data.receipt_carrier" style="width:200px"  @on-change="getCompleteData(1)">
                                <Option v-for="item in pagePara.RECEIPT_CARRIER" :value="item.id" :key="item.id">{{ item.text }}</Option>
                            </Select>
                        </div>
                        <div class="form-group m-r-2">
                            <button type="button" class="btn btn-info" @click="getCompleteData(1)"><i class="fa fa-search"></i> Search</button>
                        </div>
                    </div>
                </div>
                <Table stripe size="small" ref="completeTable" :columns="completeTable.columns" :data="completeTable.data" :height="completeTable.height" :border="completeTable.data && completeTable.data.length > 0">
                    <template slot-scope="{ row, index }" slot="ought_receive_no">
                        <span style="float: left;">{{ row.ought_receive_no }}</span>
                        <span style="float: right;">
                            <Tooltip content="RECEIVABLE">
                                <a  href="#" class="btn btn-info btn-icon btn-sm" @click="watchU8Receviable(row)">
                                    <i class="fa fa-eye "/>
                                </a>
                            </Tooltip>
                            <Tooltip content="RECEIVED" v-if="row.ought_received_split === '0'">
                                <a href="#" class="btn btn-primary btn-icon btn-sm" @click="watchU8Receved(row)">
                                    <i class="fa fa-eye-dropper "/>
                                </a>
                            </Tooltip>
                            <Poptip placement="right" width="300" v-else>
                                <a href="#" class="btn btn-yellow btn-icon btn-sm">
                                    <i class="fa fa-eye-dropper "/>
                                </a>
                                <template #content>
                                    <List>
                                        <ListItem v-for="(item, index) in row.split_detail" :key="index">
                                            <div style="width: 100%;">
                                                <span style="float: left;">
                                                    {{ item.receive_split_bank }}
                                                </span>
                                                <span style="float: right;">
                                                    {{ item.receive_split_currency }}{{ item.receive_split_natamount }}
                                                    <a href="#" class="btn btn-primary btn-icon btn-sm" @click="watchU8SplitReceved(item)">
                                                        <i class="fa fa-eye-dropper "/>
                                                    </a>
                                                </span>
                                            </div>
                                        </ListItem>
                                    </List>
                                </template>
                            </Poptip>
                            <Tooltip content="RECEIPT">
                                <a  :href="row.receipt_url" class="btn btn-green btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-money-bill-alt "/>
                                </a>
                            </Tooltip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_type">
                        <span style="float: left;">{{ row.ought_receive_type }}</span>
                        <span style="float: right;" v-if="row._disabled_received">
                            <Poptip word-wrap trigger="hover" placement="right" width="300" :content="row._disabled_message">
                                <i class="fa fa-question" style="color:red;"/>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_amount">
                        <span style="float: left;">
                            {{ row.ought_receive_currency }}
                            <span style="color:green; font-weight: bold;">{{ row.ought_receive_amount }}</span> 
                        </span>
                        <span style="float: right;">
                            <Poptip placement="right" width="300">
                                <a  href="#" class="btn btn-icon btn-sm">
                                    <i class="fa fa-list"/>
                                </a>
                                <template #content>
                                    <List>
                                        <ListItem v-for="(item, index) in row.receive_detail" :key="index">
                                            <div style="width: 100%;">
                                                <span style="float: left;">{{ item.ought_receive_detail_fee_name }}</span>
                                                <span style="float: right;">{{ item.ought_receive_detail_amount }}</span>
                                            </div>
                                        </ListItem>
                                    </List>
                                </template>
                            </Poptip>
                        </span>
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_reference_no">
                        <span style="float: left;" v-if="row.ought_received_split === '0'">{{ row.ought_receive_bank }}</span>
                        <span style="float: right; color:green;">{{ row.ought_receive_reference_no }}</span> 
                    </template>
                    <template slot-scope="{ row, index }" slot="ought_receive_from">
                        {{ row.ought_receive_from }}
                        <span style="color:green;">{{ row.ought_receive_from_u8_code }}</span> 
                    </template>
                </Table>
                <Page class="m-t-10" :current="completeTable.current" :total="completeTable.total" show-sizer show-total show-elevator :page-size="completeTable.limit" @on-change="getCompleteData" @on-page-size-change="resetCompleteTableSize"/>
            </TabPane>
        </Tabs>
      </panel>
      <Modal v-model="modal.receivedBankEditModal" title="Received Bank Edit">
        <Form ref="receivedBankForm" :model="receivedBankForm" :label-width="120">
            <FormItem label="BANK INFO">
                <Select v-model="receivedBankForm.received_bank">
                    <Option v-for="item in pagePara.BANK_INFOS" :value="item.bank_code" :key="item.bank_code">
                        {{ item.bank_code }}
                        <span style="float:right;">{{ item.bank_name }}</span>
                    </Option>
                </Select>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.receivedBankEditModal=false">Cancel</Button>
            <Button type="primary" size="large" @click="submitReceivedBankEdit">Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.u8OughtReceiveModal" title="U8 Ought Receive" width="800" >
        <Form ref="u8OughtReceiveForm" :model="watchOughtReceive" :label-width="120">
            <FormItem label="CODE">{{ watchOughtReceive.code }}</FormItem>
            <FormItem label="CUSTOMER">{{ watchOughtReceive.cusname }}</FormItem>
            <FormItem label="SUBJECT CODE">{{ watchOughtReceive.subjectcode }}</FormItem>
            <FormItem label="AMOUNT">{{ watchOughtReceive.amount }}</FormItem>
            <FormItem label="DIGEST">{{ watchOughtReceive.digest }}</FormItem>
            <FormItem label="DATE">{{ watchOughtReceive.date }}</FormItem>
            <FormItem label="ENTRY">
                <Table :columns="u8OughtReceiveTable.columns" :data="watchOughtReceive.entry"></Table>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.u8OughtReceiveModal=false">Cancel</Button>
        </div>
      </Modal>
      <Modal v-model="modal.u8ReceivedModal" title="U8 Ought Received" width="800" >
        <Form ref="u8OughtReceivedForm" :model="watchReceived" :label-width="120">
            <FormItem label="CODE">{{ watchReceived.vouchcode }}</FormItem>
            <FormItem label="CUSTOMER">{{ watchReceived.customername }}</FormItem>
            <FormItem label="SUBJECT CODE">{{ watchReceived.balanceitemcode }}</FormItem>
            <FormItem label="AMOUNT">USD: {{ watchReceived.amount }}/TZS: {{ watchReceived.originalamount }}</FormItem>
            <FormItem label="DIGEST">{{ watchReceived.digest }}</FormItem>
            <FormItem label="DATE">{{ watchReceived.vouchdate }}</FormItem>
            <FormItem label="ENTRY">
                <Table :columns="u8ReceivedTable.columns" :data="watchReceived.entry">
                    <template slot-scope="{ row, index }" slot="amount">
                        <div>USD: {{ row.amount }}</div>
                        <div>TZS: {{ row.originalamount }}</div>
                    </template>
                </Table>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.u8ReceivedModal=false">Cancel</Button>
        </div>
      </Modal>
      <Modal v-model="modal.splitReceivedModal" title="Split Received" width="1200" >
        <Card v-for="(item, index) in splitReceivedList" :key="index" style="margin-bottom: 12px;">
            <template slot="title">
                <Row>
                    <Col span="6">
                        {{ item.ought_receive_no }}
                    </Col>
                    <Col span="4">
                        {{ item.ought_receive_type }}
                    </Col>
                    <Col span="4">
                        {{ item.ought_receive_currency }} <span style="color:green; font-weight: bold;" v-if="item.received_balance">{{ item.ought_receive_amount }}</span> <span style="color:red; font-weight: bold;" v-else>{{ item.ought_receive_amount }}</span> 
                    </Col>
                    <Col span="10">
                        Reference No.: {{ item.ought_receive_reference_no }}
                    </Col>
                </Row>
            </template>
            <!-- {{ item.split_detail }} -->
            <Card v-for="(sItem, sIndex) in item.split_detail" :key="sIndex" style="margin-bottom: 12px;">
                <Row>
                    <Col span="8">
                        Bank: 
                        <Select v-model="sItem.split_bank" style="width: 300px;">
                            <Option v-for="item in pagePara.BANK_INFOS" :value="item.bank_code" :key="item.bank_code">
                                {{ item.bank_code }}
                                <span style="float:right;">{{ item.bank_name }}</span>
                            </Option>
                        </Select>
                    </Col>
                    <Col span="8">
                        {{ sItem.split_currency }}
                        <span style="color:green; font-weight: bold;" v-if="item.received_balance">{{ sItem.split_amount }}</span> <span style="color:red; font-weight: bold;" v-else>{{ sItem.split_amount }}</span> 
                    </Col>
                    <Col span="8">
                        Reference No.: {{ sItem.split_reference_no }}
                    </Col>
                </Row>
                <Divider />
                <List border>
                    <ListItem v-for="(sdItem, sdIndex) in sItem.split_fees" :key="sdIndex">
                        <Row style="width: 100%;">
                            <Col span="8">
                                {{ sdItem.ought_receive_detail_fee_name }}
                            </Col>
                            <Col span="8">
                                <InputNumber v-model="sdItem.split_detail_amount" @on-change="changeSplitDetailAmount($event, index, sIndex, sdIndex)"></InputNumber>
                            </Col>
                            <Col span="8">
                                <span style="color:green; font-weight: bold;">{{ sdItem.ought_receive_detail_amount }}</span>
                                <i style="color:#2D8CF0; margin-left: 7px; cursor: pointer;" class="fa fa-check" @click="inputSplitDetailAmount($event, index, sIndex, sdIndex)"></i>
                            </Col>
                        </Row>
                    </ListItem>
                </List>
            </Card>
        </Card>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.splitReceivedModal=false">Cancel</Button>
            <Button type="primary" size="large" @click="submitSplitReceived">Submit</Button>
        </div>
    </Modal>
    </div>
  </template>
  <script>
  const common = require('@/lib/common')
  const moment = require('moment')
  import PageOptions from '../../../config/PageOptions.vue'
  const apiUrl = '/api/zhongtan/finance/ReceivableFinance/'
  
  export default {
    name: 'ReceivableFinance',
    data: function() {
      return {
        pagePara: {},
        modal: {
            receivedBankEditModal: false, u8OughtReceiveModal: false, u8ReceivedModal: false, splitReceivedModal: false
        },
        search_data: {
            receipt_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            receipt_type: ''
        },
        receivableTable: {
            columns: [
                {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Receipt No.',
                    slot: 'receipt_no',
                    width: 240,
                    align: 'center'
                },
                {
                    title: 'Receipt Type',
                    slot: 'receipt_type',
                    width: 160,
                    align: 'center'
                },
                {
                    title: 'Receipt Amount',
                    slot: 'receipt_amount',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Receipt Reference No.',
                    slot: 'receipt_reference_no',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Receipt Object',
                    key: 'receipt_object',
                    width: 180,
                    align: 'left'
                },
                {
                    title: 'Receipt From',
                    slot: 'receipt_from',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Receipt Creator',
                    key: 'receipt_operator_name',
                    width: 160,
                    align: 'left'
                },
                {
                    title: 'Receipt Date',
                    key: 'receipt_date',
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
            sendReceivable: true, sendReceived: true, receivedEdit: true
        },
        received_search_data: {
            receivable_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        },
        receivedTable: {
            columns: [
                {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Receivable No.',
                    slot: 'ought_receive_no',
                    width: 240,
                    align: 'center'
                },
                {
                    title: 'Receivable Type',
                    slot: 'ought_receive_type',
                    width: 160,
                    align: 'center'
                },
                {
                    title: 'Receivable Amount',
                    slot: 'ought_receive_amount',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Receivable Reference No.',
                    slot: 'ought_receive_reference_no',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Receivable Object',
                    key: 'ought_receive_object',
                    width: 180,
                    align: 'left'
                },
                {
                    title: 'Receivable From',
                    slot: 'ought_receive_from',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Operator Name',
                    key: 'ought_receive_operator_name',
                    width: 160,
                    align: 'left'
                },
                {
                    title: 'Created Time',
                    key: 'created_at',
                    width: 160,
                    align: 'center'
                },
            ],
            data: [],
            height: common.getTableHeight(),
            limit: 10,
            offset: 0,
            total: 0,
            current: 1
        },
        receivedBankForm: {
            received_bank: ''
        },
        watchOughtReceive: {},
        u8OughtReceiveTable: {
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
            receivable_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
            received_date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        },
        completeTable: {
            columns: [
                {
                    type: 'selection',
                    align: 'center',
                    width: 60
                },
                {
                    title: 'Receivable No.',
                    slot: 'ought_receive_no',
                    width: 240,
                    align: 'center'
                },
                {
                    title: 'Receivable Type',
                    slot: 'ought_receive_type',
                    width: 160,
                    align: 'center'
                },
                {
                    title: 'Receivable Amount',
                    slot: 'ought_receive_amount',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Receivable Reference No.',
                    slot: 'ought_receive_reference_no',
                    width: 200,
                    align: 'left'
                },
                {
                    title: 'Receivable Object',
                    key: 'ought_receive_object',
                    width: 180,
                    align: 'left'
                },
                {
                    title: 'Receivable From',
                    slot: 'ought_receive_from',
                    width: 240,
                    align: 'left'
                },
                {
                    title: 'Operator Name',
                    key: 'ought_receive_operator_name',
                    width: 160,
                    align: 'left'
                },
                {
                    title: 'Receivable Time',
                    key: 'created_at',
                    width: 160,
                    align: 'center'
                },
                {
                    title: 'Received Time',
                    key: 'accept_at',
                    width: 160,
                    align: 'center'
                },
            ],
            data: [],
            height: common.getTableHeight(),
            limit: 10,
            offset: 0,
            total: 0,
            current: 1
        },
        watchReceived: {},
        u8ReceivedTable: {
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
      this.getReceivableData(1)
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
        if(name === 'ReceivableTab') {
            this.getReceivableData()
        } else if (name === 'ReceivedTab'){
            this.getReceivedData()
        } else if(name === 'CompleteTab') {
            this.getCompleteData()
        }
      },
      changeReceivableReceiptDate: function(e) {
        this.search_data.receipt_date = JSON.parse(JSON.stringify(e))
        this.getReceivableData(1)
      },
      getReceivableData: async function(index) {
        try {
            if (index) {
            this.receivableTable.current = index
            this.receivableTable.offset = (index - 1) * this.receivableTable.limit
            }
            let searchPara = {
                search_data: this.search_data,
                offset: this.receivableTable.offset,
                limit: this.receivableTable.limit
            }
            let response = await this.$http.post(apiUrl + 'queryReceivable', searchPara)
            let data = response.data.info
            this.receivableTable.total = data.total
            this.receivableTable.data = JSON.parse(JSON.stringify(data.rows))
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      resetReceivableTableSize: function(pageSize) {
        this.receivableTable.limit = pageSize
        this.getReceivableData(1)
      },
      selectReceivableAct: async function(selection) {
        if(selection && selection.length > 0) {
            this.buttonAuth.sendReceivable = false
        } else {
            this.buttonAuth.sendReceivable = true
        }
      },
      submitReceivable: async function() {
        let submit_receivable_list = this.$refs.receivableTable.getSelection()
        if(submit_receivable_list && submit_receivable_list.length > 0) {
            this.$commonact.confirm('Confirm Send Receivable to U8 System?', async () => {
                try {
                    let response = await this.$http.post(apiUrl + 'submitReceivable', {receivable_list: submit_receivable_list})
                    let data = response.data.info
                    this.getReceivableData()
                    if(data.code === '1') {
                        this.$Message.success('Submit Recievable success')
                    } else {
                        this.$Message.error(data.errMessage)
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            })
        } else {
            return this.$Message.error('Please select receivable order')
        }
      },
      syncU8Receivable: async function(row) {
        try {
            await this.$http.post(apiUrl + 'syncU8Receivable', {sync_data: row})
            this.getReceivableData()
            this.$Message.success('Sync Recievable success')
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      changeReceivedReceivableDate: function(e) {
        this.received_search_data.receivable_date = JSON.parse(JSON.stringify(e))
        this.getReceivedData(1)
      },
      getReceivedData: async function(index) {
        try {
            if (index) {
                this.receivedTable.current = index
                this.receivedTable.offset = (index - 1) * this.receivedTable.limit
            }
            let searchPara = {
                search_data: this.received_search_data,
                offset: this.receivedTable.offset,
                limit: this.receivedTable.limit
            }
            let response = await this.$http.post(apiUrl + 'queryReceived', searchPara)
            let data = response.data.info
            this.receivedTable.total = data.total
            this.receivedTable.data = JSON.parse(JSON.stringify(data.rows))
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      resetReceivedTableSize: function(pageSize) {
        this.receivedTable.limit = pageSize
        this.getReceivedData(1)
      },
      selectReceivedAct: async function(selection) {
        if(selection && selection.length > 0) {
            this.buttonAuth.receivedEdit = false
            let _disabled = true
            for(let s of selection) {
                _disabled = _disabled && !s._disabled_received
            }
            this.buttonAuth.sendReceived = !_disabled
        } else {
            this.buttonAuth.sendReceived = true
            this.buttonAuth.receivedEdit = true
        }
      },
      showReceivedBankEdit: async function() {
        this.receivedBankForm.received_bank = ''
        this.modal.receivedBankEditModal = true
      },
      submitReceivedBankEdit: async function() {
        let submit_received_list = this.$refs.receivedTable.getSelection()
        if(submit_received_list && submit_received_list.length > 0) {
            try {
                await this.$http.post(apiUrl + 'submitReceivedBankInfo', {received_list: submit_received_list, submit_data: this.receivedBankForm})
                this.modal.receivedBankEditModal = false
                this.getReceivedData()
                this.$Message.success('Edit Bank success')
            } catch (error) {
                this.$commonact.fault(error)
            }
        } else {
            return this.$Message.error('Please select received order')
        }
      },
      watchU8Receviable: async function(row) {
        try {
            let response = await this.$http.post(apiUrl + 'watchU8Receviable', row)
            this.watchOughtReceive = response.data.info
            this.modal.u8OughtReceiveModal = true
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      submitReceived: async function() {
        let submit_received_list = this.$refs.receivedTable.getSelection()
        if(submit_received_list && submit_received_list.length > 0) {
            this.$commonact.confirm('Confirm Send Received to U8 System?', async () => {
                try {
                    let response = await this.$http.post(apiUrl + 'submitReceived', {received_list: submit_received_list})
                    let data = response.data.info
                    this.getReceivedData()
                    if(data.code === '1') {
                        this.$Message.success('Submit Recieived success')
                    } else {
                        this.$Message.error(data.errMessage)
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            })
        } else {
            return this.$Message.error('Please select receivable order')
        }
      },
      changeCompleteReceivableDate: function(e) {
        this.complete_search_data.receivable_date = JSON.parse(JSON.stringify(e))
        this.getCompleteData(1)
      },
      changeCompleteReceivedDate: function(e) {
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
      watchU8Receved: async function(row) {
        try {
            let response = await this.$http.post(apiUrl + 'watchU8Receved', row)
            this.watchReceived = response.data.info
            this.modal.u8ReceivedModal = true
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      watchU8SplitReceved: async function(row) {
        try {
            let response = await this.$http.post(apiUrl + 'watchU8SplitReceved', row)
            this.watchReceived = response.data.info
            this.modal.u8ReceivedModal = true
        } catch (error) {
            this.$commonact.fault(error)
        }
      },
      splitReceived: async function() {
        this.splitReceivedList = this.$refs.receivedTable.getSelection()
        for(let sr of this.splitReceivedList) {
            let splitDetail = []
            let split_fees = JSON.parse(JSON.stringify(sr.receive_detail))
            if(sr.ought_receive_reference_no.indexOf('/') > 0) {
                sr.received_balance = false
                for(let sf of split_fees) {
                    sf.split_detail_amount = 0
                }
                let reference_nos = sr.ought_receive_reference_no.split('/')
                for(let rn of reference_nos) {
                    splitDetail.push({
                        split_bank: sr.ought_receive_bank,
                        split_currency: sr.ought_receive_currency,
                        split_amount: 0,
                        split_reference_no: rn,
                        split_fees: JSON.parse(JSON.stringify(split_fees))
                    })
                }
            } else {
                for(let sf of split_fees) {
                    sf.split_detail_amount = sf.ought_receive_detail_amount
                }
                sr.received_balance = true
                splitDetail.push({
                    split_bank: sr.ought_receive_bank,
                    split_currency: sr.ought_receive_currency,
                    split_amount: sr.ought_receive_amount,
                    split_reference_no: sr.ought_receive_reference_no,
                    split_fees: JSON.parse(JSON.stringify(split_fees))
                })
            }
            sr.split_detail = splitDetail
        }
        this.modal.splitReceivedModal = true
      },
      submitSplitReceived: async function() {
        for(let sr of this.splitReceivedList) {
            if(!sr.received_balance) {
                return this.$Message.error(sr.ought_receive_no + ' received amount not balance')
            }
        }
        this.$commonact.confirm('Confirm Send Received to U8 System?', async () => {
            try {
                let response = await this.$http.post(apiUrl + 'submitSplitReceived', {split_received_list: this.splitReceivedList})
                let data = response.data.info
                this.getReceivedData()
                if(data.code === '1') {
                    this.$Message.success('Submit Recieived success')
                } else {
                    this.$Message.error(data.errMessage)
                }
            } catch (error) {
                this.$commonact.fault(error)
            }
        })
      },
      changeSplitDetailAmount: async function(value, index, sIndex, sdIndex) {
        let item = this.splitReceivedList[index]
        let total_split_amount = 0
        for(let sd of item.split_detail) {
            let split_amount = 0
            for(let sdf of sd.split_fees) {
                if(sdf.split_detail_amount) {
                    split_amount += parseInt(sdf.split_detail_amount)
                }
            }
            sd.split_amount = split_amount
            total_split_amount += split_amount
        }
        if(total_split_amount === parseInt(item.ought_receive_amount)) {
            item.received_balance = true
        } else {
            item.received_balance = false
        }
        this.$forceUpdate()
      },
      inputSplitDetailAmount: async function(value, index, sIndex, sdIndex) {
        let clickSplitFeeItem = this.splitReceivedList[index].split_detail[sIndex].split_fees[sdIndex]
        clickSplitFeeItem.split_detail_amount = parseInt(clickSplitFeeItem.ought_receive_detail_amount)
        let item = this.splitReceivedList[index]
        let total_split_amount = 0
        for(let sd of item.split_detail) {
            let split_amount = 0
            for(let sdf of sd.split_fees) {
                if(sdf.split_detail_amount) {
                    split_amount += parseInt(sdf.split_detail_amount)
                }
            }
            sd.split_amount = split_amount
            total_split_amount += split_amount
        }
        if(total_split_amount === parseInt(item.ought_receive_amount)) {
            item.received_balance = true
        } else {
            item.received_balance = false
        }
        this.$forceUpdate()
      },
    }
  }
  </script>