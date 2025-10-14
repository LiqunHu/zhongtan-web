<style>
  .ivu-table .table-info-row td{
      /* background-color: #49B6D6; */
      color: #ADADAD;
  }
</style>
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
      Shipment Proforma
    </h1>
    <!-- end page-header -->
    <panel title="Shipment Proforma">
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
              <Select v-model="search_data.bl_carrier" placeholder="BL Carrier" clearable style="width:140px">
                <Option v-for="item in carrierList" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbi_bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.shipper_company" placeholder="Shipper Company" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.consignee_company" placeholder="Consignee Company" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="searchDataAct">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="shipmentLoadModalAct">Load Shipment</button>
            </div>
            <!-- <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="bookingLoadModalAct">Load Proforma</button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="bookingImportModalAct" title="import freight amount">Import Freight</button>
            </div> -->
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vesselHeight">
              <Row v-for="item in vesselData" v-bind:key="item.export_vessel_id">
                <Col :span="24">
                  <div :class="{vessel_selected: item.active}" @click="vesselSelectedAct(item)">
                    <Card>
                      <span slot="title">{{item.export_vessel_name}}({{item.export_vessel_code}})-{{item.export_vessel_voyage}}</span>
                      <a href="#" slot="extra" @click.stop="vesselModifyAct(item)" title="Edit">
                          <i class="fa fa-edit"></i>
                      </a>
                      <a href="#" slot="extra" @click.stop="vesselDeleteAct(item)" title="Remove" style="color: red; margin-left: 5px;">
                          <i class="fa fa-times"></i>
                      </a>
                      <Row>
                          <Col span="12">
                          <p>ETD: {{item.export_vessel_etd}}</p>
                          </Col>
                          <Col span="12">
                            <Tooltip placement="right" v-if="item.size_types">
                              <span>B/C: {{item.bl_count}}/{{item.container_count}}</span>
                              <div slot="content">
                                  <p v-for="(con, conI) in item.size_types" :key="conI">
                                      {{con.containers_size}} : {{con.containers_size_count}}
                                  </p>
                              </div>
                            </Tooltip>
                            <span v-else>B/C: {{item.bl_count}}/{{item.container_count}}</span>
                          </Col>
                      </Row>
                      <Row>
                          <Col span="12">
                          <p>Prepaid: {{item.export_vessel_total_prepaid}}</p>
                          </Col>
                          <Col span="12">
                          <p v-if="item.export_total_units">Total Units: {{item.export_total_units}}</p>
                          <p v-else>Total Units: <Input v-model="item.modify_export_total_units" clearable size="small" style="width: 70px;"></Input><Icon v-if="item.modify_export_total_units" type="md-checkmark" size="16" color="#19be6b" style="cursor: pointer; margin-left:7px;" v-on:click="modifyVesselTotalUnits(item)"/></p>
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
                <Table size="small" ref="masterbiTable" :row-class-name="masterbiRowClassName" :columns="blTable.columns" :data="blTable.data" :height="blTable.height">
                  <template slot-scope="{ row, index }" slot="export_masterbl_bl">
                    {{row.export_masterbl_bl}} 
                    <a href="#" slot="extra" @click.stop="masterblDeleteModalAct(row)" title="Remove" style="color: red; margin-left: 5px;">
                      <i class="fa fa-times"></i>
                    </a>
                  </template>
                  <template slot-scope="{ row, index }" slot="empty_release">
                    <Tooltip content="EDIT">
                      <a v-if="row.export_masterbl_empty_release_date" href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="bookingEditCheckModalAct(row)">
                        <i class="fa fa-edit"></i>
                      </a>
                      <a v-else href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="bookingEditModalAct(row)">
                        <i class="fa fa-edit"></i>
                      </a>
                    </Tooltip>
                  </template>
                </Table>
                <Page class="m-t-10" :current="blTable.current" :total="blTable.total" :page-size="blTable.limit" :pageSizeOpts = "blTable.pageSizeOpts" show-total show-sizer show-elevator @on-change="searchBlAct"  @on-page-size-change="changeBlPageSize"/>
              </TabPane>
              <TabPane label="Containers">
                <Table stripe size="small" ref="containerTable" :columns="containerTable.columns" :data="containerTable.data" :height="containerTable.height">
                  <template slot-scope="{ row, index }" slot="export_container_cargo_package">
                    {{row.export_container_cargo_package}} {{row.export_container_cargo_package_unit}}
                  </template>
                  <template slot-scope="{ row, index }" slot="export_container_cargo_weight">
                    {{row.export_container_cargo_weight}} {{row.export_container_cargo_weight_unit}}
                  </template>
                  <template slot-scope="{ row, index }" slot="export_container_cargo_volumn">
                    {{row.export_container_cargo_volumn}} {{row.export_container_cargo_volumn_unit}}
                  </template>
                </Table>
                <Page class="m-t-10" :current="containerTable.current" :total="containerTable.total" :page-size="containerTable.limit" :pageSizeOpts = "containerTable.pageSizeOpts" show-total show-sizer show-elevator @on-change="searchContainerAct" @on-page-size-change="changeContainerPageSize"/>
              </TabPane>
          </Tabs>
          </Col>
      </Row>
    </panel>
    <Modal v-model="modal.bookingModal" title="Proforma">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :on-error="handleError"
            :format="['pdf', 'PDF']"
            :max-size="5120"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/export/ShipmentProforma/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bookingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="bookingData">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.importModal" title="Import Freight">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileListFreight" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="uploadImport"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccessFreight"
            :on-error="handleError"
            :format="['xlsx', 'xls', 'XLSX', 'XLS']"
            :max-size="5120"
            :on-format-error="handleFormatErrorFreight"
            :on-exceeded-size="handleMaxSizeFreight"
            type="drag"
            action="/api/zhongtan/export/ShipmentProforma/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.importModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="importFreightData">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.shipmentModal" title="Shipment">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileListShipment" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="uploadShipment"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleShipmentSuccess"
            :on-error="handleError"
            :format="['xls', 'XLS', 'xlsx', 'XLSX']"
            :max-size="5120"
            :on-format-error="handleShipmentFormatError"
            :on-exceeded-size="handleShipmentMaxSize"
            type="drag"
            action="/api/zhongtan/export/ShipmentProforma/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.shipmentModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="shipmentData">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.vesselModal" title="Vessel">
      <Form ref="vesselForm" :model="vesselForm" :rules="vesselFormRule" :label-width="120">
        <FormItem label="Vessel Name" prop="export_vessel_name">
            <Input placeholder="Vessel Name" v-model="vesselForm.export_vessel_name" clearable></Input>
        </FormItem>
        <FormItem label="Vessel Voyage" prop="export_vessel_voyage">
            <Input placeholder="Vessel Voyage" v-model="vesselForm.export_vessel_voyage" clearable></Input>
        </FormItem>
        <FormItem label="Vessel ETD">
            <DatePicker type="date" placeholder="Select Vessel ETD" :value="vesselForm.export_vessel_etd" format="dd/MM/yyyy" @on-change="vesselEtdDateChange"></DatePicker>
        </FormItem>
        <FormItem label="Total Units" prop="export_total_units">
            <Input placeholder="Total Units" v-model="vesselForm.export_total_units" clearable></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.vesselModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitVesselModifyAct">Submit</Button>
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
          <Button type="text" size="large" @click="checkPasswordCancel">Cancel</Button>
          <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.bookingEditModal" title="SHIPMENT PROFORMA EDIT" width="640">
      <Form ref="bookingEditForm" :model="bookingEditForm" :label-width="128">
        <FormItem label="FORWARDER" prop="export_masterbl_empty_release_agent">
          <Select v-model="bookingEditForm.export_masterbl_empty_release_agent" filterable :remote-method="remoteEmptyReleaseAgent">
            <Option v-for="(item, index) in emptyReleaseAgent" :value="item.user_id" :key="index" :label="item.user_name">
              <span>{{item.user_name}}</span>
              <Tag color="success" v-if="item.user_customer_type === '1'" style="float: right;">AGEN</Tag>
              <Tag color="warning" v-if="item.user_customer_type === '2'" style="float: right;">CNEE</Tag>
              <Tag color="error" v-if="item.user_blacklist === '1'" style="float: right;">BLACK</Tag>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="CARGO TYPE" prop="export_masterbl_cargo_type">
          <RadioGroup v-model="bookingEditForm.export_masterbl_cargo_type">
            <Radio label="TRANSIT"></Radio>
            <Radio label="LOCAL"></Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="SALES CODE" v-if="pagePara.SALES_CODE">
          <Select v-model="bookingEditForm.export_masterbl_sales_code" filterable clearable :disabled="bookingEditForm.old_export_masterbl_sales_code">
            <Option v-for="(item, index) in pagePara.SALES_CODE" :value="item.user_code" :key="index" :label="item.user_code">
              <span>{{item.user_code}}</span>
              <span style="float: right;">{{item.user_name}}</span>
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bookingEditModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitBookingAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/ShipmentProforma/'

export default {
  name: 'ShipmentProformaControl',
  data: function() {
    return {
      modal: { bookingModal: false, importModal: false, checkPasswordModal: false, emptyReleaseModal: false, bookingEditModal: false, shipmentModal:  false},
      headers: common.uploadHeaders(),
      vesselHeight: common.getTableHeight(),
      carrierList: [
        { id: 'COSCO', text: 'COSCO' },
        { id: 'OOCL', text: 'OOCL' }
      ],
      search_data: {
        date_range: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        etd_start_date: '',
        etd_end_date: '',
        vessel_name: '',
        masterbi_bl: '',
        export_vessel_id: '',
        shipper_company: '',
        consignee_company: '',
        bl_carrier: ''
      },
      pagePara: {},
      workPara: {},
      files: {
        fileList: [],
        fileListFreight: [],
        fileListShipment: []
      },
      vesselData: [],
      blTable: {
        columns: [
          {
            title: '#M B/L No',
            slot: 'export_masterbl_bl',
            width: 220
          },
          {
            title: 'ACT',
            slot: 'empty_release',
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
            title: 'CONTAINER PACKAGE',
            key: 'export_container_cargo_package',
            width: 200
          },
          {
            title: 'CONTAINER WEIGHT',
            key: 'export_masterbl_container_weight',
            width: 200
          },
          {
            title: 'CONTAINER VOLUMN',
            key: 'export_container_cargo_volumn',
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
          },
          {
            title: 'SALES CODE',
            key: 'export_masterbl_sales_code',
            width: 200
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 20,
        offset: 0,
        total: 0,
        pageSizeOpts: [20, 40, 60, 80]
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
            title: 'CARGO PACKAGE',
            slot: 'export_container_cargo_package',
            width: 200
          },
          {
            title: 'CARGO WEIGHT',
            slot: 'export_container_cargo_weight',
            width: 200
          },
          {
            title: 'CARGO VOLUMN',
            slot: 'export_masterbl_container_volumn',
            width: 200
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        current: 1,
        limit: 20,
        offset: 0,
        total: 0,
        pageSizeOpts: [20, 40, 60, 80]
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
      bookingEditForm: {}
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.initPage()
    this.searchDataAct()
  },
  methods: {
    initPage: async function() {
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
          this.blTable.current = index
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
          this.containerTable.current = index
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
    changeBlPageSize: async function(pageSize) {
      this.blTable.limit = pageSize
      this.searchBlAct(1)
    },
    changeContainerPageSize: async function(pageSize) {
      this.containerTable.limit = pageSize
      this.searchContainerAct(1)
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
              this.searchTableAct(1)
            } else {
              v.active = false
            }
          }
          this.$forceUpdate()
        }
      })
    },
    vesselModifyAct: function(item) {
      this.$nextTick(function() {
        this.vesselForm = JSON.parse(JSON.stringify(item))
        this.checkPassword = ''
        this.checkPasswordType = 'vesselModify'
        this.modal.checkPasswordModal = true
      })
    },
    vesselEtdDateChange: async function(date) {
        this.vesselForm.export_vessel_etd = date
    },
    doVesselModifyAct: async function() {
      this.modal.vesselModal = true
    },
    submitVesselModifyAct: async function() {
      this.$refs['vesselForm'].validate(async valid => {
        if (valid) {
          try {
            let param = {
              ...this.vesselForm
            }
            await this.$http.post(apiUrl + 'modifyVessel', param)
            this.searchDataAct()
          }catch (error) {
            this.$commonact.fault(error)
          }
          this.modal.vesselModal = false
        }
      })
    },
    vesselDeleteAct: function(item) {
      this.$nextTick(function() {
        this.vesselForm = JSON.parse(JSON.stringify(item))
        this.checkPassword = ''
        this.checkPasswordType = 'vesselDelete'
        this.modal.checkPasswordModal = true
      })
    },
    doVesselDeleteAct: async function() {
      this.$commonact.confirm(`Delete the vessel?`, async() => {
        try {
          let param = {
            ...this.vesselForm
          }
          await this.$http.post(apiUrl + 'deleteVessel', param)
          this.searchDataAct()
        }catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    changeTabAct: function(name) {
      if (this.currentTab != name) {
          this.currentTab = name
      }
      this.searchTableAct()
    },
    searchTableAct: function(index) {
      if(this.currentTab === 0) {
        this.searchBlAct(index)
      } else {
        this.searchContainerAct(index)
      }
    },
    bookingLoadModalAct: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.upload.fileList = []
      this.files.fileList = []
      this.modal.bookingModal = true
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileList = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleSuccessFreight(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileListFreight = JSON.parse(JSON.stringify(this.$refs.uploadImport.fileList))
    },
    handleShipmentSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileListShipment = JSON.parse(JSON.stringify(this.$refs.uploadShipment.fileList))
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
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select pdf.'
      })
    },
    handleFormatErrorFreight(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select pdf.'
      })
    },
    handleShipmentFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select excel.'
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 5M.'
      })
    },
    handleMaxSizeFreight(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 5M.'
      })
    },
    handleShipmentMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 5M.'
      })
    },
    bookingData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload pdf file')
        }
        this.workPara.upload_files = this.files.fileList
        await this.$http.post(apiUrl + 'uploadBooking', this.workPara)
        this.$Message.success('submit success')
        this.modal.bookingModal = false
        this.searchDataAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    bookingImportModalAct: async function() {
      this.workPara = {}
      this.action = 'import'
      this.$refs.uploadImport.fileList = []
      this.files.fileListFreight = []
      this.modal.importModal = true
    },
    importFreightData: async function() {
      try {
        if (this.files.fileListFreight.length < 1) {
          return this.$Message.error('Please upload excel file')
        }
        this.workPara.upload_files = this.files.fileListFreight
        await this.$http.post(apiUrl + 'importFreight', this.workPara)
        this.$Message.success('import success')
        this.modal.importModal = false
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
          let action = ''
          if (this.checkPasswordType === 'vesselModify' || this.checkPasswordType === 'vesselDelete') {
            action = 'EXPORT_VESSEL_EDIT'
          } else if (this.checkPasswordType === 'bookingEdit' || this.checkPasswordType === 'bookingDelete') {
            action = 'EXPORT_PROFORMA_EDIT'
          } 
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'vesselModify') {
            this.doVesselModifyAct()
          } else if (this.checkPasswordType === 'vesselDelete') {
            this.doVesselDeleteAct()
          } else if (this.checkPasswordType === 'bookingEdit') {
            this.bookingEditModalAct(this.bookingEditForm)
          } else if(this.checkPasswordType === 'bookingDelete') {
            this.masterblDeleteAct()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    remoteEmptyReleaseAgent: async function(query) {
      if(query) {
        let param = {
          query: query
        }
        let response = await this.$http.post(apiUrl + 'getEmptyReleaseAgents', param)
        this.$nextTick(function() {
          let data = response.data.info
          this.emptyReleaseAgent = data.agents ? JSON.parse(JSON.stringify(data.agents)) : []
        })
      }
    },
    submitEmptyReleaseAct: async function() {
      this.$refs['emptyReleaseForm'].validate(async valid => {
        if (valid) {
          try {
            let release_quantity = 0
            if(this.emptyReleaseQuantitys) {
              for(let q of this.emptyReleaseQuantitys) {
                release_quantity = release_quantity + q.release_quantity
              }
            }
            if(release_quantity <= 0) {
              this.$Message.error('Please input release quantity')
              return
            }
            let param = {
              ...this.emptyReleaseForm,
              agentStaff: this.emptyReleaseAgentStaff,
              quantitys: this.emptyReleaseQuantitys
            }
            await this.$http.post(apiUrl + 'emptyRelease', param)
            this.searchDataAct()
          }catch (error) {
            this.$commonact.fault(error)
          }
          this.modal.emptyReleaseModal = false
        }
      })
    },
    bookingEditCheckModalAct: async function(item) {
      this.$nextTick(function() {
        this.bookingEditForm = JSON.parse(JSON.stringify(item))
        this.checkPassword = ''
        this.checkPasswordType = 'bookingEdit'
        this.modal.checkPasswordModal = true
      })
    },
    bookingEditModalAct: async function(item) {
      this.bookingEditForm = JSON.parse(JSON.stringify(item))
      this.modal.bookingEditModal = true
    },
    submitBookingAct: async function() {
      this.$refs['bookingEditForm'].validate(async valid => {
        if (valid) {
          try {
            let param = {
              ...this.bookingEditForm
            }
            await this.$http.post(apiUrl + 'bookingDataSave', param)
            this.searchDataAct()
          }catch (error) {
            this.$commonact.fault(error)
          }
          this.modal.bookingEditModal = false
        }
      })
    },
    masterblDeleteModalAct: async function(item) {
      this.$nextTick(function() {
        this.bookingEditForm = JSON.parse(JSON.stringify(item))
        this.checkPassword = ''
        this.checkPasswordType = 'bookingDelete'
        this.modal.checkPasswordModal = true
      })
    },
    masterblDeleteAct: async function() {
      this.$commonact.confirm(`Delete the booking?`, async() => {
        try {
          let param = {
            ...this.bookingEditForm
          }
          await this.$http.post(apiUrl + 'bookingDataDelete', param)
          this.searchDataAct()
        }catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    shipmentLoadModalAct: async function() {
      this.workPara = {}
      this.action = 'shipment'
      this.$refs.uploadShipment.fileList = []
      this.files.fileListShipment = []
      this.modal.shipmentModal = true
    },
    shipmentData: async function() {
      try {
        if (this.files.fileListShipment.length < 1) {
          return this.$Message.error('Please upload xls file')
        }
        this.workPara.upload_files = this.files.fileListShipment
        await this.$http.post(apiUrl + 'uploadShipment', this.workPara)
        this.$Message.success('submit success')
        this.modal.shipmentModal = false
        this.searchDataAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    masterbiRowClassName (row, index) {
      if(row.shipment_fee) {
        return ''
      } else {
        return 'table-info-row'
      }
    },
    modifyVesselTotalUnits: async function(item) {
      try {
        let param = {
          modify_type: 'line',
          export_vessel_id: item.export_vessel_id,
          export_total_units: item.modify_export_total_units
        }
        await this.$http.post(apiUrl + 'modifyVessel', param)
        this.searchDataAct()
      }catch (error) {
        this.$commonact.fault(error)
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