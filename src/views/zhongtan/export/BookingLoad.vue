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
              <DatePicker type="daterange" :value="search_data.date_range" placeholder="Vessel Date" style="width: 200px" @on-change="searchRangeAct"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.vessel_name" placeholder="Vessel Name" style="width: 200px" />
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
              <button type="button" class="btn btn-info" @click="bookingLoadModalAct">Load</button>
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
                  <template slot-scope="{ row, index }" slot="empty_release">
                    <Tooltip :content="row.export_masterbl_empty_release_approve_date" v-if="row.export_masterbl_empty_release_approve_date">
                      <a href="#" class="btn btn-green btn-icon btn-sm" v-on:click="emptyReleaseModalCheckAct(row)">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                    <Tooltip :content="row.export_masterbl_empty_release_date" v-else-if="row.export_masterbl_empty_release_date">
                      <a href="#" class="btn btn-primary btn-icon btn-sm" v-on:click="emptyReleaseModalAct(row)">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="EMPTY RELEASE" v-else>
                      <a href="#" class="btn btn-info btn-icon btn-sm" v-on:click="emptyReleaseModalAct(row)">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
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
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/import/ImportWork/upload"
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
    <Modal v-model="modal.emptyReleaseModal" title="EMPTY RELEASE" width="640">
      <Form ref="emptyReleaseForm" :model="emptyReleaseForm" :rules="emptyReleaseFormRule" :label-width="128">
        <FormItem label="Release Party" prop="export_masterbl_empty_release_agent">
          <Select v-model="emptyReleaseForm.export_masterbl_empty_release_agent" filterable :remote-method="remoteEmptyReleaseAgent">
            <Option v-for="(item, index) in emptyReleaseAgent" :value="item.user_id" :key="index" :label="item.user_name">
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
              <InputNumber :max="item.quantity" :min="0" v-model="item.release_quantity">
              </InputNumber>
              <Input v-model="item.container_type" style="width: 78px" disabled/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="Valid To" prop="export_masterbl_empty_release_valid_to">
          <DatePicker type="date" placeholder="Select Vessel ETD" v-model="emptyReleaseForm.export_masterbl_empty_release_valid_to" format="yyyy-MM-dd" @on-change="releaseValidDateChange"></DatePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.emptyReleaseModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitEmptyReleaseAct">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.bookingEditModal" title="BOOKING EDIT" width="640">
      <Form ref="bookingEditForm" :model="bookingEditForm" :rules="bookingEditFormRule" :label-width="128">
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
const apiUrl = '/api/zhongtan/export/BookingLoad/'

export default {
  name: 'BookingLoadControl',
  data: function() {
    return {
      modal: { bookingModal: false, checkPasswordModal: false, emptyReleaseModal: false, bookingEditModal: false},
      headers: common.uploadHeaders(),
      vesselHeight: common.getTableHeight(),
      search_data: {
        date_range: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        etd_start_date: '',
        etd_end_date: '',
        vessel_name: '',
        masterbi_bl: '',
        export_vessel_id: ''
      },
      workPara: {},
      files: {
        fileList: []
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
            slot: 'export_container_no',
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
      bookingEditFormRule: {
        export_masterbl_empty_release_agent: [{required: true,  message: 'The empty release agent cannot be empty', trigger: 'blur'}]
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
    this.searchDataAct()
  },
  methods: {
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
    searchBlAct: async function() {
      try {
        let searchPara = {
            ...this.search_data,
            limit: 10,
            offset: 0
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
    searchContainerAct: async function() {
      try {
        let searchPara = {
            ...this.search_data,
            limit: 10,
            offset: 0
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
        this.searchBlAct()
      } else {
        this.searchContainerAct()
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
        desc: 'File  ' + file.name + ' is too large, no more than 4M.'
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
          let param = {
            page: 'BookingLoad',
            action: this.checkPasswordType,
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
    submitBookingAct: async function(item) {
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