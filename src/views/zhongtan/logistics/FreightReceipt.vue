<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Logistics</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Freight Receipt
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Freight Receipt">
      <template slot="beforeBody">
        <div class="panel-toolbar">
            <Row>
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <input type="text" placeholder="B/L#" v-model.trim="searchPara.shipment_list_bill_no" class="form-control" style="width:130px; margin-right:7px;">
                  <input type="text" placeholder="CONTAINER#" v-model.trim="searchPara.shipment_list_container_no" class="form-control" style="width:130px; margin-right:7px;">
                  <input type="text" placeholder="INVOICE No." v-model.trim="searchPara.shipment_list_invoice_no" class="form-control" style="width:130px; margin-right:7px;">
                  <input type="text" placeholder="RECEIPT No." v-model.trim="searchPara.shipment_list_receipt_no" class="form-control" style="width:130px; margin-right:7px;">
                  <Select v-model="searchPara.shipment_list_vendor" clearable filterable placeholder="VENDOR" style="width:199px; margin-right:7px;">
                    <Option v-for="item in pagePara.VENDOR" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_customer" clearable filterable placeholder="CUSTOMER" style="width:199px; margin-right:7px;">
                    <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                  </Select>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="getFreightCollectionData(1)">
                    <i class="fa fa-search"></i>Search
                  </button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="exportAct">Export</button>
                </div>
              </div>
            </Row>
            <Row style="margin-top:7px;">
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <Select v-model="searchPara.shipment_list_cntr_owner" clearable placeholder="CNTR OWNER" style="width:130px; margin-right:7px;">
                    <Option v-for="item in cntrOwnerFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_payment_status" clearable placeholder="FREIGHT STATUS" style="width:130px; margin-right:7px;">
                    <Option v-for="item in pagePara.RECEIVABLE_STATUS" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_business_type" clearable placeholder="BUSINESS TYPE" style="width:130px; margin-right:7px;">
                    <Option v-for="item in businessTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_cargo_type" clearable placeholder="CARGO TYPE" style="width:130px; margin-right:7px;">
                    <Option v-for="item in cargoTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_in_date" placeholder="DISCHARGE/GATE OUT" @on-change="searchInDateChange" format="yyyy-MM-dd" style="margin-right:7px;"></DatePicker>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_out_date" placeholder="EMPTY RETURN/LOADING" @on-change="searchOutDateChange" format="yyyy-MM-dd"></DatePicker>
                </div>
              </div>
            </Row>
        </div>
      </template>
      <Table stripe ref="shipmentTable" :columns="table.shipmentTable.rows" :data="table.shipmentTable.data" :height="table.shipmentTable.height" :span-method="freightCollectionHandleSpan">
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="690" v-if="row.files && row.files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download" placement="top">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Undo" placement="top" v-if="!row.receipt_no">
                      <a href="#" class="btn btn-warning btn-icon btn-sm" v-on:click="undoFreight(row)">
                        <i class="fa fa-undo"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Receipt" placement="top" v-if="!row.receipt_no">
                      <a href="#" class="btn btn-green btn-icon btn-sm" @click="receiptFreight(row)">
                        <i class="fa fa-money-bill-alt"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
                <template slot-scope="{ row, index }" slot="amount">
                  {{row.amount}}({{row.currency}})
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_receivable_status">
          <Tag color="default" v-if="row.shipment_list_receivable_status === '1'">NEW FREIGHT</Tag>
          <Tag color="warning" v-if="row.shipment_list_receivable_status === '2'">APPLY FREIGHT</Tag>
          <Tag color="primary" v-if="row.shipment_list_receivable_status === '3'">FREIGHT INVOICE</Tag>
          <Tag color="warning" v-if="row.shipment_list_receivable_status === '4'">FREIGHT RECEIPT</Tag>
          <Tag color="success" v-if="row.shipment_list_receivable_status === '5'">APPLY EXTRA</Tag>
          <Tag color="warning" v-if="row.shipment_list_receivable_status === '6'">EXTRA INVOICE</Tag>
          <Tag color="success" v-if="row.shipment_list_receivable_status === '7'">EXTRA RECEIPT</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_receivable_freight">
          {{row.shipment_list_receivable_freight}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_receivable_freight_receipt}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_receivable_extra_usd">
          {{row.shipment_list_receivable_extra_usd}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_receivable_extra_usd_receipt}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_receivable_extra_tzs">
          {{row.shipment_list_receivable_extra_tzs}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_receivable_extra_tzs_receipt}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
          <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
            IMPORT
          </span>
          <span v-else>
            {{row.shipment_list_cargo_type}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_in_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_discharge_date}}
          </span>
          <span v-else>
            {{row.shipment_list_depot_gate_out_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_out_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_empty_return_date}}
          </span>
          <span v-else>
            {{row.shipment_list_loading_date}}
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.shipmentTable.total" :current="table.shipmentTable.current" :pageSizeOpts = "table.shipmentTable.pageSizeOpts" show-total show-sizer :page-size="table.shipmentTable.limit" @on-change="getFreightCollectionData"/>
    </panel>
    <Modal v-model="modal.receiptModal" title="Receipt" width="600">
      <Form ref="receiptForm" :model="receiptForm" :label-width="150" style="padding-right: 80px;">
        <FormItem label="Received From" style="margin-bottom: 0px;">
          <Select v-model="receiptForm.customer_id" clearable filterable placeholder="select Customer" disabled>
            <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Amount" style="margin-bottom: 0px;">
          <Input v-model="receiptForm.amount" disabled/>
        </FormItem>
        <FormItem label="Cash/Cheque" style="margin-bottom: 0px;">
          <Select v-model="receiptForm.freight_check_cash" >
            <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id" :disabled = "item.id === 'CASH'">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Row v-if="receiptForm.freight_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Reference No" prop="overdue_invoice_bank_reference_no" >
              <Input placeholder="Bank Reference No" v-model="receiptForm.freight_bank_reference_no"/>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="receiptForm.freight_check_cash === 'CHEQUE'">
          <Col>
            <FormItem label="Check No" prop="overdue_invoice_check_no" >
              <Input placeholder="Check No" v-model="receiptForm.freight_check_no"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.receiptModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="receiptFreightAct">Submit</Button>
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
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
import printJS from 'print-js'
const apiUrl = '/api/zhongtan/logistics/FreightReceipt/'

export default {
  name: 'ShipmentList',
  data: function() {
    return {
      modal: { receiptModal: false, checkPasswordModal: false },
      table: {
        shipmentTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Files',
              slot: 'files',
              width: 100
            },
            {
              title: 'STATUS',
              slot: 'shipment_list_receivable_status',
              width: 180,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'CUSTOMER',
              key: 'shipment_list_invoice_customer',
              width: 150,
              align: 'center'
            },
            {
              title: 'FREIGHT',
              slot: 'shipment_list_receivable_freight',
              width: 200,
              align: 'center'
            },
            {
              title: 'EXTRA#USD',
              slot: 'shipment_list_receivable_extra_usd',
              width: 150,
              align: 'center'
            },
            {
              title: 'EXTRA#TZS',
              slot: 'shipment_list_receivable_extra_tzs',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'shipment_list_vendor_name',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            
            {
              title: 'POL#',
              key: 'shipment_list_port_of_loading',
              width: 200,
              align: 'center'
            },
            {
              title: 'POD#',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'EMPTY RETURN/LOADING',
              slot: 'shipment_list_out_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'CARGO WEIGHT',
              key: 'shipment_list_cargo_weight',
              width: 150,
              align: 'center'
            },
            {
              title: 'DAR CUSTOMS RELEASE DATE',
              key: 'shipment_list_dar_customs_release_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'TRUCK DEPARTURE DATE',
              key: 'shipment_list_truck_departure_date',
              width: 210,
              align: 'center'
            },
            {
              title: 'TRUCK PLATE#',
              key: 'shipment_list_truck_plate',
              width: 150,
              align: 'center'
            },
            {
              title: 'ATA TZ BORDER',
              key: 'shipment_list_ata_tz_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA FOREIGN BORDER',
              key: 'shipment_list_ata_foreing_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'BORDER RELEASE DATE',
              key: 'shipment_list_border_release_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA DESTINATION',
              key: 'shipment_list_ata_destination',
              width: 200,
              align: 'center'
            },
            {
              title: 'DELIVERY (UNLOADING) DATE',
              key: 'shipment_list_delivery_date',
              width: 250,
              align: 'center'
            },
            {
              title: 'REMARK',
              key: 'shipment_list_remark',
              width: 150,
              align: 'center'
            }
          ],
          pageSizeOpts: [40, 60, 80, 100],
          height: common.getNewTableHeight() - 100,
          data: [],
          limit: 40,
          offset: 0,
          total: 0,
          current: 1
        },
        filesTable: {
          columns: [
            {
              title: 'Action',
              slot: 'act',
              width: 120
            },
            {
              title: 'Type',
              key: 'filetype',
              width: 150
            }, 
            {
              title: 'Amount',
              slot: 'amount',
              width: 150
            }, 
            {
              title: 'Create By',
              key: 'creater',
              width: 100
            },
            {
              title: 'Create Date',
              key: 'date',
              width: 150
            }
          ]
        }
      },
      pagePara: {},
      searchPara: {
        shipment_list_bill_no: '',
        shipment_list_container_no: '',
        shipment_list_cntr_owner: '',
        shipment_list_cargo_type: '',
        shipment_list_business_type: '',
        shipment_list_in_date: '',
        shipment_list_out_date: '',
        shipment_list_vendor: ''
      },
      businessTypeFilter: [
        {id: 'I', text: 'IMPORT'},
        {id: 'E', text: 'EXPORT'}
      ],
      cargoTypeFilter: [
        {id: 'LOCAL', text: 'IMPORT/LOCAL'},
        {id: 'TRANSIT', text: 'TRANSIT'}
      ],
      cntrOwnerFilter: [
        {id: 'COS', text: 'COSCO'},
        {id: 'OOL', text: 'OOCL'}
      ],
      oldPara: {},
      workPara: {},
      action: '',
      checkPassword: '',
      receiptForm: {
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    const initPage = async () => {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
        this.getFreightCollectionData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
    initPage()
  },
  methods: {
    getFreightCollectionData: async function(index) {
      try {
        if (index) {
          this.table.shipmentTable.offset = (index - 1) * this.table.shipmentTable.limit
          this.table.shipmentTable.current = index
        }
        let response = await this.$http.post(apiUrl + 'search', {
          searchPara: this.searchPara,
          offset: this.table.shipmentTable.offset,
          limit: this.table.shipmentTable.limit
        })
        let data = response.data.info
        this.table.shipmentTable.total = data.total
        this.table.shipmentTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    freightCollectionHandleSpan: function({row, column, rowIndex, columnIndex}) {
      if(column.title === 'Act' || column.title === 'B/L#' || column.title === 'Files') {
        return this.getFreightCollectionLayout(row, rowIndex, columnIndex)
      }
    },
    getFreightCollectionLayout: function(row, rowIndex, columnIndex) {
      let rowspan = 0
      let colspan = 1
      let tableData = this.table.shipmentTable.data
      for(let d of tableData) {
        if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].shipment_list_bill_no === row.shipment_list_bill_no) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    exportAct: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'export',
            method: 'post',
            data: {searchPara: this.searchPara},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Freight Receipt.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchInDateChange: async function(e) {
      this.searchPara.shipment_list_in_date = JSON.parse(JSON.stringify(e))
    },
    searchOutDateChange: async function(e) {
      this.searchPara.shipment_list_out_date = JSON.parse(JSON.stringify(e))
    },
    undoFreight: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'FreightInvoiceUndo'
      this.modal.checkPasswordModal = true
    },
    undoFreightAct: async function() {
      this.$commonact.confirm('undo freight note?', async () => {
        try {
          await this.$http.post(apiUrl + 'undoFreight', this.workPara)
          this.$Message.success('Undo success')
          this.getFreightCollectionData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    receiptFreight: async function(row) {
      this.receiptForm.file_id = row.file_id
      this.receiptForm.relation_id = row.relation_id
      this.receiptForm.customer_id = row.customer_id
      this.receiptForm.amount = row.amount
      this.receiptForm.freight_check_cash = 'TRANSFER'
      this.receiptForm.freight_bank_reference_no = ''
      this.receiptForm.freight_check_no = ''
      this.modal.receiptModal = true
    },
    receiptFreightAct: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'freightReceipt', this.receiptForm)
        this.$Message.success('receipt success')
        printJS(response.data.info.url)
        this.getFreightCollectionData(1)
        this.modal.receiptModal = false
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
          if (this.checkPasswordType === 'FreightInvoiceUndo') {
            action = 'LOGISTICS_FREIGHT_RECEIPT_ACTION'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'FreightInvoiceUndo') {
            await this.undoFreightAct()
          }
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
.right-bottom-title {
  text-align: right;
  font-size: 12px;
  color: #9ea7b4;
}
</style>