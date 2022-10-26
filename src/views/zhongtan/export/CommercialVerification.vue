<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Commercial Verification</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Commercial Verification
    </h1>
    <!-- end page-header -->
    <panel title="Commercial Verification">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.verification_state" style="width:180px" @on-change="getTableData">
                <Option v-for="item in pagePara.RELEASE_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
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
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-primary btn-icon btn-sm" @click.stop="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-danger btn-icon btn-sm" @click.stop="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
      <Drawer :closable="false" width="50%" inner v-model="verificationDetailModal">
        <div style="padding-top: 40px;">
          <Card>
            <div slot="title">
              #M B/L No. {{verificationDetail.export_masterbl_bl}}
              <Tag color="primary">{{verificationDetail.export_masterbl_cargo_type}}</Tag>
            </div>
            <div slot="extra">
              <Tag color="success">RECEIVABLE: ${{verificationDetail.shipment_receivable}}</Tag>
              <Tag color="warning">PAYABLE: ${{verificationDetail.shipment_payable}}</Tag>
            </div>
            <Row>
              <Col span="4"><font style="color:#17233D; font-size: 16px;">Vessel: </font>{{verificationDetail.export_vessel_name}}</Col>
              <Col span="4"><font style="color:#17233D; font-size: 16px;">Voyage: </font>{{verificationDetail.export_vessel_voyage}}</Col>
              <Col span="5"><font style="color:#17233D; font-size: 16px;">Size/Type: </font>{{verificationDetail.shipment_size_type}}</Col>
              <Col span="5"><font style="color:#17233D; font-size: 16px;">POL: </font>{{verificationDetail.export_masterbl_port_of_load}}</Col>
              <Col span="5"><font style="color:#17233D; font-size: 16px;">POD: </font>{{verificationDetail.export_masterbl_port_of_discharge}}</Col>
            </Row>
          </Card>
          <Card>
            <p slot="title">RECEIVABLE</p>
            <Table ref="receivableTable" :columns="table.receivableTable.columns" :data="verificationDetail.verification_shipment.receiveable" v-if="verificationDetail && verificationDetail.verification_shipment && verificationDetail.verification_shipment.receiveable">
              <template slot-scope="{ row, index }" slot="shipment_fee_status_now">
                <div v-if="row.this_submit_fee ==='1'">
                  <Tag color="default" v-if="row.shipment_fee_status_now === 'NE'">NEW</Tag>
                  <Tag color="primary" v-else-if="row.shipment_fee_status_now === 'SA'">SAVE</Tag>
                  <Tag color="primary" v-else-if="row.shipment_fee_status_now === 'SU'">SUBMIT</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'AP'">APPROVE</Tag>
                  <Tag color="error" v-else-if="row.shipment_fee_status_now === 'DE'">DECLINE</Tag>
                  <Tag color="error" v-else-if="row.shipment_fee_status_now === 'UN'">UNDO</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'IN'">INVOICE</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'RE'">RECEIPT</Tag>
                </div>
                <div v-else>
                  <Tag color="default" v-if="row.shipment_fee_status_now === 'NE'">NEW</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'SA'">SAVE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'SU'">SUBMIT</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'AP'">APPROVE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'DE'">DECLINE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'UN'">UNDO</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'IN'">INVOICE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'RE'">RECEIPT</Tag>
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_party">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.shipment_party}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.shipment_party}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.fee_data_code}}-{{row.fee_data_name}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.fee_data_code}}-{{row.fee_data_name}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee_amount">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.shipment_fee_amount}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.shipment_fee_amount}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="submit_user">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.submit_user}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.submit_user}}
                </div>
              </template>
            </Table>
            <p v-else>No Receivable List</p>
          </Card>
          <Card style="margin-top:10px;">
            <p slot="title">PAYABLE</p>
            <Table ref="payableTable" :columns="table.payableTable.columns" :data="verificationDetail.verification_shipment.payable" v-if="verificationDetail && verificationDetail.verification_shipment && verificationDetail.verification_shipment.payable">
              <template slot-scope="{ row, index }" slot="shipment_fee_status_now">
                <div v-if="row.this_submit_fee ==='1'">
                  <Tag color="default" v-if="row.shipment_fee_status_now === 'NE'">NEW</Tag>
                  <Tag color="primary" v-else-if="row.shipment_fee_status_now === 'SA'">SAVE</Tag>
                  <Tag color="primary" v-else-if="row.shipment_fee_status_now === 'SU'">SUBMIT</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'AP'">APPROVE</Tag>
                  <Tag color="error" v-else-if="row.shipment_fee_status_now === 'DE'">DECLINE</Tag>
                  <Tag color="error" v-else-if="row.shipment_fee_status_now === 'UN'">UNDO</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'IN'">INVOICE</Tag>
                  <Tag color="success" v-else-if="row.shipment_fee_status_now === 'RE'">RECEIPT</Tag>
                </div>
                <div v-else>
                  <Tag color="default" v-if="row.shipment_fee_status_now === 'NE'">NEW</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'SA'">SAVE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'SU'">SUBMIT</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'AP'">APPROVE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'DE'">DECLINE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'UN'">UNDO</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'IN'">INVOICE</Tag>
                  <Tag color="default" v-else-if="row.shipment_fee_status_now === 'RE'">RECEIPT</Tag>
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_party">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.shipment_party}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.shipment_party}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.fee_data_code}}-{{row.fee_data_name}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.fee_data_code}}-{{row.fee_data_name}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee_amount">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.shipment_fee_amount}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.shipment_fee_amount}}
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="submit_user">
                <div v-if="row.this_submit_fee ==='1'">
                  {{row.submit_user}}
                </div>
                <div v-else style="color:#ccc;">
                  {{row.submit_user}}
                </div>
              </template>
            </Table>
            <p v-else>No Payable List</p>
          </Card>
        </div>
      </Drawer>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/CommercialVerification/'

export default {
  data: function() {
    return {
      table: {
        checkTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'export_masterbl_bl',
              width: 150
            },
            {
              title: 'Cargo Type',
              key: 'export_masterbl_cargo_type',
              width: 150
            },
            {
              title: 'Action',
              slot: 'action',
              width: 150
            },
            {
              title: 'Verification Type',
              key: 'export_verification_api_name',
              width: 150
            },
            {
              title: 'State',
              key: 'export_verification_state',
              render: common.selectRender(this, 'RELEASE_STATE'),
              width: 200
            },
            {
              title: 'INVOICE AMOUNT',
              key: 'export_verification_invoice_amount',
              width: 150
            },
            {
              title: 'RECEIVABLE',
              key: 'export_verification_shipment_receivable',
              width: 150
            },
            {
              title: 'PAYABLE',
              key: 'export_verification_shipment_payable',
              width: 150
            },
            {
              title: 'Create By',
              key: 'apply_user',
              width: 200
            },
            {
              title: 'Create At',
              key: 'created_at',
              width: 200
            },
            {
              title: 'Review By',
              key: 'review_user',
              width: 200
            },
            {
              title: 'Review At',
              key: 'review_at',
              width: 200
            }
          ],
          data: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        },
        receivableTable: {
          columns:[
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Status',
              align: 'center',
              slot: 'shipment_fee_status_now',
            },
            {
              title: 'Party',
              align: 'center',
              slot: 'shipment_party',
            },
            {
              title: 'Fee',
              align: 'center',
              slot: 'shipment_fee',
            },
            {
              title: 'Fee Amount',
              align: 'center',
              slot: 'shipment_fee_amount',
            },
            {
              title: 'Submit',
              align: 'center',
              slot: 'submit_user',
            }
          ],
          data: [],
          removeDisabled: true,
          height: 0
        },
        payableTable: {
          columns:[
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Status',
              align: 'center',
              slot: 'shipment_fee_status_now',
            },
            {
              title: 'Party',
              align: 'center',
              slot: 'shipment_party',
            },
            {
              title: 'Fee',
              align: 'center',
              slot: 'shipment_fee',
            },
            {
              title: 'Fee Amount',
              align: 'center',
              slot: 'shipment_fee_amount',
            },
            {
              title: 'Submit',
              align: 'center',
              slot: 'submit_user',
            }
          ],
          data: [],
          removeDisabled: true,
          height: 0
        }
      },
      pagePara: {},
      search_data: {
        date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        verification_state: 'PM',
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
      try {
        await this.$http.post(apiUrl + 'approve', { export_verification_id: row.export_verification_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    decline: async function(row) {
      try {
        await this.$http.post(apiUrl + 'decline', { export_verification_id: row.export_verification_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    clickCheckTable: async function(row) {
      if(row.export_verification_api_name === 'SHIPMENT RELEASE' || row.export_verification_api_name === 'BK CANCELLATION') {
        let response = await this.$http.post(apiUrl + 'verificationDetail', row)
        this.verificationDetail = response.data.info
        if(this.verificationDetail) {
          this.verificationDetailModal = true
        }
      }
    }
  }
}
</script>
<style>
.timeline-time{
  font-size: 14px;
  font-weight: bold;
}
</style>