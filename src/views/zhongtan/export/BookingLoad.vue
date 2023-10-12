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
      Booking Empty Release
    </h1>
    <!-- end page-header -->
    <panel title="Booking Empty Release">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date_range" placeholder="Vessel Date" style="width: 160px" @on-change="searchRangeAct"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.vessel_id" filterable placeholder="Vessel Voyage" style="width:160px">
                <Option v-for="item in pagePara.VESSEL_VOYAGES" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel_voyage }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.firm_booking" filterable placeholder="FIRM BK" style="width:160px">
                <Option v-for="item in firm_booking_filter" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbi_bl" placeholder="B/L No" style="width: 160px" />
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.forwarder" filterable clearable :remote-method="remoteEmptyReleaseAgent" placeholder="FORWARDER" style="width: 160px">
                <Option v-for="(item, index) in emptyReleaseAgent" :value="item.user_name" :key="index" :label="item.user_name"></Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.shipper" placeholder="SHIPPER" style="width: 160px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.consignee" placeholder="CONSIGNEE" style="width: 160px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="searchDataAct">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="bookingLoadModalAct">Load</button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="bookingExport">Export</button>
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
                          <p>Gross Weight: {{item.gross_weight}}</p>
                        </Col>
                        <Col span="12">
                          <p>Tare Weight: {{item.tare_weight}}</p>
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
                  <template slot-scope="{ row, index }" slot="export_masterbl_firm_booking">
                    <Checkbox v-model="row.export_masterbl_firm_booking" true-value="YES" false-value="NO" @on-change="changeFirmBooking(row)" :disabled="row.export_masterbl_bl.indexOf('*') >= 0"></Checkbox>
                  </template>
                  <template slot-scope="{ row, index }" slot="export_masterbl_bl">
                    <span v-if="row.export_masterbl_bl.indexOf('*') >= 0" style="color:red;">{{row.export_masterbl_bl}}</span>
                    <span v-else>{{row.export_masterbl_bl}}</span>
                  </template>
                  <template slot-scope="{ row, index }" slot="empty_release" v-if="row.export_masterbl_bl.indexOf('*') < 0">
                    <Tooltip :content="row.export_masterbl_empty_release_approve_date" v-if="row.export_masterbl_empty_release_approve_date">
                      <a href="#" class="btn btn-green btn-icon btn-sm" v-on:click="emptyReleaseModalCheckAct(row)" :disabled ="row.disabled_empty_release">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                    <Tooltip :content="row.export_masterbl_empty_release_date" v-else-if="row.export_masterbl_empty_release_date">
                      <a href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="emptyReleaseModalAct(row)" :disabled ="row.disabled_empty_release">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="EMPTY RELEASE" v-else>
                      <a href="#" class="btn btn-info btn-icon btn-sm" v-on:click="emptyReleaseModalAct(row)" :disabled ="row.disabled_empty_release">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="EDIT">
                      <a v-if="row.export_masterbl_empty_release_date || row.export_masterbl_forwarder_company_input || row.export_masterbl_cargo_type_input" href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="bookingEditCheckModalAct(row)">
                        <i class="fa fa-edit"></i>
                      </a>
                      <a v-else href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="bookingEditModalAct(row)">
                        <i class="fa fa-edit"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Booking Guarantee Fee" v-if="row.bk_cancellation && row.bk_cancellation === '1'">
                      <a href="#" class="btn btn-success btn-icon btn-sm" v-if="row.bk_cancellation_disabled" v-on:click="bkCancellationFeeModalAct(row)">
                        <i class="fa fa-backward"></i>
                      </a>
                      <a href="#" class="btn btn-primary btn-icon btn-sm" v-else-if="row.bk_cancellation_input" v-on:click="bkCancellationFeeModalAct(row)">
                        <i class="fa fa-backward"></i>
                      </a>
                      
                      <a href="#" class="btn btn-danger btn-icon btn-sm" v-else v-on:click="bkCancellationFeeModalAct(row)">
                        <i class="fa fa-backward"></i>
                      </a>
                    </Tooltip> 
                    <Tooltip content="REMOVE ROLLOVER CHARGE/SPACE LOSS" v-if="row.export_masterbl_rollover_charge === '1'">
                      <a href="#" class="btn btn-danger btn-icon btn-sm" v-on:click="deleteRolloverChargeAct(row)">
                        <i class="fa fa-undo"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="ROLLOVER CHARGE/SPACE LOSS" v-else>
                      <a href="#" class="btn btn-danger btn-icon btn-sm" v-on:click="countRolloverChargeAct(row)">
                        <i class="fa fa-ship"></i>
                      </a>
                      <!-- <a href="#" class="btn btn-danger btn-icon btn-sm" v-else v-on:click="countRolloverChargeAct(row)">
                        <i class="fa fa-ship"></i>
                      </a> -->
                    </Tooltip>
                    <Tooltip content="DELETE">
                      <a href="#" class="btn btn-warning btn-icon btn-sm" v-on:click="deleteBookingRelease(row)">
                        <i class="fa fa-times"></i>
                      </a>
                    </Tooltip>
                  </template>
                  <template slot-scope="{ row, index }" slot="attachments">
                    <span v-if="row.attachments">
                      <a v-for="(item, index) in row.attachments" v-bind:key="index" :href="item.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </span>
                  </template>
                </Table>
                <Page class="m-t-10" :current="blTable.current" :total="blTable.total" :page-size="blTable.limit" :pageSizeOpts = "blTable.pageSizeOpts" show-total show-sizer show-elevator @on-change="searchBlAct" @on-page-size-change="changeBlPageSize" />
              </TabPane>
              <TabPane label="Containers">
                <Table stripe size="small" ref="containerTable" :columns="containerTable.columns" :data="containerTable.data" :height="containerTable.height">
                </Table>
                <Page class="m-t-10" :current="containerTable.current" :total="containerTable.total" :page-size="containerTable.limit" :pageSizeOpts = "containerTable.pageSizeOpts" show-total show-sizer show-elevator @on-change="searchContainerAct" @on-page-size-change="changeContainerPageSize"/>
              </TabPane>
          </Tabs>
          </Col>
      </Row>
    </panel>
    <Modal v-model="modal.bookingModal" title="Booking">
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
            :format="['pdf', 'PDF']"
            :max-size="5120"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/export/BookingLoad/upload"
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
    <Modal v-model="modal.vesselModal" title="Vessel">
      <Form ref="vesselForm" :model="vesselForm" :rules="vesselFormRule" :label-width="120">
        <FormItem label="Vessel Name" prop="export_vessel_name">
            <Input placeholder="Vessel Name" v-model="vesselForm.export_vessel_name" clearable></Input>
        </FormItem>
        <FormItem label="Vessel Voyage" prop="export_vessel_voyage">
            <Input placeholder="Vessel Voyage" v-model="vesselForm.export_vessel_voyage" clearable></Input>
        </FormItem>
        <FormItem label="Vessel ETD">
            <DatePicker type="date" placeholder="Select Vessel ETD" v-model="vesselForm.export_vessel_etd" format="dd/MM/yyyy" @on-change="vesselEtdDateChange"></DatePicker>
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
    <Modal v-model="modal.emptyReleaseModal" title="EMPTY RELEASE" width="640">
      <Form ref="emptyReleaseForm" :model="emptyReleaseForm" :rules="emptyReleaseFormRule" :label-width="128">
        <FormItem label="Release Party" prop="export_masterbl_empty_release_agent">
          <Select v-model="emptyReleaseForm.export_masterbl_empty_release_agent" filterable :remote-method="remoteEmptyReleaseAgent">
            <Option v-for="(item, index) in emptyReleaseAgent" :value="item.user_id" :key="index" :label="item.user_name" :disabled="item.user_blacklist === '1'">
              <span>{{item.user_name}}</span>
              <Tag color="success" v-if="item.user_customer_type === '1'" style="float: right;">AGEN</Tag>
              <Tag color="warning" v-if="item.user_customer_type === '2'" style="float: right;">CNEE</Tag>
              <Tag color="error" v-if="item.user_blacklist === '1'" style="float: right;">BLACK</Tag>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="Release Depot" prop="export_masterbl_empty_release_depot">
          <Select v-model="emptyReleaseForm.export_masterbl_empty_release_depot">
            <Option v-for="(item, index) in emptyReleaseDepot" :value="item.edi_depot_name" :key="index">{{ item.edi_depot_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Agent's Staff">
          <Row :gutter="16">
            <Col span="12">Name</Col>
            <Col span="10">ID</Col>
          </Row>
          <Row :gutter="16" v-for="(item, index) in emptyReleaseAgentStaff" :key="index">
            <Col span="12">
              <Input v-model="item.staff_name" placeholder="STAFF NAME"/>
            </Col>
            <Col span="12">
              <Input v-model="item.staff_id" placeholder="STAFF ID"/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="Quantity">
          <Row>
            <Col v-for="(item, index) in emptyReleaseQuantitys" span="12" :key="index">
              <InputNumber :max="item.quantity" :min="0" v-model="item.release_quantity" disabled>
              </InputNumber>
              <Input v-model="item.container_type" style="width: 78px" disabled/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="Valid To" prop="export_masterbl_empty_release_valid_to">
          <DatePicker type="date" placeholder="Select Vessel ETD" v-model="emptyReleaseForm.export_masterbl_empty_release_valid_to" format="yyyy-MM-dd" @on-change="releaseValidDateChange"></DatePicker>
        </FormItem>
        <FormItem label="Guarantee" prop="export_masterbl_empty_release_guarantee_letter_list">
            <Upload
                ref="releaseUpload"
                :headers="headers"
                :on-success="handleUploadSuccess"
                :on-remove="handleUploadRemove"
                :format="['pdf', 'PDF']"
                :max-size="5120"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                type="drag"
                action="/api/zhongtan/export/BookingLoad/upload">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>Click or drag files here to upload</p>
                </div>
            </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.emptyReleaseModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitEmptyReleaseAct">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.bookingEditModal" title="BOOKING EDIT" width="640">
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
    <Modal v-model="modal.bkCancellationFeeModal" title="Booking Guarantee Fee" width="640">
      <Form ref="bkCancellationFeeForm" :model="bkCancellationFeeForm" :label-width="240">
        <FormItem v-if="bkCancellationFeeForm && bkCancellationFeeForm.cancellationFee && bkCancellationFeeForm.cancellationFee.length"  v-for="(item, index) in bkCancellationFeeForm.cancellationFee" :key="index" :label="item.fee_data_code + '(' + item.fee_data_name + ')'">
          <InputNumber :min="1" v-model="item.fee_data_amount" style="width: 200px;" :disabled="item.fee_data_code === 'BGF'"></InputNumber>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bkCancellationFeeModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitBkCancellationFeeAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/BookingLoad/'

export default {
  name: 'BookingLoadControl',
  data: function() {
    return {
      modal: { bookingModal: false, checkPasswordModal: false, emptyReleaseModal: false, bookingEditModal: false, bkCancellationFeeModal: false },
      headers: common.uploadHeaders(),
      vesselHeight: common.getTableHeight(),
      search_data: {
        date_range: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        etd_start_date: '',
        etd_end_date: '',
        vessel_id: '',
        masterbi_bl: '',
        firm_booking: '',
        export_vessel_id: ''
      },
      pagePara: {},
      workPara: {},
      files: {
        fileList: []
      },
      vesselData: [],
      blTable: {
        columns: [
          {
            title: '#FIRM BK',
            slot: 'export_masterbl_firm_booking',
            width: 120
          },
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
            title: 'Attachments',
            slot: 'attachments',
            width: 100
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
        current: 1,
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
            title: 'CARGO WEIGHT',
            key: 'export_container_cargo_weight',
            width: 200
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 20,
        offset: 0,
        total: 0,
        current: 1,
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
      bookingEditForm: {},
      bkCancellationFeeForm: {},
      firm_booking_filter: [
        {id: 'YES', text: 'YES'},
        {id: 'NO', text: 'NO'}
      ]
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
          this.searchBlAct(1)
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchBlAct: async function(index) {
      try {
        if (index) {
          this.blTable.offset = (index - 1) * this.blTable.limit
          this.blTable.current = index
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
          this.containerTable.current = index
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
              this.searchTableAct()
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
    searchTableAct: function() {
      if(this.currentTab === 0) {
        this.searchBlAct(1)
      } else {
        this.searchContainerAct(1)
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
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select pdf.'
      })
    },
    handleMaxSize(file) {
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
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'vesselModify' || this.checkPasswordType === 'vesselDelete' || this.checkPasswordType === 'deleteBooking') {
            action = 'EXPORT_VESSEL_EDIT'
          } else if (this.checkPasswordType === 'emptyRelease') {
            action = 'EXPORT_EMPORT_RELEASE'
          } else if (this.checkPasswordType === 'bookingEdit' || this.checkPasswordType === 'frimBooking') {
            action = 'EXPORT_BOOKING_EDIT'
          } else if (this.checkPasswordType === 'bookingExport') {
            action = 'EXPORT_BOOKING_EXPORT'
          } else if (this.checkPasswordType === 'deleteRolloverCharge') {
            action = 'EXPORT_BOOKING_DELETE_ROLLOVER_CHARGE'
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
          } else if (this.checkPasswordType === 'emptyRelease') {
            this.emptyReleaseModalAct(this.emptyReleaseForm)
          } else if (this.checkPasswordType === 'bookingEdit') {
            this.bookingEditModalAct(this.bookingEditForm)
          } else if (this.checkPasswordType === 'frimBooking') {
            this.firmBookingAct()
          } else if (this.checkPasswordType === 'bookingExport') {
            this.bookingExportAct()
          } else if (this.checkPasswordType === 'deleteBooking') {
            this.doDeleteBookingRelease()
          } else if (this.checkPasswordType === 'deleteRolloverCharge') {
            this.doDeleteRolloverChargeAct()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    emptyReleaseModalAct: async function(item) {
      let param = {
        export_masterbl_id: item.export_masterbl_id
      }
      let response = await this.$http.post(apiUrl + 'getEmptyReleaseData', param)
      this.$nextTick(function() {
        let data = response.data.info
        this.emptyReleaseForm = JSON.parse(JSON.stringify(data.masterbl_bl))
        this.emptyReleaseQuantitys =  data.quantitys ? JSON.parse(JSON.stringify(data.quantitys)) : []
        this.emptyReleaseAgent = data.agents ? JSON.parse(JSON.stringify(data.agents)) : []
        this.emptyReleaseDepot = data.depots ? JSON.parse(JSON.stringify(data.depots)) : []
        this.emptyReleaseAgentStaff = data.agent_staff ? JSON.parse(JSON.stringify(data.agent_staff)) : [{staff_name: '', staff_id: ''}, {staff_name: '', staff_id: ''}]
        this.$refs.releaseUpload.clearFiles()
        this.modal.emptyReleaseModal = true
      })
    },
    emptyReleaseModalCheckAct: async function(item) {
      this.$nextTick(function() {
        this.emptyReleaseForm = JSON.parse(JSON.stringify(item))
        this.checkPassword = ''
        this.checkPasswordType = 'emptyRelease'
        this.modal.checkPasswordModal = true
      })
    },
    releaseValidDateChange: async function(date) {
        this.emptyReleaseForm.export_masterbl_empty_release_valid_to = date
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
            if(!this.emptyReleaseForm.export_masterbl_empty_release_date && !this.emptyReleaseForm.export_masterbl_empty_release_approve_date
              && (!this.emptyReleaseForm.export_masterbl_empty_release_guarantee_letter_list || this.emptyReleaseForm.export_masterbl_empty_release_guarantee_letter_list.length < 1)) {
              this.$Message.error('Please upload guarantee letter')
              return
            }
            let param = {
              ...this.emptyReleaseForm,
              agentStaff: this.emptyReleaseAgentStaff,
              quantitys: this.emptyReleaseQuantitys
            }
            await this.$http.post(apiUrl + 'emptyRelease', param)
            this.modal.emptyReleaseModal = false
            this.searchDataAct()
          }catch (error) {
            this.$commonact.fault(error)
          }
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
    bkCancellationFeeModalAct: async function(item) {
      this.bkCancellationFeeForm = {}
      this.bkCancellationFeeForm.cancellationFee = []
      this.bkCancellationFeeForm.export_masterbl_id = item.export_masterbl_id
      this.bkCancellationFeeForm.export_vessel_id = item.export_vessel_id
      this.bkCancellationFeeForm.export_masterbl_bl = item.export_masterbl_bl
      this.bkCancellationFeeForm.bk_cancellation_disabled = item.bk_cancellation_disabled
      this.bkCancellationFeeForm.bk_cancellation_input = item.bk_cancellation_input
      if(item.cancellationFee && item.cancellationFee.length > 0) {
        this.bkCancellationFeeForm.cancellationFee = JSON.parse(JSON.stringify(item.cancellationFee))
      }
      if(this.pagePara.BK_CANCELLATION_FEE) {
        for(let cf of this.pagePara.BK_CANCELLATION_FEE) {
          if(this.bkCancellationFeeForm.cancellationFee && this.bkCancellationFeeForm.cancellationFee.length > 0) {
            let exist = false
            for(let bcf of this.bkCancellationFeeForm.cancellationFee) {
              if(bcf.fee_data_code === cf.fee_data_code) {
                bcf.fee_data_name = cf.fee_data_name
                exist = true
                break
              }
            }
            if(!exist) {
              if(cf.fee_data_code === 'BGF') {
                let param = {
                  export_masterbl_id: item.export_masterbl_id
                }
                let response = await this.$http.post(apiUrl + 'bkCancellationFeeCount', param)
                let bgf_data = response.data.info
                if(bgf_data && bgf_data.fee_data_amount) {
                  this.bkCancellationFeeForm.cancellationFee.push({
                    fee_data_code: bgf_data.fee_data_code,
                    fee_data_name: bgf_data.fee_data_name,
                    fee_data_amount: bgf_data.fee_data_amount
                  }) 
                }
              } else {
                this.bkCancellationFeeForm.cancellationFee.push({
                  fee_data_code: cf.fee_data_code,
                  fee_data_name: cf.fee_data_name,
                  fee_data_amount: cf.fee_data_receivable_amount
                }) 
              }
            }
          } else {
            if(cf.fee_data_code === 'BGF') {
              let param = {
                export_masterbl_id: item.export_masterbl_id
              }
              let response = await this.$http.post(apiUrl + 'bkCancellationFeeCount', param)
              let bgf_data = response.data.info
              if(bgf_data && bgf_data.fee_data_amount) {
                this.bkCancellationFeeForm.cancellationFee.push({
                  fee_data_code: bgf_data.fee_data_code,
                  fee_data_name: bgf_data.fee_data_name,
                  fee_data_amount: bgf_data.fee_data_amount
                }) 
              }
            } else {
              this.bkCancellationFeeForm.cancellationFee.push({
                fee_data_code: cf.fee_data_code,
                fee_data_name: cf.fee_data_name,
                fee_data_amount: cf.fee_data_receivable_amount
              })
            }
          }
        }
      }
      this.modal.bkCancellationFeeModal = true
    },
    submitBkCancellationFeeAct: async function() {
      if(this.bkCancellationFeeForm.cancellationFee && this.bkCancellationFeeForm.cancellationFee.length > 0) {
        let cancellationFee = []
        for(let bcf of this.bkCancellationFeeForm.cancellationFee) {
          if(bcf.fee_data_amount) {
            cancellationFee.push(bcf)
          }
        }
        if(cancellationFee && cancellationFee.length > 0) {
          try {
            let param = {
              export_masterbl_id: this.bkCancellationFeeForm.export_masterbl_id,
              cancellationFee: cancellationFee
            }
            await this.$http.post(apiUrl + 'bkCancellationFeeSave', param)
            this.searchDataAct()
            this.modal.bkCancellationFeeModal = false
          }catch (error) {
            this.$commonact.fault(error)
          }
        } else {
          return this.$Message.error('Please input BK Cancellation Fee')
        }
      } else {
        return this.$Message.error('Please input BK Cancellation Fee')
      }
    },
    changeFirmBooking: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$commonact.confirm('Submit ' + (String(row.export_masterbl_firm_booking) === 'YES' ? 'SELECTED' : 'CANCEL SELECT') + ' Firm BK?', async() => {
        try {
          this.workPara = JSON.parse(JSON.stringify(row))
          this.checkPassword = ''
          this.checkPasswordType = 'frimBooking'
          this.modal.checkPasswordModal = true
        }catch (error) {
          this.$commonact.fault(error)
        }
      }, async() => {
        this.searchDataAct()
      })
    },
    firmBookingAct: async function() {
      try {
        await this.$http.post(apiUrl + 'frimBooking', this.workPara)
        this.searchDataAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    bookingExport: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'bookingExport'
      this.modal.checkPasswordModal = true
    },
    bookingExportAct: async function() {
      let response = await this.$http.request({url: apiUrl + 'bookingExport', method: 'post', data: this.search_data, responseType: 'blob'})
      let blob = response.data
      let reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = e => {
        let a = document.createElement('a')
        a.download = 'BOOKING STATISTICS.xlsx'
        a.href = e.target.result
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.emptyReleaseForm.export_masterbl_empty_release_guarantee_letter_list = JSON.parse(JSON.stringify(this.$refs.releaseUpload.fileList))
    },
    handleUploadRemove(file, fileList) {
        const index = this.emptyReleaseForm.export_masterbl_empty_release_guarantee_letter_list.indexOf(file)
        this.emptyReleaseForm.export_masterbl_empty_release_guarantee_letter_list.splice(index, 1)
    },
    deleteBookingRelease: async function(row) {
      this.$commonact.confirm('Delete ' + row.export_masterbl_bl +'?', async() => {
        this.workPara = JSON.parse(JSON.stringify(row))
        if(row.export_masterbl_empty_release_approve_date) {
          try {
            this.checkPassword = ''
            this.checkPasswordType = 'deleteBooking'
            this.modal.checkPasswordModal = true
          }catch (error) {
            this.$commonact.fault(error)
          }
        } else {
          this.doDeleteBookingRelease()
        }
      }, async() => {
        this.searchDataAct()
      })
    },
    doDeleteBookingRelease: async function() {
      try {
        await this.$http.post(apiUrl + 'deleteBooking', this.workPara)
        this.searchDataAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    countRolloverChargeAct: async function(row) {
      try {
        await this.$http.post(apiUrl + 'countRolloverCharge', row)
        this.searchDataAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    deleteRolloverChargeAct: async function(row) {
      try {
        this.workPara = JSON.parse(JSON.stringify(row))
        this.checkPassword = ''
        this.checkPasswordType = 'deleteRolloverCharge'
        this.modal.checkPasswordModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    doDeleteRolloverChargeAct: async function() {
      try {
        await this.$http.post(apiUrl + 'deleteRolloverCharge', this.workPara)
        this.searchDataAct()
      } catch (error) {
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