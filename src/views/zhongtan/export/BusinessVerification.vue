<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Business Verification</a>
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
              <DatePicker type="daterange" :value="search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.verification_state" style="width:180px" placeholder="State" @on-change="getTableData">
                <Option v-for="item in pagePara.RELEASE_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="search_data.verification_vessel_id" filterable placeholder="Vessel Voyage" style="width:180px">
                <Option v-for="item in pagePara.VESSEL_VOYAGES" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel_voyage }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.release_party" clearable filterable :remote-method="remoteEmptyReleaseParty">
                <Option v-for="(item, index) in emptyReleaseParty" :value="item.user_id" :key="index" :label="item.user_name" :disabled="item.user_blacklist === '1'">
                  <span>{{item.user_name}}</span>
                  <Tag color="success" v-if="item.user_customer_type === '1'" style="float: right;">AGEN</Tag>
                  <Tag color="warning" v-if="item.user_customer_type === '2'" style="float: right;">CNEE</Tag>
                  <Tag color="error" v-if="item.user_blacklist === '1'" style="float: right;">BLACK</Tag>
                </Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportAct">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="checkTable" highlight-row	:columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height" @on-row-click="clickCheckTable">
        <template slot-scope="{ row, index }" slot="release_party">
          <p v-if="row.export_verification_api_name === 'EMPTY RELEASE'">
            {{row.empty_release_party}}
          </p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-primary btn-icon btn-sm" @click.stop="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.export_verification_state == 'PM'" href="#" class="btn btn-danger btn-icon btn-sm" @click.stop="decline(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="attachments">
          <span v-if="row.attachments">
            <a v-for="(item, index) in row.attachments" v-bind:key="index" :href="item.uploadfile_url" class="btn btn-primary btn-icon btn-sm" target="_blank">
              <i class="fa fa-download"></i>
            </a>
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="export_vessel_voyage">
          {{row.export_vessel_name}} / {{row.export_vessel_voyage}}
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
              <Col span="4"><font style="color:#17233D; font-size: 16px;">Size/Type: </font>{{verificationDetail.shipment_size_type}}</Col>
            </Row>
          </Card>
          <Card>
            <p slot="title">RECEIVABLE</p>
            <Table ref="receivableTable" :columns="table.receivableTable.columns" :data="verificationDetail.verification_shipment.receiveable" v-if="verificationDetail && verificationDetail.verification_shipment && verificationDetail.verification_shipment.receiveable">
              <template slot-scope="{ row, index }" slot="shipment_fee_status_now">
                <Tag color="default" v-if="row.shipment_fee_status === 'NE'">NEW</Tag>
                <Tag color="primary" v-else-if="row.shipment_fee_status === 'SA'">SAVE</Tag>
                <Tag color="primary" v-else-if="row.shipment_fee_status === 'SU'">SUBMIT</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'AP'">APPROVE</Tag>
                <Tag color="error" v-else-if="row.shipment_fee_status === 'DE'">DECLINE</Tag>
                <Tag color="error" v-else-if="row.shipment_fee_status === 'UN'">UNDO</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'IN'">INVOICE</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'RE'">RECEIPT</Tag>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee">
                {{row.fee_data_code}}-{{row.fee_data_name}}
              </template>
            </Table>
            <p v-else>No Receivable List</p>
          </Card>
          <Card style="margin-top:10px;">
            <p slot="title">PAYABLE</p>
            <Table ref="payableTable" :columns="table.payableTable.columns" :data="verificationDetail.verification_shipment.payable" v-if="verificationDetail && verificationDetail.verification_shipment && verificationDetail.verification_shipment.payable">
              <template slot-scope="{ row, index }" slot="shipment_fee_status_now">
                <Tag color="default" v-if="row.shipment_fee_status === 'NE'">NEW</Tag>
                <Tag color="primary" v-else-if="row.shipment_fee_status === 'SA'">SAVE</Tag>
                <Tag color="primary" v-else-if="row.shipment_fee_status === 'SU'">SUBMIT</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'AP'">APPROVE</Tag>
                <Tag color="error" v-else-if="row.shipment_fee_status === 'DE'">DECLINE</Tag>
                <Tag color="error" v-else-if="row.shipment_fee_status === 'UN'">UNDO</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'IN'">INVOICE</Tag>
                <Tag color="success" v-else-if="row.shipment_fee_status === 'RE'">RECEIPT</Tag>
              </template>
              <template slot-scope="{ row, index }" slot="shipment_fee">
                {{row.fee_data_code}}-{{row.fee_data_name}}
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
const apiUrl = '/api/zhongtan/export/BusinessVerification/'

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
              title: 'Cargo Descriptions',
              key: 'export_masterbl_cargo_descriptions',
              width: 200
            },
            {
              title: 'Release Party',
              slot: 'release_party',
              width: 300
            },
            {
              title: 'Action',
              slot: 'action',
              width: 150
            },
            {
              title: 'Attachments',
              slot: 'attachments',
              width: 100
            },
            {
              title: 'Vessel Voyage',
              slot: 'export_vessel_voyage',
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
              title: 'DEPOT',
              key: 'export_verification_depot',
              width: 150
            },
            {
              title: 'QTY',
              key: 'export_verification_quantity',
              width: 150
            },
            {
              title: 'ETD',
              key: 'export_vessel_etd',
              width: 150
            },
            {
              title: 'Validity',
              key: 'export_masterbl_empty_release_valid_to',
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
              key: 'shipment_party',
            },
            {
              title: 'Fee',
              align: 'center',
              slot: 'shipment_fee',
            },
            {
              title: 'Fee Amount',
              align: 'center',
              key: 'shipment_fee_amount',
            },
            {
              title: 'Submit',
              align: 'center',
              key: 'submit_user',
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
              key: 'shipment_party',
            },
            {
              title: 'Fee',
              align: 'center',
              slot: 'shipment_fee',
            },
            {
              title: 'Fee Amount',
              align: 'center',
              key: 'shipment_fee_amount',
            },
            {
              title: 'Submit',
              align: 'center',
              key: 'submit_user',
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
        verification_vessel_id: '',
        bl: '',
      },
      modal: { invoiceDetail: false, verificationTimeline: false},
      workPara: {},
      verificationTitle: '',
      timelinePara: [],
      verificationDetailModal: false,
      verificationDetail: {},
      emptyReleaseParty: []
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
          verification_vessel_id: this.search_data.verification_vessel_id,
          bl: this.search_data.bl,
          release_party: this.search_data.release_party,
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
      if(row.export_verification_api_name === 'SHIPMENT RELEASE') {
        let response = await this.$http.post(apiUrl + 'verificationDetail', row)
        this.verificationDetail = response.data.info
        if(this.verificationDetail) {
          this.verificationDetailModal = true
        }
      }
    },
    exportAct: async function() {
      try {
        let searchPara = {
          start_date: this.search_data.date[0],
          end_date: this.search_data.date[1],
          verification_state: this.search_data.verification_state,
          verification_vessel_id: this.search_data.verification_vessel_id,
          bl: this.search_data.bl,
          release_party: this.search_data.release_party
        }
        let response = await this.$http.request({
            url: apiUrl + 'export',
            method: 'post',
            data: searchPara,
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Export Business Verification.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    remoteEmptyReleaseParty: async function(query) {
      if(query) {
        let param = {
          query: query
        }
        let response = await this.$http.post(apiUrl + 'getEmptyReleaseParty', param)
        this.$nextTick(function() {
          let data = response.data.info
          this.emptyReleaseParty = data.agents ? JSON.parse(JSON.stringify(data.agents)) : []
        })
      }
    },
  }
}
</script>
<style>
.timeline-time{
  font-size: 14px;
  font-weight: bold;
}
.timeline-content{
  padding-left: 5px;
}
</style>