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
      Import Demurrage Invoice Statistics
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Import Demurrage Invoice Statistics">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <row>
            <div class="form-inline">
              <div class="form-group m-r-2">
                ATA&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.ata_date" placeholder="ATA Date" style="width: 160px" @on-change="searchAtaDate"></DatePicker>
              </div>
              <div class="form-group m-r-2">
                Invoice Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.invoice_date" placeholder="Invoice Date" style="width: 160px" @on-change="searchInvoiceDate"></DatePicker>
              </div>
              <div class="form-group m-r-2">
                Receipt Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.receipt_date" placeholder="Receipt Date" style="width: 160px" @on-change="searchReceiptDate"></DatePicker>
              </div>
              <div class="form-group m-r-2">
                <input type="text" class="form-control" v-model="search_data.invoice_no" placeholder="Invoice No" style="width: 160px" />
              </div>
              <div class="form-group m-r-2">
                <input type="text" class="form-control" v-model="search_data.receipt_no" placeholder="Receipt No" style="width: 160px" />
              </div>
              <div class="form-group m-r-10">
                <button type="button" class="btn btn-info" @click="getTableData">
                  <i class="fa fa-search"></i> Search
                </button>
              </div>
              <div class="form-group m-r-10">
                <button type="button" class="btn btn-info" @click="exportDemurrageReport">
                  <i class="fa fa-download"></i> Export
                </button>
              </div>
            </div>
          </row>
          <row style="margin-top:7px;">
            <div class="form-inline">
              <div class="form-group m-r-2">
                <Select v-model="search_data.vessel_id" clearable filterable placeholder="VESSEL" style="width: 160px;">
                  <Option v-for="item in pagePara.VESSEL" :value="item.invoice_vessel_id" :key="item.invoice_vessel_id">{{item.vessel_info}}</Option>
                </Select>
              </div>
              <div class="form-group m-r-2">
                <Select v-model="search_data.customer_id" clearable filterable placeholder="MESSRS" style="width: 160px;">
                  <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{item.user_name}}</Option>
                </Select>
              </div>
              <div class="form-group m-r-2">
                <input type="text" class="form-control" v-model="search_data.invoice_containers_no" placeholder="Container No" style="width: 160px" />
              </div>
            </div>
          </row>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
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
        <template slot-scope="{ row, index }" slot="invoice_containers_size">
            {{row.invoice_containers_size}} [
            <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.invoice_containers_size">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="invoice_vessel">
          <Tooltip placement="right">
            {{row.invoice_vessel_name}} / {{row.invoice_vessel_voyage}}
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
        <template slot-scope="{ row, index }" slot="invoice_discharge_date">
          {{row.invoice_containers_edi_discharge_date}}
          <Row class="right-bottom-title">
            <span>ATA: {{row.invoice_vessel_ata}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_data">
          <Poptip trigger="hover" placement="right" width="400">
            {{row.invoice_containers_empty_return_overdue_amount_invoice}}
            <div slot="content">
              <table>
                  <thead>
                      <tr>
                          <th style="width: 150px; text-align: center;">Invoice No</th>
                          <th style="width: 100px; text-align: center;">Amount</th>
                          <th style="width: 150px; text-align: center;">Invoice Date</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item, index1) in row.invoice_data" :key="index1">
                          <td style="width: 150px; text-align: center;">{{item.invoice_no}}</td>
                          <td style="width: 100px; text-align: center;">{{item.invoice_amount}}</td>
                          <td style="width: 150px; text-align: center;">{{item.invoice_date}}</td>
                      </tr>
                  </tbody>
              </table>
            </div>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="receipt_data">
          <Poptip trigger="hover" placement="right" width="400">
            {{row.invoice_containers_empty_return_overdue_amount_receipt}}
            <div slot="content">
              <table>
                  <thead>
                      <tr>
                        <th style="width: 250px; text-align: center;">Receipt No</th>
                        <th style="width: 150px; text-align: center;">Receipt Date</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item, index1) in row.receipt_data" :key="index1">
                        <td style="width: 250px; text-align: center;">{{item.receipt_no}}</td>
                        <td style="width: 150px; text-align: center;">{{item.receipt_date}}</td>
                      </tr>
                  </tbody>
              </table>
            </div>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/ImportDemurrageStatisticsInvoice/'

export default {
  name: 'ImportDemurrageStatisticsInvoice',
  data: function() {
    return {
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'Container#',
              key: 'invoice_containers_no',
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
              title: 'Line',
              key: 'invoice_containers_bl_line',
              width: 100,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'invoice_containers_bl',
              width: 140,
              align: 'center'
            },
            {
              title: 'vessel',
              slot: 'invoice_vessel',
              width: 240,
              align: 'center'
            },
            {
              title: 'Discharge Date',
              slot: 'invoice_discharge_date',
              width: 140,
              align: 'center'
            },
            {
              title: 'Return Date',
              key: 'invoice_containers_empty_return_date_invoice',
              width: 140,
              align: 'center'
            },
            {
              title: 'Invoice#',
              slot: 'invoice_data',
              width: 140,
              align: 'center',
            },
            {
              title: 'Demurrage party',
              key: 'invoice_masterbi_demurrage_party',
              width: 260,
              align: 'center'
            },
            {
              title: 'Deposit party',
              key: 'invoice_masterbi_deposit_party',
              width: 260,
              align: 'center'
            },
            {
              title: 'Receipt#',
              slot: 'receipt_data',
              width: 140,
              align: 'center',
            },
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
        ata_date: [],
        invoice_date: [moment().subtract(1, 'week').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        receipt_date: [],
        invoice_vessel_name: '',
        invoice_containers_bl: '',
        invoice_containers_no: '',
        invoice_no: '',
        receipt_no: ''
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
    searchAtaDate: function(e) {
      this.search_data.ata_date = JSON.parse(JSON.stringify(e))
    },
    searchInvoiceDate: function(e) {
      this.search_data.invoice_date = JSON.parse(JSON.stringify(e))
    },
    searchReceiptDate: function(e) {
      this.search_data.receipt_date = JSON.parse(JSON.stringify(e))
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
    exportDemurrageReport: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'exportDemurrageReport',
            method: 'post',
            data: {search_data: this.search_data},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'demurrage report ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
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