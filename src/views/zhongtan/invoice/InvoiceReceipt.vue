<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Financial Receipt</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Financial Receipt
      <small>Financial Receipt...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Financial Receipt">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="vessel.search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="vessel.search_data.vesselName" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="vessel.search_data.bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getVoyageData">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="actCollectModal">Collect</button>
            </div>
            <!-- <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="actExportModal">Export</button>
            </div> -->
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vessel.height">
              <Row v-for="item in vessel.data" v-bind:key="item.invoice_vessel_id">
                <Col>
                  <div @click="checkVoyage(item.invoice_vessel_id)">
                    <Card>
                      <p slot="title">
                        <i class="fa fa-ship" v-if="item.invoice_vessel_type === 'Bulk'" title="BULK SHIP"></i>
                        <i class="fa fa-cubes" v-else title="CONTAINER SHIP"></i>
                        {{item.invoice_vessel_name}}({{item.invoice_vessel_code}}) - {{item.invoice_vessel_voyage}}
                      </p>
                      <Row>
                        <Col span="11">
                          <p>ETA: {{item.invoice_vessel_eta}}</p>
                        </Col>
                        <Col span="13">Do release: {{item.invoice_do_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                      <Row>
                        <Col span="11">
                          <p>ATA: {{item.invoice_vessel_ata}}</p>
                        </Col>
                        <Col span="13">In release: {{item.invoice_invoice_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                      <Row>
                        <Col span="11">
                          <p>ATD: {{item.invoice_vessel_atd}}</p>
                        </Col>
                        <Col span="13">Re release: {{item.invoice_receipt_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Scroll>
          </div>
        </Col>
        <Col span="17" offset="1">
          <Tabs :animated="false" @on-click="changeTab">
            <TabPane label="MasterBl">
              <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
                <template slot-scope="{ row, index }" slot="invoice_masterbi_bl">
                  <i class="fa fa-ship" v-if="row.invoice_masterbi_vessel_type === 'Bulk'"></i>
                  <i class="fa fa-cubes" v-else></i>
                  {{row.invoice_masterbi_bl}}
                </template>
                <template slot-scope="{ row, index }" slot="Receipt">
                  <Tooltip :content="row.invoice_masterbi_receipt_release_date_fmt" v-if="row.invoice_masterbi_deposit_receipt_date && row.invoice_masterbi_invoice_receipt_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                  </Tooltip>
                  <Tooltip content="Receipt" v-else-if="(row.invoice_masterbi_deposit_release_date && !row.invoice_masterbi_deposit_receipt_date) || (row.invoice_masterbi_fee_release_date && !row.invoice_masterbi_invoice_receipt_date)">
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actReceiptModal(row)">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                  </Tooltip>
                  <Tooltip content="Receipt" v-else>
                    <a href="#" class="btn btn-green btn-icon btn-sm disabled">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                  </Tooltip>
                </template>
                <template slot-scope="{ row, index }" slot="files">
                  <Poptip trigger="hover" placement="bottom" :transfer="true" width="555" v-if="row.files && row.files.length > 0">
                    <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
                    <template slot="content">
                      <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                        <template slot-scope="{ row, index }" slot="act">
                          <Tooltip content="Download" v-if="row.release_date">
                            <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                              <i class="fa fa-download"></i>
                            </a>
                          </Tooltip>
                          <Tooltip content="Release" v-if="!row.release_date && row.filetype === 'Receipt'">
                            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="doRealse(row, index)">
                              <i class="fa fa-share-square"></i>
                            </a>
                          </Tooltip>
                          <Tooltip content="Undo" v-if="row.filetype === 'DO' && row.release_date">
                            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="undoReleaseModal(row, index)">
                              <i class="fa fa-undo"></i>
                            </a>
                          </Tooltip>
                          <Tooltip content="Undo" v-else-if="row.filetype === 'Receipt' && row.release_date && !row.do_release_date">
                            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="undoReleaseModal(row, index)">
                              <i class="fa fa-undo"></i>
                            </a>
                          </Tooltip>
                        </template>
                      </Table>
                    </template>
                  </Poptip>
                </template>
              </Table>
              <Page class="m-t-10" :total="table.masterbiTable.total" :page-size="table.masterbiTable.limit" @on-change="getMasterbiData" />
            </TabPane>
            <TabPane label="Containers">
              <Table stripe size="small" ref="containersTable" :columns="table.containersTable.columns" :data="table.containersTable.data" :height="table.containersTable.height"></Table>
              <Page class="m-t-10" :total="table.containersTable.total" :page-size="table.containersTable.limit" @on-change="getContainersData" />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </panel>
    <Modal v-model="modal.receiptModal" title="Download Receipt" width="600" :mask-closable="false">
      <Form :model="workPara" :label-width="160">
        <Row>
          <Col>
            <FormItem label="Receipt Type">
              <RadioGroup v-model="checkType" @on-change="changeType">
                <Radio v-if="workPara.invoice_masterbi_deposit_release_date && !workPara.invoice_masterbi_deposit_receipt_date" label="deposit"></Radio>
                <Radio v-if="workPara.invoice_masterbi_fee_release_date && !workPara.invoice_masterbi_invoice_receipt_date" label="fee"></Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Received From" prop="invoice_masterbi_received_from">
              <Select v-model="workPara.invoice_masterbi_received_from" filterable clearable placeholder="Received From" :disabled="(!!workPara.invoice_masterbi_receipt_release_date || !!workPara.invoice_masterbi_deposit_date || !!workPara.invoice_masterbi_fee_date) && receiptDisabled">
                <Option v-for="item in pagePara.RECEIVES" :value="item" :key="item">{{item}}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Currency" prop="invoice_masterbi_receipt_currency">
              <Select
                v-model="workPara.invoice_masterbi_receipt_currency"
                :disabled="!!workPara.invoice_masterbi_receipt_release_date || !!workPara.invoice_masterbi_deposit_date || !!workPara.invoice_masterbi_fee_date"
              >
                <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Amount" prop="invoice_masterbi_receipt_amount">
              <Input
                placeholder="Amount"
                v-model="workPara.invoice_masterbi_receipt_amount"
                :disabled="!!workPara.invoice_masterbi_receipt_release_date || !!workPara.invoice_masterbi_deposit_date || !!workPara.invoice_masterbi_fee_date"
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Cash/Cheque" prop="invoice_masterbi_check_cash">
              <Select v-model="workPara.invoice_masterbi_check_cash" :disabled="!!workPara.invoice_masterbi_receipt_release_date">
                <Option v-for="item in pagePara.CASH_BANK_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_check_cash === 'TRANSFER'">
          <Col>
            <FormItem label="Bank Reference No" prop="invoice_masterbi_bank_reference_no" >
              <Input placeholder="Bank Reference No" v-model="workPara.invoice_masterbi_bank_reference_no" :disabled="!!workPara.invoice_masterbi_receipt_release_date"/>
            </FormItem>
          </Col>
        </Row>
        <Row v-show="workPara.invoice_masterbi_check_cash === 'CHEQUE'">
          <Col>
            <FormItem label="Check No" prop="invoice_masterbi_check_no">
              <Input placeholder="Check No" v-model="workPara.invoice_masterbi_check_no" :disabled="!!workPara.invoice_masterbi_receipt_release_date" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <a href="#" style="float:left; padding-top:10px;" @click.prevent="receiptEditAct" title="Edit">
          <i class="fa fa-edit"></i>Edit
        </a>
        <Button type="text" size="large" @click="modal.receiptModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadReceipt">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.collectModal" title="Download Receipt Collect" width="600" :mask-closable="false">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Ship Co." prop="carrier">
              <Select v-model="workPara.carrier">
                <Option v-for="item in pagePara.RECEIPT_TYPE_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="Data" prop="collect_date">
              <DatePicker type="daterange" v-model="workPara.collect_date" placeholder="Date" style="width: 200px"></DatePicker>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.collectModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadCollect">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.undoReleaseCheckModal" title="Undo Receipt Release" width="600" :closable="false" :mask-closable="false">
      <Form :model="workPara" :label-width="120">
        <FormItem v-show="false">
          <Input type="password" style='width:0;opacity:0;'></Input>       
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
          <Input type="password" placeholder="Password" v-model="workPara.undo_release_password"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.undoReleaseCheckModal = false;">Cancel</Button>
        <Button type="primary" size="large" @click="doUndoRelease">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.exportModal" title="Export Receipt" width="600" :mask-closable="false">
      <Form :model="workPara" :label-width="120" style="padding-right: 60px;">
        <Row>
          <Col>
            <FormItem label="VESSEL VOYAGE">
              <Select v-model="exportPara.invoice_vessel_id" filterable clearable>
                <Option v-for="item in pagePara.VESSEL_VOYAGE" :value="item.invoice_vessel_id" :key="item.invoice_vessel_id">{{item.invoice_vessel}}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="VSL ATA">
              <DatePicker type="daterange" v-model="exportPara.invoice_vessel_ata" placeholder="Date" style="width: 386px" @on-change="vesselAtaChangeData"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="CUSTOMER">
              <Select v-model="exportPara.invoice_customer_id" filterable clearable>
                <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="D/O Date">
              <DatePicker type="daterange" v-model="exportPara.invoice_do_date" placeholder="Date" style="width: 386px" @on-change="doChangeData"></DatePicker>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.exportModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="exportReceiptData">Submit</Button>
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
const apiUrl = '/api/zhongtan/invoice/InvoiceReceipt/'

function formatCurrency(num) {
  num = num.toString().replace(/[^\d.-]/g, '') //转成字符串并去掉其中除数字, . 和 - 之外的其它字符。
  if (isNaN(num)) num = '0' //是否非数字值
  let sign = num == (num = Math.abs(num))
  num = Math.floor(num * 100 + 0.50000000001) //下舍入
  let cents = num % 100 //求余 余数 = 被除数 - 除数 * 商
  cents = cents < 10 ? '0' + cents : cents //小于2位数就补齐
  num = Math.floor(num / 100).toString()
  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    //每隔三位小数分始开隔
    //4 ==> 三位小数加一个分隔符，
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3))
  }
  return (sign ? '' : '-') + num + '.' + cents
}

export default {
  data: function() {
    return {
      modal: { receiptModal: false, collectModal: false, undoReleaseCheckModal: false, exportModal: false, checkPasswordModal: false },
      table: {
        masterbiTable: {
          columns: [
            {
              title: '#M B/L No',
              slot: 'invoice_masterbi_bl',
              width: 180
            },
            {
              title: 'Receipt',
              slot: 'Receipt',
              width: 90
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
              key: 'invoice_masterbi_freight',
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
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
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
              title: 'Action',
              slot: 'act',
              width: 100
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
          date: [
            moment()
              .subtract(30, 'days')
              .format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD')
          ],
          vesselName: '',
          bl: ''
        },
        current: '',
        height: common.getTableHeight()
      },
      deposit: {
        depositType: 'Container Deposit',
        fees: [],
        disableFlag: true,
        customer: {
          options: [],
          loading: false
        }
      },
      currentTab: 0,
      checkType: '',
      exportPara: {
        invoice_vessel_id: '',
        invoice_vessel_ata: '',
        invoice_customer_id: '',
        invoice_do_date: ''
      },
      checkPassword: '',
      receiptDisabled: true
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    await this.getPara()
    await this.getVoyageData()
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
    getVoyageData: async function() {
      try {
        let searchPara = {
          start_date: this.vessel.search_data.date[0],
          end_date: this.vessel.search_data.date[1],
          vesselName: this.vessel.search_data.vesselName,
          bl: this.vessel.search_data.bl,
          limit: 10,
          offset: 0
        }

        let response = await this.$http.post(apiUrl + 'searchVoyage', searchPara)
        let data = response.data.info
        this.vessel.data = JSON.parse(JSON.stringify(data.vessels))
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.masterbl.rows))
        this.table.masterbiTable.total = data.masterbl.total
        this.table.containersTable.data = []
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    checkVoyage: async function(invoice_vessel_id) {
      if (this.vessel.current != invoice_vessel_id) {
        this.vessel.current = invoice_vessel_id
        if (this.currentTab === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
      }
    },
    changeTab: function(name) {
      if (this.currentTab != name) {
        this.currentTab = name
        if (name === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
      }
    },
    getMasterbiData: async function(index) {
      if (index) {
        this.table.masterbiTable.offset = (index - 1) * this.table.masterbiTable.limit
      }
      let searchPara = {
        invoice_vessel_id: this.vessel.current,
        offset: this.table.masterbiTable.offset,
        limit: this.table.masterbiTable.limit
      }

      let response = await this.$http.post(apiUrl + 'getMasterbiData', searchPara)
      let data = response.data.info
      this.table.masterbiTable.total = data.total
      this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.rows))
    },
    getContainersData: async function(index) {
      if (index) {
        this.table.containersTable.offset = (index - 1) * this.table.containersTable.limit
      }
      let searchPara = {
        invoice_vessel_id: this.vessel.current,
        offset: this.table.containersTable.offset,
        limit: this.table.containersTable.limit
      }

      let response = await this.$http.post(apiUrl + 'getContainersData', searchPara)
      let data = response.data.info
      this.table.containersTable.total = data.total
      this.table.containersTable.data = JSON.parse(JSON.stringify(data.rows))
    },
    actReceiptModal: function(row) {
      this.$nextTick(function() {
        this.workPara = JSON.parse(JSON.stringify(row))
        if (!row.invoice_masterbi_receipt_currency) {
            this.workPara.invoice_masterbi_receipt_currency = 'USD'
        }
        if (!row.invoice_masterbi_check_cash) {
          this.workPara.invoice_masterbi_check_cash = 'TRANSFER'
        }
        this.workPara.invoice_masterbi_received_from = row.user_name
        if(row.invoice_masterbi_deposit_release_date && !row.invoice_masterbi_deposit_receipt_date) {
          this.checkType = 'deposit'
          if(row.invoice_masterbi_deposit_received_from) {
            this.workPara.invoice_masterbi_received_from = row.invoice_masterbi_deposit_received_from
          }
          this.workPara.invoice_masterbi_receipt_amount = formatCurrency(parseFloat(row.invoice_masterbi_deposit))
        } else if(row.invoice_masterbi_fee_release_date && !row.invoice_masterbi_invoice_receipt_date) {
          this.checkType = 'fee'
          if(row.invoice_masterbi_invoice_received_from) {
            this.workPara.invoice_masterbi_received_from = row.invoice_masterbi_invoice_received_from
          }
          this.workPara.invoice_masterbi_receipt_amount = 0
          if (row.invoice_masterbi_of) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_of)
          }
          if (row.invoice_masterbi_bl_amendment) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_bl_amendment)
          }
          if (row.invoice_masterbi_cod_charge) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_cod_charge)
          }
          if (row.invoice_masterbi_transfer) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_transfer)
          }
          if (row.invoice_masterbi_lolf) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_lolf)
          }
          if (row.invoice_masterbi_lcl) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_lcl)
          }
          if (row.invoice_masterbi_amendment) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_amendment)
          }
          if (row.invoice_masterbi_tasac) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_tasac)
          }
          if (row.invoice_masterbi_printing) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_printing)
          }
          if (row.invoice_masterbi_others) {
            this.workPara.invoice_masterbi_receipt_amount += parseFloat(row.invoice_masterbi_others)
          }
          this.workPara.invoice_masterbi_receipt_amount = formatCurrency(this.workPara.invoice_masterbi_receipt_amount)
        }
        this.$forceUpdate()
        this.modal.receiptModal = true
      })
    },
    downloadReceipt: async function() {
      try {
        this.workPara.checkType = this.checkType
        if (!this.workPara.checkType) {
          return this.$Message.error('Please choose receipt type')
        }
        let response = await this.$http.post(apiUrl + 'downloadReceipt', this.workPara)
        printJS(response.data.info.url)
        this.$Message.success('do success')
        this.modal.receiptModal = false
        if (this.currentTab === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    doRealse: async function(row, index) {
      try {
        await this.$http.post(apiUrl + 'doRelease', { file_id: row.file_id })
        if (this.currentTab === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
        this.$Message.success('release success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    changeType: function() {
      if (this.checkType === 'deposit') {
        if(this.workPara.invoice_masterbi_deposit_received_from) {
          this.workPara.invoice_masterbi_received_from = this.workPara.invoice_masterbi_deposit_received_from
        }
        this.workPara.invoice_masterbi_receipt_currency = this.workPara.invoice_container_deposit_currency
        this.workPara.invoice_masterbi_receipt_amount = formatCurrency(parseFloat(this.workPara.invoice_masterbi_deposit))
      } else if (this.checkType === 'freight') {
        this.workPara.invoice_masterbi_receipt_currency = this.workPara.invoice_ocean_freight_fee_currency
        this.workPara.invoice_masterbi_receipt_amount = formatCurrency(parseFloat(this.workPara.invoice_masterbi_of))
      } else {
        if(this.workPara.invoice_masterbi_invoice_received_from) {
          this.workPara.invoice_masterbi_received_from = this.workPara.invoice_masterbi_invoice_received_from
        }
        this.workPara.invoice_masterbi_receipt_currency = this.workPara.invoice_fee_currency
        this.workPara.invoice_masterbi_receipt_amount = 0
        if (this.workPara.invoice_masterbi_of) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_of)
        }
        if (this.workPara.invoice_masterbi_bl_amendment) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_bl_amendment)
        }
        if (this.workPara.invoice_masterbi_cod_charge) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_cod_charge)
        }
        if (this.workPara.invoice_masterbi_transfer) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_transfer)
        }
        if (this.workPara.invoice_masterbi_lolf) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_lolf)
        }
        if (this.workPara.invoice_masterbi_lcl) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_lcl)
        }
        if (this.workPara.invoice_masterbi_amendment) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_amendment)
        }
        if (this.workPara.invoice_masterbi_tasac) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_tasac)
        }
        if (this.workPara.invoice_masterbi_printing) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_printing)
        }
        if (this.workPara.invoice_masterbi_others) {
          this.workPara.invoice_masterbi_receipt_amount += parseFloat(this.workPara.invoice_masterbi_others)
        }
        this.workPara.invoice_masterbi_receipt_amount = formatCurrency(this.workPara.invoice_masterbi_receipt_amount)
      }
    },
    actCollectModal: function() {
      this.workPara = {}
      this.modal.collectModal = true
    },
    downloadCollect: async function() {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'downloadCollect',
          method: 'post',
          data: this.workPara,
          responseType: 'blob'
        })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = this.workPara.carrier + '- receipt from.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    undoReleaseModal(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.modal.undoReleaseCheckModal = true
    },
    doUndoRelease: async function() {
      try {
        let _self = this
        if(!_self.workPara.undo_release_password) {
          return _self.$Message.error('Please enter right password')
        }
        _self.$commonact.confirm(`undo this release?`, async () => {
          try {
            await _self.$http.post(apiUrl + 'doUndoRelease', { file_id: _self.workPara.file_id, undo_release_password: common.md52( _self.workPara.undo_release_password) })
            if (this.currentTab === 0) {
              this.getMasterbiData(1)
            } else {
              this.getContainersData(1)
            }
            _self.$Message.success('undo release success')
            _self.modal.undoReleaseCheckModal = false
          } catch (error) {
            _self.$commonact.fault(error)
          }
        })
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actExportModal: async function() {
      this.exportPara.invoice_vessel_id = ''
      this.exportPara.invoice_vessel_ata = ''
      this.exportPara.invoice_customer_id = ''
      this.exportPara.invoice_do_date = ''
      this.modal.exportModal = true
    },
    vesselAtaChangeData: function(e) {
      this.exportPara.invoice_vessel_ata = JSON.parse(JSON.stringify(e))
    },
    doChangeData: function(e) {
      this.exportPara.invoice_do_date = JSON.parse(JSON.stringify(e))
    },
    exportReceiptData: async function() {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'exportReceipt',
          method: 'post',
          data: this.exportPara,
          responseType: 'blob'
        })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'receipt' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    receiptEditAct: function(item) {
      try {
        this.checkPassword = ''
        this.modal.checkPasswordModal = true
        this.checkPasswordType = 'receiptEdit'
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actCheckPassword: async function() {
      try {
        if(!this.checkPassword) {
          return this.$Message.error('Please enter right password')
        }
        await this.$http.post(apiUrl + 'checkPassword', { check_password: common.md52(this.checkPassword)})
        this.modal.checkPasswordModal = false
        if(this.checkPasswordType === 'receiptEdit') {
          this.receiptDisabled = false
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
  }
}
</script>