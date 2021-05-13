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
      Freight Collection
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Freight Collection">
      <template slot="beforeBody">
        <div class="panel-toolbar">
            <Row>
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <input type="text" placeholder="B/L#" v-model.trim="searchPara.shipment_list_bill_no" class="form-control" style="width:199px; margin-right:7px;">
                  <input type="text" placeholder="CONTAINER#" v-model.trim="searchPara.shipment_list_container_no" class="form-control" style="width:199px; margin-right:7px;">
                  <Select v-model="searchPara.shipment_list_cntr_owner" clearable placeholder="CNTR OWNER" style="width:199px; margin-right:7px;">
                    <Option v-for="item in cntrOwnerFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_vendor" clearable filterable placeholder="VENDOR" style="width:199px; margin-right:7px;">
                    <Option v-for="item in pagePara.VENDOR" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_customer" clearable filterable placeholder="CUSTOMER" style="width:199px">
                    <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                  </Select>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="getFreightCollectionData(1)">
                    <i class="fa fa-search"></i>Search
                  </button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="addInvoiceModal">Invoice</button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="addExtraModal">Extra</button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="exportAct">Export</button>
                </div>
              </div>
            </Row>
            <Row style="margin-top:7px;">
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <Select v-model="searchPara.shipment_list_payment_status" clearable placeholder="FREIGHT STATUS" style="width:199px; margin-right:7px;">
                    <Option v-for="item in pagePara.RECEIVABLE_STATUS" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_business_type" clearable placeholder="BUSINESS TYPE" style="width:199px; margin-right:7px;">
                    <Option v-for="item in businessTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_cargo_type" clearable placeholder="CARGO TYPE" style="width:199px; margin-right:7px;">
                    <Option v-for="item in cargoTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_in_date" placeholder="DISCHARGE/GATE OUT" @on-change="searchInDateChange" format="yyyy-MM-dd" style="margin-right:7px;"></DatePicker>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_out_date" placeholder="EMPTY RETURN/LOADING" @on-change="searchOutDateChange" format="yyyy-MM-dd"></DatePicker>
                </div>
              </div>
            </Row>
        </div>
      </template>
      <Table stripe ref="shipmentTable" :columns="table.shipmentTable.rows" :data="table.shipmentTable.data" :height="table.shipmentTable.height" @on-select="paymentSelect" @on-select-cancel="paymentSelectCancel" @on-selection-change="paymentSelectedChange" :span-method="freightCollectionHandleSpan">
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="690" v-if="row.files && row.files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download" placement="top" v-if="row.filetype === 'FREIGHT INVOICE' || row.filetype === 'EXTRA INVOICE'">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Undo" placement="top" v-if="(row.filetype === 'FREIGHT INVOICE' || row.filetype === 'EXTRA INVOICE') && !row.receipt_no">
                      <a href="#" class="btn btn-warning btn-icon btn-sm" v-on:click="undoFreight(row)">
                        <i class="fa fa-undo"></i>
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
    <Modal v-model="modal.invoiceModal" title="Freight Invoice" width="1000">
      <Form ref="freightInvoiceForm" :model="freightInvoiceForm" :label-width="160">
        <FormItem label="Customer#" prop="shipment_list_customer" style="padding-right: 80px;">
          <Select v-model="freightInvoiceForm.shipment_list_customer" clearable filterable placeholder="select Customer" style="width:720px;" @on-change="changeInvoiceCustomer">
            <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Freight#" prop="total_invoice_amount" style="padding-right: 80px;">
           <Input placeholder="Freight#" v-model="freightInvoiceForm.total_invoice_amount" disabled/>
        </FormItem>
      </Form>
      <Table border ref="invoiceTable" :columns="table.invoiceTable.rows" :data="table.invoiceTable.data" max-height="400">
        <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
          {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_vendor">
          {{row.shipment_list_vendor_code}}/{{row.shipment_list_vendor_name}}
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
      <div slot="footer">
          <Button type="text" size="large" @click="modal.invoiceModal=false">Cancel</Button>
          <Button type="primary" size="large" @click="freightInvoiceAct" :disabled="freightInvoiceForm.invoice_submit_disabled">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.extraModal" title="Freight Extra" width="800">
      <Form ref="freightExtra" :model="freightExtraForm" :rules="freightExtraRules" :label-width="160" style="padding-right: 80px;">
        <FormItem label="B/L#" prop="freight_extra_bl_no">
          {{freightExtraForm.freight_extra_bl_no}}
        </FormItem>
        <FormItem label="Customer#" prop="freight_extra_customer" style="padding-right: 80px;">
          <Select v-model="freightExtraForm.freight_extra_customer" filterable placeholder="select Customer" style="width:530px;">
            <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Extra Attachment" prop="freight_extra_files">
          <Upload
            ref="upload"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            type="drag"
            action="/api/zhongtan/logistics/FreightCollection/upload">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="Amount" prop="payment_extra_amount">
          <Input v-model="freightExtraForm.freight_extra_amount" placeholder="Enter your amount" @keyup.native='keyupNumberFormat($event)'>
            <Select slot="append" v-model="freightExtraForm.freight_extra_currency" style="width: 100px">
              <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
            </Select>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
          <Button type="text" size="large" @click="modal.extraModal=false">Cancel</Button>
          <Button type="primary" size="large" @click="applyFreightExtraAct">Submit</Button>
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
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/logistics/FreightCollection/'

export default {
  name: 'ShipmentList',
  data: function() {
    return {
      modal: { invoiceModal: false, extraModal: false, checkPasswordModal: false },
      table: {
        shipmentTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
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
          height: common.getTableHeight(),
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
              width: 100
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
        },
        searchTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
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
              title: 'FREIGHT#',
              slot: 'shipment_list_receivable_freight',
              width: 200,
              align: 'center'
            },
            {
              title: 'VENDOR',
              slot: 'shipment_list_vendor',
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
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
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
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        invoiceTable: {
          rows: [
            {
              type: 'index',
              width: 80,
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
              title: 'Freight#',
              key: 'shipment_list_receivable_freight',
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
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
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
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
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
      paymentSelectedAll: false,
      applyPaymentDisabled: true,
      freightExtraForm: {
        freight_extra_bl_no: '',
        freight_extra_customer: '',
        freight_extra_amount: '',
        freight_extra_currency: '',
        freight_extra_files: []
      },
      freightExtraFormOld: {},
      freightExtraRules: {
        freight_extra_amount: [
          { required: true, message: 'The amount cannot be empty', trigger: 'blur' },
          { type: 'number', message: 'The amount must be number', trigger: 'blur' , transform(value) { return Number(value)}}
        ],
        freight_extra_files: [
          { type: 'array', min: 1, required: true, trigger: 'change', message: 'upload extra Attachment'}
        ]
      },
      uploadHeaders: common.uploadHeaders(),
      freightInvoiceForm: {
        invoice_submit_disabled: true,
        total_invoice_amount: '',
        shipment_list_customer: ''
      },
      freightInvoiceFormOld: {},
      freightInvoiceRules: {
        shipment_list_customer: [
          { required: true, message: 'The customer cannot be empty', trigger: 'blur'} ],
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
    searchInDateChange: async function(e) {
      this.searchPara.shipment_list_in_date = JSON.parse(JSON.stringify(e))
    },
    searchOutDateChange: async function(e) {
      this.searchPara.shipment_list_out_date = JSON.parse(JSON.stringify(e))
    },
    paymentSelect: async function(selection, row) {
      if(this.table.shipmentTable.data) {
        for(let d of this.table.shipmentTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = true
          }
        }
      }
    },
    paymentSelectCancel: async function(selection, row) {
      if(this.table.shipmentTable.data) {
        for(let d of this.table.shipmentTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = false
          }
        }
      }
    },
    paymentSelectedChange: async function(selection) {
      if(selection && selection.length > 0) {
        this.applyPaymentDisabled = false
      } else {
        this.applyPaymentDisabled = true
      }
      if(selection && selection.length === this.table.shipmentTable.data.length) {
        this.paymentSelectedAll = true
      } else {
        this.paymentSelectedAll = false
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
          a.download = 'Freight Invoice.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addInvoiceModal: async function() {
      try {
        await this.resetFreightInvoiceForm()
        await this.getInvoiceData()
        this.modal.invoiceModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    getInvoiceData: async function() {
      let param = {paymentSelectedAll: this.paymentSelectedAll}
      if(this.paymentSelectedAll) {
        param.searchPara = this.searchPara
      } else {
        param.selection = this.$refs.shipmentTable.getSelection()
      }
      let response = await this.$http.post(apiUrl + 'getInvoiceData', param)
      let data = response.data.info
      this.table.invoiceTable.data = data.invoice_list
      this.table.invoiceTable.total = data.invoice_total
      this.freightInvoiceForm.shipment_list_customer = data.invoice_customer
      this.freightInvoiceForm.total_invoice_amount = data.invoice_amount
      this.freightInvoiceForm.invoice_submit_disabled = data.invoice_disabled
      this.freightInvoiceFormOld = JSON.parse(JSON.stringify(this.freightInvoiceForm))
    },
    changeInvoiceCustomer: async function(value) {
      if(value) {
        try {
          let response = await this.$http.post(apiUrl + 'calculationInvoice', {invoiceCustomer: value, calculationData : this.table.invoiceTable.data})
          let data = response.data.info
          this.table.invoiceTable.data = data.invoice_list
          this.table.invoiceTable.total = data.invoice_total
          this.freightInvoiceForm.total_invoice_amount = data.invoice_amount
          this.freightInvoiceForm.invoice_submit_disabled = false
        } catch (error) {
          this.freightInvoiceForm.invoice_submit_disabled = true
          this.$commonact.fault(error)
        }
      } else {
        this.freightInvoiceForm.invoice_submit_disabled = true
      }
    },
    resetFreightInvoiceForm: async function() {
      this.freightInvoiceForm = {
        invoice_submit_disabled: true,
        total_invoice_amount: '',
        shipment_list_customer: ''
      }
    },
    freightInvoiceAct: async function() {
      try {
        if(this.freightInvoiceFormOld.shipment_list_customer && this.freightInvoiceFormOld.shipment_list_customer !== this.freightInvoiceForm.shipment_list_customer) {
          this.checkPassword = ''
          this.checkPasswordType = 'FreightInvoiceCustomer'
          this.modal.checkPasswordModal = true
        } else {
          let param = {
            invoiceCustomer: this.freightInvoiceForm.shipment_list_customer, 
            invoiceData : this.table.invoiceTable.data
          }
          await this.$http.post(apiUrl + 'freightInvoice', param)
          this.getFreightCollectionData(this.table.shipmentTable.current)
          this.modal.invoiceModal = false
        }
      } catch (error) {
        this.freightInvoiceForm.invoice_submit_disabled = true
        this.$commonact.fault(error)
      }
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
    addExtraModal: async function() {
      try {
        let param = {paymentSelectedAll: this.paymentSelectedAll}
        if(this.paymentSelectedAll) {
          param.searchPara = this.searchPara
        } else {
          param.selection = this.$refs.shipmentTable.getSelection()
        }
        let response = await this.$http.post(apiUrl + 'getExtraData', param)
        let data = response.data.info
        this.freightExtraForm.freight_extra_shipment_id = data.extra_shipment_id
        this.freightExtraForm.freight_extra_bl_no = data.extra_bl
        this.freightExtraForm.freight_extra_customer = data.extra_customer
        this.freightExtraForm.freight_extra_cntr_owner = data.extra_cntr_owner
        this.freightExtraForm.freight_extra_business_type = data.extra_business_type
        this.freightExtraForm.freight_extra_cargo_type = data.extra_cargo_type
        this.freightExtraForm.freight_extra_amount = ''
        this.freightExtraForm.freight_extra_currency = 'USD'
        this.freightExtraForm.freight_extra_files = []
        this.freightExtraFormOld = JSON.parse(JSON.stringify(this.freightExtraForm))
        this.modal.extraModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    keyupNumberFormat: async function(e, index, key) {
        if(e.target.value) {
            e.target.value = e.target.value.replace(/\s+/g, '')
            let nagtiveFlg = e.target.value.indexOf('-') === 0
            e.target.value = e.target.value.replace(/[^\d.]/g, '')
            e.target.value = e.target.value.replace(/\.{2,}/g, '.')
            e.target.value = e.target.value.replace(/^\./g, '0.')
            e.target.value = e.target.value.replace(/^\d*\.\d*\./g, e.target.value.substring(0,e.target.value.length-1))
            e.target.value = e.target.value.replace(/^0[^\\.]+/g, '0')
            e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
            e.target.value = nagtiveFlg ? '-' + e.target.value : e.target.value
            this.freightExtraForm.freight_extra_amount = e.target.value
        } else {
            this.freightExtraForm.freight_extra_amount = ''
        }
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.freightExtraForm.freight_extra_files = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
        const index = this.freightExtraForm.freight_extra_files.indexOf(file)
        this.freightExtraForm.freight_extra_files.splice(index, 1)
    },
    applyFreightExtraAct: async function() {
      this.$refs['freightExtra'].validate(async valid => {
        if (valid) {
          try {
            if(this.freightExtraFormOld.shipment_list_customer && this.freightExtraFormOld.shipment_list_customer !== this.freightExtraForm.shipment_list_customer) {
              this.checkPassword = ''
              this.checkPasswordType = 'ExtraInvoiceCustomer'
              this.modal.checkPasswordModal = true
            } else {
              await this.$http.post(apiUrl + 'freightExtra', this.freightExtraForm)
              this.$Message.success('apply success')
              this.modal.extraModal = false
              this.getFreightCollectionData(1)
            }
          } catch (error) {
            this.$commonact.fault(error)
          }
        } else {
          this.$Message.error('Validate Fail!')
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
          if (this.checkPasswordType === 'FreightInvoiceUndo' || this.checkPasswordType === 'FreightInvoiceCustomer' 
                || this.checkPasswordType === 'ExtraInvoiceCustomer') {
            action = 'LOGISTICS_FREIGHT_COLLECTION_ACTION'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'FreightInvoiceUndo') {
            await this.undoFreightAct()
          } else if (this.checkPasswordType === 'FreightInvoiceCustomer') {
            let param = {
              invoiceCustomer: this.freightInvoiceForm.shipment_list_customer, 
              invoiceData : this.table.invoiceTable.data
            }
            await this.$http.post(apiUrl + 'freightInvoice', param)
            this.getFreightCollectionData(this.table.shipmentTable.current)
            this.modal.invoiceModal = false
          } else if (this.checkPasswordType === 'ExtraInvoiceCustomer') {
            await this.$http.post(apiUrl + 'freightExtra', this.freightExtraForm)
            this.$Message.success('apply success')
            this.modal.extraModal = false
            this.getFreightCollectionData(1)
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