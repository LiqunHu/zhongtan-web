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
      Export Demurrage Calculation
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Export Demurrage Calculation">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <Select v-model="search_data.export_vessel_id" clearable filterable style="width:200px">
                <Option v-for="item in pagePara.VESSELS" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.export_container_bl" placeholder="#M B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.export_container_no" placeholder="Container No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <DatePicker type="daterange" placeholder="Loading Date" v-model="search_data.loading_date" format="yyyy-MM-dd" @on-change="searchDataChange" style="width:200px"></DatePicker>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)"><i class="fa fa-search"></i> Search </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="setDeductionData()" :disabled="deductionDisabled"> Deduction </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="demurrageExport">Export</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" @on-select-all="containerSelectedAll"  @on-select-all-cancel="containerSelectedAllCancel" @on-selection-change="containerSelectedChange" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="vessel_voyage">
          {{row.export_vessel_name}} / {{row.export_vessel_voyage}}
        </template>
        <template slot-scope="{ row, index }" slot="export_container_no">
          <i style="color: #FF9900; margin-right:10px;" class="fa fa-money-bill-alt" v-if="row.export_container_cal_deduction_amount && row.export_container_cal_deduction_amount > 0"></i>
          <span style="color: #00cc66" v-if="row.export_container_cal_receipt === '1'">{{row.export_container_no}}</span>
          <span style="color: #3091f2" v-else>{{row.export_container_no}}</span>
          <font color="#1890ff" style="margin-left:10px;" v-if="row.export_container_soc_type==='S'">SOC</font>
        </template>
         <template slot-scope="{ row, index }" slot="export_container_size_type">
            {{row.export_container_size_type}} [
            <span v-for="(item, index) in pagePara.CONTAINER_SIZE" :key="index" v-if="item.container_size_code === row.export_container_size_type">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="export_container_edi_loading_date">
          <span v-if="row.export_masterbl_bl_carrier === 'OOCL'">{{row.export_container_edi_loading_date}}</span>
          <span v-if="row.export_masterbl_bl_carrier === 'COSCO'">{{row.export_container_edi_wharf_gate_in_date}}</span>
          <Row class="right-bottom-title">
            <span>ETD: {{row.export_vessel_etd}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_edi_depot_gate_out_date">
          <span>{{row.export_container_edi_depot_gate_out_date}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_days">
          <span style="color: #00cc66" v-if="row.export_container_cal_receipt === '1'">{{row.export_container_cal_demurrage_days}}</span>
          <span style="color: #3091f2" v-else>{{row.export_container_cal_demurrage_days}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_demurrage_amount">
          <span style="color: #00cc66" v-if="row.export_container_cal_receipt === '1'">{{row.export_container_cal_demurrage_amount}}</span>
          <span style="color: #3091f2" v-else>{{row.export_container_cal_demurrage_amount}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="export_container_cal_deduction_amount">
          <span style="color: #00cc66" v-if="row.export_container_cal_receipt === '1'">{{row.export_container_cal_deduction_amount}}</span>
          <span style="color: #3091f2" v-else>{{row.export_container_cal_deduction_amount}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="cal_demurrage">
          <a href="#" class="btn btn-success btn-icon btn-sm" title="RECEIPT" v-if="row.export_container_cal_receipt === '1'" @click.prevent="demurrageCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
          <a href="#" class="btn btn-warning btn-icon btn-sm" title="INVOICE" v-else-if="row.export_container_cal_invoice === '1'" @click.prevent="demurrageCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
          <a href="#" class="btn btn-primary btn-icon btn-sm" v-else @click.prevent="demurrageCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.calculationModal" title="Demurrage Calculation" width="640">
        <Form ref="overdueChargeForm" :model="overdueChargeForm" :label-width="150" style="padding-right: 80px;">
          <FormItem label="Gate Out">
            <DatePicker type="date" placeholder="Gate Out Date" v-model="overdueChargeForm.export_container_edi_depot_gate_out_date" format="dd/MM/yyyy" @on-change="gateOutDateChange" :disabled="!!overdueChargeForm.export_container_edi_depot_gate_out_date && returnOverdueDaysDisabled"></DatePicker>
            <Tag type="dot" v-if="overdueChargeForm.demurrage_invoice_containers_diff_days">Diff {{overdueChargeForm.demurrage_invoice_containers_diff_days}} Days</Tag>
          </FormItem>
          <FormItem label="Loading Date" v-if="overdueChargeForm.export_masterbl_bl_carrier === 'OOCL'">
            <DatePicker type="date" placeholder="Loading Date" v-model="overdueChargeForm.export_container_edi_loading_date" format="dd/MM/yyyy" @on-change="loadingDateChange" :disabled="!!overdueChargeForm.export_container_edi_loading_date && returnOverdueDaysDisabled"></DatePicker>
            <Tag type="dot">ETD {{overdueChargeForm.export_vessel_etd}}</Tag>
          </FormItem>
          <FormItem label="Get In Date" v-if="overdueChargeForm.export_masterbl_bl_carrier === 'COSCO'">
            <DatePicker type="date" placeholder="Get In Date" v-model="overdueChargeForm.export_container_edi_wharf_gate_in_date" format="dd/MM/yyyy" @on-change="gateInDateChange" :disabled="!!overdueChargeForm.export_container_edi_wharf_gate_in_date && returnOverdueDaysDisabled"></DatePicker>
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
      <Modal v-model="modal.deductionModal" title="INVOICE" width="600">
        <Form ref="deductionForm" :model="deductionForm" :label-width="180" style="padding-right: 80px;">
          <FormItem label="TOTAL DEMURRAGE" style="margin-bottom: 0px;">
            <Input v-model="deductionForm.total_demurrage_amount" disabled></Input>
          </FormItem>
          <FormItem label="DEDUCTION AMOUNT" style="margin-bottom: 0px;">
            <InputNumber :max="deductionForm.total_demurrage_amount" :min="0" v-model="deductionForm.deduction_amount"></InputNumber >
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.deductionModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="deductionDemurrageAct">Submit</Button>
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
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/ExportDemurrageCalculation/'

export default {
  name: 'ExportDemurrageCalculation',
  data: function() {
    return {
      modal: { calculationModal: false, checkPasswordModal: false, deductionModal: false},
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
              title: 'Vessel Voyage',
              slot: 'vessel_voyage',
              width: 200,
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
              width: 120,
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
              title: 'Loading / Gate In',
              slot: 'export_container_edi_loading_date',
              width: 140,
              align: 'center'
            },
            {
              title: 'Overdue Days',
              slot: 'export_container_cal_demurrage_days',
              width: 140,
              align: 'center',
            },
            {
              title: 'Demurrage',
              slot: 'export_container_cal_demurrage_amount',
              width: 120,
              align: 'center',
            },
            {
              title: 'Deduction',
              slot: 'export_container_cal_deduction_amount',
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
        }
      },
      search_data: {
        export_vessel_id: '',
        export_container_bl: '',
        export_container_no: '',
        loading_date: []
      },
      overdueChargeFormOld: {},
      overdueChargeForm: {},
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
      emptySubmitDisabled: true,
      deductionDisabled: true,
      deductionForm: {
        total_demurrage_amount: '',
        deduction_amount: ''
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
      if(column.title === '#M B/L No' || column.title === 'Vessel Voyage' || column.title === 'Files') {
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
              this.deductionDisabled = true
              return this.$Message.error('please select same #B/L No.')
            }
          }
          if(s.export_container_cal_demurrage_amount) {
            this.deductionDisabled = false
          }
        }
      } else {
        this.deductionDisabled = true
      }
      this.$forceUpdate()
    },
    resetChageRuleForm: function() {
      this.overdueChargeFormOld = {}
      this.overdueChargeForm = {}
      this.emptySubmitDisabled = true
    },
    demurrageCalculationModal: async function(row) {
      this.$nextTick(() => {
        this.$refs['overdueChargeForm'].resetFields()
      })
      this.resetChageRuleForm()
      this.overdueChargeFormOld = Object.assign({}, row)
      this.overdueChargeForm = Object.assign({}, row) // copy obj
      this.returnOverdueDaysDisabled = true
      if(row.export_container_cal_receipt === '1' || row.export_container_cal_invoice === '1') {
        try {
          this.checkPassword = ''
          this.modal.checkPasswordModal = true
          this.checkPasswordType = 'exportDemurrageModal'
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        this.modal.calculationModal = true
        if(!this.overdueChargeForm.export_container_cal_demurrage_days) {
          this.calculationDiff()
        }
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
    gateInDateChange: async function(date) {
      this.overdueChargeForm.export_container_edi_wharf_gate_in_date = date
      await this.calculationDiff()
    },
    calculationDiff: async function() {
      let loading_date = this.overdueChargeForm.export_vessel_etd
      if(this.overdueChargeForm.export_masterbl_bl_carrier === 'OOCL' && this.overdueChargeForm.export_container_edi_loading_date) {
        loading_date = this.overdueChargeForm.export_container_edi_loading_date
      }
      if(this.overdueChargeForm.export_masterbl_bl_carrier === 'COSCO' && this.overdueChargeForm.export_container_edi_wharf_gate_in_date) {
        loading_date = this.overdueChargeForm.export_container_edi_wharf_gate_in_date
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
            this.emptySubmitDisabled = true
            this.$commonact.fault(error)
          }
        } else {
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
        if(this.overdueChargeForm.export_container_edi_wharf_gate_in_date) {
          if(typeof this.overdueChargeForm.export_container_edi_wharf_gate_in_date === 'object') {
            this.overdueChargeForm.export_container_edi_wharf_gate_in_date = moment(this.overdueChargeForm.export_container_edi_wharf_gate_in_date).local().format('DD/MM/YYYY')
          }
        }
        await this.$http.post(apiUrl + 'demurrageCalculationSave', this.overdueChargeForm)
        this.modal.calculationModal = false
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
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
          action: 'EXPORT_DEMURRAGE',
          checkPassword: common.md52(this.checkPassword)
        }
        await this.$http.post(apiUrl + 'checkPassword', param)
        this.modal.checkPasswordModal = false
        if(this.checkPasswordType === 'calculationEdit') {
          this.returnOverdueDaysDisabled = false
          this.emptySubmitDisabled = false
          this.overdueChargeForm.export_container_edi_depot_gate_out_date_disabled = false
          this.overdueChargeForm.export_container_edi_loading_date_disabled = false
        } else if(this.checkPasswordType === 'exportDemurrageModal'){
          this.modal.calculationModal = true
          if(!this.overdueChargeForm.export_container_cal_demurrage_days) {
            this.calculationDiff()
          }
        } else if(this.checkPasswordType === 'deductionDemurrage') {
          let selection = this.$refs.containerTable.getSelection()
          if(selection && selection.length > 0) {
            try {
              let response = await this.$http.post(apiUrl + 'getSelectionDemurrage', {selectAll: this.tableSelectAll, selection: selection})
              this.deductionForm.total_demurrage_amount = response.data.info.total_demurrage_amount
              this.deductionForm.deduction_amount = ''
              this.modal.deductionModal = true
            } catch (error) {
              this.$commonact.fault(error)
            }
          }
        } else if(this.checkPasswordType === 'demurrageExport') {
          this.demurrageExportAct()
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    overdueFreeDaysChange: async function() {
      await this.calculationDiff()
    },
    setDeductionData: async function() {
      try {
        this.checkPassword = ''
        this.modal.checkPasswordModal = true
        this.checkPasswordType = 'deductionDemurrage'
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    deductionDemurrageAct: async function() {
      let selection = this.$refs.containerTable.getSelection()
      if(selection && selection.length > 0) {
        try {
          await this.$http.post(apiUrl + 'deductionDemurrage', {selectAll: this.tableSelectAll, selection: selection, deduction_amount: this.deductionForm.deduction_amount })
          this.modal.deductionModal = false
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
    },
    searchDataChange: async function(date) {
      this.search_data.loading_date = JSON.parse(JSON.stringify(date))
    },
    demurrageExport: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'demurrageExport'
      this.modal.checkPasswordModal = true
    },
    demurrageExportAct: async function() {
      let response = await this.$http.request({url: apiUrl + 'demurrageExport', method: 'post', data: {search_data: this.search_data}, responseType: 'blob'})
      let blob = response.data
      let reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = e => {
        let a = document.createElement('a')
        a.download = 'Export Demurrage Calculation.xlsx'
        a.href = e.target.result
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    },
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