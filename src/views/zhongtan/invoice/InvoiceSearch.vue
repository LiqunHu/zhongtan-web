<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Invoice,D/O Search</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Invoice,D/O Search
      <small>Invoice,D/O Search...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Invoice,D/O Search">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="vessel.search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="vessel.search_data.collect" style="width:180px">
                <Option v-for="item in pagePara.COLLECT_FLAG" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input clearable type="text" class="form-control" v-model="vessel.search_data.vesselName" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input clearable type="text" class="form-control" v-model="vessel.search_data.bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
        <template slot-scope="{ row, index }" slot="invoice_masterbi_bl">
          <i class="fa fa-ship" v-if="row.invoice_masterbi_vessel_type === 'Bulk'"></i>
          <i class="fa fa-cubes" v-else></i>
          {{row.invoice_masterbi_bl}}
        </template>
        <template slot-scope="{ row, index }" slot="Invoice">
          <a href="#" class="btn btn-green btn-icon btn-sm" v-if="row.invoice_masterbi_deposit_release_date || row.invoice_masterbi_fee_release_date">
            GO
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" v-else>
            NO
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="Do">
          <Tooltip content="Generate Do" v-if="!row.invoice_masterbi_do_release_date">
            <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadDoModal(row)" v-if="row.invoice_masterbi_do_state">
              GO
            </a>
            <a href="#" class="btn btn-danger btn-icon btn-sm" v-else @click="actDownLoadDoModalCheck(row)">
              NO
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="Collect">
          <Tag href="#" color="primary"v-if="row.invoice_masterbi_freight == 'COLLECT'">Collect</Tag>
          <Tag href="#" color="success" v-if="row.invoice_masterbi_freight !== 'COLLECT'">Prepaid</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="555" v-if="row.files && row.files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template v-if="row.filetype === 'DO'">
                    <Tooltip content="Download">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                  <template v-else-if="row.state === 'AP'">
                    <Tooltip content="Download">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="vessel">
          <Tooltip placement="right">
            {{row.invoice_vessel_name}}-{{row.invoice_vessel_voyage}}
            <div slot="content">
              <Row>
                <i-col span="12">Vessel Name:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_name}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Vessel Voyage:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_voyage}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Vessel Code:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_code}}</i-col>
              </Row>
              <Row>
                <i-col span="12">Call Sign:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_call_sign}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ETA:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_eta}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ATA:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_ata}}</i-col>
              </Row>
              <Row>
                <i-col span="12">ATD:</i-col>
                <i-col span="12" style="text-align:right ">{{row.invoice_vessel_atd}}</i-col>
              </Row>
            </div>
          </Tooltip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.masterbiTable.total" :page-size="table.masterbiTable.limit" @on-change="getData" />
    </panel>
    <Modal v-model="modal.downLoadDoModal" title="Download Do" width="600">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Delivery to" prop="invoice_masterbi_delivery_to">
              <Select v-model="workPara.invoice_masterbi_delivery_to" filterable clearable allow-create placeholder="Delivery" style="width:400px"  @on-query-change="deliveryCreate">
                <Option v-for="item in delivery.options" :value="item" :key="item">{{item}}</Option>
              </Select>
              <!-- <a href="#" @click.prevent="changeDoDeliverEdit" title="Edit">
                <i class="fa fa-edit"></i>
              </a> -->
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="VALID TO" prop="invoice_masterbi_valid_to">
              <DatePicker type="date" placeholder="VALID TO" v-model="workPara.invoice_masterbi_valid_to" @on-change="validToDateChange" :disabled="!!workPara.invoice_masterbi_do_release_date"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk'">
          <Col>
            <FormItem label="FCL" prop="invoice_masterbi_do_fcl">
              <RadioGroup v-model="workPara.invoice_masterbi_do_fcl">
                <Radio value="FCL/FCL" label="FCL/FCL" style="margin-right: 50px;"></Radio>
                <Radio value="FCL/LCL" label="FCL/LCL" style="margin-right: 50px;"></Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="ICD" prop="invoice_masterbi_do_icd">
              <i-select v-model="workPara.invoice_masterbi_do_icd">
                <i-option  v-for="item in pagePara.ICD" :value="item.icd_name" :key="item.icd_name" :label="item.icd_name">
                    <span>{{item.icd_name}}</span>
                    <span style="float:right;color:#ccc">{{item.icd_code}}</span>
                </i-option>
              </i-select>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.downLoadDoModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadDo">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :closable="false" :mask-closable="false">
      <Form :label-width="120">
        <FormItem v-show="false">
          <Input type="password" style='width:0;opacity:0;'></Input>       
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
          <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.checkPasswordModal = false; depositEdit = false; doDeliverEdit = false;">Cancel</Button>
        <Button type="primary" size="large" @click="actCheckPassword">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import printJS from 'print-js'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/InvoiceSearch/'

export default {
  data: function() {
    return {
      modal: { downLoadDoModal: false, checkPasswordModal: false},
      table: {
        masterbiTable: {
          columns: [
            {
              title: '#M B/L No',
              slot: 'invoice_masterbi_bl',
              width: 180
            },
            {
              title: 'Invoice',
              slot: 'Invoice',
              width: 80
            },
            {
              title: 'Do',
              slot: 'Do',
              width: 60
            },
            {
              title: 'Files',
              slot: 'files',
              width: 100
            },
            {
              title: 'Cargo Classification',
              key: 'invoice_masterbi_cargo_type',
              width: 100
            },
            {
              title: 'Freight Terms',
              slot: 'Collect',
              width: 120
            },
            {
              title: 'Vessel',
              slot: 'vessel',
              width: 160
            },
            {
              title: '*B/L Type',
              key: 'invoice_masterbi_bl_type',
              width: 100
            },
            {
              title: 'Place of Destination',
              key: 'invoice_masterbi_destination',
              tooltip: true,
              width: 130
            },
            {
              title: 'Place of Delivery',
              key: 'invoice_masterbi_delivery',
              tooltip: true,
              width: 130
            },
            {
              title: 'Port of Loading',
              key: 'invoice_masterbi_loading',
              tooltip: true,
              width: 130
            },
            {
              title: 'Number of Containers',
              key: 'invoice_masterbi_container_no',
              tooltip: true,
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
              tooltip: true,
              width: 100
            },
            {
              title: 'Package Unit',
              key: 'invoice_masterbi_package_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Weight',
              key: 'invoice_masterbi_gross_weight',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Weight Unit',
              key: 'invoice_masterbi_gross_weight_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Volume',
              key: 'invoice_masterbi_gross_volume',
              tooltip: true,
              width: 100
            },
            {
              title: 'Gross Volume Unit',
              key: 'invoice_masterbi_gross_volume_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'Invoice Value',
              key: 'invoice_masterbi_invoice_value',
              tooltip: true,
              width: 100
            },
            {
              title: 'Invoice Currency',
              key: 'invoice_masterbi_invoice_currency',
              tooltip: true,
              width: 100
            },
            {
              title: 'Freight Charge',
              key: 'invoice_masterbi_freight_charge',
              tooltip: true,
              width: 100
            },
            {
              title: 'Freight Currency',
              key: 'invoice_masterbi_freight_currency',
              tooltip: true,
              width: 100
            },
            {
              title: 'IMDG Code',
              key: 'invoice_masterbi_imdg',
              tooltip: true,
              width: 100
            },
            {
              title: 'Packing Type',
              key: 'invoice_masterbi_packing_type',
              tooltip: true,
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
              tooltip: true,
              width: 150
            },
            {
              title: 'Exporter Name',
              key: 'invoice_masterbi_exporter_name',
              tooltip: true,
              width: 200,
            },
            {
              title: 'Exporter Tel',
              key: 'invoice_masterbi_exporter_tel',
              tooltip: true,
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
              tooltip: true,
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
              tooltip: true,
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
              tooltip: true,
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
              tooltip: true,
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
              tooltip: true,
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
              tooltip: true,
              width: 100
            },
            {
              title: 'Net Weight Unit',
              key: 'invoice_masterbi_net_weight_unit',
              tooltip: true,
              width: 100
            },
            {
              title: 'LineAgent Code',
              key: 'invoice_masterbi_line_code',
              tooltip: true,
              width: 100
            },
            {
              title: 'TerminalCode',
              key: 'invoice_masterbi_terminal_code',
              tooltip: true,
              width: 100
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        },
        filesTable: {
          columns: [
            {
              title: 'Create Date',
              key: 'date',
              width: 120
            },
            {
              title: 'Type',
              key: 'filetype',
              width: 80
            },
            {
              title: 'Receipt Type',
              key: 'receipt_type',
              width: 80
            },
            {
              title: 'State',
              key: 'state',
              render: common.selectRender(this, 'UPLOAD_STATE'),
              width: 150
            },
            {
              title: 'Action',
              slot: 'act',
              width: 150
            },
            {
              title: 'Release Date',
              key: 'release_date',
              width: 150
            },
            {
              title: 'Release User',
              key: 'release_user',
              width: 150
            }
          ]
        }
      },
      pagePara: {},
      workPara: {},
      headers: common.uploadHeaders(),
      action: '',
      files: {
        fileList: []
      },
      vessel: {
        data: [],
        search_data: {
          date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
          vesselName: '',
          bl: '',
          collect: ''
        },
        current: '',
        height: common.getTableHeight()
      },
      checkPassword: '',
      checkPasswordType: '',
      doDeliverEdit: false,
      formRules: {
          invoice_vessel_name: [
              { required: true, message: 'The vessel name cannot be empty', trigger: 'blur' }
          ],
          invoice_vessel_code: [
              { required: true, message: 'The vessel code cannot be empty', trigger: 'blur' }
          ],
          invoice_vessel_voyage: [
               { required: true, message: 'The vessel voyage cannot be empty', trigger: 'blur' }
          ],
          invoice_vessel_eta: [
              { required: true, type: 'date', message: 'The vessel ETA cannot be empty', trigger: 'change' }
          ],
          invoice_vessel_ata: [
               { required: true, type: 'date', message: 'The vessel ATA cannot be empty', trigger: 'change' }
          ],
          invoice_vessel_atd: [
              { required: true, type: 'date', message: 'The vessel ATD cannot be empty', trigger: 'change' }
          ],
          invoice_vessel_call_sign: [
              { required: true, message: 'The vessel call sign cannot be empty', trigger: 'blur' }
          ]
      },
      delivery: {
        options: []
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    await this.getPara()
    await this.getData(1)
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
      this.vessel.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getData: async function(index) {
      try {
        if (index) {
          this.table.masterbiTable.offset = (index - 1) * this.table.masterbiTable.limit
        }
        let searchPara = {
          start_date: this.vessel.search_data.date[0],
          end_date: this.vessel.search_data.date[1],
          collect: this.vessel.search_data.collect,
          vesselName: this.vessel.search_data.vesselName,
          bl: this.vessel.search_data.bl,
          offset: this.table.masterbiTable.offset,
          limit: this.table.masterbiTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.rows))
        this.table.masterbiTable.total = data.total
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actDownLoadDoModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.doDeliverEdit = false
      this.delivery.options = JSON.parse(JSON.stringify(this.pagePara.DELIVER))
      if(row.invoice_masterbi_delivery_to) {
        const index = this.delivery.options.indexOf(row.invoice_masterbi_delivery_to)
        if(index < 0) {
          this.delivery.options.unshift(row.invoice_masterbi_delivery_to)
        }
      }

      if(!this.workPara.invoice_masterbi_do_fcl) {
        if(this.workPara.invoice_masterbi_lcl) {
          this.workPara.invoice_masterbi_do_fcl = 'FCL/LCL'
        } else {
          this.workPara.invoice_masterbi_do_fcl = 'FCL/FCL'
        }
      }
      
      if(this.pagePara.DELIVER.ICD) {
        let defaultICD = false
        for(let i = 0; i < this.pagePara.DELIVER.ICD.length; i++) {
          if(this.pagePara.DELIVER.ICD[i].icd_name === 'TICTS TERMINAL') {
            defaultICD = true
            break
          }
        }
        if(!defaultICD) {
          this.pagePara.DELIVER.ICD.push({'icd_name': 'TICTS TERMINAL', 'icd_code': 'WTTZDL002'})
        }
      } else {
        this.pagePara.DELIVER.ICD = [{'icd_name': 'TICTS TERMINAL', 'icd_code': 'WTTZDL002'}]
      }
      if(!this.workPara.invoice_masterbi_do_icd) {
        this.workPara.invoice_masterbi_do_icd = 'TICTS TERMINAL'
      }
      
      this.modal.downLoadDoModal = true
    },
    actDownLoadDoModalCheck: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.modal.checkPasswordModal = true
      this.checkPasswordType = 'downLoadDoModalCheck'
    },
    deliveryCreate: function (val) {
      if(val) {
        const index = this.delivery.options.indexOf(val)
        if(index < 0) {
          this.delivery.options.unshift(val)
        }
      }
    },
    downloadDo: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'downloadDo', this.workPara)
        printJS(response.data.info.url)
        this.$Message.success('do success')
        this.modal.downLoadDoModal = false
        this.getData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    changeDoDeliverEdit: function() {
      if(!this.doDeliverEdit) {
        try {
          this.modal.checkPasswordModal = true
          this.checkPassword = ''
          this.checkPasswordType = 'doDeliverEdit'
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
    },
    actCheckPassword: async function() {
      try {
        if(!this.checkPassword) {
          return this.$Message.error('Please enter right password')
        }
        await this.$http.post(apiUrl + 'checkPassword', { check_password: common.md52(this.checkPassword)})
        this.modal.checkPasswordModal = false
        if(this.checkPasswordType === 'doDeliverEdit') {
          this.doDeliverEdit = true
        } else if(this.checkPasswordType === 'downLoadDoModalCheck') {
          this.actDownLoadDoModal(this.workPara)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    validToDateChange: async function(date) {
      this.workPara.invoice_masterbi_valid_to = date
    },
  }
}
</script>