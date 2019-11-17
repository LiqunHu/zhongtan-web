<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Home</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Home
      <small>header small text goes here...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="vessel.search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getVoyageData">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="loadImportModal">Load</button>
            </div>
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vessel.height">
              <Row v-for="item in vessel.data" v-bind:key="item.invoice_vessel_id">
                <Col>
                  <div @click="getVoyageDetail(item.invoice_vessel_id)">
                    <Card>
                      <p slot="title">{{item.invoice_vessel_name}}({{item.invoice_vessel_code}}) - {{item.invoice_vessel_voyage}}</p>
                      <p>ETA: {{item.invoice_vessel_eta}}</p>
                      <p>ATA: {{item.invoice_vessel_ata}}</p>
                      <p>ATD: {{item.invoice_vessel_atd}}</p>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Scroll>
          </div>
        </Col>
        <Col span="17" offset="1">
          <Tabs :animated="false">
            <TabPane label="MasterBl">
              <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
                <template slot-scope="{ row, index }" slot="action">
                  <Tooltip content="Download B/L">
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadDoModal(row)">
                      <i class="fa fa-download"></i>
                    </a>
                  </Tooltip>
                </template>
              </Table>
            </TabPane>
            <TabPane label="Containers">
              <Table stripe size="small" ref="containersTable" :columns="table.containersTable.columns" :data="table.containersTable.data" :height="table.containersTable.height"></Table>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </panel>
    <Modal v-model="modal.importModal" title="Import">
      <Form :model="workPara" :label-width="120">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xlsx']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/invoice/Invoice/upload"
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
    <Modal v-model="modal.downLoadDoModal" title="Download Do" width="600">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Delivery to" prop="invoice_masterbi_delivery_to">
              <Input placeholder="Delivery to" v-model="workPara.invoice_masterbi_delivery_to" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="VALID TO" prop="invoice_masterbi_valid_to">
              <DatePicker type="date" placeholder="VALID TO" v-model="workPara.invoice_masterbi_valid_to"></DatePicker>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.downLoadDoModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadDo">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/Invoice/'

export default {
  data: function() {
    return {
      modal: { importModal: false, downLoadDoModal: false },
      table: {
        masterbiTable: {
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
              title: 'Cargo Classification',
              key: 'invoice_masterbi_cargo_type',
              width: 100
            },
            {
              title: '*B/L Type',
              key: 'invoice_masterbi_bl_type',
              width: 100
            },
            {
              title: 'Place of Destination',
              key: 'invoice_masterbi_destination',
              width: 130
            },
            {
              title: 'Place of Delivery',
              key: 'invoice_masterbi_delivery',
              width: 130
            },
            {
              title: 'Oil Type',
              key: 'invoice_masterbi_oil_type',
              width: 100
            },
            {
              title: 'Port of Loading',
              key: 'invoice_masterbi_loading',
              width: 130
            },
            {
              title: 'Number of Containers',
              key: 'invoice_masterbi_container_no',
              width: 100
            },
            {
              title: 'Description of Goods',
              key: 'invoice_masterbi_goods_description',
              tooltip: true,
              width: 200
            },
            {
              title: 'Number of Package',
              key: 'invoice_masterbi_package_no',
              width: 100
            },
            {
              title: 'Package Unit',
              key: 'invoice_masterbi_package_unit',
              width: 100
            },
            {
              title: 'Gross Weight',
              key: 'invoice_masterbi_gross_weight',
              width: 100
            },
            {
              title: 'Gross Weight Unit',
              key: 'invoice_masterbi_gross_weight_unit',
              width: 100
            },
            {
              title: 'Gross Volume',
              key: 'invoice_masterbi_gross_volume',
              width: 100
            },
            {
              title: 'Gross Volume Unit',
              key: 'invoice_masterbi_gross_volume_unit',
              width: 100
            },
            {
              title: 'Invoice Value',
              key: 'invoice_masterbi_invoice_value',
              width: 100
            },
            {
              title: 'Invoice Currency',
              key: 'invoice_masterbi_invoice_currency',
              width: 100
            },
            {
              title: 'Freight Charge',
              key: 'invoice_masterbi_freight_charge',
              width: 100
            },
            {
              title: 'Freight Currency',
              key: 'invoice_masterbi_freight_currency',
              width: 100
            },
            {
              title: 'IMDG Code',
              key: 'invoice_masterbi_imdg',
              width: 100
            },
            {
              title: 'Packing Type',
              key: 'invoice_masterbi_packing_type',
              width: 100
            },
            {
              title: 'Forwarder Code',
              key: 'invoice_masterbi_forwarder_code',
              tooltip: true,
              width: 150
            },
            {
              title: 'Forwarder Name',
              key: 'invoice_masterbi_forwarder_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Forwarder Tel',
              key: 'invoice_masterbi_forwarder_tel',
              width: 150
            },
            {
              title: 'Exporter Name',
              key: 'invoice_masterbi_exporter_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Exporter Tel',
              key: 'invoice_masterbi_exporter_tel',
              width: 100
            },
            {
              title: 'Exporter Address',
              key: 'invoice_masterbi_exporter_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Exporter TIN',
              key: 'invoice_masterbi_exporter_tin',
              width: 100
            },
            {
              title: 'Consignee Name',
              key: 'invoice_masterbi_consignee_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Consignee Tel',
              key: 'invoice_masterbi_consignee_tel',
              width: 100
            },
            {
              title: 'Consignee Address',
              key: 'invoice_masterbi_consignee_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Consignee TIN',
              key: 'invoice_masterbi_consignee_tin',
              width: 100
            },
            {
              title: 'Notify Name',
              key: 'invoice_masterbi_notify_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Notify Tel',
              key: 'invoice_masterbi_notify_tel',
              width: 100
            },
            {
              title: 'Notify Address',
              key: 'invoice_masterbi_notify_address',
              tooltip: true,
              width: 200
            },
            {
              title: 'Notify TIN',
              key: 'invoice_masterbi_notify_tin',
              width: 100
            },
            {
              title: 'Shipping Mark',
              key: 'invoice_masterbi_shipping_mark',
              tooltip: true,
              width: 200
            },
            {
              title: 'Net Weight',
              key: 'invoice_masterbi_net_weight',
              width: 100
            },
            {
              title: 'Net Weight Unit',
              key: 'invoice_masterbi_net_weight_unit',
              width: 100
            },
            {
              title: 'LineAgent Code',
              key: 'invoice_masterbi_line_code',
              width: 100
            },
            {
              title: 'TerminalCode',
              key: 'invoice_masterbi_terminal_code',
              width: 100
            }
          ],
          data: [],
          height: common.getTableHeight() - 50
        },
        containersTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'invoice_containers_bl',
              width: 150
            },
            {
              title: 'Type Of Container',
              key: 'invoice_containers_type',
              width: 100
            },
            {
              title: 'Container No',
              key: 'invoice_containers_no',
              width: 150
            },
            {
              title: 'Container Size',
              key: 'invoice_containers_size',
              width: 100
            },
            {
              title: 'Seal No.1',
              key: 'invoice_containers_seal1',
              width: 100
            },
            {
              title: 'Seal No.2',
              key: 'invoice_containers_seal2',
              width: 100
            },
            {
              title: 'Seal No.3',
              key: 'invoice_containers_seal3',
              width: 100
            },
            {
              title: 'Freight Indicator',
              key: 'invoice_containers_freight_indicator',
              width: 100
            },
            {
              title: 'No Of Package',
              key: 'invoice_containers_package_no',
              width: 100
            },
            {
              title: 'Package Unit',
              key: 'invoice_containers_package_unit',
              width: 100
            },
            {
              title: 'Volumn',
              key: 'invoice_containers_volumn',
              width: 100
            },
            {
              title: 'Volumn Unit',
              key: 'invoice_containers_volumn_unit',
              width: 100
            },
            {
              title: 'Weight',
              key: 'invoice_containers_weight',
              width: 100
            },
            {
              title: 'Weight Unit',
              key: 'invoice_containers_weight_unit',
              width: 100
            },
            {
              title: 'Plug type of reefer',
              key: 'invoice_containers_plug_reefer',
              width: 100
            },
            {
              title: 'Minimum Temperature',
              key: 'invoice_containers_min_temperature',
              width: 100
            },
            {
              title: 'Maximum Temperature',
              key: 'invoice_containers_max_temperature',
              width: 100
            }
          ],
          data: [],
          height: common.getTableHeight() - 50
        }
      },
      workPara: {},
      headers: common.uploadHeaders(),
      action: '',
      files: {
        fileList: []
      },
      vessel: {
        data: [],
        search_data: {
          date: [
            moment()
              .subtract(30, 'days')
              .format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD')
          ]
        },
        height: common.getTableHeight()
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    await this.getVoyageData()
  },
  methods: {
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
        this.getVoyageData()
        this.modal.importModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchData: function(e) {
      this.vessel.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getVoyageData: async function() {
      try {
        let searchPara = {
          start_date: this.vessel.search_data.date[0],
          end_date: this.vessel.search_data.date[1]
        }

        let response = await this.$http.post(apiUrl + 'searchVoyage', searchPara)
        let data = response.data.info
        this.vessel.data = JSON.parse(JSON.stringify(data))
        this.table.masterbiTable.data = []
        this.table.containersTable.data = []
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    getVoyageDetail: async function(invoice_vessel_id) {
      try {
        let response = await this.$http.post(apiUrl + 'getVoyageDetail', {
          invoice_vessel_id: invoice_vessel_id
        })
        let data = response.data.info
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.MasterBl))
        this.table.containersTable.data = JSON.parse(JSON.stringify(data.Containers))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actDownLoadDoModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.modal.downLoadDoModal = true
    },
    downloadDo: async function() {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'downloadDo',
          method: 'post',
          data: this.workPara,
          responseType: 'blob'
        })
        this.modal.downLoadDoModal = false
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = this.workPara.invoice_masterbi_consignee_name + ' ' + this.workPara.invoice_masterbi_bl + '.docx'
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