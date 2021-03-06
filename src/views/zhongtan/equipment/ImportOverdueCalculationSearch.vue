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
      Import Overdue Calculation Search
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Import Overdue Calculation Search">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Invoice Date" style="width: 200px" @on-change="searchDate"></DatePicker>
            </div>
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
              <button type="button" class="btn btn-info" @click="exportData">
                <i class="fa fa-download"></i> Export
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
const apiUrl = '/api/zhongtan/equipment/ImportOverdueCalculationSearch/'

export default {
  name: 'ImportOverdueCalculation',
  data: function() {
    return {
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
              slot: 'invoice_discharge_date',
              width: 140,
              align: 'center'
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
              title: 'OVERDUE CALCULATION',
              align: 'center',
              children: [
                {
                  title: 'Return Date',
                  key: 'invoice_containers_empty_return_date',
                  align: 'center',
                  width: 140
                },
                {
                  title: 'Overdue Days',
                  key: 'invoice_containers_empty_return_overdue_days',
                  align: 'right',
                  width: 140
                },
                {
                  title: 'Demurrage',
                  key: 'invoice_containers_empty_return_overdue_amount',
                  align: 'right',
                  width: 140
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
        date: [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
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
    searchDate: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
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
          a.download = 'overdue ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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