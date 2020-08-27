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
      Import Overdue Calculation Receipt
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Import Overdue Calculation Receipt">
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
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom-start" :transfer="true" v-if="row.files && row.files.length > 0">
            <span>Files [{{row.files.length}}]</span>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template v-if="row.state === 'AP' && row.file_type === 'INVOICE'">
                    <Tooltip content="Download" placement="top">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="RECEIPT" placement="top" v-if="!row.receipt_no">
                      <a class="btn btn-pink btn-icon btn-sm" @click="receiptModelAct(row)">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                  </template>
                  <template v-if="row.file_type === 'RECEIPT'">
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
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
    </panel>
    <Modal v-model="modal.receiptModal" title="RECEIPT" width="600">
      <Form ref="receiptForm" :model="receiptForm" :label-width="150" style="padding-right: 80px;">
        <FormItem label="Received From" style="margin-bottom: 0px;">
          <Input v-model="receiptForm.overdue_invoice_received_from" disabled/>
        </FormItem>
        <FormItem label="Amount" style="margin-bottom: 0px;">
          <Input v-model="receiptForm.overdue_invoice_demurrage" disabled/>
        </FormItem>
        <FormItem label="Cash/Cheque" style="margin-bottom: 0px;">
          <Select v-model="receiptForm.overdue_invoice_check_cash" >
            <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id" :disabled = "item.id === 'CASH'">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Row v-if="receiptForm.overdue_invoice_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Reference No" prop="overdue_invoice_bank_reference_no" >
              <Input placeholder="Bank Reference No" v-model="receiptForm.overdue_invoice_bank_reference_no"/>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="receiptForm.overdue_invoice_check_cash === 'CHEQUE'">
          <Col>
            <FormItem label="Check No" prop="overdue_invoice_check_no" >
              <Input placeholder="Check No" v-model="receiptForm.overdue_invoice_check_no"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.receiptModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="receiptAct" >Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
import printJS from 'print-js'
const apiUrl = '/api/zhongtan/equipment/ImportOverdueCalculationReceipt/'

export default {
  name: 'ImportOverdueCalculationReceipt',
  data: function() {
    return {
      modal: { receiptModal: false },
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
              title: 'Discharge Date',
              key: 'invoice_vessel_ata',
              width: 140,
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
              width: 115,
              align: 'center'
            },
            {
              title: 'Destination',
              key: 'invoice_masterbi_destination',
              width: 120,
              align: 'center'
            },
            {
              title: 'Depot Name',
              key: 'invoice_containers_depot_name',
              width: 125,
              align: 'center',
            },
            {
              title: 'OVERDUE CALCULATION',
              align: 'center',
              children: [
                {
                  title: 'Return Date',
                  key: 'invoice_containers_empty_return_date',
                  align: 'center',
                  width: 120,
                },
                {
                  title: 'Free Days',
                  key: 'invoice_containers_empty_return_overdue_free_days',
                  align: 'center',
                  width: 120,
                },
                {
                  title: 'Overdue Days',
                  key: 'invoice_containers_empty_return_overdue_days',
                  align: 'right',
                  width: 140,
                },
                {
                  title: 'Demurrage',
                  key: 'invoice_containers_empty_return_overdue_amount',
                  align: 'right',
                  width: 120,
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
      receiptForm: {
        file_id: '',
        overdue_invoice_received_from: '',
        overdue_invoice_demurrage: '',
        overdue_invoice_check_cash: 'TRANSFER',
        overdue_invoice_check_no: '',
        overdue_invoice_bank_reference_no:''
      },
      receiptRules: {
        overdue_invoice_bank_reference_no: [{ required: true, trigger: 'blur', message: 'input bank reference no' }],
        overdue_invoice_check_no: [{ required: true, trigger: 'blur', message: 'input check no' }],
      }
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
    receiptModelAct: async function(row) {
      this.receiptForm.file_id = row.file_id
      this.receiptForm.overdue_invoice_received_from = row.received_from
      this.receiptForm.overdue_invoice_demurrage = row.demurrage
      this.receiptForm.overdue_invoice_check_cash = 'TRANSFER'
      this.receiptForm.overdue_invoice_check_no = ''
      this.receiptForm.overdue_invoice_bank_reference_no = ''
      this.modal.receiptModal = true
    },
    receiptAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'doReceipt', this.receiptForm)
        printJS(response.data.info.url)
        this.$Message.success('Receipt Success')
        this.modal.receiptModal = false
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
  }
}
</script>
