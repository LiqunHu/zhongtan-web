<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Business Check</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Business Check
      <small>Business Check...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="checkTable" :columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/BusinessCheck/'

export default {
  data: function() {
    return {
      table: {
        checkTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'invoice_masterbi_bl',
              width: 150
            },
            {
              title: 'Action',
              slot: 'action',
              width: 130
            },
            {
              title: 'Receipt Type',
              key: 'receipt_type',
              width: 150
            },
            {
              title: 'Apply Name',
              key: 'user_name',
              width: 150
            },
            {
              title: 'Deposit',
              key: 'deposit',
              width: 150
            },
            {
              title: 'Ocean Freight',
              key: 'of',
              width: 150
            },
            {
              title: 'LIFT ON LIFT OFF',
              key: 'lolf',
              width: 150
            },
            {
              title: 'AMENDMENT',
              key: 'amendment',
              width: 150
            },
            {
              title: 'TASAC',
              key: 'tasac',
              width: 150
            },
            {
              title: 'BILL PRINGTING',
              key: 'printing',
              width: 150
            },
            {
              title: 'OTHERS',
              key: 'others',
              width: 150
            },
            {
              title: 'COMMENT',
              key: 'comment',
              width: 300,
              render: common.tooltipRender()
            }
          ],
          data: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      search_data: {
        date: [
          moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD'),
          moment().format('YYYY-MM-DD')
        ],
        bl: ''
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    try {
      this.getTableData(1)
    } catch (error) {
      this.$commonact.fault(error)
    }
  },
  methods: {
    searchData: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.checkTable.offset = (index - 1) * this.table.checkTable.limit
        }

        let searchPara = {
          start_date: this.search_data.date[0],
          end_date: this.search_data.date[1],
          bl: this.search_data.bl,
          offset: this.table.checkTable.offset,
          limit: this.table.checkTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.checkTable.total = data.total
        this.table.checkTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    approve: async function(row) {
      try {
        await this.$http.post(apiUrl + 'approve', { uploadfile_id: row.uploadfile_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    decline: async function(row) {
      try {
        await this.$http.post(apiUrl + 'decline', { uploadfile_id: row.uploadfile_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
  }
}
</script>