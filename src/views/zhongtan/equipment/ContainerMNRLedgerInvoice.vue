<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Equipment Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      CONTAINER MNR LEDGER 
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="CONTAINER MNR LEDGER INVOICE">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Create Date" style="width: 200px" @on-change="searchDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.mnr_ledger_corresponding_payer_id" clearable filterable placeholder="Payer">
                <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{item.user_name}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.mnr_ledger_bl" placeholder="BL#" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.container_no" placeholder="Container#" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addMNRModal">
                <i class="fa fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click.prevent="editMNRModal(row)" title="EDIT" :disabled="row.edit_disabled" v-if="row.mnr_ledger_reedit_flg && row.mnr_ledger_reedit_flg === '1'">
            <i class="fa fa-edit "/>
          </a>
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click.prevent="editMNRModal(row)" title="EDIT" :disabled="row.edit_disabled" v-else>
            <i class="fa fa-edit "/>
          </a>
          <a href="#" class="btn btn-pink btn-icon btn-sm" :title="row.mnr_ledger_invoice_date" v-if="row.edit_disabled && !!row.mnr_ledger_invoice_date">
            <i class="fa fa-money-bill-alt "/>
          </a>
          <a href="#" class="btn btn-green btn-icon btn-sm" :title="row.mnr_ledger_invoice_date" @click.prevent="invoiceAct(row)"  v-else-if="!!row.mnr_ledger_invoice_date" :disabled="row.invoice_disabled">
            <i class="fa fa-money-bill-alt "/>
          </a>
          <a href="#" class="btn btn-green btn-icon btn-sm" @click.prevent="invoiceAct(row)" title="INVOICE" v-else :disabled="row.invoice_disabled">
            <i class="fa fa-money-bill-alt "/>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="mnr_files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" v-if="row.mnr_files && row.mnr_files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.mnr_files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.mnr_files">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download" v-if="row.state === 'AP' && row.filetype === 'MNR Invoice'" placement="top">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Download" v-if="row.filetype === 'MNR Invoice' && !row.receipt_status" placement="top">
                      <a class="btn btn-danger btn-icon btn-sm" target="_blank" v-on:click="doDeleteMNRInvoie(row)">
                        <i class="fa fa-times"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="vessel">
          {{row.mnr_ledger_vessel_name}} / {{row.mnr_ledger_vessel_voyage}}
        </template>   
        <template slot-scope="{ row, index }" slot="size_type">
          {{row.mnr_ledger_container_size}} 
          <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.mnr_ledger_container_size">[{{item.container_size_name}}]</span>
        </template>
        <template slot-scope="{ row, index }" slot="mnr_atts">
          <Poptip trigger="hover" placement="bottom" :transfer="true" v-if="row.mnr_atts && row.mnr_atts.length > 0">
            <Button type="text" style="text-decoration:underline">Atta [{{row.mnr_atts.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.attachmentsTable.columns" :data="row.mnr_atts">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download">
                      <a :href="row.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.addEditModal" :title="modal_title[act_type]" width="600">
        <Form ref="containerForm" :model="containerForm" :label-width="120" style="padding-right: 80px;">
          <FormItem label="Container#" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="containerForm.mnr_ledger_container_no_id" filterable clearable remote :remote-method="handleSearchContainer" :loading="containerLoading" @on-change="handleChangeContainer" placeholder="Container#">
              <Option v-for="item in containerList" :value="item.invoice_containers_id" :key="item.invoice_containers_id" :label="item.invoice_containers_no">
                <Row>
                  <Col span="8">
                    <span>{{item.invoice_containers_no}}
                      <font v-if="item.invoice_containers_size">[{{item.invoice_containers_size}}]</font>
                    </span>
                  </Col>
                  <Col span="12" offset="4" v-if="item.invoice_containers_size">
                    <div style="color: #999;">{{item.invoice_vessel_name }} / {{item.invoice_vessel_voyage }}</div>
                    <div style="color: #999;">{{item.invoice_containers_bl }}</div>
                  </Col>
                </Row>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="Vessel Name" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_vessel_name" :disabled="containerDisabled"/>
          </FormItem>
          <FormItem label="Vessel Voyage" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_vessel_voyage" :disabled="containerDisabled"/>
          </FormItem>
          <FormItem label="Arrival Date" style="margin-bottom: 0px;">
            <DatePicker type="date" placeholder="Select Vessel ATA" v-model="containerForm.mnr_ledger_vessel_ata" format="dd/MM/yyyy" @on-change="vesselAtaDateChange" :disabled="containerDisabled"></DatePicker>
          </FormItem>
          <FormItem label="B/L#" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_bl" :disabled="containerDisabled"/>
          </FormItem>
          <FormItem label="Destination" style="margin-bottom: 0px;">
            <Select v-model="containerForm.mnr_ledger_destination" filterable :disabled="containerDisabled">
                <Option v-for="item in pagePara.DESTINATION" :value="item.discharge_port_code" :key="item.discharge_port_code" :label="item.discharge_port_code">
                  <span>{{ item.discharge_port_code }}</span>
                  <span style="float: right;color:#ccc">{{ item.discharge_port_name }}</span>
                </Option>
            </Select>
          </FormItem>
          <FormItem label="Cargo Type" style="margin-bottom: 0px;">
            <Select v-model="containerForm.mnr_ledger_cargo_type" filterable :disabled="containerDisabled">
                <Option v-for="item in pagePara.MNR_CARGO_TYPE" :value="item.id" :key="item.id" :label="item.text">
                  {{ item.text }}
                </Option>
            </Select>
          </FormItem>
          <FormItem label="Size Type" style="margin-bottom: 0px;">
            <Select v-model="containerForm.mnr_ledger_container_size" filterable :disabled="containerDisabled">
                <Option v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                  <span>{{ item.container_size_code }}</span>
                  <span style="float: right;color:#ccc">{{ item.container_size_name }}</span>
                </Option>
            </Select>
          </FormItem>
          <FormItem label="Description" style="margin-bottom: 0px;">
            <Select v-model="containerForm.mnr_ledger_description">
              <Option v-for="item in pagePara.MNR_DESCRIPTION" :value="item.text" :key="item.id" :label="item.text"></Option>
            </Select>
          </FormItem>
          <FormItem label="D/V Amount" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_dv_amount" @keyup.native='keyupDvAmount($event)'/>
          </FormItem>
          <FormItem label="Actual Charge" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_actual_charge_amount" @keyup.native='keyupActualChargeAmount($event)'/>
          </FormItem>
          <FormItem label="Loss Declaring" style="margin-bottom: 0px;">
            <DatePicker type="date" placeholder="Select Loss Declaring Date" v-model="containerForm.mnr_ledger_loss_declaring_date" format="dd/MM/yyyy" @on-change="vesselDeclaringDateChange"></DatePicker>
          </FormItem>
          <FormItem label="Corresponding" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="containerForm.mnr_ledger_corresponding_payer_id" filterable clearable remote :remote-method="handleSearchCustomer" :loading="customerLoading" @on-change="handleChangeCustomer" placeholder="Customer">
              <Option v-for="item in customerList" :value="item.user_id" :key="item.user_id">{{item.user_name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="Payment" style="margin-bottom: 0px;">
            <DatePicker type="date" placeholder="Select Payment Date" v-model="containerForm.mnr_ledger_payment_date" format="dd/MM/yyyy" @on-change="vesselPaymentDateChange"></DatePicker>
          </FormItem>
          <FormItem label="Termination" style="margin-bottom: 0px;">
            <Input v-model="containerForm.mnr_ledger_termination"/>
          </FormItem>
          <FormItem label="MNR Attachments" prop="mnr_attachments">
            <Upload
                ref="upload"
                :headers="uploadHeaders"
                :on-success="handleUploadSuccess"
                :on-remove="handleUploadRemove"
                type="drag"
                action="/api/zhongtan/equipment/ContainerMNRLedgerInvoice/upload">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>Click or drag files here to upload</p>
                </div>
            </Upload>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.addEditModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="createAct" v-if="act_type === 'create'">Submit</Button>
          <Button type="primary" size="large" @click="updateAct" v-if="act_type === 'update'">Submit</Button>
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
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/equipment/ContainerMNRLedgerInvoice/'

export default {
  name: 'ContainerMNRLedgerInvoice',
  data: function() {
    return {
      modal: { addEditModal: false, checkPasswordModal: false },
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'Act',
              slot: 'action',
              width: 150,
              align: 'center',
            },
            {
              title: 'Container#',
              key: 'mnr_ledger_container_no',
              width: 130,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'mnr_ledger_bl',
              width: 150,
              align: 'center'
            },
             {
              title: 'MNR Invoice',
              slot: 'mnr_files',
              width: 120
            },
            {
              title: 'Vessel',
              slot: 'vessel',
              width: 150,
              align: 'center',
            },
            {
              title: 'Arrival Date',
              key: 'mnr_ledger_vessel_ata',
              width: 130,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'size_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Description',
              key: 'mnr_ledger_description',
              width: 120,
              align: 'center'
            },
            {
              title: 'D/V Amount USD',
              key: 'mnr_ledger_dv_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Actual Charge Amount',
              key: 'mnr_ledger_actual_charge_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Loss Declaring Date',
              key: 'mnr_ledger_loss_declaring_date',
              width: 120,
              align: 'center'
            },
            {
              title: 'Corresponding Payer',
              key: 'mnr_ledger_corresponding_payer',
              width: 120,
              align: 'center'
            },
            {
              title: 'Payment Date',
              key: 'mnr_ledger_payment_date',
              width: 120,
              align: 'center'
            },
            {
              title: 'Termination',
              key: 'mnr_ledger_termination',
              width: 120,
              align: 'center'
            },
            {
              title: 'MNR Attachments',
              slot: 'mnr_atts',
              width: 100
            },
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight(),
          limit: 10,
          offset: 0,
          total: 0
        },
        attachmentsTable: {
          columns: [
            {
                title: 'Act',
                slot: 'act',
                width: 80
            },
            {
                title: 'Create Date',
                key: 'created_at',
                width: 200
            },
          ]
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
      search_data: {
        date: [moment().startOf('month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        mnr_ledger_bl: '',
        container_no: ''
      },
      act_type: 'create',
      modal_title:{
        create: 'ADD MNR Ledger',
        update: 'EDIT MNR Ledger'
      },
      containerForm: {},
      containerList: [],
      containerLoading: false,
      customerList: [],
      customerLoading: false,
      containerDisabled: true,
      uploadHeaders: common.uploadHeaders(),
      files: {
        fileList: []
      },
      workPara: {}
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
    searchDate: function(e) {
        this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.containerTable.offset = (index - 1) * this.table.containerTable.limit
        }
        let searchPara = {
          search_data: this.search_data,
          offset: this.table.containerTable.offset,
          limit: this.table.containerTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.containerTable.total = data.total
        this.table.containerTable.data = JSON.parse(JSON.stringify(data.rows))
        if(this.table.containerTable.data) {
          for(let d of this.table.containerTable.data) {
            if((d.invoice_containers_laden_release_date && d.invoice_containers_laden_release_overdue_amount && parseInt(d.invoice_containers_laden_release_overdue_amount) > 0) || (d.invoice_containers_empty_return_date && d.invoice_containers_empty_return_overdue_amount && parseInt(d.invoice_containers_empty_return_overdue_amount) > 0)) {
              d._disabled = false
            } else {
              d._disabled = true
            }
          }
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetTableSizer: function(pageSizer) {
        this.table.containerTable.limit = pageSizer
        this.getTableData(1)
    },
    gateOutTerminalChange: async function(date) {
      this.containerForm.invoice_containers_gate_out_terminal_date = date
    },
    gateInTerminalChange: async function(date) {
      this.containerForm.invoice_containers_gate_in_terminal_date = date
    },
    addMNRModal: async function() {
      try {
        this.act_type = 'create'
        this.containerForm = {}
        this.containerForm.mnr_ledger_description = 'MNR CHARGE'
        this.containerList = []
        this.customerList = []
        this.files = {}
        this.files.fileList = []
        this.modal.addEditModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    editMNRModal: async function(row) {
      try {
        this.act_type = 'update'
        this.containerDisabled = true
        this.containerLoading = true
        this.containerList = [
          {
            invoice_containers_id: row.mnr_ledger_container_no_id,
            invoice_containers_no: row.mnr_ledger_container_no,
            invoice_containers_bl: row.mnr_ledger_bl,
            invoice_masterbi_destination: row.mnr_ledger_destination,
            invoice_masterbi_cargo_type: row.mnr_ledger_cargo_type,
            invoice_containers_size: row.mnr_ledger_container_size,
            invoice_vessel_name: row.mnr_ledger_vessel_name,
            invoice_vessel_voyage: row.mnr_ledger_vessel_voyage,
            invoice_vessel_ata: row.mnr_ledger_vessel_ata,
          }
        ]
        this.containerLoading = false
        this.customerLoading = true
        this.customerList = [
          {
            user_id: row.mnr_ledger_corresponding_payer_id,
            user_name: row.mnr_ledger_corresponding_payer,
          }
        ]
        this.customerLoading = false
        this.containerForm = {}
        this.files = {}
        this.files.fileList = []
        this.$nextTick(function() {
          this.containerForm = Object.assign({}, row)
          if(!row.mnr_ledger_container_no_id) {
            this.containerDisabled = false
          }
        })
        this.modal.addEditModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.containerForm.mnr_attachments = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
        const index = this.containerForm.mnr_attachments.indexOf(file)
        this.containerForm.mnr_attachments.splice(index, 1)
    },
    createAct: async function() {
      try {
        if(this.containerForm.mnr_ledger_vessel_ata && (typeof this.containerForm.mnr_ledger_vessel_ata === 'object')) {
          this.containerForm.mnr_ledger_vessel_ata = moment(this.containerForm.mnr_ledger_vessel_ata).format('DD/MM/YYYY')
        }
        await this.$http.post(apiUrl + 'add', this.containerForm)
        this.modal.addEditModal = false
        this.getTableData(1)
        this.$Message.success('add success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    updateAct: async function() {
      try {
        if(this.containerForm.mnr_ledger_vessel_ata && (typeof this.containerForm.mnr_ledger_vessel_ata === 'object')) {
          this.containerForm.mnr_ledger_vessel_ata = moment(this.containerForm.mnr_ledger_vessel_ata).format('DD/MM/YYYY')
        }
        if(this.containerForm.mnr_ledger_loss_declaring_date && (typeof this.containerForm.mnr_ledger_loss_declaring_date === 'object')) {
          this.containerForm.mnr_ledger_loss_declaring_date = moment(this.containerForm.mnr_ledger_loss_declaring_date).format('DD/MM/YYYY')
        }
        if(this.containerForm.mnr_ledger_payment_date && (typeof this.containerForm.mnr_ledger_payment_date === 'object')) {
          this.containerForm.mnr_ledger_payment_date = moment(this.containerForm.mnr_ledger_payment_date).format('DD/MM/YYYY')
        }
        await this.$http.post(apiUrl + 'update', this.containerForm)
        this.modal.addEditModal = false
        this.getTableData(1)
        this.$Message.success('edit success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    invoiceAct: async function(row) {
      try {
        await this.$http.post(apiUrl + 'invoice', row)
        this.getTableData(1)
        this.$Message.success('invoice success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    handleSearchContainer: async function(value) {
      if(value) {
        try {
          this.containerLoading = true
          let response = await this.$http.post(apiUrl + 'searchContainer', {search_text: value})
          this.containerList = JSON.parse(JSON.stringify(response.data.info))
          this.containerLoading = false
        } catch (error) {
          this.$commonact.fault(error)
        }
        
      } else {
        this.containerList = []
      }
    },
    handleChangeContainer: async function(value) {
      for(let item of this.containerList) {
        if(item.invoice_containers_id === value) {
          if(item.invoice_containers_bl) {
            this.containerForm.mnr_ledger_container_no = item.invoice_containers_no
            this.containerForm.mnr_ledger_vessel_name = item.invoice_vessel_name
            this.containerForm.mnr_ledger_vessel_voyage = item.invoice_vessel_voyage
            this.containerForm.mnr_ledger_vessel_ata = item.invoice_vessel_ata
            this.containerForm.mnr_ledger_bl = item.invoice_containers_bl
            this.containerForm.mnr_ledger_destination = item.invoice_masterbi_destination
            this.containerForm.mnr_ledger_cargo_type = item.invoice_masterbi_cargo_type
            this.containerForm.mnr_ledger_container_size = item.invoice_containers_size
            this.containerDisabled = true
          } else {
            this.containerForm.mnr_ledger_container_no = item.invoice_containers_no
            this.containerForm.mnr_ledger_vessel_ata = ''
            this.containerForm.mnr_ledger_bl = ''
            this.containerForm.mnr_ledger_container_size = ''
            this.containerDisabled = false
          }
          break
        }
      }
    },
    handleSearchCustomer: async function(value) {
      if(value) {
        try {
          this.customerLoading = true
          let response = await this.$http.post(apiUrl + 'searchCustomer', {search_text: value})
          this.customerList = JSON.parse(JSON.stringify(response.data.info))
          this.customerLoading = false
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        this.customerList = []
      }
    },
    handleChangeCustomer: async function(value) {
      for(let item of this.customerList) {
        if(item.user_id === value) {
          this.containerForm.mnr_ledger_corresponding_payer = item.user_name
          break
        }
      }
    },
    vesselAtaDateChange: async function(date) {
      this.containerForm.mnr_ledger_vessel_ata = date
    },
    vesselDeclaringDateChange: async function(date) {
      this.containerForm.mnr_ledger_loss_declaring_date = date
    },
    vesselPaymentDateChange: async function(date) {
      this.containerForm.mnr_ledger_payment_date = date
    },
    keyupDvAmount: async function(e) {
      e.target.value = e.target.value.replace(/[^\d.]/g, '')
      e.target.value = e.target.value.replace(/\.{2,}/g, '.')
      e.target.value = e.target.value.replace(/^\./g, '0.')
      e.target.value = e.target.value.replace(/^\d*\.\d*\./g, e.target.value.substring(0,e.target.value.length-1))
      e.target.value = e.target.value.replace(/^0[^\\.]+/g, '0')
      e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
      this.mnr_ledger_dv_amount = e.target.value
    },
    keyupActualChargeAmount: async function(e) {
      e.target.value = e.target.value.replace(/[^\d.]/g, '')
      e.target.value = e.target.value.replace(/\.{2,}/g, '.')
      e.target.value = e.target.value.replace(/^\./g, '0.')
      e.target.value = e.target.value.replace(/^\d*\.\d*\./g, e.target.value.substring(0,e.target.value.length-1))
      e.target.value = e.target.value.replace(/^0[^\\.]+/g, '0')
      e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
      this.mnr_ledger_actual_charge_amount = e.target.value
    },
    doDeleteMNRInvoie: async function(row){
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'MNRInvoieDelete'
      this.modal.checkPasswordModal = true
    },
    doDeleteMNRInvoieAct: async function(){
      this.$commonact.confirm(`Delete the invoice file?`, async() => {
        try {
          let param = {
            ...this.workPara
          }
          await this.$http.post(apiUrl + 'deleteMNRInvoie', param)
          this.getTableData(1)
        }catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'MNRInvoieDelete') {
            action = 'MNR_INVOICE'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'MNRInvoieDelete') {
            await this.doDeleteMNRInvoieAct()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
  }
}
</script>
