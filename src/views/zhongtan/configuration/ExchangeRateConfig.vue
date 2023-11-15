<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">System Configuration</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Rate Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <button type="button" class="btn btn-info" @click="getRateData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addRateModal">Add Exchange Rate</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="rateTable" :columns="table.rateTable.rows" :data="table.rateTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyRateModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteRate(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.rateTable.total" :page-size="table.rateTable.limit" @on-change="getRateData"/>
    </panel>
    <Modal v-model="modal.rateModal" title="Exchange Rate">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleRateModal" ref="formRate">
        <FormItem label="USD" prop="rate_usd">
          <Input placeholder="USD" v-model="workPara.rate_usd">
            <span slot="append">USD</span>
          </Input>
        </FormItem>
        <FormItem label="TZS" prop="rate_tzs">
          <Input placeholder="TZS" v-model="workPara.rate_tzs">
            <span slot="append">TZS</span>
          </Input>
        </FormItem>
        <FormItem label="Enabled Date" prop="enable_date">
          <DatePicker type="date" v-model="workPara.enable_date" format="dd/MM/yyyy" @on-change="gateEnabledDateChange"></DatePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.rateModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitRate">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/ExchangeRateConfigControl/'

export default {
  name: 'ExchangeRateConfig',
  data: function() {
    return {
      modal: { rateModal: false },
      table: {
        rateTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'USD',
              key: 'rate_usd'
            },
            {
              title: 'TZS',
              key: 'rate_tzs'
            },
            {
              title: 'ENABLED DATE',
              key: 'enable_date'
            },
            {
              title: 'Action',
              slot: 'action'
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
        ruleRateModal: {
          rate_usd: [{ required: true, trigger: 'change', message: 'Enter USD' }],
          rate_tzs: [{ required: true, trigger: 'change', message: 'Enter TZS' }],
          enable_date: [{ required: true, trigger: 'change', message: 'Please select date' }],
        }
      },
      pagePara: {},
      oldPara: {},
      workPara: {
        rate_usd: '1',
        rate_tzs: '',
        enable_date: '',
      },
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
        this.getRateData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getRateData: async function(index) {
      try {
        if (index) {
          this.table.rateTable.offset = (index - 1) * this.table.rateTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.rateTable.search_text,
          offset: this.table.rateTable.offset,
          limit: this.table.rateTable.limit
        })
        let data = response.data.info
        this.table.rateTable.total = data.total
        this.table.rateTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addRateModal: async function() {
      this.workPara = {
        rate_usd: '1',
        rate_tzs: '',
        enable_date: ''
      }
      this.action = 'add'
      this.$refs.formRate.resetFields()
      this.modal.rateModal = true
    },
    gateEnabledDateChange: async function(date) {
      this.workPara.enable_date = date
    },
    modifyRateModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formRate.resetFields()
      this.modal.rateModal = true
    },
    submitRate: function() {
      this.$refs['formRate'].validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getRateData()
            this.modal.rateModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteRate: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { rate_id: row.rate_id })
          this.$Message.success('delete success')
          this.getRateData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>