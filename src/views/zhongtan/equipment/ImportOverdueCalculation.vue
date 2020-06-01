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
      Import Overdue Calculation
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Import Overdue Calculation">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_vessel_name" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_bl" placeholder="#M B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_no" placeholder="Container No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-primary" @click="getTableData" :disabled="ladenInvoiceDisabled">
                <i class="fa fa-money-bill-alt"></i> Laden Invoice
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-primary" @click="getTableData" :disabled="ladenReceiptDisabled">
                <i class="fa fa-money-bill-alt"></i> Laden Receipt
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-success" @click="getTableData" :disabled="emptyInvoiceDisabled">
                <i class="fa fa-money-bill-alt"></i> Empty Invoice
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-success" @click="getTableData" :disabled="emptyReceiptDisabled">
                <i class="fa fa-money-bill-alt"></i> Empty Receipt
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" border @on-selection-change="containerSelectedChange">
        <template slot-scope="{ row, index }" slot="invoice_containers_size">
            {{row.invoice_containers_size}} [
            <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.invoice_containers_size">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="laden_overdue_calculation">
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click="ladenOverdueCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="empty_overdue_calculation">
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click="emptyOverdueCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.calculationModal" :title="textMap[modalStatus]" width="600">
        <Form ref="overdueChargeForm" :model="overdueChargeForm" :rules="overdueChargeRules" :label-width="120" style="padding-right: 80px;">
          <FormItem label="Discharge Date">
            <Input icon="ios-calendar-outline" v-model="overdueChargeForm.invoice_vessel_ata" disabled style="width: 176px;"></Input>
          </FormItem>
          <FormItem label="Return Date">
            <DatePicker v-if="modalStatus === 'laden'" type="date" placeholder="Return Date" v-model="overdueChargeForm.invoice_containers_laden_release_date" format="dd/MM/yyyy" @on-change="returnDateChange"></DatePicker>
            <DatePicker v-if="modalStatus === 'empty'" type="date" placeholder="Return Date" v-model="overdueChargeForm.invoice_containers_empty_return_date" format="dd/MM/yyyy" @on-change="returnDateChange"></DatePicker>
          </FormItem>
          <FormItem label="Overdue Days">
            <Input v-if="modalStatus === 'laden'" v-model="overdueChargeForm.invoice_containers_laden_release_overdue_days" disabled>
                <span slot="append" style="display:block; width: 40px">Day</span>
            </Input>
            <Input v-if="modalStatus === 'empty'" v-model="overdueChargeForm.invoice_containers_empty_return_overdue_days" disabled>
                <span slot="append" style="display:block; width: 40px">Day</span>
            </Input>
          </FormItem>
          <FormItem label="Overdue Charge">
            <Input v-if="modalStatus === 'laden'" v-model="overdueChargeForm.invoice_containers_laden_release_overdue_amount" disabled>
                <span slot="append" style="display:block; width: 40px">USD</span>
            </Input>
            <Input v-if="modalStatus === 'empty'" v-model="overdueChargeForm.invoice_containers_empty_return_overdue_amount" disabled>
                <span slot="append" style="display:block; width: 40px">USD</span>
            </Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.calculationModal = false">Cancel</Button>
          <Button type="primary" size="large" v-if="modalStatus === 'laden'" @click="ladenSubmitAct" :disabled="ladenSubmitDisabled">Laden Submit</Button>
          <Button type="primary" size="large" v-if="modalStatus === 'empty'" @click="emptySubmitAct" :disabled="emptySubmitDisabled">Empty Submit</Button>
        </div>
      </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/ImportOverdueCalculation/'

export default {
  name: 'ImportOverdueCalculation',
  data: function() {
    return {
      modal: { calculationModal: false },
      modalStatus: 'laden',
      textMap: {
        laden: 'Laden Overdue Calculation',
        empty: 'Empty Overdue Calculation'
      },
      cargoTypeFileter: [
        { id: 'IM', text: 'IM' },
        { id: 'TR', text: 'TR' }
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
              key: 'invoice_containers_bl',
              width: 150,
              align: 'center'
            },
            {
              title: 'Container No',
              key: 'invoice_containers_no',
              width: 130,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'invoice_containers_size',
              width: 120,
              align: 'center'
            },
            {
              title: 'IM/TR',
              key: 'invoice_masterbi_cargo_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Destination',
              key: 'invoice_masterbi_destination',
              width: 120,
              align: 'center'
            },
            {
              title: 'Discharge Date',
              key: 'invoice_vessel_ata',
              width: 140,
              align: 'center'
            },
            {
              title: 'LADEN RELEASE',
              align: 'center',
              children: [
                {
                  title: 'Return Date',
                  key: 'invoice_containers_laden_release_date',
                  width: 140,
                  align: 'center'
                },
                {
                  title: 'Overdue Days',
                  key: 'invoice_containers_laden_release_overdue_days',
                  width: 140,
                  align: 'right'
                },
                {
                  title: 'Demurrage',
                  key: 'invoice_containers_laden_release_overdue_amount',
                  width: 120,
                  align: 'right'
                },
                {
                  title: 'Cal',
                  slot: 'laden_overdue_calculation',
                  align: 'center',
                  width: 60
                }
              ]
            },
            {
              title: 'EMPTY RETURN',
              align: 'center',
              children: [
                {
                  title: 'Return Date',
                  key: 'invoice_containers_empty_return_date',
                  width: 140,
                  align: 'center'
                },
                {
                  title: 'Overdue Days',
                  key: 'invoice_containers_empty_return_overdue_days',
                  width: 140,
                  align: 'right'
                },
                {
                  title: 'Demurrage',
                  key: 'invoice_containers_empty_return_overdue_amount',
                  width: 120,
                  align: 'right'
                },
                {
                  title: 'Cal',
                  slot: 'empty_overdue_calculation',
                  align: 'center',
                  width: 60
                }
              ]
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      search_data: {
        invoice_vessel_name: '',
        invoice_containers_bl: '',
        invoice_containers_no: ''
      },
      overdueChargeFormOld: {},
      overdueChargeForm: {},
      overdueChargeRules: {
        overdue_charge_cargo_type: [{ required: true, message: 'The cargo type cannot be empty', trigger: 'change' }],
        overdue_charge_discharge_port: [{ required: true, trigger: 'change', message: 'select discharge port' }],
        overdue_charge_discharge_port_multiple: [{ type: 'array', min: 1, required: true, trigger: 'change', message: 'select discharge port' }],
        overdue_charge_carrier: [{ required: true, message: 'The carrier cannot be empty', trigger: 'change' }],
        overdue_charge_container_size: [{ required: true, trigger: 'change', message: 'select container size' }],
        overdue_charge_container_type: [{ required: true, trigger: 'change', message: 'select container type' }],
        overdue_charge_container_type_multiple: [{ type: 'array', min: 1, required: true, trigger: 'change', message: 'select container type' }],
        overdue_charge_min_day: [
          { required: true, message: 'The min day cannot be empty', trigger: 'blur' },
          {
            type: 'number',
            message: 'The min day must be number',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }
        ],
        overdue_charge_max_day: [
          {
            type: 'number',
            message: 'The min day must be number',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }
        ],
        overdue_charge_amount: [
          {
            type: 'number',
            message: 'The amount must be number',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }
        ]
      },
      ladenSubmitDisabled: true,
      emptySubmitDisabled: true,
      ladenInvoiceDisabled: true,
      ladenReceiptDisabled: true,
      emptyInvoiceDisabled: true,
      emptyReceiptDisabled: true
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
    containerSelectedChange: async function(selection) {
      if(selection && selection.length > 0) {
        let bl = ''
        for(let s of selection) {
          if(!bl) {
            bl = s.invoice_containers_bl
          } else {
            if(bl !== s.invoice_containers_bl) {
              this.ladenInvoiceDisabled = true
              this.ladenReceiptDisabled = true
              this.emptyInvoiceDisabled = true
              this.emptyReceiptDisabled = true
              return this.$Message.error('please select same #B/L No.')
            }
          }
          if(s.invoice_containers_laden_release_date) {
            this.ladenInvoiceDisabled = false
          }
          if(s.invoice_containers_laden_release_invoice_release_date) {
            this.ladenReceiptDisabled = false
          }
          if(s.invoice_containers_empty_return_date) {
            this.emptyInvoiceDisabled = false
          }
          if(s.invoice_containers_empty_return_invoice_release_date) {
            this.emptyReceiptDisabled = false
          }
        }
      } else {
        this.ladenInvoiceDisabled = true
        this.ladenReceiptDisabled = true
        this.emptyInvoiceDisabled = true
        this.emptyReceiptDisabled = true
      }
      this.$forceUpdate()
    },
    resetChageRuleForm: function() {
      this.overdueChargeFormOld = {}
      this.overdueChargeForm = {}
      this.ladenSubmitDisabled = true
      this.emptySubmitDisabled = true
    },
    ladenOverdueCalculationModal: async function(row) {
      this.$nextTick(() => {
        this.$refs['overdueChargeForm'].resetFields()
      })
      this.resetChageRuleForm()
      this.overdueChargeFormOld = Object.assign({}, row)
      this.overdueChargeForm = Object.assign({}, row) // copy obj
      this.modalStatus = 'laden'
      this.modal.calculationModal = true
    },
    emptyOverdueCalculationModal: async function(row) {
      this.$nextTick(() => {
        this.$refs['overdueChargeForm'].resetFields()
      })
      this.resetChageRuleForm()
      this.overdueChargeFormOld = Object.assign({}, row)
      this.overdueChargeForm = Object.assign({}, row) // copy obj
      this.modalStatus = 'empty'
      this.modal.calculationModal = true
    },
    returnDateChange: async function(date) {
      let diff = moment(date, "DD/MM/YYYY").diff(moment(this.overdueChargeForm.invoice_vessel_ata, "DD/MM/YYYY"), 'days')
      if(diff >= 0) {
        try {
          let param = {
            invoice_vessel_ata: this.overdueChargeForm.invoice_vessel_ata,
            return_date: date,
            invoice_masterbi_cargo_type: this.overdueChargeForm.invoice_masterbi_cargo_type,
            invoice_masterbi_destination: this.overdueChargeForm.invoice_masterbi_destination,
            invoice_containers_bl: this.overdueChargeForm.invoice_containers_bl,
            invoice_containers_size: this.overdueChargeForm.invoice_containers_size,
          }
          let response = await this.$http.post(apiUrl + 'calculation', param)
          if(this.modalStatus === 'laden') {
            this.overdueChargeForm.invoice_containers_laden_release_overdue_days = response.data.info.diff_days
            this.overdueChargeForm.invoice_containers_laden_release_overdue_amount = response.data.info.overdue_amount
            this.ladenSubmitDisabled = false
          } else if(this.modalStatus === 'empty') {
            this.overdueChargeForm.invoice_containers_empty_return_overdue_days = response.data.info.diff_days
            this.overdueChargeForm.invoice_containers_empty_return_overdue_amount = response.data.info.overdue_amount
            this.emptySubmitDisabled = false
          }
        } catch (error) {
          this.ladenSubmitDisabled = true
          this.emptySubmitDisabled = true
          this.$commonact.fault(error)
        }
      } else {
        this.ladenSubmitDisabled = true
        this.emptySubmitDisabled = true
        return this.$Message.error('return must after discharge date')
      }
    },
    ladenSubmitAct: async function() {
      try {
        await this.$http.post(apiUrl + 'ladenReleaseSave', this.overdueChargeForm)
        this.modal.calculationModal = false
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    emptySubmitAct: async function() {
      try {
        await this.$http.post(apiUrl + 'emptyReturnSave', this.overdueChargeForm)
        this.modal.calculationModal = false
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
  }
}
</script>
