<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Export</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Receipt
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <div class="form-group m-r-2">
                <DatePicker type="daterange" :value="table.bookingTable.search_data.date" placeholder="Application Date" style="width: 200px" @on-change="searchData"></DatePicker>
              </div>
              <div class="form-group m-r-2">
                <Select v-model="table.bookingTable.search_data.billlading_state" style="width:180px">
                  <Option v-for="item in pagePara.BLSTATUSINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </div>
              <div class="form-group m-r-2">
                <Select
                  v-model="table.bookingTable.search_data.customer.value"
                  filterable
                  remote
                  :remote-method="searchCustomer"
                  :loading="table.bookingTable.search_data.customer.loading"
                  placeholder="customer"
                >
                  <Option v-for="item in table.bookingTable.search_data.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
                </Select>
              </div>
              <div class="form-group m-r-10">
                <button type="button" class="btn btn-info" @click="getBookingData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="bookingTable" :columns="table.bookingTable.rows" :data="table.bookingTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <Tooltip content="Booking bill lading" v-if="row.billlading_state === 'PS'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="invoiceModal(row)">
              <i class="fa fa-money-bill-alt"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="customerINFO">
          <Poptip trigger="hover" width="300">
            <Button type="text" style="text-decoration:underline">{{row.customerINFO.name}}</Button>
            <template slot="content">
              Phone: {{row.customerINFO.phone}}
              <br>
              Email: {{row.customerINFO.email}}
              <br>
              Address: {{row.customerINFO.address}}
              <br>
            </template>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.bookingTable.total" :page-size="table.bookingTable.limit" @on-change="getBookingData"/>
    </panel>
    <Modal v-model="modal.invoiceModal" title="invoice">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleInvoiceModal" ref="invoice">
        <h4 class="text-middle m-b-10">
          <b>Invoice</b>
        </h4>
        <FormItem label="Invoice Money" prop="billlading_invoice_money">
          <Input placeholder="Invoice Money" v-model="workPara.billlading_invoice_money"/>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" @click="modal.invoiceModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="invoice">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
// const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/Receipt/'

export default {
  name: 'Receipt',
  data: function() {
    return {
      modal: { invoiceModal: false },
      table: {
        bookingTable: {
          rows: [
            {
              type: 'index',
              width: 40,
              align: 'center'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100
            },
            {
              title: 'Customer',
              slot: 'customerINFO',
              width: 100
            },
            {
              title: 'S/O',
              key: 'billlading_no',
              width: 150
            },
            {
              title: 'Status',
              key: 'billlading_state',
              render: (h, params) => {
                let info = this.pagePara.BLSTATUSINFO.find(element => element.id === params.row.billlading_state)
                return h('span', { class: 'label ' + info.style }, info.text)
              },
              width: 150
            },
            {
              title: 'SUM',
              key: 'sum_fee'
            },
            {
              title: 'FREIGHT',
              key: 'billlading_invoice_freight'
            },
            {
              title: 'B/LANDING',
              key: 'billlading_invoice_blanding'
            },
            {
              title: 'TASAC',
              key: 'billlading_invoice_tasac'
            },
            {
              title: 'AMMENDMENT FEE',
              key: 'billlading_invoice_ammendment'
            },
            {
              title: 'ISP',
              key: 'billlading_invoice_isp'
            },
            {
              title: 'SURCHAGE',
              key: 'billlading_invoice_surchage'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_data: {
            date: [
              moment()
                .subtract(90, 'days')
                .format('YYYY-MM-DD'),
              moment().format('YYYY-MM-DD')
            ],
            customer: {
              options: [],
              value: '',
              loading: false
            },
            billlading_state: '',
            search_text: ''
          }
        }
      },
      formRule: {
        ruleInvoiceModal: {
          billlading_invoice_money: [{ required: true, trigger: 'change', message: 'Enter Invoice money' }]
        }
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
        this.getBookingData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    searchData: function(e) {
      this.table.bookingTable.search_data.date = JSON.parse(JSON.stringify(e))
    },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.table.bookingTable.search_data.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.table.bookingTable.search_data.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.table.bookingTable.search_data.customer.loading = false
      } else {
        this.table.bookingTable.search_data.customer.options = []
      }
    },
    getBookingData: async function(index) {
      try {
        if (index) {
          this.table.bookingTable.offset = (index - 1) * this.table.bookingTable.limit
        }

        let searchPara = {
          start_date: this.table.bookingTable.search_data.date[0],
          end_date: this.table.bookingTable.search_data.date[1],
          offset: this.table.bookingTable.offset,
          limit: this.table.bookingTable.limit
        }

        if (this.table.bookingTable.search_data.billlading_state) {
          searchPara.billlading_state = this.table.bookingTable.search_data.billlading_state
        }

        if (this.table.bookingTable.search_data.customer.value) {
          searchPara.customer = this.table.bookingTable.search_data.customer.value
        }

        if (this.table.bookingTable.search_data.search_text) {
          searchPara.search_text = this.table.bookingTable.search_data.search_text
        }

        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.bookingTable.total = data.total
        this.table.bookingTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    invoiceModal: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$refs.invoice.resetFields()
      this.modal.invoiceModal = true
    },
    invoice: async function() {
      this.$refs.invoice.validate(async valid => {
        try {
          if (valid) {
            await this.$http.post(apiUrl + 'invoice', this.workPara)
            this.$Message.success('submit success')
            this.getBookingData()
            this.modal.invoiceModal = false
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>