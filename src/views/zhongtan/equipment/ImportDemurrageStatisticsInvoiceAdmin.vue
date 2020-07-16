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
      Demurrage Statistics
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Demurrage Statistics">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              ATA&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.ata_date" placeholder="ATA Date" style="width: 200px" @on-change="searchAtaDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              Invoice Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.invoice_date" placeholder="Invoice Date" style="width: 200px" @on-change="searchInvoiceDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              Receipt Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.receipt_date" placeholder="Receipt Date" style="width: 200px" @on-change="searchReceiptDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_vessel_name" placeholder="Vessel Name" style="width: 200px" />
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
              <button type="button" class="btn btn-info" @click="exportDemurrageReport">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
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
              title: 'Discharge Date',
              key: 'invoice_vessel_ata',
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
              title: 'Invoice Amount',
              key: 'invoice_containers_empty_return_overdue_amount_invoice',
              width: 140,
              align: 'center'
            },
            {
              title: 'Invoice Date',
              key: 'invoice_containers_empty_return_invoice_date',
              width: 140,
              align: 'center',
            },
            {
              title: 'Payer',
              key: 'user_name',
              width: 200,
              align: 'center',
            },
            {
              title: 'Receipt Date',
              key: 'invoice_containers_empty_return_receipt_date',
              width: 140,
              align: 'center',
            },
            {
              title: 'Receipt#',
              key: 'invoice_containers_empty_return_date_receipt_no',
              width: 140,
              align: 'center',
            },
             {
              title: 'EDI Return Date',
              key: 'invoice_containers_actually_return_date',
              width: 140,
              align: 'center'
            },
            {
              title: 'Actual Overdue Days',
              key: 'invoice_containers_actually_return_overdue_days',
              width: 200,
              align: 'center'
            },
            {
              title: 'Actual Amount',
              key: 'invoice_containers_actually_return_overdue_amount',
              width: 140,
              align: 'center',
            },
            {
              title: 'Balance',
              key: 'invoice_containers_actually_balance',
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
        invoice_containers_no: ''
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
            url: apiUrl + 'exportDemurrageAdminReport',
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
