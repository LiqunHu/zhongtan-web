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
    <panel title="Shipment Release">
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
                  </template>
                </Table>
              </div>
            </Split>
          </div>
          <div slot="right">
            <Card>
              <div slot="title">
                #M B/L No. {{bookingShipment.export_masterbl_bl}}
                <Tag color="primary">{{bookingShipment.export_masterbl_cargo_type}}</Tag>
              </div>
              <Button slot="extra" size="small" type="primary">详细信息</Button>
              <Button slot="extra" size="small" style="margin-left: 7px;">操作历史</Button>
              <Row>
                <Col span="4"><font style="color:#17233D; font-size: 16px;">Vessel: </font>{{bookingShipment.vessel.export_vessel_name}}</Col>
                <Col span="4"><font style="color:#17233D; font-size: 16px;">Voyage: </font>{{bookingShipment.vessel.export_vessel_voyage}}</Col>
                <Col span="4"><font style="color:#17233D; font-size: 16px;">Size/Type: </font>{{bookingShipment.size_type}}</Col>
              </Row>
            </Card>
            <Card>
              <Button slot="title" size="small" type="info" icon="ios-settings-outline" v-on:click="saveShipmentAct">SAVE</Button>
              <Button slot="title" size="small" type="primary" icon="ios-send-outline" style="margin-left: 7px;" v-on:click="submitShipmentAct" :disabled="submitDisabled">SUBMIT</Button>
              <Button slot="title" size="small" type="error" icon="ios-undo-outline" style="margin-left: 7px;" v-on:click="undoShipmentAct" :disabled="undoDisabled">UNDO</Button>
              <Button slot="title" size="small" type="success" icon="ios-paper-outline" style="margin-left: 7px;" v-on:click="invoiceShipmentAct" :disabled="invoiceDisabled">INVOICE</Button>
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
                        <Button size="small" type="primary" icon="ios-add" title="ADD RECEIVABLE" v-on:click="addReceivableAct">ADD</Button>
                        <Button size="small" type="error" style="margin-left: 7px;" icon="ios-remove" title="REMOVE RECEIVABLE" :disabled="receivableTable.removeDisabled" v-on:click="removeReceivableAct">REMOVE</Button>
                        <Button size="small" type="warning" style="margin-left: 7px;" icon="ios-add" title="SUPPLEMENT RECEIVABLE" v-on:click="addSupplementReceivableAct">SUPPLEMENT</Button>
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
                          </template>
                          <template slot-scope="{ row, index }" slot="invoce_file">
                            <a :href="row.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank" v-if="row.uploadfile_url">
                              <i class="fa fa-download"></i>
                            </a>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_party">
                            <Select v-model="receivableTable.data[index].shipment_fee_party" transfer filterable  :disabled="receivableTable.data[index].party_disabled">
                              <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee">
                            <Select v-model="receivableTable.data[index].fee_data_code" v-if="receivableTable.data[index].shipment_fee_supplement ==='1'" transfer :disabled="receivableTable.data[index].fee_disabled">
                              <Option v-for="item in pagePara.ALL_RECEIVABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="receivableTable.data[index].fee_data_code" v-else-if="receivableTable.data[index].fee_data_fixed ==='1'" disabled>
                              <Option v-for="item in pagePara.FIXED_RECEIVABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="receivableTable.data[index].fee_data_code" v-else transfer :disabled="receivableTable.data[index].fee_disabled" @on-change="changeShipmentFeeAct(index, 'R')">
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
                        <Button size="small" type="primary" icon="ios-add" title="ADD PAYABLE" v-on:click="addPayableAct">ADD</Button>
                        <Button size="small" type="error" style="margin-left: 7px;" icon="ios-remove" title="REMOVE PAYABLE" :disabled="payableTable.removeDisabled" v-on:click="removePayableAct">REMOVE</Button>
                        <Button size="small" type="warning" style="margin-left: 7px;" icon="ios-add" title="SUPPLEMENT PAYABLE" v-on:click="addSupplementPayableAct">SUPPLEMENT</Button>
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
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_party">
                            <Select v-model="payableTable.data[index].shipment_fee_party" transfer filterable :disabled="payableTable.data[index].party_disabled">
                              <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                            </Select>
                          </template>
                          <template slot-scope="{ row, index }" slot="shipment_fee">
                            <Select v-model="payableTable.data[index].fee_data_code" v-if="payableTable.data[index].shipment_fee_supplement ==='1'" transfer :disabled="payableTable.data[index].fee_disabled">
                              <Option v-for="item in pagePara.ALL_PAYABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="payableTable.data[index].fee_data_code" v-if="payableTable.data[index].fee_data_fixed ==='1'" disabled>
                              <Option v-for="item in pagePara.FIXED_PAYABLE_FEE" :value="item.fee_data_code" :key="item.fee_data_code">{{ item.fee_data_code }} - {{ item.fee_data_name }}</Option>
                            </Select>
                            <Select v-model="payableTable.data[index].fee_data_code" v-else transfer :disabled="payableTable.data[index].fee_disabled" @on-change="changeShipmentFeeAct(index, 'P')">
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
      fullHeight: document.documentElement.clientHeight - 230,
      splitLeft: '240',
      splitBooking: '156',
      splitShipment: 0.6,
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
            width: 50,
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
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    this.$refs.displayLayout.style.height = this.fullHeight + 'px'
    this.$refs.shipmentLayout.style.height = (this.fullHeight - 200) + 'px'
    this.receivableTable.height = (this.fullHeight - 200) * this.splitShipment - 40
    this.payableTable.height = (this.fullHeight - 200) * (1-this.splitShipment) - 40
    await this.initAct()
  },
  methods: {
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
      let param = {
        export_masterbl_id: export_masterbl_id
      }
      let response = await this.$http.post(apiUrl + 'getBookingShipment', param)
      this.bookingShipment = response.data.info
      this.receivableTable.data = this.bookingShipment.shipment_receivable
      if(this.receivableTable.data && this.receivableTable.data.length > 0) {
        let invoiceStatus = ['AP']
        for(let d of this.receivableTable.data) {
          if(invoiceStatus.indexOf(d.shipment_fee_status) >= 0) {
            this.invoiceDisabled = false
          }
        }
      }
      this.payableTable.data = this.bookingShipment.shipment_payable
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
      for(let d of tableData) {
        if(d.shipment_fee_invoice_id === row.shipment_fee_invoice_id) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].shipment_fee_invoice_id === row.shipment_fee_invoice_id) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    shipmentSplitMoveAct: async function() {
      this.receivableTable.height = (this.fullHeight - 200) * this.splitShipment - 40
      this.payableTable.height = (this.fullHeight - 200) * (1-this.splitShipment) - 40
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
    },
    removeReceivableAct: async function() {
      let selection = this.$refs.receivableTable.getSelection()
      if(selection && selection.length > 0) {
        for(let s of selection) {
          for(let i = 0; i < this.receivableTable.data.length; i++) {
            if(s.shipment_fee_id === this.receivableTable.data[i].shipment_fee_id) {
              this.receivableTable.data.splice(i, 1)
            }
          }
        }
      }
      this.receivableTable.removeDisabled = true
    },
    removePayableAct: async function() {
      let selection = this.$refs.payableTable.getSelection()
      if(selection && selection.length > 0) {
        for(let s of selection) {
          for(let i = 0; i < this.payableTable.data.length; i++) {
            if(s.shipment_fee_id === this.payableTable.data[i].shipment_fee_id) {
              this.payableTable.data.splice(i, 1)
            }
          }
        }
      }
      this.payableTable.removeDisabled = true
    },
    selectReceivableAct: async function(selection) {
      if(selection && selection.length > 0) {
        let submitStatus = ['SA', 'DE', 'UN'] 
        let undoStatus = ['SU']
        this.receivableTable.removeDisabled = false
        this.submitDisabled = false
        this.undoDisabled = false
        for(let s of selection) {
          if(s.fee_data_fixed === '1') {
            this.receivableTable.removeDisabled = true
            break
          }
        }
        for(let s of selection) {
          if(submitStatus.indexOf(s.shipment_fee_status) < 0 || !s.fee_data_code 
              || !s.shipment_fee_party || !s.shipment_fee_amount || parseInt(s.shipment_fee_amount) === 0) {
            this.submitDisabled = true
            break
          }
        }
        for(let s of selection) {
          if(undoStatus.indexOf(s.shipment_fee_status) < 0) {
            this.undoDisabled = true
            break
          }
        }
      } else {
        this.receivableTable.removeDisabled = true
        this.submitDisabled = true
        this.undoDisabled = true
      }
    },
    selectPayableAct: async function(selection) {
      if(selection && selection.length > 0) {
        let submitStatus = ['SA', 'DE', 'UN'] 
        let undoStatus = ['SU']
        this.payableTable.removeDisabled = false
        this.submitDisabled = false
        this.undoDisabled = false
        for(let s of selection) {
          if(s.fee_data_fixed === '1') {
            this.payableTable.removeDisabled = true
            break
          }
        }
        for(let s of selection) {
          if(submitStatus.indexOf(s.shipment_fee_status) < 0 || !s.fee_data_code 
              || !s.shipment_fee_party || !s.shipment_fee_amount || parseInt(s.shipment_fee_amount) === 0) {
            this.submitDisabled = true
            break
          }
        }
        for(let s of selection) {
          if(undoStatus.indexOf(s.shipment_fee_status) < 0) {
            this.undoDisabled = true
            break
          }
        }
      } else {
        this.payableTable.removeDisabled = true
        this.submitDisabled = true
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
        export_masterbl_id: this.bookingShipment.export_masterbl_id,
        shipment_receivable: this.$refs.receivableTable.getSelection(),
        shipment_payable: this.$refs.payableTable.getSelection(),
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
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let param = {
            page: 'BookingLoad',
            action: this.checkPasswordType,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
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