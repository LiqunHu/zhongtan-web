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
      Shipment Receipt
    </h1>
    <!-- end page-header -->
    <panel title="Shipment Receipt">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date_range" placeholder="Vessel Date" style="width: 200px" @on-change="searchRangeAct"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.vessel_name" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_no" placeholder="INVOICE No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbi_bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="searchDataAct">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="exportCollectModalAct"><i class="fa fa-download" style="padding-right:7px;"></i>Collect</button>
            </div>
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vesselHeight">
              <Row v-for="item in vesselData" v-bind:key="item.export_vessel_id">
                <Col>
                  <div :class="{vessel_selected: item.active}" @click="vesselSelectedAct(item)">
                    <Card>
                      <p slot="title">
                        {{item.export_vessel_name}}({{item.export_vessel_code}})-{{item.export_vessel_voyage}}
                      </p>
                      <Row>
                          <Col span="12">
                          <p>ETD: {{item.export_vessel_etd}}</p>
                          </Col>
                          <Col span="12">
                            B/C: {{item.bl_count}}/{{item.container_count}}
                          </Col>
                      </Row>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Scroll>
          </div>
        </Col>
        <Col span="17" offset="1">
          <Tabs :animated="true" @on-click="changeTabAct">
              <TabPane label="MasterBl">
                <Table stripe size="small" ref="masterbiTable" :columns="blTable.columns" :data="blTable.data" :height="blTable.height">
                  <template slot-scope="{ row, index }" slot="files">
                    <Poptip trigger="hover" placement="bottom-start" :transfer="true" v-if="row.files && row.files.length > 0">
                      <span>Files [{{row.files.length}}]</span>
                      <template slot="content">
                        <Table stripe size="small" :columns="filesTable.columns" :data="row.files">
                          <template slot-scope="{ row, index }" slot="file_no">
                            <span v-if="row.api_name === 'SHIPMENT-INVOICE'">{{row.uploadfile_invoice_no}}</span>
                            <span v-else-if="row.api_name === 'SHIPMENT-RECEIPT'">{{row.uploadfile_receipt_no}}</span>
                          </template>
                          <template slot-scope="{ row, index }" slot="file_type">
                            <Tag color="primary" v-if="row.api_name === 'SHIPMENT-INVOICE'">INVOICE</Tag>
                            <Tag color="success" v-else-if="row.api_name === 'SHIPMENT-RECEIPT'">RECEIPT</Tag>
                          </template>
                          <template slot-scope="{ row, index }" slot="act">
                            <Tooltip content="Download" placement="top">
                              <a :href="row.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                <i class="fa fa-download"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="RECEIPT" placement="top" v-if="row.api_name === 'SHIPMENT-INVOICE' && !row.uploadfile_receipt_no">
                              <a class="btn btn-pink btn-icon btn-sm" @click="receiptModelAct(row)">
                                <i class="fa fa-money-bill-alt"></i>
                              </a>
                            </Tooltip>
                          </template>
                        </Table>
                      </template>
                    </Poptip>
                  </template>
                </Table>
                <Page class="m-t-10" :total="blTable.total" :page-size="blTable.limit" @on-change="searchBlAct" />
              </TabPane>
              <TabPane label="Containers">
                <Table stripe size="small" ref="containerTable" :columns="containerTable.columns" :data="containerTable.data" :height="containerTable.height">
                </Table>
                <Page class="m-t-10" :total="containerTable.total" :page-size="containerTable.limit" @on-change="searchContainerAct" />
              </TabPane>
          </Tabs>
          </Col>
      </Row>
    </panel>
    <Modal v-model="modal.receiptModal" title="RECEIPT" width="600">
      <Form ref="receiptForm" :model="receiptForm" :label-width="150" style="padding-right: 80px;">
        <FormItem label="Received From" style="margin-bottom: 0px;">
          <Input v-model="receiptForm.shipment_receipt_party_name" disabled/>
        </FormItem>
        <FormItem label="Amount" style="margin-bottom: 0px;">
          <Input v-model="receiptForm.shipment_receipt_amount" disabled/>
        </FormItem>
        <FormItem label="Cash/Cheque" style="margin-bottom: 0px;">
          <Select v-model="receiptForm.shipment_receipt_check_cash" >
            <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id" :disabled = "item.id === 'CASH'">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Row v-if="receiptForm.shipment_receipt_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Reference No" prop="overdue_invoice_bank_reference_no" >
              <Input placeholder="Bank Reference No" v-model="receiptForm.shipment_receipt_bank_reference_no"/>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="receiptForm.shipment_receipt_check_cash === 'CHEQUE'">
          <Col>
            <FormItem label="Check No" prop="overdue_invoice_check_no" >
              <Input placeholder="Check No" v-model="receiptForm.shipment_receipt_check_no"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.receiptModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="receiptAct" >Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.collectModal" title="Download Receipt Collect" width="600" :mask-closable="false">
      <Form :model="collectForm" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Ship Co." prop="carrier">
              <Select v-model="collectForm.carrier">
                <Option v-for="item in pagePara.RECEIPT_TYPE_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Party" prop="party">
              <Select v-model="collectForm.receipt_party" transfer filterable>
                <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Vessel" prop="vessel">
              <Select v-model="collectForm.receipt_vessel" transfer filterable>
                <Option v-for="item in pagePara.VESSEL" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="VSL ETD" prop="collect_etd">
              <DatePicker type="daterange" v-model="collectForm.collect_etd" placeholder="ETD Date" style="width: 200px" @on-change="collectETD"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Receipt Data" prop="collect_date">
              <DatePicker type="daterange" v-model="collectForm.collect_date" placeholder="Date" @on-change="collectData"></DatePicker>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.collectModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="exportCollectAct">Submit</Button>
      </div>
    </Modal>
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
import printJS from 'print-js'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/ShipmentReceipt/'

export default {
  name: 'BookingLoadControl',
  data: function() {
    return {
      modal: { receiptModal: false, checkPasswordModal: false, collectModal: false },
      headers: common.uploadHeaders(),
      vesselHeight: common.getTableHeight(),
      pagePara: {},
      search_data: {
        date_range: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        etd_start_date: '',
        etd_end_date: '',
        vessel_name: '',
        invoice_no: '',
        masterbi_bl: '',
        export_vessel_id: ''
      },
      vesselData: [],
      blTable: {
        columns: [
          {
            title: '#M B/L No',
            key: 'export_masterbl_bl',
            width: 220
          },
          {
            title: 'File',
            slot: 'files',
            width: 200
          },
          {
            title: 'CSO/AGREEMENT NUMBER',
            key: 'export_masterbl_cso_number',
            width: 220
          },
          {
            title: 'CARGO TYPE',
            key: 'export_masterbl_cargo_type',
            width: 220
          },
          {
            title: 'SHIPPER',
            key: 'export_masterbl_shipper_company',
            width: 200
          },
          {
            title: 'FORWARDER',
            key: 'export_masterbl_forwarder_company',
            width: 200
          },
          {
            title: 'CONSIGNEE',
            key: 'export_masterbl_consignee_company',
            width: 200
          },
          {
            title: 'PORT OF LOAD',
            key: 'export_masterbl_port_of_load',
            width: 200
          },
          {
            title: 'PORT OF DISCHARGE',
            key: 'export_masterbl_port_of_discharge',
            width: 200
          },
          {
            title: 'TRAFFIC MODE',
            key: 'export_masterbl_traffic_mode',
            width: 200
          },
          {
            title: 'CONTAINER QTY',
            key: 'export_masterbl_container_quantity',
            width: 200
          },
          {
            title: 'CONTAINER WEIGHT',
            key: 'export_masterbl_container_weight',
            width: 200
          },
          {
            title: 'CARGO NATURE',
            key: 'export_masterbl_cargo_nature',
            width: 200
          },
          {
            title: 'CARGO DESCRIPTIONS',
            key: 'export_masterbl_cargo_descriptions',
            width: 200
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 10,
        offset: 0,
        total: 0
      },
      containerTable: {
        columns: [
          {
            title: '#M B/L No',
            key: 'export_container_bl',
            width: 220
          },
          {
            title: 'Container No',
            key: 'export_container_no',
            width: 200
          },
          {
            title: 'SOC/COC',
            key: 'export_container_soc_type',
            width: 200
          },
          {
            title: 'SIZE/TYPE',
            key: 'export_container_size_type',
            width: 200
          },
          {
            title: 'CARGO WEIGHT',
            key: 'export_container_cargo_weight',
            width: 200
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 10,
        offset: 0,
        total: 0
      },
      filesTable: {
        columns: [
          {
            title: '#No.',
            slot: 'file_no',
            width: 120
          },
          {
            title: 'Type',
            slot: 'file_type',
            width: 120
          },
          {
            title: 'Amount',
            key: 'uploadfile_amount',
            width: 120
          },
          {
            title: 'Action',
            slot: 'act',
            width: 120
          },
          {
            title: 'Create User',
            key: 'user_name',
            width: 120
          },
          {
            title: 'Create Date',
            key: 'created_at',
            width: 160
          },
        ]
      },
      containerData: [],
      currentTab: 0,
      vesselForm: {},
      vesselFormRule: {
        export_vessel_name: [{required: true,  message: 'The vessel name cannot be empty', trigger: 'blur'}],
        export_vessel_voyage: [{required: true, message: 'The vessel voyage cannot be empty', trigger: 'blur'}]
      },
      emptyReleaseForm: {},
      emptyReleaseFormRule: {
        export_masterbl_empty_release_agent: [{required: true,  message: 'The empty release agent cannot be empty', trigger: 'blur'}],
        export_masterbl_empty_release_depot: [{required: true, message: 'The empty release depot cannot be empty', trigger: 'blur'}]
      },
      emptyReleaseQuantitys: [],
      emptyReleaseAgent: [],
      emptyReleaseDepot: [],
      emptyReleaseAgentStaff: [],
      checkPassword: '',
      checkPasswordType: '',
      bookingEditForm: {},
      receiptForm: {
        file_id: '',
        shipment_receipt_party_name: '',
        shipment_receipt_amount: '',
        shipment_receipt_check_cash: 'TRANSFER',
        shipment_receipt_check_no: '',
        shipment_receipt_bank_reference_no: ''
      },
      collectForm: {
        carrier: '',
        receipt_party: '',
        collect_date: ''
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getPara()
    this.searchDataAct()
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
    searchDataAct: async function() {
      try {
        let searchPara = {
            ...this.search_data
        }
        let response = await this.$http.post(apiUrl + 'searchVessel', searchPara)
        this.$nextTick(function() {
          this.vesselData = response.data.info
          if(this.vesselData) {
            let active = false
            for(let i = 0; i < this.vesselData.length; i++) {
              if(this.vesselData[i].export_vessel_id === this.search_data.export_vessel_id) {
                this.vesselData[i].active = true
                active = true
                break
              }
            }
            if(!active) {
              for(let i = 0; i < this.vesselData.length; i++) {
                if(i === 0) {
                  this.vesselData[i].active = true
                  this.search_data.export_vessel_id = this.vesselData[i].export_vessel_id
                } else {
                  this.vesselData[i].active = false
                }
              }
            }
          }
          this.searchBlAct()
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchBlAct: async function(index) {
      try {
        if (index) {
          this.blTable.offset = (index - 1) * this.blTable.limit
        }
        let searchPara = {
            ...this.search_data,
            limit: this.blTable.limit,
            offset: this.blTable.offset
        }
        let response = await this.$http.post(apiUrl + 'searchBl', searchPara)
        this.$nextTick(function() {
          let data = response.data.info
          this.blTable.total = data.total
          this.blTable.data = JSON.parse(JSON.stringify(data.rows))
          this.blTable.unchanged = JSON.parse(JSON.stringify(data.rows))
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchContainerAct: async function(index) {
      try {
        if (index) {
          this.containerTable.offset = (index - 1) * this.containerTable.limit
        }
        let searchPara = {
            ...this.search_data,
            limit: this.containerTable.limit,
            offset: this.containerTable.offset
        }
        let response = await this.$http.post(apiUrl + 'searchContainer', searchPara)
        this.$nextTick(function() {
          let data = response.data.info
          this.containerTable.total = data.total
          this.containerTable.data = JSON.parse(JSON.stringify(data.rows))
          this.containerTable.unchanged = JSON.parse(JSON.stringify(data.rows))
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchRangeAct: function(e) {
      this.search_data.date_range = JSON.parse(JSON.stringify(e))
      this.search_data.etd_start_date = this.search_data.date_range[0]
      this.search_data.etd_end_date = this.search_data.date_range[1]
    },
    vesselSelectedAct: function(item) {
      this.$nextTick(function() {
        if(this.vesselData) {
          for(let v of this.vesselData) {
            if(v.export_vessel_id === item.export_vessel_id) {
              v.active = true
              this.search_data.export_vessel_id = v.export_vessel_id
              this.searchTableAct()
            } else {
              v.active = false
            }
          }
          this.$forceUpdate()
        }
      })
    },
    changeTabAct: function(name) {
      if (this.currentTab != name) {
          this.currentTab = name
      }
      this.searchTableAct()
    },
    searchTableAct: function() {
      if(this.currentTab === 0) {
        this.searchBlAct()
      } else {
        this.searchContainerAct()
      }
    },
    receiptModelAct: async function(row) {
      this.receiptForm.file_id = row.uploadfile_id
      this.receiptForm.shipment_receipt_party_name = row.shipment_receipt_party_name
      this.receiptForm.shipment_receipt_amount = row.uploadfile_amount
      this.receiptForm.shipment_receipt_check_cash = 'TRANSFER'
      this.receiptForm.shipment_receipt_check_no = ''
      this.receiptForm.shipment_receipt_bank_reference_no = ''
      this.modal.receiptModal = true
    },
    receiptAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'shipmentReceipt', this.receiptForm)
        printJS(response.data.info.url)
        this.$Message.success('Receipt Success')
        this.modal.receiptModal = false
        this.searchTableAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    collectETD: function(e) {
      this.collectForm.collect_etd = JSON.parse(JSON.stringify(e))
    },
    collectData: function(e) {
      this.collectForm.collect_date = JSON.parse(JSON.stringify(e))
    },
    exportCollectModalAct: async function() {
      this.collectForm = {
        carrier: '',
        receipt_party: '',
        collect_date: ''
      }
      this.modal.collectModal = true
    },
    exportCollectAct: async function() {
      try {
        let response = await this.$http.request({url: apiUrl + 'exportCollect', method: 'post', data: this.collectForm, responseType: 'blob'})
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Shipment Receipt Report.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
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