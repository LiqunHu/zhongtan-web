<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Unusual</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Commercial Verification
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Commercial Verification">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Verification Date" style="width: 200px"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.verification_state" style="width:180px">
                <Option v-for="item in pagePara.COMMERCIAL_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getUnusualVerificationData">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="unusualVerification" :columns="table.unusualVerification.rows" :data="table.unusualVerification.data" :border="table.unusualVerification.data && table.unusualVerification.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a v-if = "row.unusual_verification_state == 'PC'" href="#" class="btn btn-primary btn-icon btn-sm" @click.stop="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.unusual_verification_state == 'PC'" href="#" class="btn btn-danger btn-icon btn-sm" @click.stop="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="atta_files">
          <span v-if="row.atta_files">
            <a v-for="(item, index) in row.atta_files" v-bind:key="index" :href="item.uploadfile_url" target="_blank">
              <i class="fa fa-file-pdf" style="color:purple; font-size: 18px; margin-right: 7px;" v-if="getFileExtension(item.uploadfile_url) === 'PDF'"></i>
              <i class="fa fa-file-excel" style="color:blue; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'XLS' || getFileExtension(item.uploadfile_url) === 'XLSX'"></i>
              <i class="fa fa-file-word" style="color:aqua; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'DOC' || getFileExtension(item.uploadfile_url) === 'DOCX'"></i>
              <i class="fa fa-envelope" style="color:green; font-size: 18px; margin-right: 7px;" v-else-if="getFileExtension(item.uploadfile_url) === 'EML'"></i>
              <i class="fa fa-download" style="color:orange; font-size: 18px; margin-right: 7px;" v-else></i>
            </a>
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.unusualVerification.total" :page-size="table.unusualVerification.limit" @on-change="getUnusualVerificationData"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/payment/UnusualCommercial/'

export default {
  name: 'UnusualCommercial',
  data: function() {
    return {
      table: {
        unusualVerification: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Action',
              width: 120,
              slot: 'action'
            },
            {
              title: 'State',
              key: 'unusual_verification_state',
              width: 240,
              render: common.selectRender(this, 'COMMERCIAL_STATE'),
            },
            {
              title: 'INVOICE PARTY',
              width: 260,
              key: 'unusual_invoice_party_name'
            },
            {
              title: 'VESSEL/VOYOGE',
              width: 160,
              key: 'unusual_invoice_vessel_voyage'
            },
            {
              title: 'ITEMS',
              width: 260,
              key: 'unusual_invoice_items_name'
            },
            {
              title: 'CARGO TYPE',
              width: 200,
              key: 'unusual_invoice_cargo_type'
            },
            {
              title: 'B/L#',
              width: 200,
              key: 'unusual_invoice_bl'
            },
            {
              title: 'Amount',
              width: 160,
              key: 'unusual_invoice_amount'
            },
            {
              title: 'ATTACHMENT',
              width: 200,
              slot: 'atta_files'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_text: ''
        }
      },
      formRule: {
        rulePaymentItemsModal: {
          unusual_items_code: [{ required: true, trigger: 'change', message: 'Enter unusual item code' }],
          unusual_items_name: [{ required: true, trigger: 'change', message: 'Enter unusual item name' }],
        }
      },
      search_data: {
        date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        verification_state: 'PC',
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: ''
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
        this.getUnusualVerificationData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getUnusualVerificationData: async function(index) {
      try {
        if (index) {
          this.table.unusualVerification.offset = (index - 1) * this.table.unusualVerification.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_data: this.search_data,
          offset: this.table.unusualVerification.offset,
          limit: this.table.unusualVerification.limit
        })
        let data = response.data.info
        this.table.unusualVerification.total = data.total
        this.table.unusualVerification.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    approve: async function(row) {
      this.$commonact.confirm('approve unusual invoice apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'approve', { unusual_verification_id: row.unusual_verification_id })
          this.getUnusualVerificationData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    decline: async function(row) {
      this.$commonact.confirm('decline unusual invoice apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'decline', { unusual_verification_id: row.unusual_verification_id })
          this.getUnusualVerificationData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    getFileExtension: function(filename){
      let ext = /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : ''
      if(ext) {
        return ext.toLocaleUpperCase()
      }
      return ext
    }
  }
}
</script>