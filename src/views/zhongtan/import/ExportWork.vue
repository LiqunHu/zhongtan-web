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
      Export
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Export Work">
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
              <input type="text" class="form-control" v-model="table.importTable.search_data.voyage" placeholder="Voyage" style="width: 100px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="table.importTable.search_data.bl" placeholder="BL No." style="width: 130px" />
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
                :max-size="5120"
                :before-upload="handleImportbefore"
                :on-success="handleImportSuccess"
                :on-error="handleImportError"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                action="/api/zhongtan/import/ImportWork/uploadImport"
              >
                <button type="button" class="btn btn-info">Load</button>
              </Upload>-->
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
            <div class="form-group m-r-3">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="exportShipmentList()">SHIPMENT LIST</button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="importTable" :columns="table.importTable.rows" :data="table.importTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <Tooltip content="Download B/L">
            <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadBLModal(row)">
              <i class="fa fa-download"></i>
            </a>
          </Tooltip>
          <Tooltip content="Released" v-if="row.import_billlading_released_flag === '0'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="releasedBL(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="customerINFO">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="300">
            <Button type="text" style="text-decoration:underline">{{row.customerINFO.name}}</Button>
            <template slot="content">
              Phone: {{row.customerINFO.phone}}
              <br />
              Email: {{row.customerINFO.email}}
              <br />
              Address: {{row.customerINFO.address}}
              <br />
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="Vessel">({{row.import_billlading_vessel_code}}){{row.import_billlading_vessel_name}}</template>
      </Table>
      <Row>
        <Col span="20">
          <Page class="m-t-10" :total="table.importTable.total" :page-size="table.importTable.limit" @on-change="getImportData" />
        </Col>
        <Col span="4">
          <div class="total">Total:  {{table.importTable.total}}</div>
        </Col>
      </Row>
    </panel>
    <Modal v-model="modal.importModal" title="Export">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xml']"
            :max-size="10240"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/import/ExportWork/upload"
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
    <Modal v-model="modal.downLoadBLModal" title="Download BL" width="800">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Deliver to" prop="deliver_to">
              <Select
                v-model="workPara.import_billlading_customer_id"
                filterable
                clearable
                remote
                :remote-method="searchDeliveryCustomer"
                :loading="deliveryCustomer.loading"
                placeholder="customer"
                @on-change="customerChange"
              >
                <Option v-for="item in deliveryCustomer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
              <!-- <Input type="textarea" :rows="2" placeholder="Deliver to" v-model="workPara.deliver_to" /> -->
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="9">
            <FormItem label="BL Date" prop="bl_date">
              <DatePicker type="date" placeholder="BL Date" v-model="workPara.bl_date"></DatePicker>
            </FormItem>
          </Col>
          <Col offset="3" span="9">
            <FormItem label="Valid to" prop="valid_to">
              <DatePicker type="date" placeholder="Valid to" v-model="workPara.valid_to"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span="9">
            <FormItem label="Consignee Name" prop="consignee_name">
              <Input type="textarea" :rows="4" placeholder="Consignee Name" v-model="workPara.consignee_name" />
            </FormItem>
          </Col>
          <Col offset="3" span="9">
            <FormItem label="Delivery Order No" prop="delivery_order_no">
              <Input placeholder="Delivery Order No" v-model="workPara.delivery_order_no" disabled />
            </FormItem>
            <FormItem label="B/L NO." prop="bl_no">
              <Input placeholder="B/L NO." v-model="workPara.bl_no" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="9">
            <FormItem label="Address: " prop="consignee_address">
              <Input type="textarea" :rows="4" placeholder="Address" v-model="workPara.consignee_address" />
            </FormItem>
          </Col>
          <Col offset="3" span="9">
            <FormItem label="Vessel" prop="vessel">
              <Input placeholder="Vessel" v-model="workPara.vessel" />
            </FormItem>
            <FormItem label="Voyage" prop="voyage">
              <Input placeholder="Voyage" v-model="workPara.voyage" />
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span="8">
            <FormItem label="POL/ETD" prop="etd">
              <DatePicker type="date" placeholder="POL/ETD" v-model="workPara.etd"></DatePicker>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="POD/ETA" prop="eta">
              <DatePicker type="date" placeholder="POD/RTA" v-model="workPara.eta"></DatePicker>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="ICD/TERMINAL" prop="terminal">
              <Input placeholder="ICD/TERMINAL" v-model="workPara.terminal" />
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col>
            <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data">
              <template slot-scope="{ row, index }" slot="container_no">
                <Input v-model="row.container_no" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="seal_no">
                <Input v-model="row.seal_no" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_size">
                <Input v-model="row.container_size" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_marks">
                <Input v-model="row.container_marks" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_tare">
                <Input v-model="row.container_tare" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_count">
                <Input v-model="row.container_count" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_commodity">
                <Input v-model="row.container_commodity" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_net_weight">
                <Input v-model="row.container_net_weight" @on-blur="table.containerTable.data[index] = row" />
              </template>
              <template slot-scope="{ row, index }" slot="container_cbm">
                <Input v-model="row.container_cbm" @on-blur="table.containerTable.data[index] = row" />
              </template>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="TOTAL CONTAINERS" prop="container_count">
              <Input placeholder="TOTAL NO. OF CONTAINERS PER SIZE/TYPE " v-model="workPara.container_count" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="9">
            <FormItem label="Total Net weight" prop="net_weight">
              <Input placeholder="Total Net weight" v-model="workPara.net_weight" />
            </FormItem>
          </Col>
          <Col offset="3" span="9">
            <FormItem label="Total CMB" prop="total_cmb">
              <Input placeholder="Total CMB" v-model="workPara.total_cmb" />
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col>
            <FormItem label="Receiving and delivery system" prop="receiving_delivery">
              <Input placeholder="Receiving and delivery system" v-model="workPara.receiving_delivery" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.downLoadBLModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadBL">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import _ from 'lodash'
const moment = require('moment')
const common = require('@/lib/common')
import expandRow from '../../../components/import/import-expand.vue'
const apiUrl = '/api/zhongtan/import/ExportWork/'

export default {
  name: 'ExportWorkControl',
  components: { expandRow },
  data: function() {
    return {
      modal: { importModal: false, downLoadBLModal: false },
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
              title: 'Action',
              slot: 'action',
              width: 130
            },
            {
              title: 'Do No.',
              key: 'import_billlading_id',
              width: 120
            },
            {
              title: 'Released',
              key: 'import_billlading_released_flag',
              render: common.selectRender(this, 'TFINFO'),
              width: 100
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
              width: 160
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
        },
        containerTable: {
          columns: [
            {
              title: 'Container No.',
              slot: 'container_no',
              width: 120
            },
            {
              title: 'Seal No.',
              slot: 'seal_no',
              width: 120
            },
            {
              title: 'Size',
              slot: 'container_size',
              width: 120
            },
            {
              title: 'Marks & Numbers',
              slot: 'container_marks',
              width: 120
            },
            {
              title: 'Tare',
              slot: 'container_tare',
              width: 120
            },
            {
              title: 'PCS/QTY',
              slot: 'container_count',
              width: 120
            },
            {
              title: 'Commodity',
              slot: 'container_commodity',
              width: 150
            },
            {
              title: 'Net WT KGM',
              slot: 'container_net_weight',
              width: 120
            },
            {
              title: 'CBM',
              slot: 'container_cbm',
              width: 120
            }
          ],
          data: []
        }
      },
      formRule: {
        ruleImportModal: {}
      },
      deliveryCustomer: {
        options: [],
        loading: false
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
        let response = await this.$http.post(apiUrl + 'init', {business_type: 'E'})
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
    searchDeliveryCustomer: async function(query) {
      if (query !== '') {
        this.deliveryCustomer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.deliveryCustomer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.deliveryCustomer.loading = false
      } else {
        this.deliveryCustomer.options = []
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
          business_type: 'E',
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
      this.files.fileList = []
      this.$refs.upload.fileList = []
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
        desc: 'File  ' + file.name + ' is too large, no more than 10M.'
      })
    },
    importData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload xml file')
        }
        this.workPara.upload_files = this.files.fileList
        this.workPara.business_type = 'E'
        await this.$http.post(apiUrl + 'uploadImport', this.workPara)
        this.$Message.success('submit success')
        this.getPara()
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
          business_type: 'E',
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
          a.download = 'MBL_UPLOAD_' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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
          business_type: 'E',
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
          a.download = 'CBL_UPLOAD_' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    customerChange: function(sel) {
      if (sel) {
        for(let op of this.deliveryCustomer.options) {
          if(op.id === sel) {
            this.workPara.customerINFO = JSON.parse(JSON.stringify(op))
            break
          }
        }
      }
    },
    actDownLoadBLModal: function(row) {
      let _self = this
      this.workPara = {}

      this.workPara.import_billlading_id = row.import_billlading_id
      _self.workPara.import_billlading_customer_id = row.import_billlading_customer_id
      this.$nextTick(function() {
        if (row.import_billlading_customer_id) {
          this.deliveryCustomer.loading = true
          this.deliveryCustomer.options = [
            {
              id: row.import_billlading_customer_id,
              text: row.customerINFO.name
            }
          ]
          this.workPara.customerINFO = row.customerINFO
          this.deliveryCustomer.loading = false
        } else {
          this.deliveryCustomer.options = []
        }
      })
      this.workPara.bl_date = moment().format('YYYY-MM-DD')
      this.workPara.valid_to = ''
      let cary = row.import_billlading_consignee.split('<br/>')
      this.workPara.consignee_name = cary.length > 0 ? cary[0].replace(/\r\n/g, '') : ''
      this.workPara.consignee_address =
        cary.length > 1
          ? _.takeRight(cary, cary.length - 1)
              .join(' ')
              .replace(/\r\n/g, '')
          : ''
      this.workPara.delivery_order_no = row.import_billlading_id
      this.workPara.bl_no = row.import_billlading_no
      this.workPara.vessel = row.import_billlading_vessel_name
      this.workPara.voyage = row.import_billlading_voyage
      this.workPara.etd = ''
      this.workPara.eta = ''
      this.workPara.terminal = ''
      this.table.containerTable.data = []
      if (row.container.length > 0) {
        for (let c of row.container) {
          this.table.containerTable.data.push({
            container_no: c.import_billlading_container_num,
            seal_no: c.import_billlading_container_seal,
            container_size: c.import_billlading_container_type,
            container_marks: 'N/M',
            container_tare: c.import_billlading_container_tare_weight,
            container_count: c.import_billlading_container_package_cnt + ' ' + row.goods[0].import_billlading_goods_package_unit,
            container_commodity: '',
            container_net_weight: c.import_billlading_container_weight,
            container_cbm: parseFloat(row.import_billlading_total_volume_cbm) / row.container.length
          })
        }
      } else {
        this.table.containerTable.data.push({
          container_no: '',
          seal_no: '',
          container_size: '',
          container_marks: 'N/M',
          container_tare: '',
          container_count: '',
          container_commodity: '',
          container_net_weight: '',
          container_cbm: ''
        })
      }
      this.workPara.container_count = row.container.length + 'X' + row.container[0].import_billlading_container_type
      this.workPara.net_weight = row.import_billlading_total_gross_weight_kg
      this.workPara.total_cmb = row.import_billlading_total_volume_cbm
      this.workPara.receiving_delivery = row.container[0].import_billlading_container_traffic_mode
      this.workPara.commodity = ''
      if (row.goods.length > 0) {
        for (let g of row.goods) {
          this.workPara.commodity += g.import_billlading_goods_package_number + ' ' + g.import_billlading_goods_package_unit + '\r'
          this.workPara.commodity += g.import_billlading_goods_description + '\r'
        }
      }

      this.modal.downLoadBLModal = true
    },
    downloadBL: async function() {
      try {
        this.workPara.bl_date = moment(this.workPara.bl_date).format('YYYY-MM-DD')
        this.workPara.valid_to = moment(this.workPara.valid_to).format('YYYY-MM-DD')
        this.workPara.etd = moment(this.workPara.etd).format('YYYY-MM-DD')
        this.workPara.eta = moment(this.workPara.eta).format('YYYY-MM-DD')
        this.workPara.containers = this.table.containerTable.data
        this.workPara.deliver_to = this.workPara.customerINFO.name + ', ' + this.workPara.customerINFO.address
        this.workPara.deliver_name = this.workPara.customerINFO.name
        let response = await this.$http.request({
          url: apiUrl + 'downloadBL',
          method: 'post',
          data: this.workPara,
          responseType: 'blob'
        })
        this.modal.downLoadBLModal = false
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = this.workPara.consignee_name + ' ' + this.workPara.bl_no + '.docx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
        this.getImportData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    releasedBL: async function(row) {
      this.$commonact.confirm('Released?', async () => {
        try {
          await this.$http.post(apiUrl + 'released', { import_billlading_id: row.import_billlading_id })
          this.$Message.success('Successful operation')
          this.getImportData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    exportShipmentList: async function() {
      try {
        let searchPara = {
          start_date: this.table.importTable.search_data.date[0],
          end_date: this.table.importTable.search_data.date[1],
          vessel: this.table.importTable.search_data.vessel,
          voyage: this.table.importTable.search_data.voyage,
          bl: this.table.importTable.search_data.bl,
          search_text: this.table.importTable.search_text,
          business_type: 'E',
        }

        if (this.table.importTable.search_data.customer.value) {
          searchPara.customer = this.table.importTable.search_data.customer.value
        }
        if(!searchPara.vessel || !searchPara.voyage) {
          return this.$Message.error('Please select vessel and voyage')
        }
        let response = await this.$http.request({
          url: apiUrl + 'exportShipmentList',
          method: 'post',
          data: searchPara,
          responseType: 'blob'
        })

        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'SHIPMENT_LIST_UPLOAD_' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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