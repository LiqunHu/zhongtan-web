<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Import</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Import
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="table.importTable.search_data.date" placeholder="Application Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select
                v-model="table.importTable.search_data.customer.value"
                filterable
                remote
                :remote-method="searchCustomer"
                :loading="table.importTable.search_data.customer.loading"
                placeholder="customer"
              >
                <Option v-for="item in table.importTable.search_data.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.vessel" placeholder="vessel" style="width: 100px">
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.voyage" placeholder="Voyage" style="width: 100px">
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.bl" placeholder="BL No." style="width: 150px">
            </div>
            <div class="input-group m-r-10">
              <input type="text" placeholder="Search Name Phone" v-model="table.importTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getImportData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <Upload
                ref="upload"
                :show-upload-list="false"
                :headers="headers"
                :format="['xml']"
                :max-size="4096"
                :before-upload="handleImportbefore"
                :on-success="handleImportSuccess"
                :on-error="handleImportError"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                action="/api/zhongtan/import/ImportWork/uploadImport"
              >
                <button type="button" class="btn btn-info">Load</button>
              </Upload>
            </div>
            <div class="form-group m-r-10">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getImportData(1)">
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="importTable" :columns="table.importTable.rows" :data="table.importTable.data">
        <template slot-scope="{ row, index }" slot="customerINFO">
          <Poptip trigger="hover"  placement="bottom" :transfer="true" width="300">
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
      <Page class="m-t-10" :total="table.importTable.total" :page-size="table.importTable.limit" @on-change="getImportData"/>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
import expandRow from '../../../components/import/import-expand.vue'
const apiUrl = '/api/zhongtan/import/ImportWork/'

export default {
  name: 'ImportWorkControl',
  components: { expandRow },
  data: function() {
    return {
      modal: {},
      table: {
        importTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'expand',
              width: 50,
              render: (h, params) => {
                return h(expandRow, {
                  props: {
                    row: params.row
                  }
                })
              }
            },
            {
              title: 'Customer',
              slot: 'customerINFO',
              width: 100
            },
            {
              title: 'Service',
              key: 'import_billlading_srv_code',
              width: 150
            },
            {
              title: 'Vessel',
              key: 'import_billlading_vessel_code',
              width: 150
            },
            {
              title: 'voyage',
              key: 'import_billlading_voyage',
              width: 150
            },
            {
              title: 'S/O',
              key: 'import_billlading_no',
              width: 150
            },
            {
              title: 'Shipper',
              key: 'import_billlading_shipper',
              render: common.tooltipBrRender(),
              width: 300
            },
            {
              title: 'Consignee',
              key: 'import_billlading_consignee',
              render: common.tooltipBrRender(),
              width: 300
            },
            {
              title: 'Notify Party',
              key: 'import_billlading_notify_party',
              render: common.tooltipBrRender(),
              width: 300
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_data: {
            date: [
              moment()
                .subtract(30, 'days')
                .format('YYYY-MM-DD'),
              moment().format('YYYY-MM-DD')
            ],
            customer: {
              options: [],
              value: '',
              loading: false
            },
            vessel: '',
            voyage: '',
            bl: '',
            search_text: ''
          }
        }
      },
      formRule: {
        ruleImportModal: {}
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      headers: common.uploadHeaders(),
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
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
    this.getImportData(1)
  },
  methods: {
    searchData: function(e) {
      this.table.importTable.search_data.date = JSON.parse(JSON.stringify(e))
    },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.table.importTable.search_data.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.table.importTable.search_data.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.table.importTable.search_data.customer.loading = false
      } else {
        this.table.importTable.search_data.customer.options = []
      }
    },
    getImportData: async function(index) {
      try {
        if (index) {
          this.table.importTable.offset = (index - 1) * this.table.importTable.limit
        }

        let searchPara = {
          start_date: this.table.importTable.search_data.date[0],
          end_date: this.table.importTable.search_data.date[1],
          vessel: this.table.importTable.search_data.vessel,
          voyage: this.table.importTable.search_data.voyage,
          bl: this.table.importTable.search_data.bl,
          search_text: this.table.importTable.search_text,
          offset: this.table.importTable.offset,
          limit: this.table.importTable.limit
        }

        if (this.table.importTable.search_data.customer.value) {
          searchPara.customer = this.table.importTable.search_data.customer.value
        }

        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.importTable.total = data.total
        this.table.importTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    loadImportModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formUser.resetFields()
      this.modal.importModal = true
    },
    handleImportbefore(file) {
      this.$Spin.show()
    },
    handleImportSuccess(res, file, fileList) {
      this.$Spin.hide()
      this.$Notice.success({
        title: 'Success',
        desc: 'File Import Success'
      })
      this.getImportData()
    },
    handleImportError(error, file, fileList) {
      this.$Spin.hide()
      this.$Notice.error({
        title: 'Error',
        desc: 'File Import Failed'
      })
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select pdf.'
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 4M.'
      })
    }
  }
}
</script>