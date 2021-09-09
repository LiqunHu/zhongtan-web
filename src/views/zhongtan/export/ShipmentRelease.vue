<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Export</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Shipment Release
    </h1>
    <!-- end page-header -->
    <panel ref="shipmentPanel" title="Shipment Release" v-resize="resizePanel">
      <div ref="displayLayout">
        <Split v-model="splitLeft">
          <div slot="left" style="height: 100%;">
            <Split v-model="splitBooking" mode="vertical">
              <div slot="top">
                <Card>
                  <p slot="title">#M B/L No</p>
                  <Button slot="extra" size="small" type="primary" icon="ios-search" v-on:click="searchBookingDataAct">Search</Button>
                  <Input v-model="searchData.bookingNo" :rows ="3" type="textarea" placeholder="BL separated by commas" />
                </Card>
              </div>
              <div slot="bottom" style="padding-top: 10px;">
                <Table ref="bookingTable" :border="bookingTable.data.length > 0" highlight-row :columns="bookingTable.columns" :data="bookingTable.data" @on-row-click="selectBookingAct">
                  <template slot-scope="{ row, index }" slot="booking_status">
                    <a href="#" class="btn btn-green btn-icon btn-sm" v-if="row.booking_status">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                    <a href="#" class="btn btn-danger btn-icon btn-sm" v-else>
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                    <a href="#" class="btn btn-danger btn-icon btn-sm" v-if="row.bk_cancellation_status && row.bk_cancellation_status === '1'">
                      <i class="fa fa-backward"></i>
                    </a>
                  </template>
                </Table>
              </div>
            </Split>
          </div>
          <div slot="right">
            <Card>
              <Row>
                <Col span="6">
                  #M B/L No. {{bookingShipment.export_masterbl_bl}}
                  <Tag color="primary">{{bookingShipment.export_masterbl_cargo_type}}</Tag>
                </Col>
                <Col span="5"><font style="color:#17233D; font-size: 16px;">Vessel: </font>{{bookingShipment.vessel.export_vessel_name}}/{{bookingShipment.vessel.export_vessel_voyage}}</Col>
                <Col span="3"><font style="color:#17233D; font-size: 16px;">ETD: </font>{{bookingShipment.vessel.export_vessel_etd}}</Col>
                <Col span="3"><font style="color:#17233D; font-size: 16px;">Size/Type: </font>{{bookingShipment.size_type}}</Col>
                <Col span="4"><font style="color:#17233D; font-size: 16px;">POL: </font>{{bookingShipment.export_masterbl_port_of_load}}</Col>
                <Col span="3"><font style="color:#17233D; font-size: 16px;">POD: </font>{{bookingShipment.export_masterbl_port_of_discharge}}</Col>
              </Row>
            </Card>
            <Card>
              <Button slot="title" size="small" type="info" icon="ios-settings-outline" v-on:click="saveShipmentAct">SAVE</Button>
              <Button slot="title" size="small" type="primary" icon="ios-send-outline" style="margin-left: 7px;" v-on:click="submitShipmentAct" :disabled="submitDisabled">SUBMIT</Button>
              <Button slot="title" size="small" type="error" icon="ios-undo-outline" style="margin-left: 7px;" v-on:click="undoShipmentAct" :disabled="undoDisabled">UNDO</Button>
              <Button slot="title" size="small" type="success" icon="ios-paper-outline" style="margin-left: 7px;" v-on:click="invoiceShipmentAct" :disabled="invoiceDisabled">INVOICE</Button>
              <Button slot="title" size="small" type="success" icon="ios-paper-outline" style="margin-left: 7px;" v-on:click="resetShipmentAct" :disabled="resetDisabled">RESET</Button>
              <Row slot="extra" style="width: 400px;">
                <Col span="8">应收  {{bookingShipment.totalReceivable}}</Col>
                <Col span="8">应付  {{bookingShipment.totalPayable}}</Col>
                <Col span="8">毛利  {{bookingShipment.grossProfit}}</Col>
              </Row>
              <div ref="shipmentLayout">
                <Split v-model="splitShipment" mode="vertical" @on-move-end="shipmentSplitMoveAct">
                  <div slot="top">
                    <Row style="margin-bottom: 10px;">
                      <Col span="24">
                        RECEIVABLE
                        <Button size="small" type="primary" icon="ios-add" title="ADD RECEIVABLE" v-on:click="addReceivableAct" :disabled="bookingShipment.bk_cancellation_status === '1'">ADD</Button>
                        <Button size="small" type="error" style="margin-left: 7px;" icon="ios-remove" title="REMOVE RECEIVABLE" :disabled="receivableTable.removeDisabled" v-on:click="removeReceivableAct">REMOVE</Button>
                        <!-- <Button size="small" type="warning" style="margin-left: 7px;" icon="ios-add" title="SUPPLEMENT RECEIVABLE" v-on:click="addSupplementReceivableAct">SUPPLEMENT</Button> -->
                      </Col>
                    </Row>
                    <Row>
                      <Col span="24">
                        <Table ref="receivableTable" :border="receivableTable.data.length > 0" highlight-row :columns="receivableTable.columns" :data="receivableTable.data" :height="receivableTable.height" @on-selection-change="selectReceivableAct" :span-method="handleReceivableSpan">
                          <template slot-scope="{ row, index }" slot="shipment_status">
                            <Tag color="default" v-if="receivableTable.data[index].shipment_fee_status === 'NE'">NEW</Tag>
                            <Tag color="primary" v-else-if="receivableTable.data[index].shipment_fee_status === 'SA'">SAVE</Tag>
                            <Tag color="primary" v-else-if="receivableTable.data[index].shipment_fee_status === 'SU'">SUBMIT</Tag>
                            <Tag color="success" v-else-if="receivableTable.data[index].shipment_fee_status === 'AP'">APPROVE</Tag>
                            <Tag color="error" v-else-if="receivableTable.data[index].shipment_fee_status === 'DE'">DECLINE</Tag>
                            <Tag color="error" v-else-if="receivableTable.data[index].shipment_fee_status === 'UN'">UNDO</Tag>
                            <Tag color="success" v-else-if="receivableTable.data[index].shipment_fee_status === 'IN'">INVOICE</Tag>
                            <Tag color="success" v-else-if="receivableTable.data[index].shipment_fee_status === 'RE'">RECEIPT</Tag>
                            <Tag color="warning" v-else-if="receivableTable.data[index].shipment_fee_status === 'BA'">BALANCE</Tag>
                          </template>
                          <template slot-scope="{ row, index }" slot="invoce_file">
                            <a :href="row.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" v-if="row.uploadfile_url">
                              <i class="fa fa-download"></i>
                            </a>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_party">
                            <Select v-model="receivableTable.data[index].shipment_fee_party" clearable transfer filterable  :disabled="receivableTable.data[index].party_disabled">
                              <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee">
                            <Select v-model="receivableTable.data[index].fee_data_code" v-if="receivableTable.data[index].shipment_fee_supplement ==='1'" transfer filterable :disabled="receivableTable.data[index].fee_disabled">
                              <Option v-for="item in pagePara.ALL_RECEIVABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="receivableTable.data[index].fee_data_code" v-else-if="receivableTable.data[index].fee_data_fixed ==='1'" disabled>
                              <Option v-for="item in pagePara.FIXED_RECEIVABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="receivableTable.data[index].fee_data_code" v-else transfer filterable :disabled="receivableTable.data[index].fee_disabled" @on-change="changeShipmentFeeAct(index, 'R')">
                              <Option v-for="item in pagePara.OTHER_RECEIVABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee_amount">
                            <Input v-model="receivableTable.data[index].shipment_fee_amount" :disabled="receivableTable.data[index].amount_disabled">
                              <Select v-model="receivableTable.data[index].shipment_fee_currency" slot="append" transfer style="width: 100px" :disabled="receivableTable.data[index].currency_disabled">
                                <Option v-for="item in pagePara.FEE_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                              </Select>
                            </Input>
                          </template>
                        </Table>
                      </Col>
                    </Row>
                  </div>
                  <div slot="bottom" style="padding-top: 20px;">
                    <Row style="margin-bottom: 10px;">
                      <Col span="24">
                        PAYABLE
                        <Button size="small" type="primary" icon="ios-add" title="ADD PAYABLE" v-on:click="addPayableAct" :disabled="bookingShipment.bk_cancellation_status === '1'">ADD</Button>
                        <Button size="small" type="error" style="margin-left: 7px;" icon="ios-remove" title="REMOVE PAYABLE" :disabled="payableTable.removeDisabled" v-on:click="removePayableAct">REMOVE</Button>
                        <!-- <Button size="small" type="warning" style="margin-left: 7px;" icon="ios-add" title="SUPPLEMENT PAYABLE" v-on:click="addSupplementPayableAct">SUPPLEMENT</Button> -->
                      </Col>
                    </Row>
                    <Row>
                      <Col span="24">
                        <Table ref="payableTable" :border="payableTable.data.length > 0" highlight-row :columns="payableTable.columns" :data="payableTable.data" :height="payableTable.height" @on-selection-change="selectPayableAct">
                          <template slot-scope="{ row, index }" slot="shipment_status">
                            <Tag color="default" v-if="payableTable.data[index].shipment_fee_status === 'NE'">NEW</Tag>
                            <Tag color="primary" v-else-if="payableTable.data[index].shipment_fee_status === 'SA'">SAVE</Tag>
                            <Tag color="primary" v-else-if="payableTable.data[index].shipment_fee_status === 'SU'">SUBMIT</Tag>
                            <Tag color="success" v-else-if="payableTable.data[index].shipment_fee_status === 'AP'">APPROVE</Tag>
                            <Tag color="error" v-else-if="payableTable.data[index].shipment_fee_status === 'DE'">DECLINE</Tag>
                            <Tag color="error" v-else-if="payableTable.data[index].shipment_fee_status === 'UN'">UNDO</Tag>
                            <Tag color="success" v-else-if="payableTable.data[index].shipment_fee_status === 'IN'">INVOICE</Tag>
                            <Tag color="success" v-else-if="payableTable.data[index].shipment_fee_status === 'RE'">RECEIPT</Tag>
                            <Tag color="warning" v-else-if="receivableTable.data[index].shipment_fee_status === 'BA'">BALANCE</Tag>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_party">
                            <Select v-model="payableTable.data[index].shipment_fee_party" clearable transfer filterable :disabled="payableTable.data[index].party_disabled">
                              <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee">
                            <Select v-model="payableTable.data[index].fee_data_code" v-if="payableTable.data[index].shipment_fee_supplement ==='1'" transfer filterable :disabled="payableTable.data[index].fee_disabled">
                              <Option v-for="item in pagePara.ALL_PAYABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="payableTable.data[index].fee_data_code" v-else-if="payableTable.data[index].fee_data_fixed ==='1'" disabled>
                              <Option v-for="item in pagePara.FIXED_PAYABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="payableTable.data[index].fee_data_code" v-else transfer filterable :disabled="payableTable.data[index].fee_disabled" @on-change="changeShipmentFeeAct(index, 'P')">
                              <Option v-for="item in pagePara.OTHER_PAYABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee_amount">
                            <Input v-model="payableTable.data[index].shipment_fee_amount" :disabled="payableTable.data[index].amount_disabled">
                              <Select v-model="payableTable.data[index].shipment_fee_currency" slot="append" transfer style="width: 100px" :disabled="payableTable.data[index].currency_disabled">
                                <Option v-for="item in pagePara.FEE_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                              </Select>
                            </Input>
                          </template>
                        </Table>
                      </Col>
                    </Row>
                  </div>
                </Split>
              </div>
            </Card>
          </div>
        </Split>
      </div>
    </panel>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :mask-closable="false">
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
// const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/ShipmentRelease/'

export default {
  name: 'ShipmentRelease',
  data: function() {
    return {
      modal: { checkPasswordModal: false},
      headers: common.uploadHeaders(),
      fullHeight: '',
      splitLeft: '280',
      splitBooking: '156',
      splitShipment: 0.5,
      pagePara: {},
      searchData: {
        bookingNo: ''
      },
      bookingTable: {
        columns:[
          {
            type: 'index',
            width: 30,
            align: 'center'
          },
          {
            title: '#M B/L No',
            key: 'booking_no',
          },
          {
            title: '#',
            align: 'center',
            width: 90,
            slot: 'booking_status',
          }
        ],
        data: []
      },
      bookingShipment: {
        vessel: {}
      },
      submitDisabled: true,
      undoDisabled: true,
      invoiceDisabled: true,
      resetDisabled: true,
      shipmentAddIndex: 0,
      receivableTable: {
        columns:[
          {
            type: 'selection',
            align: 'center',
            width: 60
          },
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: 'Status',
            align: 'center',
            width: 120,
            slot: 'shipment_status',
          },
          {
            title: 'Invoice',
            align: 'center',
            width: 100,
            slot: 'invoce_file'
          },
          {
            title: 'Party',
            align: 'center',
            width: 300,
            slot: 'shipment_party',
          },
          {
            title: 'Fee',
            align: 'center',
            width: 200,
            slot: 'shipment_fee',
          },
          {
            title: 'Fee Amount',
            align: 'center',
            width: 280,
            slot: 'shipment_fee_amount',
          },
          {
            title: 'Submit By',
            align: 'center',
            width: 140,
            key: 'shipment_fee_submit_by_user',
          },
          {
            title: 'Submit At',
            align: 'center',
            width: 180,
            key: 'shipment_fee_submit_at',
          }
        ],
        data: [],
        removeDisabled: true,
        height: 0
      },
      payableTable: {
        columns:[
          {
            type: 'selection',
            align: 'center',
            width: 60
          },
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: 'Status',
            align: 'center',
            width: 120,
            slot: 'shipment_status',
          },
          {
            title: 'Party',
            align: 'center',
            width: 400,
            slot: 'shipment_party',
          },
          {
            title: 'Fee',
            align: 'center',
            width: 200,
            slot: 'shipment_fee',
          },
          {
            title: 'Fee Amount',
            align: 'center',
            width: 280,
            slot: 'shipment_fee_amount',
          },
          {
            title: 'Submit By',
            align: 'center',
            width: 140,
            key: 'shipment_fee_submit_by_user',
          },
          {
            title: 'Submit At',
            align: 'center',
            width: 180,
            key: 'shipment_fee_submit_at',
          }
        ],
        data: [],
        removeDisabled: true,
        height: 0
      },
      checkPassword: '',
      checkPasswordType: ''
    }
  },
  directives: {  // 使用局部注册指令的方式
    resize: { // 指令的名称
      bind(el, binding) { // el为绑定的元素，binding为绑定给指令的对象
        let width = '', height = ''
        function isReize() {
          const style = document.defaultView.getComputedStyle(el)
          if (width !== style.width || height !== style.height) {
            binding.value()  // 关键
          }
          width = style.width
          height = style.height
        }
        el.__vueSetInterval__ = setInterval(isReize, 300)
      },
      unbind(el) {
        clearInterval(el.__vueSetInterval__)
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    this.resizePanel()
    await this.initAct()
  },
  methods: {
    resizePanel() {
      if(this.$refs.shipmentPanel.expand) {
        this.fullHeight = document.documentElement.clientHeight + 210
        this.$refs.displayLayout.style.height = this.fullHeight + 'px'
        this.$refs.shipmentLayout.style.height = (this.fullHeight - 140) + 'px'
        this.receivableTable.height = (this.fullHeight - 140) * this.splitShipment - 40
        this.payableTable.height = (this.fullHeight - 140) * (1-this.splitShipment) - 40
      } else {
        this.fullHeight = document.documentElement.clientHeight
        this.$refs.displayLayout.style.height = this.fullHeight + 'px'
        this.$refs.shipmentLayout.style.height = (this.fullHeight - 140) + 'px'
        this.receivableTable.height = (this.fullHeight - 140) * this.splitShipment - 40
        this.payableTable.height = (this.fullHeight - 140) * (1-this.splitShipment) - 40
      }
    },
    initAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchBookingDataAct: async function() {
      if(this.searchData.bookingNo) {
        let response = await this.$http.post(apiUrl + 'searchBookingData', this.searchData)
        this.bookingTable.data = response.data.info
      }
    },
    selectBookingAct: async function(row, index) {
      await this.getBookingShipmentAct(row.export_masterbl_id)
    },
    getBookingShipmentAct: async function(export_masterbl_id) {
      this.invoiceDisabled = true
      this.submitDisabled = true
      this.resetDisabled = true
      let param = {
        export_masterbl_id: export_masterbl_id
      }
      let response = await this.$http.post(apiUrl + 'getBookingShipment', param)
      this.bookingShipment = response.data.info
      this.receivableTable.data = this.bookingShipment.shipment_receivable
      let submitStatus = ['SA', 'DE', 'UN']
      let resetStatus = ['SU', 'AP', 'IN', 'RE', 'BA']
      if(this.receivableTable.data && this.receivableTable.data.length > 0) {
        let invoiceStatus = ['AP']
        for(let d of this.receivableTable.data) {
          if(submitStatus.indexOf(d.shipment_fee_status) >= 0 && d.shipment_fee_party && d.fee_data_code && d.shipment_fee_amount && d.shipment_fee_currency) {
            this.submitDisabled = false
          }
          if(invoiceStatus.indexOf(d.shipment_fee_status) >= 0) {
            this.invoiceDisabled = false
          }
          if(resetStatus.indexOf(d.shipment_fee_status) >= 0) {
            this.resetDisabled = false
          }
        }
      }
      this.payableTable.data = this.bookingShipment.shipment_payable
      if(this.payableTable.data && this.payableTable.data.length > 0) {
        for(let d of this.payableTable.data) {
          if(submitStatus.indexOf(d.shipment_fee_status) >= 0 && d.shipment_fee_party && d.fee_data_code && d.shipment_fee_amount && d.shipment_fee_currency) {
            this.submitDisabled = false
          }
        }
      }
    },
    handleReceivableSpan: function({row, column, rowIndex, columnIndex}) {
      if(column.title === 'Invoice') {
        return this.getReceivableLayout(row, rowIndex, columnIndex)
      }
    },
    getReceivableLayout: function(row, rowIndex, columnIndex) {
      let rowspan = 0
      let colspan = 1
      let tableData = this.receivableTable.data
      for(let i = 0; i < tableData.length; i++) {
        if(tableData[i].shipment_fee_invoice_id === row.shipment_fee_invoice_id) {
          rowspan++
        }
        if(i >= rowIndex && i < tableData.length - 1 && tableData[i + 1].shipment_fee_invoice_id !== row.shipment_fee_invoice_id) {
          break
        }
      }
      let span = []
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].shipment_fee_invoice_id === row.shipment_fee_invoice_id) {
          span = [0, 0]
        } else {
          span = [rowspan, colspan]
        }
      } else {
        span = [1, 1]
      }
      return span
    },
    shipmentSplitMoveAct: async function() {
      this.receivableTable.height = (this.fullHeight - 140) * this.splitShipment - 40
      this.payableTable.height = (this.fullHeight - 140) * (1-this.splitShipment) - 40
    },
    addReceivableAct: async function() {
      this.receivableTable.data.push({
        shipment_fee_id: 'N' + (this.shipmentAddIndex++),
        fee_data_code: '',
        shipment_fee_type: 'R',
        shipment_fee_party: '',
        shipment_fee_status: 'NE',
        fee_data_fixed: '0',
        shipment_fee_fixed_amount: '0',
        shipment_fee_amount: '',
        shipment_fee_currency: 'USD',
        shipment_fee_supplement: '0',
        party_disabled: false,
        fee_disabled: false,
        amount_disabled: false,
        currency_disabled: false,
      })
    },
    addPayableAct: async function() {
      // this.$nextTick(function() {
      //   this.checkPassword = ''
      //   this.checkPasswordType = 'addPayable'
      //   this.modal.checkPasswordModal = true
      // })
      this.payableTable.data.push({
        shipment_fee_id: 'N' + (this.shipmentAddIndex++),
        fee_data_code: '',
        shipment_fee_type: 'P',
        shipment_fee_party: '',
        shipment_fee_status: 'NE',
        fee_data_fixed: '0',
        shipment_fee_fixed_amount: '0',
        shipment_fee_amount: '',
        shipment_fee_currency: 'USD',
        shipment_fee_supplement: '0',
        party_disabled: false,
        fee_disabled: false,
        amount_disabled: false,
        currency_disabled: false,
      })
    },
    addSupplementReceivableAct: async function() {
      this.receivableTable.data.push({
        shipment_fee_id: 'N' + (this.shipmentAddIndex++),
        fee_data_code: '',
        shipment_fee_type: 'R',
        shipment_fee_party: '',
        shipment_fee_status: 'NE',
        fee_data_fixed: '0',
        shipment_fee_fixed_amount: '0',
        shipment_fee_amount: '',
        shipment_fee_currency: 'USD',
        shipment_fee_supplement: '1',
        party_disabled: false,
        fee_disabled: false,
        amount_disabled: false,
        currency_disabled: false,
      })
    },
    addSupplementPayableAct: async function() {
      this.$nextTick(function() {
        this.checkPassword = ''
        this.checkPasswordType = 'addSupplementPayable'
        this.modal.checkPasswordModal = true
      })
    },
    removeReceivableAct: async function() {
      this.$nextTick(function() {
        this.checkPassword = ''
        this.checkPasswordType = 'removeReceivable'
        this.modal.checkPasswordModal = true
      })
    },
    removePayableAct: async function() {
      this.$nextTick(function() {
        this.checkPassword = ''
        this.checkPasswordType = 'removePayable'
        this.modal.checkPasswordModal = true
      })
    },
    selectReceivableAct: async function(selection) {
      if(selection && selection.length > 0) {
        let undoStatus = ['SU']
        this.receivableTable.removeDisabled = false
        this.undoDisabled = false
        // for(let s of selection) {
        //   if(s.fee_data_fixed === '1') {
        //     this.receivableTable.removeDisabled = true
        //     break
        //   }
        // }
        for(let s of selection) {
          if(undoStatus.indexOf(s.shipment_fee_status) < 0) {
            this.undoDisabled = true
            break
          }
        }
      } else {
        this.receivableTable.removeDisabled = true
        this.undoDisabled = true
      }
    },
    selectPayableAct: async function(selection) {
      if(selection && selection.length > 0) {
        let undoStatus = ['SU']
        this.payableTable.removeDisabled = false
        this.undoDisabled = false
        // for(let s of selection) {
        //   if(s.fee_data_fixed === '1') {
        //     this.payableTable.removeDisabled = true
        //     break
        //   }
        // }
        for(let s of selection) {
          if(undoStatus.indexOf(s.shipment_fee_status) < 0) {
            this.undoDisabled = true
            break
          }
        }
      } else {
        this.payableTable.removeDisabled = true
        this.undoDisabled = true
      }
    },
    changeShipmentFeeAct: async function(index, type) {
      let param = {
        export_masterbl_id: this.bookingShipment.export_masterbl_id,
        shipment_fee_type: type,
        fee_data_code: type === 'R' ? this.receivableTable.data[index].fee_data_code : this.payableTable.data[index].fee_data_code
      }
      let response = await this.$http.post(apiUrl + 'getShipmentFeeAmount', param)
      let fee_data = response.data.info
      if(type === 'R') {
        this.receivableTable.data[index].shipment_fee_amount = fee_data.fee_amount
        this.receivableTable.data[index].shipment_fee_currency = fee_data.fee_currency
        this.receivableTable.data[index].shipment_fee_fixed_amount = fee_data.fee_amount_fixed
        this.receivableTable.data[index].party_disabled = fee_data.party_disabled
        this.receivableTable.data[index].fee_disabled = fee_data.fee_disabled
        this.receivableTable.data[index].amount_disabled = fee_data.amount_disabled
        this.receivableTable.data[index].currency_disabled = fee_data.currency_disabled
      } else {
        this.payableTable.data[index].shipment_fee_amount = fee_data.fee_amount
        this.payableTable.data[index].shipment_fee_currency = fee_data.fee_currency
        this.payableTable.data[index].shipment_fee_fixed_amount = fee_data.fee_amount_fixed
        this.payableTable.data[index].party_disabled = fee_data.party_disabled
        this.payableTable.data[index].fee_disabled = fee_data.fee_disabled
        this.payableTable.data[index].amount_disabled = fee_data.amount_disabled
        this.payableTable.data[index].currency_disabled = fee_data.currency_disabled
      }
    },
    saveShipmentAct: async function() {
      let param = {
        export_masterbl_id: this.bookingShipment.export_masterbl_id,
        shipment_receivable: this.receivableTable.data,
        shipment_payable: this.payableTable.data,
      }
      await this.$http.post(apiUrl + 'saveShipment', param)
      await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
    },
    submitShipmentAct: async function() {
      let param = {
        export_masterbl_id: this.bookingShipment.export_masterbl_id
      }
      await this.$http.post(apiUrl + 'submitShipment', param)
      await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
    },
    undoShipmentAct: async function() {
      let param = {
        export_masterbl_id: this.bookingShipment.export_masterbl_id,
        shipment_receivable: this.$refs.receivableTable.getSelection(),
        shipment_payable: this.$refs.payableTable.getSelection(),
      }
      await this.$http.post(apiUrl + 'undoShipment', param)
      await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
    },
    invoiceShipmentAct: async function() {
      let param = {
        export_masterbl_id: this.bookingShipment.export_masterbl_id,
      }
      await this.$http.post(apiUrl + 'invoiceShipment', param)
      await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
    },
    resetShipmentAct: async function(){
      this.$nextTick(function() {
        this.checkPassword = ''
        this.checkPasswordType = 'resetShipment'
        this.modal.checkPasswordModal = true
      })
    },
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = 'EXPORT_SHIPMENT_RELEASE'
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'addPayable') {
            this.payableTable.data.push({
              shipment_fee_id: 'N' + (this.shipmentAddIndex++),
              fee_data_code: '',
              shipment_fee_type: 'P',
              shipment_fee_party: '',
              shipment_fee_status: 'NE',
              fee_data_fixed: '0',
              shipment_fee_fixed_amount: '0',
              shipment_fee_amount: '',
              shipment_fee_currency: 'USD',
              shipment_fee_supplement: '0',
              party_disabled: false,
              fee_disabled: false,
              amount_disabled: false,
              currency_disabled: false,
            })
          } else if (this.checkPasswordType === 'addSupplementPayable') {
            this.payableTable.data.push({
              shipment_fee_id: 'N' + (this.shipmentAddIndex++),
              fee_data_code: '',
              shipment_fee_type: 'P',
              shipment_fee_party: '',
              shipment_fee_status: 'NE',
              fee_data_fixed: '0',
              shipment_fee_fixed_amount: '0',
              shipment_fee_amount: '',
              shipment_fee_currency: 'USD',
              shipment_fee_supplement: '1',
              party_disabled: false,
              fee_disabled: false,
              amount_disabled: false,
              currency_disabled: false,
            })
          } else if (this.checkPasswordType === 'removePayable') {
            let selection = this.$refs.payableTable.getSelection()
            if(selection && selection.length > 0) {
              let remove_ids = []
              for(let s of selection) {
                remove_ids.push(s.shipment_fee_id)
              }
              if(remove_ids && remove_ids.length > 0) {
                await this.$http.post(apiUrl + 'removeShipment', {remove_ids: remove_ids})
              }
            }
            this.payableTable.removeDisabled = true
            await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
          } else if(this.checkPasswordType === 'removeReceivable') {
            let selection = this.$refs.receivableTable.getSelection()
            if(selection && selection.length > 0) {
              let remove_ids = []
              for(let s of selection) {
                remove_ids.push(s.shipment_fee_id)
              }
              if(remove_ids && remove_ids.length > 0) {
                await this.$http.post(apiUrl + 'removeShipment', {remove_ids: remove_ids})
              }
            }
            this.receivableTable.removeDisabled = true
            await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
          } else if(this.checkPasswordType === 'resetShipment') {
            let param = {
              export_masterbl_id: this.bookingShipment.export_masterbl_id,
            }
            await this.$http.post(apiUrl + 'resetShipment', param)
            await this.getBookingShipmentAct(this.bookingShipment.export_masterbl_id)
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    }
  }
}
</script>
<style scoped>
.total {
  padding-top: 20px;
  font-size: 12px;
}

.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}

.vessel_selected {
  border:rgb(84, 173, 247) solid 1px;
}
</style>