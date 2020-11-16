<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Commercial Verification</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Commercial Verification
    </h1>
    <!-- end page-header -->
    <panel title="Commercial Verification">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.verification_state" style="width:180px" @on-change="getTableData">
                <Option v-for="item in pagePara.RELEASE_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
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
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-primary btn-icon btn-sm" @click="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-danger btn-icon btn-sm" @click="decline(row)">
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
const apiUrl = '/api/zhongtan/export/CommercialVerification/'

export default {
  data: function() {
    return {
      table: {
        checkTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'export_masterbl_bl',
              width: 150
            },
            {
              title: 'Empty Release Party',
              key: 'empty_release_party',
            },
            {
              title: 'Action',
              slot: 'action',
              width: 150
            },
            {
              title: 'Verification Type',
              key: 'export_verification_api_name',
              width: 150
            },
            {
              title: 'State',
              key: 'export_verification_state',
              render: common.selectRender(this, 'RELEASE_STATE'),
              width: 200
            },
            {
              title: 'DEPOT',
              key: 'export_verification_depot',
              width: 150
            },
            {
              title: 'QTY',
              key: 'export_verification_quantity',
              width: 150
            },
            {
              title: 'Create By',
              key: 'apply_user',
            },
            {
              title: 'Create At',
              key: 'created_at',
            }
          ],
          data: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      pagePara: {},
      search_data: {
        date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        verification_state: 'PM',
        bl: '',
      },
      modal: { invoiceDetail: false, verificationTimeline: false},
      workPara: {},
      verificationTitle: '',
      timelinePara: []
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
          verification_state: this.search_data.verification_state,
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
        await this.$http.post(apiUrl + 'approve', { export_verification_id: row.export_verification_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    decline: async function(row) {
      try {
        await this.$http.post(apiUrl + 'decline', { export_verification_id: row.export_verification_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
  }
}
</script>
<style>
.timeline-time{
  font-size: 14px;
  font-weight: bold;
}
.timeline-content{
  padding-left: 5px;
}
</style>