<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Payment</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Business Verification
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Business Verification">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Verification Date" style="width: 200px" @on-change="searchRangeAct"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.verification_state" style="width:180px" @on-change="getPaymentVerificationData">
                <Option v-for="item in pagePara.BUSINESS_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getPaymentVerificationData">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="paymentVerification" :columns="table.paymentVerification.rows" :data="table.paymentVerification.data" :border="table.paymentVerification.data && table.paymentVerification.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a v-if = "row.payment_verification_state == 'PB'" href="#" class="btn btn-primary btn-icon btn-sm" @click.stop="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.payment_verification_state == 'PB'" href="#" class="btn btn-danger btn-icon btn-sm" @click.stop="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_items">
          {{row.payment_advice_items_name}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_beneficiary">
          {{row.payment_advice_beneficiary_name}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_amount">
          {{row.payment_advice_amount}}{{row.payment_advice_currency}}
        </template>
        <template slot-scope="{ row, index }" slot="payment_advice_remarks">
          <font style="font-weight: bold;">BILLS TO</font> {{row.payment_advice_remarks_name}}
        </template>
        <template slot-scope="{ row, index }" slot="atta_files">
          <span v-if="row.atta_files">
            <a v-for="(item, index) in row.atta_files" v-bind:key="index" :href="item.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
              <i class="fa fa-download"></i>
            </a>
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.paymentVerification.total" :page-size="table.paymentVerification.limit" @on-change="getPaymentVerificationData"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/payment/BusinessVerification/'

export default {
  name: 'PaymentBusinessVerification',
  data: function() {
    return {
      modal: { paymentVerificationModal: false },
      table: {
        paymentVerification: {
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
              key: 'payment_verification_state',
              width: 180,
              render: common.selectRender(this, 'BUSINESS_STATE'),
            },
            {
              title: 'PAYMENT METHOD',
              width: 180,
              key: 'payment_advice_method'
            },
            {
              title: 'VESSEL/VOYOGE',
              width: 160,
              key: 'payment_advice_vessel_voyage'
            },
            {
              title: 'ITEMS',
              width: 160,
              slot: 'payment_advice_items'
            },
            {
              title: 'INV/CNTRL#',
              width: 160,
              key: 'payment_advice_inv_cntrl'
            },
            {
              title: 'BENEFICIARY',
              width: 160,
              slot: 'payment_advice_beneficiary'
            },
            {
              title: 'BANK ACCOUNT',
              width: 160,
              key: 'payment_advice_bank_account'
            },
            {
              title: 'AMOUNT',
              width: 160,
              slot: 'payment_advice_amount'
            },
            {
              title: 'REMARKS',
              width: 200,
              slot: 'payment_advice_remarks'
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
          payment_items_code: [{ required: true, trigger: 'change', message: 'Enter payment item code' }],
          payment_items_name: [{ required: true, trigger: 'change', message: 'Enter payment item name' }],
        }
      },
      search_data: {
        date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        verification_state: 'PB',
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
        this.getPaymentVerificationData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    searchRangeAct: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
      this.getPaymentVerificationData(1)
    },
    getPaymentVerificationData: async function(index) {
      try {
        if (index) {
          this.table.paymentVerification.offset = (index - 1) * this.table.paymentVerification.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_data: this.search_data,
          offset: this.table.paymentVerification.offset,
          limit: this.table.paymentVerification.limit
        })
        let data = response.data.info
        this.table.paymentVerification.total = data.total
        this.table.paymentVerification.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    approve: async function(row) {
      this.$commonact.confirm('approve payment advice apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'approve', { payment_verification_id: row.payment_verification_id })
          this.getPaymentVerificationData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    decline: async function(row) {
      this.$commonact.confirm('decline payment advice apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'decline', { payment_verification_id: row.payment_verification_id })
          this.getPaymentVerificationData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>