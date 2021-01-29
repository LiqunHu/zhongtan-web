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
              RETURN&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.return_date" placeholder="RETURN Date" style="width: 200px" @on-change="searchReturnDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.vessel_id" clearable filterable placeholder="VESSEL" style="width: 120px;">
                <Option v-for="item in pagePara.VESSEL" :value="item.invoice_vessel_id" :key="item.invoice_vessel_id">{{item.vessel_info}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.customer_id" clearable filterable placeholder="MESSRS" style="width: 120px;">
                <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{item.user_name}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_bl" placeholder="B/L#" style="width: 120px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_no" placeholder="Container#" style="width: 120px" />
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.free_days_range" clearable placeholder="Free Days" style="width: 120px;">
                <Option v-for="item in pagePara.FREE_DAYS_RANGE" :value="item" :key="item">{{item}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.is_overdue" clearable placeholder="OVERDUE" style="width: 120px;">
                <Option value="1">OVERDUE</Option>
                <Option value="0">FREE</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.is_invoice" clearable placeholder="INVOICE" style="width: 120px;">
                <Option value="1">INVOICE</Option>
                <Option value="0">UN INVOICE</Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportData">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="invoice_containers_no">
          {{row.invoice_containers_no}}<font color="#1890ff" style="margin-left:10px;" v-if="row.invoice_containers_type==='S'">SOC</font>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_masterbi_demurrage_party">
          <font color="red" style="font-weight: bold;" v-if="row.invoice_containers_type==='S'">SOC</font>
          <font v-else>{{row.invoice_masterbi_demurrage_party}}</font>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_date">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_date && row.invoice_containers_actually_return_date && row.invoice_containers_empty_return_date !== row.invoice_containers_actually_return_date"> {{row.invoice_containers_actually_return_date}} </span>
          <span v-else>{{row.invoice_containers_actually_return_date}}</span>
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_date">
            <i class="fa fa-calculator" style="margin-right:7px;"></i><span>{{row.invoice_containers_empty_return_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_overdue_days">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_days && row.invoice_containers_actually_return_overdue_days && row.invoice_containers_empty_return_overdue_days !== row.invoice_containers_actually_return_overdue_days"> {{row.invoice_containers_actually_return_overdue_days}} </span>
          <span v-else>{{row.invoice_containers_actually_return_overdue_days}}</span>
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_overdue_days">
            <i class="fa fa-calculator" style="margin-right:7px;"></i><span>{{row.invoice_containers_empty_return_overdue_days}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_overdue_amount">
          <span style="color: red;" v-if="row.invoice_containers_empty_return_overdue_amount && row.invoice_containers_actually_return_overdue_amount && row.invoice_containers_empty_return_overdue_amount_receipt && (row.invoice_containers_empty_return_overdue_amount !== row.invoice_containers_actually_return_overdue_amount || row.invoice_containers_empty_return_overdue_amount_receipt != row.invoice_containers_actually_return_overdue_amount)"> {{row.invoice_containers_actually_return_overdue_amount}} </span>
          <span v-else>{{row.invoice_containers_actually_return_overdue_amount}}</span>
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_overdue_amount">
            <i class="fa fa-calculator" style="margin-right:7px;"></i><span>{{row.invoice_containers_empty_return_overdue_amount}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="invoice_containers_empty_return_overdue_amount_receipt">
          <Row class="right-bottom-title" v-if="row.invoice_containers_empty_return_overdue_deduction">
            <i class="fa fa-tag" style="color: red; margin-right:7px;"></i><span style="color: red;">{{row.invoice_containers_empty_return_overdue_deduction}}</span>
          </Row>
          {{row.invoice_containers_empty_return_overdue_amount_receipt}}
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
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/ImportOverdueStatistics/'

export default {
  name: 'ImportOverdueStatistics',
  data: function() {
    return {
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'Container#',
              slot: 'invoice_containers_no',
              width: 160,
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
              key: 'invoice_masterbi_carrier',
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
              title: 'Cargo',
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
              slot: 'invoice_discharge_date',
              width: 130,
              align: 'center'
            },
            {
              title: 'Return Date',
              slot: 'invoice_containers_empty_return_date',
              width: 120,
              align: 'center'
            },
            {
              title: 'Free Days',
              key: 'invoice_containers_free_days',
              width: 100,
              align: 'center',
            },
            {
              title: 'Current Overdue Days',
              key: 'invoice_containers_current_overdue_days',
              width: 180,
              align: 'center',
            },
            {
              title: 'Overdue Days',
              slot: 'invoice_containers_empty_return_overdue_days',
              width: 130,
              align: 'center',
            },
            {
              title: 'Overdue Amount',
              slot: 'invoice_containers_empty_return_overdue_amount',
              width: 150,
              align: 'center'
            },
            {
              title: 'Receipt Amount',
              slot: 'invoice_containers_empty_return_overdue_amount_receipt',
              width: 150,
              align: 'center'
            },
            {
              title: 'Demurrage party',
              slot: 'invoice_masterbi_demurrage_party',
              width: 260,
              align: 'center'
            },
            {
              title: 'Deposit party',
              key: 'invoice_masterbi_deposit_party',
              width: 260,
              align: 'center'
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight(),
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      search_data: {
        ata_date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
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
    searchReturnDate: function(e) {
      this.search_data.return_date = JSON.parse(JSON.stringify(e))
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
    exportData: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'exportData',
            method: 'post',
            data: {search_data: this.search_data},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'overdue report ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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