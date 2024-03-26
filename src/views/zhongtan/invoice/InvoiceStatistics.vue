<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Invoice Work</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Invoice,D/O Statistics
    </h1>
    <!-- end page-header -->
    <panel title="Invoice,D/O Statistics">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              ATA&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.ata_date" placeholder="ATA Date" style="width: 140px" @on-change="searchAtaDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.invoice_vessel_id" style="width:140px" placeholder="VESSEL">
                <Option v-for="item in pagePara.VESSEL_VOYAGE" :value="item.invoice_vessel_id" :key="item.invoice_vessel_id">{{ item.invoice_vessel }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.invoice_carrier" style="width:140px" placeholder="CARRIER">
                <Option v-for="item in pagePara.RECEIPT_TYPE_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.invoice_customer_id" style="width:140px" placeholder="CUSTOMER">
                <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              D/O&nbsp;&nbsp;
              <Select clearable v-model="search_data.do_status" style="width:100px" placeholder="D/O">
                <Option value="1" key="1">D/O</Option>
                <Option value="2" key="2">UN D/O</Option>
                <Option value="3" key="3">RELEASE</Option>
                <Option value="4" key="4">UN RELEASE</Option>
              </Select>
              <DatePicker v-if="search_data.do_status == '1'" type="daterange" :value="search_data.do_date" placeholder="D/O Date" style="width: 140px" @on-change="searchDoDate"></DatePicker>
              <DatePicker v-if="search_data.do_status == '3'" type="daterange" :value="search_data.invoice_date" placeholder="INVOICE Date" style="width: 140px" @on-change="searchInvoiceDate"></DatePicker>
              <DatePicker v-if="search_data.do_status == '3'" type="daterange" :value="search_data.receipt_date" placeholder="RECEIPT Date" style="width: 140px" @on-change="searchReceiptDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input clearable type="text" class="form-control" v-model="search_data.bl" placeholder="B/L No" style="width: 140px" />
            </div>
            <div class="form-group m-r-2">
              <input clearable type="text" class="form-control" v-model="search_data.delivery_order_no" placeholder="Delivery Order No." style="width: 140px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportData()">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
        <template slot-scope="{ row, index }" slot="invoice_masterbi_bl">
          <i class="fa fa-ship" v-if="row.invoice_masterbi_vessel_type === 'Bulk'"></i>
          <i class="fa fa-cubes" v-else></i>
          {{row.invoice_masterbi_bl}}
        </template>
        <template slot-scope="{ row, index }" slot="Invoice">
          <a href="#" class="btn btn-green btn-icon btn-sm" v-if="row.invoice_masterbi_deposit_release_date || row.invoice_masterbi_fee_release_date">
            GO
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" v-else>
            NO
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="Do">
          <Tooltip content="Generate Do" v-if="!row.invoice_masterbi_do_release_date">
            <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadDoModal(row)" v-if="row.invoice_masterbi_do_state">
              GO
            </a>
            <a href="#" class="btn btn-danger btn-icon btn-sm" v-else @click="actDownLoadDoModalCheck(row)">
              NO
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="Collect">
          <Tag href="#" color="primary"v-if="row.invoice_masterbi_freight == 'COLLECT'">Collect</Tag>
          <Tag href="#" color="success" v-if="row.invoice_masterbi_freight !== 'COLLECT'">Prepaid</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="555" v-if="row.files && row.files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template v-if="row.filetype === 'DO'">
                    <Tooltip content="Download">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                  <template v-else-if="row.state === 'AP'">
                    <Tooltip content="Download">
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
        <template slot-scope="{ row, index }" slot="vessel">
          <Tooltip placement="right">
            {{row.invoice_vessel_name}}-{{row.invoice_vessel_voyage}}
            <div slot="content">
              <Row>
                <i-col span="12">Vessel Name:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_name}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Vessel Voyage:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_voyage}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Vessel Code:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_code}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Call Sign:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_call_sign}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ETA:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_eta}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ATA:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_ata}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ATD:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_atd}}</i-col>
              </Row>
            </div>
          </Tooltip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.masterbiTable.total" :page-size="table.masterbiTable.limit" @on-change="getData" show-total/>
    </panel>
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
        <Button type="text" size="large" @click="modal.checkPasswordModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/InvoiceStatistics/'

export default {
  data: function() {
    return {
      modal: {checkPasswordModal: false },
      table: {
        masterbiTable: {
          columns: [
            {
              title: '#M B/L No',
              slot: 'invoice_masterbi_bl',
              width: 180
            },
            {
              title: 'Files',
              slot: 'files',
              width: 100
            },
            {
              title: 'Cargo Classification',
              key: 'invoice_masterbi_cargo_type',
              width: 100
            },
            {
              title: 'Freight Terms',
              slot: 'Collect',
              width: 120
            },
            {
              title: 'Vessel',
              slot: 'vessel',
              width: 160
            },
            {
              title: '*B/L Type',
              key: 'invoice_masterbi_bl_type',
              width: 100
            },
            {
              title: 'Place of Destination',
              key: 'invoice_masterbi_destination',
              tooltip: true,
              width: 130
            },
            {
              title: 'Place of Delivery',
              key: 'invoice_masterbi_delivery',
              tooltip: true,
              width: 130
            },
            {
              title: 'Port of Loading',
              key: 'invoice_masterbi_loading',
              tooltip: true,
              width: 130
            },
            {
              title: 'Number of Containers',
              key: 'invoice_masterbi_container_no',
              tooltip: true,
              width: 100
            },
            {
              title: 'Description of Goods',
              key: 'invoice_masterbi_goods_description',
              tooltip: true,
              width: 200
            },
            {
              title: 'Number of Package',
              key: 'invoice_masterbi_package_no',
              tooltip: true,
              width: 100
            },
            {
              title: 'Package Unit',
              key: 'invoice_masterbi_package_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Weight',
              key: 'invoice_masterbi_gross_weight',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Weight Unit',
              key: 'invoice_masterbi_gross_weight_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Volume',
              key: 'invoice_masterbi_gross_volume',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Volume Unit',
              key: 'invoice_masterbi_gross_volume_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Invoice Value',
              key: 'invoice_masterbi_invoice_value',
              tooltip: true,
              width: 100
            },
            {
              title: 'Invoice Currency',
              key: 'invoice_masterbi_invoice_currency',
              tooltip: true,
              width: 100
            },
            {
              title: 'Freight Charge',
              key: 'invoice_masterbi_freight_charge',
              tooltip: true,
              width: 100
            },
            {
              title: 'Freight Currency',
              key: 'invoice_masterbi_freight_currency',
              tooltip: true,
              width: 100
            },
            {
              title: 'IMDG Code',
              key: 'invoice_masterbi_imdg',
              tooltip: true,
              width: 100
            },
            {
              title: 'Packing Type',
              key: 'invoice_masterbi_packing_type',
              tooltip: true,
              width: 100
            },
            {
              title: 'Forwarder Code',
              key: 'invoice_masterbi_forwarder_code',
              tooltip: true,
              width: 150
            },
            {
              title: 'Forwarder Name',
              key: 'invoice_masterbi_forwarder_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Forwarder Tel',
              key: 'invoice_masterbi_forwarder_tel',
              tooltip: true,
              width: 150
            },
            {
              title: 'Exporter Name',
              key: 'invoice_masterbi_exporter_name',
              tooltip: true,
              width: 200,
            },
            {
              title: 'Exporter Tel',
              key: 'invoice_masterbi_exporter_tel',
              tooltip: true,
              width: 100
            },
            {
              title: 'Exporter Address',
              key: 'invoice_masterbi_exporter_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Exporter TIN',
              key: 'invoice_masterbi_exporter_tin',
              tooltip: true,
              width: 100
            },
            {
              title: 'Consignee Name',
              key: 'invoice_masterbi_consignee_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Consignee Tel',
              key: 'invoice_masterbi_consignee_tel',
              tooltip: true,
              width: 100
            },
            {
              title: 'Consignee Address',
              key: 'invoice_masterbi_consignee_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Consignee TIN',
              key: 'invoice_masterbi_consignee_tin',
              tooltip: true,
              width: 100
            },
            {
              title: 'Notify Name',
              key: 'invoice_masterbi_notify_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Notify Tel',
              key: 'invoice_masterbi_notify_tel',
              tooltip: true,
              width: 100
            },
            {
              title: 'Notify Address',
              key: 'invoice_masterbi_notify_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Notify TIN',
              key: 'invoice_masterbi_notify_tin',
              tooltip: true,
              width: 100
            },
            {
              title: 'Shipping Mark',
              key: 'invoice_masterbi_shipping_mark',
              tooltip: true,
              width: 200
            },
            {
              title: 'Net Weight',
              key: 'invoice_masterbi_net_weight',
              tooltip: true,
              width: 100
            },
            {
              title: 'Net Weight Unit',
              key: 'invoice_masterbi_net_weight_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'LineAgent Code',
              key: 'invoice_masterbi_line_code',
              tooltip: true,
              width: 100
            },
            {
              title: 'TerminalCode',
              key: 'invoice_masterbi_terminal_code',
              tooltip: true,
              width: 100
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
              key: 'filetype',
              width: 80
            },
            {
              title: 'Receipt Type',
              key: 'receipt_type',
              width: 80
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
      pagePara: {},
      workPara: {},
      headers: common.uploadHeaders(),
      action: '',
      files: {
        fileList: []
      },
      search_data: {
        ata_date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        invoice_vessel_id: '',
        invoice_customer_id: '',
        bl: '',
        do_status: '',
        do_date: '',
        invoice_date: '',
        receipt_date: '',
        delivery_order_no: '',
        invoice_carrier: ''
      },
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    await this.getPara()
    await this.getData(1)
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
    getData: async function(index) {
      try {
        if (index) {
          this.table.masterbiTable.offset = (index - 1) * this.table.masterbiTable.limit
        }
        let searchPara = JSON.parse(JSON.stringify(this.search_data))
        searchPara.offset = this.table.masterbiTable.offset
        searchPara.limit = this.table.masterbiTable.limit
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.rows))
        this.table.masterbiTable.total = data.total
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchAtaDate: function(e) {
      this.search_data.ata_date = JSON.parse(JSON.stringify(e))
    },
    searchDoDate: function(e) {
      this.search_data.do_date = JSON.parse(JSON.stringify(e))
    },
    searchInvoiceDate: function(e) {
      this.search_data.invoice_date = JSON.parse(JSON.stringify(e))
    },
    searchReceiptDate: function(e) {
      this.search_data.receipt_date = JSON.parse(JSON.stringify(e))
    },
    exportData: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'invoiceStatisticsExport'
      this.modal.checkPasswordModal = true
    },
    doExportData: async function() {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'export',
          method: 'post',
          data: JSON.parse(JSON.stringify(this.search_data)),
          responseType: 'blob'
        })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'statistics-' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let act = ''
          if (this.checkPasswordType === 'invoiceStatisticsExport' ) {
            act = 'INVOICE_STATISTICS_ACTION'
          }
          let param = {
            action: act,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'invoiceStatisticsExport') {
            this.doExportData()
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