<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Export Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Export Statistics
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Export Statistics">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbl_bl" placeholder="#M B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.vessel_id" placeholder="Select Vessel" clearable filterable style="width:200px">
                <Option v-for="item in pagePara.VESSELS" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel_name + '/' + item.export_vessel_voyage }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.etd_date" placeholder="ETD Date" style="width: 200px" @on-change="searchETDData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.consignee" placeholder="Consignee" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportStatisticsAct()"> 
                <i class="fa fa-download" style="padding-right:7px;"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="export_charge_status">
          <Tag color="success" v-if="row.charge_status === 'RELEASE'">RELEASE</Tag>
          <Tag color="error" v-else>HOLD</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="export_vessel">
          {{row.export_vessel_name + ' / ' + row.export_vessel_voyage}}
        </template>
         <template slot-scope="{ row, index }" slot="container_size_type">
            {{row.container_size_type}} [
            <span v-for="(item, index) in pagePara.CONTAINER_SIZE" :key="index" v-if="item.container_size_code === row.container_size_type">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="receivable_detail">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
              <Tag color="default" v-if="item.shipment_fee_status === 'NE'">NEW ${{item.total_amount}}</Tag>
              <Tag color="primary" v-else-if="item.shipment_fee_status === 'SA'">SAVE ${{item.total_amount}}</Tag>
              <Tag color="primary" v-else-if="item.shipment_fee_status === 'SU'">SUBMIT ${{item.total_amount}}</Tag>
              <Tag color="success" v-else-if="item.shipment_fee_status === 'AP'">APPROVE ${{item.total_amount}}</Tag>
              <Tag color="error" v-else-if="item.shipment_fee_status === 'DE'">DECLINE ${{item.total_amount}}</Tag>
              <Tag color="error" v-else-if="item.shipment_fee_status === 'UN'">UNDO ${{item.total_amount}}</Tag>
              <Tag color="success" v-else-if="item.shipment_fee_status === 'IN'">INVOICE ${{item.total_amount}}</Tag>
              <Tag color="success" v-else-if="item.shipment_fee_status === 'RE'">RECEIPT ${{item.total_amount}}</Tag>
              <Tag color="warning" v-else-if="item.shipment_fee_status === 'BA'">BALANCE ${{item.total_amount}}</Tag>
            </ListItem>
          </List>
        </template>
        <template slot-scope="{ row, index }" slot="receivable_receipt">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
               <Tag color="default">{{item.shipment_fee_receipt_no}}</Tag>
            </ListItem>
          </List>
        </template>
        <template slot-scope="{ row, index }" slot="receivable_agent">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
              <Tag color="default">{{item.user_name}}</Tag>
            </ListItem>
          </List>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/ExportStatistics/'

export default {
  name: 'ExportStatistics',
  data: function() {
    return {
      modal: {loadingListModal: false},
      headers: common.uploadHeaders(),
      chargeStatus: [
        { id: 'RELEASE', text: 'RELEASE' },
        { id: 'HOLD', text: 'HOLD' }
      ],
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'export_masterbl_bl',
              width: 150,
              align: 'center'
            },
            {
              title: 'B/L Status',
              slot: 'export_charge_status',
              width: 100,
              align: 'center'
            },
            {
              title: 'Vessel Voyage',
              slot: 'export_vessel',
              width: 150,
              align: 'center'
            },
            {
              title: 'ETD',
              key: 'export_vessel_etd',
              width: 120,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'export_masterbl_port_of_load',
              width: 120,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'export_masterbl_port_of_discharge',
              width: 120,
              align: 'center'
            },
            {
              title: 'Container No',
              key: 'container_no',
              width: 160,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'container_size_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Receivable',
              key: 'total_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Receivable Amount',
              slot: 'receivable_detail',
              width: 160,
              align: 'center'
            },
            {
              title: 'Receipt#',
              slot: 'receivable_receipt',
              width: 200,
              align: 'center'
            },
            {
              title: 'Agent',
              slot: 'receivable_agent',
              width: 360,
              align: 'center'
            },
            {
              title: 'Shipper',
              key: 'export_masterbl_shipper_company',
              width: 160,
              align: 'center'
            },
            {
              title: 'Consignee',
              key: 'export_masterbl_consignee_company',
              width: 160,
              align: 'center'
            },
            {
              title: 'Forwarder',
              key: 'export_masterbl_forwarder_company',
              width: 160,
              align: 'center'
            },
            {
              title: 'cargo Descriptions',
              key: 'export_masterbl_cargo_descriptions',
              width: 200,
              align: 'center'
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
        masterbl_bl: '',
        vessel_id: '',
        etd_date: '',
        consignee: ''
      },
      files: {
        fileList: []
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
    searchETDData: function(e) {
      this.search_data.etd_date = JSON.parse(JSON.stringify(e))
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
      if(column.title !== 'Container No' && column.title !== 'Size/Type') {
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
    exportStatisticsAct: async function() {
      try {
        let searchPara = {
          search_data: this.search_data
        }
        let response = await this.$http.request({url: apiUrl + 'exportStatistics', method: 'post', data: searchPara, responseType: 'blob'})
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Export Statistics.xlsx'
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