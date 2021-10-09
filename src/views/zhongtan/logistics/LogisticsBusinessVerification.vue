<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Logistics</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Business Verification
    </h1>
    <!-- end page-header -->
    <panel title="Business Verification">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Verification Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.verification_state" style="width:180px" @on-change="getTableData">
                <Option v-for="item in pagePara.FREIGHT_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
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
      <Table stripe size="small" ref="checkTable" highlight-row	:columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height" @on-row-click="clickCheckTable">
        <template slot-scope="{ row, index }" slot="action">
          <a v-if = "row.logistics_verification_state == 'PB'" href="#" class="btn btn-primary btn-icon btn-sm" @click.stop="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.logistics_verification_state == 'PB'" href="#" class="btn btn-danger btn-icon btn-sm" @click.stop="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="files">
          <span v-if="row.files">
            <a v-for="(item, index) in row.files" v-bind:key="index" :href="item.url" class="btn btn-primary btn-icon btn-sm" target="_blank" @click.stop>
              <i class="fa fa-download"></i>
            </a>
          </span>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
      <Drawer :closable="false" width="50%" inner v-model="verificationDetailModal">
        <div style="padding-top: 40px;">
          <Table border ref="advanceTable" :columns="table.advanceTable.rows" :data="table.advanceTable.data" v-if="workPara.logistics_verification_api_name === 'PAYMENT ADVANCE'">
            <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
              {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
          <Table border ref="balanceTable" :columns="table.balanceTable.rows" :data="table.balanceTable.data" v-if="workPara.logistics_verification_api_name === 'PAYMENT BALANCE'">
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
          <Table border ref="extraTable" :columns="table.extraTable.rows" :data="table.extraTable.data" v-if="workPara.logistics_verification_api_name === 'PAYMENT EXTRA'">
            <template slot-scope="{ row, index }" slot="files">
              <span v-if="row.files">
                <a v-for="(item, index) in row.files" v-bind:key="index" :href="item.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                  <i class="fa fa-download"></i>
                </a>
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="payment_extra_cargo_type">
              <span v-if="row.payment_extra_business_type === 'I' && row.payment_extra_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.payment_extra_cargo_type}}
              </span>
            </template>
          </Table>
          <Table border ref="freightInvoiceTable" :columns="table.freightInvoiceTable.rows" :data="table.freightInvoiceTable.data" v-if="workPara.logistics_verification_api_name === 'FREIGHT INVOICE'">
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
          <Table border ref="freightExtraTable" :columns="table.freightExtraTable.rows" :data="table.freightExtraTable.data" v-if="workPara.logistics_verification_api_name === 'EXTRA INVOICE'">
            <template slot-scope="{ row, index }" slot="files">
              <span v-if="row.files">
                <a v-for="(item, index) in row.files" v-bind:key="index" :href="item.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                  <i class="fa fa-download"></i>
                </a>
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="payment_extra_cargo_type">
              <span v-if="row.payment_extra_business_type === 'I' && row.payment_extra_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.payment_extra_cargo_type}}
              </span>
            </template>
          </Table>
          <Table border ref="fullTable" :columns="table.fullTable.rows" :data="table.fullTable.data" v-if="workPara.logistics_verification_api_name === 'PAYMENT FULL'">
            <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
              {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
        </div>
      </Drawer>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/logistics/BusinessVerification/'

export default {
  data: function() {
    return {
      table: {
        checkTable: {
          columns: [
            {
              title: 'Action',
              slot: 'action',
              width: 150
            },
            {
              title: 'Vendor/Customer',
              key: 'vendor',
              width: 150
            },
            {
              title: 'Verification Type',
              key: 'logistics_verification_api_name',
              width: 200
            },
            {
              title: 'State',
              key: 'logistics_verification_state',
              render: common.selectRender(this, 'FREIGHT_STATE'),
              width: 200
            },
            {
              title: 'Amount',
              key: 'logistics_verification_amount',
              width: 120
            },
            {
              title: 'ATTACHMENT',
              slot: 'files',
              width: 150,
              align: 'center'
            },
            {
              title: 'Business Type',
              key: 'logistics_verification_business_type',
              width: 150
            },
            {
              title: 'Cntr Owner',
              key: 'logistics_verification_cntr_owner',
              width: 150
            },
            {
              title: 'Cargo Type',
              key: 'logistics_verification_cargo_type',
              width: 150
            },
            {
              title: 'Create By',
              key: 'user_name',
              width: 200
            },
            {
              title: 'Create At',
              key: 'created_at',
              width: 200
            }
          ],
          data: [],
          height: common.getTableHeight(),
          limit: 10,
          offset: 0,
          total: 0
        },
        advanceTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'ADVANCE#',
              slot: 'shipment_list_advance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        balanceTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'BALANCE#',
              key: 'shipment_list_balance_payment',
              width: 200,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        extraTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'payment_extra_bl_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'EXTRA(USD)',
              key: 'payment_extra_amount_usd',
              width: 200,
              align: 'center'
            },
            {
              title: 'EXTRA(TZS)',
              key: 'payment_extra_amount_tzs',
              width: 200,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'ATTACHMENT',
              slot: 'files',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'payment_extra_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'payment_extra_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'payment_extra_cargo_type',
              width: 150,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        freightInvoiceTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'FREIGHT#',
              key: 'shipment_list_receivable_freight',
              width: 150,
              align: 'center'
            },
            {
              title: 'CUSTOMER',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        freightExtraTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'payment_extra_bl_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'EXTRA(USD)',
              key: 'payment_extra_amount_usd',
              width: 200,
              align: 'center'
            },
            {
              title: 'EXTRA(TZS)',
              key: 'payment_extra_amount_tzs',
              width: 200,
              align: 'center'
            },
            {
              title: 'CUSTOMER',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'ATTACHMENT',
              slot: 'files',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'payment_extra_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'payment_extra_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'payment_extra_cargo_type',
              width: 150,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        fullTable: {
          rows: [
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'ADVANCE#',
              slot: 'shipment_list_advance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'BALANCE#',
              key: 'shipment_list_balance_payment',
              width: 200,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        }
      },
      pagePara: {},
      search_data: {
        date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        verification_state: 'PB',
        bl: '',
      },
      modal: { invoiceDetail: false, verificationTimeline: false},
      workPara: {},
      verificationTitle: '',
      timelinePara: [],
      verificationDetailModal: false,
      verificationDetail: {}
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
      this.$commonact.confirm('approve logistics freight apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'approve', { logistics_verification_id: row.logistics_verification_id })
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    decline: async function(row) {
      this.$commonact.confirm('decline logistics freight apply?', async () => {
        try {
          await this.$http.post(apiUrl + 'decline', { logistics_verification_id: row.logistics_verification_id })
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    clickCheckTable: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      try {
        let response = await this.$http.post(apiUrl + 'verificationDetail', { logistics_verification_id: row.logistics_verification_id })
        if(this.workPara.logistics_verification_api_name === 'PAYMENT ADVANCE') {
          this.table.advanceTable.data = response.data.info
        } else if(this.workPara.logistics_verification_api_name === 'PAYMENT BALANCE') {
          this.table.balanceTable.data = response.data.info
        } else if(this.workPara.logistics_verification_api_name === 'PAYMENT EXTRA') {
          this.table.extraTable.data = response.data.info
        } else if(this.workPara.logistics_verification_api_name === 'FREIGHT INVOICE') {
          this.table.freightInvoiceTable.data = response.data.info
        } else if(this.workPara.logistics_verification_api_name === 'EXTRA INVOICE') {
          this.table.freightExtraTable.data = response.data.info
        } else if(this.workPara.logistics_verification_api_name === 'PAYMENT FULL') {
          this.table.fullTable.data = response.data.info
        }
        if(this.verificationDetail) {
          this.verificationDetailModal = true
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
  }
}
</script>