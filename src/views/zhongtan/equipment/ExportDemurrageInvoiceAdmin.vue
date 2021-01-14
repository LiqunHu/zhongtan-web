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
      Export Demurrage Invoice
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Export Demurrage Invoice">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.export_vessel_name" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.export_container_bl" placeholder="#M B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.export_container_no" placeholder="Container No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-success" @click="demurrageInvoiceModal" :disabled="emptyInvoiceDisabled">
                <i class="fa fa-money-bill-alt"></i> Invoice
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-warning" @click="demurrageReInvoiceModal" :disabled="emptyInvoiceDisabled">
                <i class="fa fa-money-bill-alt"></i> RE Invoice
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-success" @click="issuingStoringOrderModal" :disabled="emptyInvoiceDisabled">
                <i class="fa fa-envelope"></i> Storing Order
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" @on-select-all="containerSelectedAll"  @on-select-all-cancel="containerSelectedAllCancel" @on-selection-change="containerSelectedChange" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom-start" :transfer="true" v-if="row.files && row.files.length > 0">
            <span>Files [{{row.files.length}}]</span>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template v-if="row.state === 'AP'">
                    <Tooltip content="Download" placement="top">
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
        <template slot-scope="{ row, index }" slot="export_container_no">
          <i style="color: #FF9900; margin-right:10px;" class="fa fa-money-bill-alt" v-if="row.export_container_cal_demurrage_deduction && row.export_container_cal_demurrage_deduction > 0"></i>{{row.export_container_no}}<font color="#1890ff" style="margin-left:10px;" v-if="row.export_container_soc_type==='S'">SOC</font>
        </template>
         <template slot-scope="{ row, index }" slot="export_container_size_type">
            {{row.export_container_size_type}} [
            <span v-for="(item, index) in pagePara.CONTAINER_SIZE" :key="index" v-if="item.container_size_code === row.export_container_size_type">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="export_container_edi_loading_date">
          {{row.export_container_edi_loading_date}}
          <Row class="right-bottom-title">
            <span>ETD: {{row.export_vessel_etd}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_edi_depot_gate_out_date">
          <span style="color: #ff9900;" v-if="row.export_container_cal_receipt_date">{{row.export_container_edi_depot_gate_out_date}}</span>
          <span v-else>{{row.export_container_edi_depot_gate_out_date}}</span>
          <Row class="right-bottom-title" v-if="row.export_container_cal_receipt_date">
            <span>{{row.export_container_cal_receipt_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_days">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_days && row.invoice_containers_actually_return_overdue_days && row.invoice_containers_empty_return_overdue_days !== row.invoice_containers_actually_return_overdue_days"> {{row.invoice_containers_empty_return_overdue_days}} </span>
          <span style="color: #ff9900;" v-else-if="row.invoice_containers_empty_return_overdue_days_receipt">{{row.invoice_containers_empty_return_overdue_days}}</span>
          <span v-else>{{row.invoice_containers_empty_return_overdue_days}}</span>
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_overdue_days_receipt">
            <span>{{row.invoice_containers_empty_return_overdue_days_receipt}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_amount">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_amount && row.invoice_containers_actually_return_overdue_amount && row.invoice_containers_empty_return_overdue_amount !== row.invoice_containers_actually_return_overdue_amount"> {{row.invoice_containers_empty_return_overdue_amount}} </span>
          <span style="color: #ff9900;" v-else-if="row.invoice_containers_empty_return_overdue_amount_receipt">{{row.invoice_containers_empty_return_overdue_amount}}</span>
          <span v-else>{{row.invoice_containers_empty_return_overdue_amount}}</span>
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_overdue_amount_receipt">
            <span>{{row.invoice_containers_empty_return_overdue_amount_receipt}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_days">
          <span>{{row.export_container_cal_demurrage_days}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_amount">
          <span>{{row.export_container_cal_demurrage_amount}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_deduction">
          <span>{{row.export_container_cal_demurrage_deduction}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="cal_demurrage">
          <a href="#" class="btn btn-success btn-icon btn-sm" title="RECEIPT" v-if="row.invoice_containers_empty_return_overdue_amount_receipt && row.invoice_containers_actually_return_overdue_amount && row.invoice_containers_empty_return_overdue_amount_receipt === row.invoice_containers_actually_return_overdue_amount">
            <i class="fa fa-calculator"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" title="UNINVOICE" v-else-if="row.invoice_containers_empty_return_edit_flg === '1' && row.invoice_containers_type!=='S'" @click.prevent="emptyOverdueCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
          <a href="#" class="btn btn-primary btn-icon btn-sm" v-else-if="row.invoice_containers_type!=='S'" @click.prevent="emptyOverdueCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
          <a href="#" class="btn btn-default btn-icon btn-sm" v-if="row.invoice_containers_type!=='S'" @click.prevent="containerInvoiceDetailAct(row)">
            <Icon type="md-options" />
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.calculationModal" title="Demurrage Calculation" width="640">
        <Form ref="overdueChargeForm" :model="overdueChargeForm" :label-width="150" style="padding-right: 80px;">
          <FormItem label="Gate Out">
            <DatePicker type="date" placeholder="Gate Out Date" v-model="overdueChargeForm.export_container_edi_depot_gate_out_date" format="dd/MM/yyyy" @on-change="gateOutDateChange" :disabled="overdueChargeForm.export_container_edi_depot_gate_out_date_disabled"></DatePicker>
            <Tag type="dot" v-if="overdueChargeForm.demurrage_invoice_containers_diff_days">Diff {{overdueChargeForm.demurrage_invoice_containers_diff_days}} Days</Tag>
          </FormItem>
          <FormItem label="Loading Date">
            <DatePicker type="date" placeholder="Loading Date" v-model="overdueChargeForm.export_container_edi_loading_date" format="dd/MM/yyyy" @on-change="loadingDateChange" :disabled ="overdueChargeForm.export_container_edi_loading_date_disabled"></DatePicker>
            <Tag type="dot">ETD {{overdueChargeForm.export_vessel_etd}}</Tag>
          </FormItem>
          <FormItem label="Free Days">
            <Input-number :min="parseInt(overdueChargeForm.export_container_cal_static_free_days)" v-model="overdueChargeForm.export_container_cal_free_days" :active-change="false" @on-change="overdueFreeDaysChange" :disabled ="returnOverdueDaysDisabled" style="width: 200px;"></Input-number>
            <Checkbox v-model="overdueChargeForm.free_days_single" :disabled ="returnOverdueDaysDisabled">SINGLE</Checkbox>
          </FormItem>
          <FormItem label="Demurrage Days">
            <Input v-model="overdueChargeForm.export_container_cal_demurrage_days" disabled>
                <span slot="append" style="display:block; width: 40px">Days</span>
            </Input>
          </FormItem>
          <FormItem label="Demurrage Charge">
            <Input v-model="overdueChargeForm.export_container_cal_demurrage_amount" :disabled ="returnOverdueDaysDisabled">
              <span slot="append" style="display:block; width: 40px">USD</span>
            </Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <a href="#" style="float:left; padding-top:10px;" @click.prevent="overdueDaysEditAct" title="Edit">
            <i class="fa fa-edit"></i>Edit
          </a>
          <Button type="text" size="large" @click="modal.calculationModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="demurrageSubmitAct" :disabled="emptySubmitDisabled">Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.invoiceModal" title="INVOICE" width="600">
        <Form ref="invoiceForm" :model="invoiceForm" :rules="invoiceRules" :label-width="150" style="padding-right: 80px;">
          <FormItem label="MESSRS" prop="invoice_customer_id" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="invoiceForm.invoice_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="customer.loading" placeholder="Customer">
              <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="TOTAL DEMURRAGE" style="margin-bottom: 0px;">
            <Input v-model="invoiceForm.totalDemurrage" disabled></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.invoiceModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="demurrageInvoiceAct" >Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.reInvoiceModal" title="RE INVOICE" width="600">
        <Form ref="invoiceForm" :model="invoiceForm" :rules="invoiceRules" :label-width="150" style="padding-right: 80px;">
          <FormItem label="MESSRS" prop="invoice_customer_id" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="invoiceForm.invoice_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="customer.loading" placeholder="Customer">
              <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="TOTAL DEMURRAGE" style="margin-bottom: 0px;">
            <Input v-model="invoiceForm.totalDemurrage" disabled></Input>
          </FormItem>
          <FormItem label="DEDUCTION" style="margin-bottom: 0px;">
            <Input-number v-model="invoiceForm.deduction" :max="invoiceForm.totalDemurrage" :min="0"></Input-number>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.reInvoiceModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="emptyReInvoiceAct" >Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :closable="false" :mask-closable="false">
        <Form :label-width="120">
          <FormItem v-show="false">
            <Input type="password" style='width:0;opacity:0;'></Input>       
          </FormItem>
          <FormItem label="Password" prop="checkPassword">
            <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.checkPasswordModal = false; depositEdit = false; doDeliverEdit = false;">Cancel</Button>
          <Button type="primary" size="large" @click="actCheckPassword">Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.invoiceTimelineModal" :title="invoiceTimelineTitle">
        <Timeline>
          <TimelineItem v-for="(item, index) in containerInvoiceDetail" :key="index" v-if="index === 0" color="green">
            <i class="fa fa-trophy" slot="dot"></i>
            <p class="timeline-content">Discharge Date: {{item.overdue_invoice_containers_overdue_discharge_date}}</p>
            <p class="timeline-content">Return Date: {{item.overdue_invoice_containers_return_date}}</p>
            <p class="timeline-content">Overdue Days: {{item.overdue_invoice_containers_overdue_days}} Days</p>
            <p class="timeline-content">Overdue Amount: {{item.overdue_invoice_containers_overdue_amount}} USD</p>
            <p class="timeline-content">Deduction: {{item.overdue_invoice_containers_overdue_deduction}} USD</p>
          </TimelineItem>
          <TimelineItem v-for="item in containerInvoiceDetail" v-bind:key="item.overdue_invoice_containers_id">
              <p class="timeline-time">{{item.invoice_created_at}}</p>
              <p class="timeline-content">{{item.user_name}}</p>
              <p class="timeline-content">Free: {{item.overdue_invoice_containers_overdue_free_days}} Days</p>
              <p class="timeline-content">Staring Date: {{item.overdue_invoice_containers_overdue_staring_date}}</p>
              <p class="timeline-content">Return Date: {{item.overdue_invoice_containers_return_date}}</p>
              <p class="timeline-content">Overdue Days: {{item.overdue_invoice_containers_overdue_increase_days}} Days</p>
              <p class="timeline-content">Overdue Amount: {{item.overdue_invoice_containers_overdue_invoice_amount}} USD</p>
              <p class="timeline-content">Deduction: {{item.overdue_invoice_containers_overdue_deduction}} USD</p>
              <p class="timeline-content">Receipt: {{item.overdue_invoice_containers_receipt_date}}</p>
          </TimelineItem>
        </Timeline>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.invoiceTimelineModal=false">Cancel</Button>
        </div>
      </Modal>
      <Modal v-model="modal.storingOrderModal" title="Storing Order" width="600">
        <Form ref="storingOrderForm" :model="storingOrderForm" :rules="storingOrderRules" :label-width="150" style="padding-right: 80px;">
          <FormItem label="Depot Name" prop="invoice_containers_depot_name" style="margin-bottom: 0px;">
            <Select v-model="storingOrderForm.invoice_containers_depot_name" filterable clearable placeholder="Customer">
              <Option v-for="item in pagePara.EDI_DEPOT" :value="item.edi_depot_name" :key="item.edi_depot_name">{{item.edi_depot_name}}</Option>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.storingOrderModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="issuingStoringOrderAct" >Submit</Button>
        </div>
      </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/ExportDemurrageInvoiceAdmin/'

export default {
  name: 'ExportDemurrageInvoiceAdmin',
  data: function() {
    return {
      modal: { calculationModal: false, invoiceModal : false, checkPasswordModal: false, invoiceTimelineModal: false, storingOrderModal: false, reInvoiceModal: false },
      cargoTypeFileter: [
        { id: 'LOCAL', text: 'LOCAL' },
        { id: 'TRANSIT', text: 'TRANSIT' }
      ],
      carrierFileter: [
        { id: 'COSCO', text: 'COSCO' },
        { id: 'OOCL', text: 'OOCL' }
      ],
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              type: 'selection',
              align: 'center',
              width: 60
            },
            {
              title: '#M B/L No',
              key: 'export_container_bl',
              width: 150,
              align: 'center'
            },
            {
              title: 'Files',
              slot: 'files',
              width: 80,
              align: 'center'
            },
            {
              title: 'Container No',
              slot: 'export_container_no',
              width: 160,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'export_container_size_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Cargo Type',
              key: 'export_masterbl_cargo_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'Depot Name',
              key: 'export_container_get_depot_name',
              width: 125,
              align: 'center'
            },
            {
              title: 'Free Days',
              key: 'export_container_cal_free_days',
              width: 120,
              align: 'center',
            },
            {
              title: 'Gate Out',
              slot: 'export_container_edi_depot_gate_out_date',
              width: 120,
              align: 'center',
            },
            {
              title: 'Loading Date',
              slot: 'export_container_edi_loading_date',
              width: 140,
              align: 'center'
            },
            {
              title: 'Days',
              slot: 'export_container_cal_demurrage_days',
              width: 120,
              align: 'center',
            },
            {
              title: 'Amount',
              slot: 'export_container_cal_demurrage_amount',
              width: 120,
              align: 'center',
            },
            {
              title: 'Deduction',
              key: 'export_container_cal_demurrage_deduction',
              width: 120,
              align: 'center',
            },
            {
              title: 'Act',
              slot: 'cal_demurrage',
              width: 120,
              align: 'center',
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight(),
          current: 1,
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
              key: 'file_type',
              width: 120
            },
            {
              title: 'Demurrage',
              key: 'demurrage',
              width: 120
            },
            {
              title: 'State',
              key: 'state',
              render: common.selectRender(this, 'UPLOAD_STATE'),
              width: 160
            },
            {
              title: 'Action',
              slot: 'act',
              width: 120
            },
            {
              title: 'Release User',
              key: 'release_user',
              width: 120
            },
            {
              title: 'Release Date',
              key: 'release_date',
              width: 160
            },
          ]
        }
      },
      search_data: {
        invoice_vessel_name: '',
        invoice_containers_bl: '',
        invoice_containers_no: ''
      },
      overdueChargeFormOld: {},
      overdueChargeForm: {},
      ladenSubmitDisabled: true,
      emptySubmitDisabled: true,
      emptyInvoiceDisabled: true,
      tableSelectAll: false,
      invoiceForm: {
        invoice_customer_id: '',
        deduction: 0,
        totalDemurrage: 10
      },
      invoiceRules: {
        invoice_customer_id: [{ required: true, trigger: 'change', message: 'select messrs' }],
      },
      customer: {
        loading: false,
        options: []
      },
      checkPassword: '',
      checkPasswordType: '',
      returnOverdueDaysDisabled: true,
      invoiceTimelineTitle: '',
      containerInvoiceDetail: [],
      storingOrderForm: {
        invoice_containers_depot_name: ''
      },
      storingOrderRules: {
        invoice_containers_depot_name: [{ required: true, trigger: 'change', message: 'select depot name' }],
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
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.containerTable.current = index
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
            if(d.export_container_cal_demurrage_amount && d.export_container_cal_receipt_amount && parseInt(d.export_container_cal_demurrage_amount) === parseInt(d.export_container_cal_receipt_amount)) {
              d._disabled = true
            } else if(d.export_container_cal_demurrage_amount && parseInt(d.export_container_cal_demurrage_amount) > 0) {
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
    handleSpan: function({row, column, rowIndex, columnIndex}) {
      if(column.title === '#M B/L No' || column.title === 'Files') {
        return this.getLayout(row, rowIndex, columnIndex)
      }
    },
    getLayout: function(row, rowIndex, columnIndex) {
      let rowspan = 0
      let colspan = 1
      let tableData = this.table.containerTable.data
      for(let d of tableData) {
        if(d.export_masterbl_id === row.export_masterbl_id) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].export_masterbl_id === row.export_masterbl_id) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    containerSelectedAll: async function(selection) {
      this.tableSelectAll = true
    },
    containerSelectedAllCancel: async function(selection) {
      this.tableSelectAll = false
    },
    containerSelectedChange: async function(selection) {
      if(selection && selection.length > 0) {
        let bl = ''
        for(let s of selection) {
          if(!bl) {
            bl = s.export_container_bl
          } else {
            if(bl !== s.export_container_bl) {
              this.emptyInvoiceDisabled = true
              return this.$Message.error('please select same #B/L No.')
            }
          }
          if(s.export_container_cal_demurrage_amount) {
            this.emptyInvoiceDisabled = false
          }
        }
      } else {
        this.emptyInvoiceDisabled = true
      }
      this.$forceUpdate()
    },
    resetChageRuleForm: function() {
      this.overdueChargeFormOld = {}
      this.overdueChargeForm = {}
      this.ladenSubmitDisabled = true
      this.emptySubmitDisabled = true
    },
    emptyOverdueCalculationModal: async function(row) {
      this.$nextTick(() => {
        this.$refs['overdueChargeForm'].resetFields()
      })
      this.resetChageRuleForm()
      this.overdueChargeFormOld = Object.assign({}, row)
      this.overdueChargeForm = Object.assign({}, row) // copy obj
      this.overdueChargeForm.invoice_containers_edi_discharge_date_disabled = this.overdueChargeForm.invoice_containers_edi_discharge_date
      this.returnOverdueDaysDisabled = true
      this.modal.calculationModal = true
      if(!this.overdueChargeForm.export_container_cal_demurrage_days) {
        this.calculationDiff()
      }
    },
    gateOutDateChange: async function(date) {
      this.overdueChargeForm.export_container_edi_depot_gate_out_date = date
      await this.calculationDiff()
    },
    loadingDateChange: async function(date) {
      this.overdueChargeForm.export_container_edi_loading_date = date
      await this.calculationDiff()
    },
    calculationDiff: async function() {
      let loading_date = this.overdueChargeForm.export_vessel_etd
      if(this.overdueChargeForm.export_container_edi_loading_date) {
        loading_date = this.overdueChargeForm.export_container_edi_loading_date
      }
      let gate_out_date = this.overdueChargeForm.export_container_edi_depot_gate_out_date
      if(loading_date && gate_out_date) {

        if(typeof loading_date === 'object') {
          loading_date = moment(loading_date).local().format('DD/MM/YYYY')
        }
        if(typeof gate_out_date === 'object') {
          gate_out_date = moment(gate_out_date).local().format('DD/MM/YYYY')
        }
        let diff = moment(loading_date, "DD/MM/YYYY").diff(moment(gate_out_date, "DD/MM/YYYY"), 'days')
        if(diff >= 0) {
          try {
            let param = {
              masterbl_id: this.overdueChargeForm.export_masterbl_id,
              container_id: this.overdueChargeForm.export_container_id,
              gate_out_date: gate_out_date,
              loading_date: loading_date,
              bl_carrier: this.overdueChargeForm.export_masterbl_bl_carrier,
              cargo_type: this.overdueChargeForm.export_masterbl_cargo_type,
              containers_size: this.overdueChargeForm.export_container_size_type,
              free_days: this.overdueChargeForm.export_container_cal_free_days
            }
            let response = await this.$http.post(apiUrl + 'calculation', param)
            this.$nextTick(function() {
              this.overdueChargeForm.demurrage_invoice_containers_diff_days = response.data.info.diff_days
              this.overdueChargeForm.export_container_cal_demurrage_days = response.data.info.overdue_days
              this.overdueChargeForm.export_container_cal_demurrage_amount = response.data.info.overdue_amount
              this.emptySubmitDisabled = false
              this.$forceUpdate()
            })
          } catch (error) {
            this.ladenSubmitDisabled = true
            this.emptySubmitDisabled = true
            this.$commonact.fault(error)
          }
        } else {
          this.ladenSubmitDisabled = true
          this.emptySubmitDisabled = true
          return this.$Message.error('loading date must after gate out date')
        }
      }
    },
    demurrageSubmitAct: async function() {
      try {
        if(this.overdueChargeForm.export_container_edi_depot_gate_out_date) {
          if(typeof this.overdueChargeForm.export_container_edi_depot_gate_out_date === 'object') {
            this.overdueChargeForm.export_container_edi_depot_gate_out_date = moment(this.overdueChargeForm.export_container_edi_depot_gate_out_date).local().format('DD/MM/YYYY')
          }
        }
        if(this.overdueChargeForm.export_container_edi_loading_date) {
          if(typeof this.overdueChargeForm.export_container_edi_loading_date === 'object') {
            this.overdueChargeForm.export_container_edi_loading_date = moment(this.overdueChargeForm.export_container_edi_loading_date).local().format('DD/MM/YYYY')
          }
        }
        await this.$http.post(apiUrl + 'demurrageCalculationSave', this.overdueChargeForm)
        this.modal.calculationModal = false
        this.getTableData()
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
    demurrageInvoiceModal: async function() {
      let selection = this.$refs.containerTable.getSelection()
      let invoice_customer_id = ''
      let totalDemurrage = 0
      if(selection && selection.length > 0) {
        for(let d of selection) {
          if(d.customerINFO && d.customerINFO.length > 0) {
            this.customer.loading = true
            this.customer.options = JSON.parse(JSON.stringify(d.customerINFO))
            this.customer.loading = false
            invoice_customer_id = d.invoice_containers_customer_id
            break
          }
        }
        try {
          let response = await this.$http.post(apiUrl + 'getInvoiceSelection', {action: 'invoice', selectAll: this.tableSelectAll, selection: selection, invoicePara: this.invoiceForm})
          totalDemurrage = response.data.info.totalDemurrage
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
      this.$nextTick(function() {
        this.invoiceForm.invoice_customer_id = invoice_customer_id
      })
      this.invoiceForm.totalDemurrage = totalDemurrage
      this.modal.invoiceModal = true
    },
    demurrageInvoiceAct: async function() {
      this.$refs['invoiceForm'].validate(async valid => {
        if (valid) {
          let selection = this.$refs.containerTable.getSelection()
          if(selection && selection.length > 0) {
            try {
              await this.$http.post(apiUrl + 'demurrageInvoice', {selectAll: this.tableSelectAll, selection: selection, invoicePara: this.invoiceForm})
              this.getTableData()
              this.$Message.success('Invoice Success')
              this.modal.invoiceModal = false
              this.emptyInvoiceDisabled = true
            } catch (error) {
              this.$commonact.fault(error)
            }
          }
        } else {
            this.$Message.error('Validate Fail!')
        }
      })
    },
    demurrageReInvoiceModal: async function() {
      try {
        this.checkPassword = ''
        this.modal.checkPasswordModal = true
        this.checkPasswordType = 'demurrageReinvoice'
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    demurrageReInvoiceModalAct: async function() {
      let selection = this.$refs.containerTable.getSelection()
      let invoice_customer_id = ''
      let totalDemurrage = 0
      if(selection && selection.length > 0) {
        for(let d of selection) {
          if(d.customerINFO && d.customerINFO.length > 0) {
            this.customer.loading = true
            this.customer.options = JSON.parse(JSON.stringify(d.customerINFO))
            this.customer.loading = false
            invoice_customer_id = d.invoice_containers_customer_id
            break
          }
        }
        try {
          let response = await this.$http.post(apiUrl + 'getInvoiceSelection', {action: 'reinvoice', selectAll: this.tableSelectAll, selection: selection, invoicePara: this.invoiceForm})
          totalDemurrage = response.data.info.totalDemurrage
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
      this.$nextTick(function() {
        this.invoiceForm.invoice_customer_id = invoice_customer_id
      })
      this.invoiceForm.totalDemurrage = totalDemurrage
      this.invoiceForm.deduction = 0
      this.modal.reInvoiceModal = true
    },
    emptyReInvoiceAct: async function() {
      this.$refs['invoiceForm'].validate(async valid => {
        if (valid) {
          let selection = this.$refs.containerTable.getSelection()
          if(selection && selection.length > 0) {
            try {
              await this.$http.post(apiUrl + 'emptyReInvoice', {selectAll: this.tableSelectAll, selection: selection, invoicePara: this.invoiceForm})
              this.getTableData()
              this.$Message.success('Invoice Success')
              this.modal.reInvoiceModal = false
              this.emptyInvoiceDisabled = true
            } catch (error) {
              this.$commonact.fault(error)
            }
          }
        } else {
            this.$Message.error('Validate Fail!')
        }
      })
    },
    overdueDaysEditAct: function(item) {
      try {
        this.checkPassword = ''
        this.modal.checkPasswordModal = true
        this.checkPasswordType = 'calculationEdit'
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actCheckPassword: async function() {
      try {
        if(!this.checkPassword) {
          return this.$Message.error('Please enter right password')
        }
        let param = {
          page: 'Import Overdue Invoice Admin',
          action: this.checkPasswordType,
          checkPassword: common.md52(this.checkPassword)
        }
        await this.$http.post(apiUrl + 'checkPassword', param)
        this.modal.checkPasswordModal = false
        if(this.checkPasswordType === 'calculationEdit') {
          this.returnOverdueDaysDisabled = false
          this.emptySubmitDisabled = false
          this.ladenSubmitDisabled = false
          this.overdueChargeForm.export_container_edi_depot_gate_out_date_disabled = false
          this.overdueChargeForm.export_container_edi_loading_date_disabled = false
        } else if(this.checkPasswordType === 'demurrageReinvoice'){
          this.demurrageReInvoiceModalAct()
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actuallyOverdueCopyAct: async function(row) {
      try {
        await this.$http.post(apiUrl + 'actuallyOverdueCopy', row)
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    overdueFreeDaysChange: async function() {
      await this.calculationDiff()
    },
    containerInvoiceDetailAct: async function(row) {
      try {
        let response = await this.$http.post(apiUrl + 'containerInvoiceDetail', row)
        this.containerInvoiceDetail = response.data.info
        if(this.containerInvoiceDetail && this.containerInvoiceDetail.length > 0) {
          this.invoiceTimelineTitle = row.invoice_containers_bl + ' : ' + row.invoice_containers_no
          this.modal.invoiceTimelineModal = true
        }else {
          this.$Message.warning('no invoice records')
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    issuingStoringOrderModal: async function(row) {
      let selection = this.$refs.containerTable.getSelection()
      let invoice_containers_depot_name = ''
      if(selection && selection.length > 0) {
        for(let d of selection) {
          if(d.invoice_containers_depot_name) {
            invoice_containers_depot_name = d.invoice_containers_depot_name
            break
          }
        }
      }
      this.$nextTick(function() {
        this.storingOrderForm.invoice_containers_depot_name = invoice_containers_depot_name
      })
      this.modal.storingOrderModal = true
    },
    issuingStoringOrderAct: async function() {
      this.$refs['storingOrderForm'].validate(async valid => {
        if (valid) {
          let selection = this.$refs.containerTable.getSelection()
          if(selection && selection.length > 0) {
            try {
              await this.$http.post(apiUrl + 'issuingStoringOrder', {selection: selection, storingOrderPara: this.storingOrderForm})
              this.getTableData()
              this.$Message.success('Storing Order Email Send Success')
              this.modal.storingOrderModal = false
              this.emptyInvoiceDisabled = true
            } catch (error) {
              this.$commonact.fault(error)
            }
          }
        } else {
            this.$Message.error('Validate Fail!')
        }
      })
    }
  }
}
</script>
<style scoped>
.right-bottom-title {
  text-align: right;
  font-size: 12px;
  color: #9ea7b4;
}
</style>