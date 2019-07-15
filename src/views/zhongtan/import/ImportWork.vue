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
                clearable
                remote
                :remote-method="searchCustomer"
                :loading="table.importTable.search_data.customer.loading"
                placeholder="customer"
              >
                <Option v-for="item in table.importTable.search_data.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="table.importTable.search_data.vessel" clearable style="width:150px" placeholder="Vessel">
                <Option v-for="item in pagePara.SHIPSINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.voyage" placeholder="Voyage" style="width: 100px">
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.bl" placeholder="BL No." style="width: 130px">
            </div>
            <div class="input-group m-r-3">
              <button type="button" class="btn btn-info" @click="getImportData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <!-- <Upload
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
              </Upload> -->
              <button type="button" class="btn btn-info" @click="loadImportModal">Load</button>
            </div>
            <div class="form-group m-r-3">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="assignCuatomer()">Assign</button>
              </div>
            </div>
            <div class="form-group m-r-3">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="exportMBL()">MBL</button>
              </div>
            </div>
            <div class="form-group m-r-3">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="exportCBL()">CBL</button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="importTable" :columns="table.importTable.rows" :data="table.importTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <Tooltip content="Download B/L">
            <a href="#" class="btn btn-green btn-icon btn-sm" @click="downLoadBL(row)">
              <i class="fa fa-download"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="customerINFO">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="300">
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
        <template slot-scope="{ row, index }" slot="Vessel">({{row.import_billlading_vessel_code}}){{row.import_billlading_vessel_name}}</template>
      </Table>
      <Row>
        <Col span="20">
          <Page class="m-t-10" :total="table.importTable.total" :page-size="table.importTable.limit" @on-change="getImportData"/>
        </Col>
        <Col span="4">
          <div class="total">Total: {{table.importTable.total}}</div>
        </Col>
      </Row>
    </panel>
    <Modal v-model="modal.importModal" title="Import">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Arrive Date" prop="arrive_date">
          <DatePicker type="date" placeholder="Arrive Date" v-model="workPara.arrive_date"></DatePicker>
        </FormItem>
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60"/>
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xml']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/import/ImportWork//upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.importModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="importData">Submit</Button>
      </div>
    </Modal>
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
        modal: { importModal: false },
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
              title: 'Action',
              slot: 'action',
              width: 130
            },
            {
              title: 'Customer',
              slot: 'customerINFO',
              width: 150
            },
            {
              title: 'Service',
              key: 'import_billlading_srv_code',
              width: 150
            },
            {
              title: 'Vessel',
              slot: 'Vessel',
              width: 200
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
                .subtract(7, 'days')
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
      action: '',
      files: {
        fileList: []
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getPara()
    this.getImportData(1)
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
      this.modal.importModal = true
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileList = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
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
      this.getPara()
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
    },
    importData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload xml file')
        }
        this.workPara.upload_files = this.files.fileList
        await this.$http.post(apiUrl + 'uploadImport', this.workPara)
        this.$Message.success('submit success')
        this.getImportData()
        this.modal.importModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    assignCuatomer() {
      let _self = this
      if (_self.table.importTable.search_data.customer.value) {
        let sels = _self.$refs.importTable.getSelection()
        if (sels.length === 0) {
          return _self.$Message.warning('Please select bls.')
        }

        _self.$commonact.confirm(`Assign the select BL. to ${_self.table.importTable.search_data.customer.options[0].text}?`, async () => {
          try {
            let bls = []
            for (let s of sels) {
              bls.push(s.import_billlading_id)
            }

            await _self.$http.post(apiUrl + 'assignCustomer', {
              bls: bls,
              customer_id: _self.table.importTable.search_data.customer.value
            })
            _self.$Message.success('assign success')
            _self.getImportData()
          } catch (error) {
            _self.$commonact.fault(error)
          }
        })
      } else {
        _self.$Message.warning('Please select a customer')
      }
    },
    exportMBL: async function() {
      try {
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

        let response = await this.$http.request({
          url: apiUrl + 'exportMBL',
          method: 'post',
          data: searchPara,
          responseType: 'blob'
        })

        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'MBL_UPLOAD.csv'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    exportCBL: async function() {
      try {
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

        let response = await this.$http.request({
          url: apiUrl + 'exportCBL',
          method: 'post',
          data: searchPara,
          responseType: 'blob'
        })

        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'CBL_UPLOAD.csv'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    downLoadBL: async function(row) {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'downloadBL',
          method: 'post',
          data: { import_billlading_id: row.import_billlading_id },
          responseType: 'blob'
        })

        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = row.ca0 + ' ' + row.import_billlading_no+ '.docx'
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
.total {
  padding-top: 20px;
  font-size: 12px;
}

.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
</style>