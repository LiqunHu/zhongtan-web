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
              <button type="button" class="btn btn-success" @click="emptyInvoiceModal" :disabled="emptyInvoiceDisabled">
                <i class="fa fa-money-bill-alt"></i> Invoice
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" @on-selection-change="containerSelectedChange" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_date">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_date && row.invoice_containers_actually_return_date && row.invoice_containers_empty_return_date !== row.invoice_containers_actually_return_date"> {{row.invoice_containers_empty_return_date}} </span>
          <span v-else>{{row.invoice_containers_empty_return_date}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_overdue_days">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_days && row.invoice_containers_actually_return_overdue_days && row.invoice_containers_empty_return_overdue_days !== row.invoice_containers_actually_return_overdue_days"> {{row.invoice_containers_empty_return_overdue_days}} </span>
          <span v-else>{{row.invoice_containers_empty_return_overdue_days}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_overdue_amount">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_amount && row.invoice_containers_actually_return_overdue_amount && row.invoice_containers_empty_return_overdue_amount !== row.invoice_containers_actually_return_overdue_amount"> {{row.invoice_containers_empty_return_overdue_amount}} </span>
          <span v-else>{{row.invoice_containers_empty_return_overdue_amount}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_actually_return_date">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_date && row.invoice_containers_actually_return_date && row.invoice_containers_empty_return_date !== row.invoice_containers_actually_return_date"> {{row.invoice_containers_actually_return_date}} </span>
          <span v-else>{{row.invoice_containers_actually_return_date}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_actually_return_overdue_days">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_days && row.invoice_containers_actually_return_overdue_days && row.invoice_containers_empty_return_overdue_days !== row.invoice_containers_actually_return_overdue_days"> {{row.invoice_containers_actually_return_overdue_days}} </span>
          <span v-else>{{row.invoice_containers_actually_return_overdue_days}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_actually_return_overdue_amount">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_amount && row.invoice_containers_actually_return_overdue_amount && row.invoice_containers_empty_return_overdue_amount !== row.invoice_containers_actually_return_overdue_amount"> {{row.invoice_containers_actually_return_overdue_amount}} </span>
          <span v-else>{{row.invoice_containers_actually_return_overdue_amount}}</span>
        </template>
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
        <template slot-scope="{ row, index }" slot="invoice_containers_size">
            {{row.invoice_containers_size}} [
            <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.invoice_containers_size">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="empty_overdue_calculation">
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click="emptyOverdueCalculationModal(row)">
            <i class="fa fa-calculator"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="actually_return_act">
          <a v-if="row.invoice_containers_actually_return_date" href="#" class="btn btn-success btn-icon btn-sm" @click="actuallyOverdueCopyAct(row)">
            <i class="fa fa-copy"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.calculationModal" :title="textMap[modalStatus]" width="600">
        <Form ref="overdueChargeForm" :model="overdueChargeForm" :label-width="150" style="padding-right: 80px;">
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
            <Input v-if="modalStatus === 'empty'" v-model="overdueChargeForm.invoice_containers_empty_return_overdue_amount" :disabled ="returnOverdueDaysDisabled">
              <a slot="append" href="#" @click.prevent="overdueDaysEditAct" title="Edit" style="display:block; width: 40px">
                <i class="fa fa-edit"></i>
              </a>
            </Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.calculationModal = false">Cancel</Button>
          <Button type="primary" size="large" v-if="modalStatus === 'laden'" @click="ladenSubmitAct" :disabled="ladenSubmitDisabled">Submit</Button>
          <Button type="primary" size="large" v-if="modalStatus === 'empty'" @click="emptySubmitAct" :disabled="emptySubmitDisabled">Submit</Button>
        </div>
      </Modal>
      <Modal v-model="modal.invoiceModal" title="INVOICE" width="600">
        <Form ref="invoiceForm" :model="invoiceForm" :rules="invoiceRules" :label-width="150" style="padding-right: 80px;">
          <FormItem label="MESSRS" prop="invoice_customer_id" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="invoiceForm.invoice_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="customer.loading" placeholder="Customer">
              <Option v-for="item in customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.invoiceModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="emptyInvoiceAct" >Submit</Button>
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
const apiUrl = '/api/zhongtan/equipment/ImportOverdueCalculation/'

export default {
  name: 'ImportOverdueCalculation',
  data: function() {
    return {
      modal: { calculationModal: false, invoiceModal : false, checkPasswordModal: false },
      modalStatus: 'laden',
      textMap: {
        laden: 'Overdue Calculation',
        empty: 'Overdue Calculation'
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
              title: 'Files',
              slot: 'files',
              width: 80,
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
              width: 80,
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
              title: 'OVERDUE CALCULATION',
              align: 'center',
              fixed: 'right',
              children: [
                {
                  title: 'Return Date',
                  slot: 'invoice_containers_empty_return_date',
                  width: 125,
                  align: 'center',
                  fixed: 'right'
                },
                {
                  title: 'Overdue Days',
                  slot: 'invoice_containers_empty_return_overdue_days',
                  width: 125,
                  align: 'right',
                  fixed: 'right'
                },
                {
                  title: 'Demurrage',
                  slot: 'invoice_containers_empty_return_overdue_amount',
                  width: 125,
                  align: 'right',
                  fixed: 'right'
                },
                {
                  title: 'Cal',
                  slot: 'empty_overdue_calculation',
                  width: 80,
                  align: 'center',
                  fixed: 'right'
                }
              ]
            },
            {
              title: 'ACTUALLY',
              align: 'center',
              fixed: 'right',
              children: [
                {
                  title: 'Return Date',
                  slot: 'invoice_containers_actually_return_date',
                  width: 125,
                  align: 'center',
                  fixed: 'right'
                },
                {
                  title: 'Overdue Days',
                  slot: 'invoice_containers_actually_return_overdue_days',
                  width: 125,
                  align: 'right',
                  fixed: 'right'
                },
                {
                  title: 'Demurrage',
                  slot: 'invoice_containers_actually_return_overdue_amount',
                  width: 125,
                  align: 'right',
                  fixed: 'right'
                },
                {
                  title: 'Depot Name',
                  key: 'invoice_containers_depot_name',
                  width: 125,
                  align: 'center',
                  fixed: 'right'
                },
                {
                  title: 'Save',
                  slot: 'actually_return_act',
                  width: 80,
                  align: 'center',
                  fixed: 'right'
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
      invoiceForm: {
        invoice_customer_id: ''
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
      returnOverdueDaysDisabled: true
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
        if(d.invoice_masterbi_id === row.invoice_masterbi_id) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].invoice_masterbi_id === row.invoice_masterbi_id) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    containerSelectedChange: async function(selection) {
      if(selection && selection.length > 0) {
        let bl = ''
        for(let s of selection) {
          if(!bl) {
            bl = s.invoice_containers_bl
          } else {
            if(bl !== s.invoice_containers_bl) {
              this.emptyInvoiceDisabled = true
              return this.$Message.error('please select same #B/L No.')
            }
          }
          if(s.invoice_containers_empty_return_date) {
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
    ladenOverdueCalculationModal: async function(row) {
      this.$nextTick(() => {
        this.$refs['overdueChargeForm'].resetFields()
      })
      this.resetChageRuleForm()
      this.overdueChargeFormOld = Object.assign({}, row)
      this.overdueChargeForm = Object.assign({}, row) // copy obj
      this.modalStatus = 'laden'
      this.returnOverdueDaysDisabled = true
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
      this.returnOverdueDaysDisabled = true
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
    emptyInvoiceModal: async function() {
      let selection = this.$refs.containerTable.getSelection()
      let invoice_customer_id = ''
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
      }
      this.$nextTick(function() {
        this.invoiceForm.invoice_customer_id = invoice_customer_id
      })
      this.modal.invoiceModal = true
    },
    emptyInvoiceAct: async function() {
      this.$refs['invoiceForm'].validate(async valid => {
        if (valid) {
          let selection = this.$refs.containerTable.getSelection()
          if(selection && selection.length > 0) {
            try {
              await this.$http.post(apiUrl + 'emptyInvoice', {selection: selection, invoicePara: this.invoiceForm})
              this.getTableData()
              this.$Message.success('Invoice Success')
              this.modal.invoiceModal = false
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
        this.checkPasswordType = 'returnOverdueDaysEdit'
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actCheckPassword: async function() {
      try {
        if(!this.checkPassword) {
          return this.$Message.error('Please enter right password')
        }
        await this.$http.post(apiUrl + 'checkPassword', { check_password: common.md52(this.checkPassword)})
        this.modal.checkPasswordModal = false
        if(this.checkPasswordType === 'returnOverdueDaysEdit') {
          this.returnOverdueDaysDisabled = false
          this.emptySubmitDisabled = false
          this.ladenSubmitDisabled = false
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
    }
  }
}
</script>
