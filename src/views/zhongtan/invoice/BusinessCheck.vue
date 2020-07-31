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
      <small>Business Verification...</small>
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
              <Select clearable v-model="search_data.upload_state" style="width:180px" @on-change="getTableData">
                <Option v-for="item in pagePara.UPLOAD_STATE" :value="item.id" :key="item.id">{{ item.text }}</Option>
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
      <Table stripe size="small" ref="checkTable" :columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height">
        <template slot-scope="{ row, index }" slot="amount">
          <span v-if="row.receipt_type === 'Fixed Invoice'">{{row.fixed_deposit_amount}}</span>
          <span v-if="row.receipt_type === 'Overdue Invoice'">{{row.overdue_invoice_amount}}</span>
          <span v-if="row.receipt_type === 'MNR Invoice'">{{row.mnr_amount}}</span>
          <span v-if="row.receipt_type === 'Deposit Amount'">{{row.deposit}}</span>
          <Poptip v-if="row.receipt_type === 'Invoice Fee'" trigger="hover" placement="bottom-start" :transfer="true" width="300">
            <span>{{row.feeTotal}}</span>
            <template slot="content">
              <Row v-if="row.of">
                <i-col span="12">OCEAN FREIGHT</i-col>
                <i-col span="6" offset="6">{{row.of}}</i-col>
              </Row>
              <Row v-if="row.blAmendment">
                <i-col span="12">B/L amendment</i-col>
                <i-col span="6" offset="6">{{row.blAmendment}}</i-col>
              </Row>
              <Row v-if="row.codCharge">
                <i-col span="12">COD Charge</i-col>
                <i-col span="6" offset="6">{{row.codCharge}}</i-col>
              </Row>
              <Row v-if="row.transfer">
                <i-col span="12">CONTAINER TRANSFER</i-col>
                <i-col span="6" offset="6">{{row.transfer}}</i-col>
              </Row>
              <Row v-if="row.lolf">
                <i-col span="12">LIFT ON LIFT OFF</i-col>
                <i-col span="6" offset="6">{{row.lolf}}</i-col>
              </Row>
              <Row v-if="row.lcl">
                <i-col span="12">LCL</i-col>
                <i-col span="6" offset="6">{{row.lcl}}</i-col>
              </Row>
              <Row v-if="row.amendment">
                <i-col span="12">AMENDMENT</i-col>
                <i-col span="6" offset="6">{{row.amendment}}</i-col>
              </Row>
              <Row v-if="row.tasac">
                <i-col span="12">TASAC</i-col>
                <i-col span="6" offset="6">{{row.tasac}}</i-col>
              </Row>
              <Row v-if="row.printing">
                <i-col span="12">BILL PRINGTING</i-col>
                <i-col span="6" offset="6">{{row.printing}}</i-col>
              </Row>
              <Row v-if="row.others">
                <i-col span="12">OTHERS</i-col>
                <i-col span="6" offset="6">{{row.others}}</i-col>
              </Row>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a v-if = "row.upload_state == 'PB' && ((row.receipt_type !== 'Guarantee Letter' && row.receipt_type !== 'Fixed Invoice') || row.deposit_work_state === 'N')" href="#" class="btn btn-primary btn-icon btn-sm" @click="approve(row)">
            <i class="fa fa-check"></i>
          </a>
          <a v-if = "row.upload_state == 'PB' && ((row.receipt_type !== 'Guarantee Letter' && row.receipt_type !== 'Fixed Invoice') || row.deposit_work_state === 'N')" href="#" class="btn btn-danger btn-icon btn-sm" @click="decline(row)">
            <i class="fa fa-times"></i>
          </a>
          <a v-if = "row.receipt_type === 'Deposit Amount' || row.receipt_type === 'Invoice Fee' " href="#" class="btn btn-success btn-icon btn-sm" @click.prevent="actInvoiceDetailModal(row)">
            <Icon type="md-link" />
          </a>
          <a v-if = "row.receipt_type === 'Overdue Invoice'" href="#" class="btn btn-success btn-icon btn-sm" @click.prevent="actOverdueInvoiceDetailModal(row)">
            <Icon type="md-link" />
          </a>
          <a v-if = "row.receipt_type === 'MNR Invoice'" href="#" class="btn btn-success btn-icon btn-sm" @click.prevent="actMNRInvoiceDetailModal(row)">
            <Icon type="md-link" />
          </a>
          <a href="#" class="btn btn-default btn-icon btn-sm" @click.prevent="actVerificationTimelineModal(row)">
            <Icon type="md-options" />
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.invoiceDetail" title="Business Check" width="600">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col span="6">
            <span>Vessel Name</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_vessel_name }}</label>
          </Col>
          <Col span="6">
            <span>Vessel Voyage</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_vessel_voyage }}</label>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <span>#M B/L No</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_masterbi_bl }}</label>
          </Col>
          <Col span="6">
            <span>Cargo Classification</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_masterbi_cargo_type }} / {{ workPara.invoice_masterbi_freight }}</label>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <span>Port of Loading</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_masterbi_loading }}</label>
          </Col>
          <Col span="6">
            <span>Place of Destination</span>
          </Col>
          <Col span="6">
            <label> {{ workPara.invoice_masterbi_destination }}</label>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <span>Container Size</span>
          </Col>
          <Col span="18">
            <label style='white-space:pre;'> {{ workPara.container_size_type }}</label>
          </Col>
        </Row>
        <Table v-if="workPara.invoice_contaienrs" stripe size="small" :columns="table.overdueTable.columns" :data="workPara.invoice_contaienrs"></Table>
        <Table v-if="workPara.mnr_containers" stripe size="small" :columns="table.mnrTable.columns" :data="workPara.mnr_containers"></Table>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.invoiceDetail=false">Cancel</Button>
      </div>
    </Modal>
    <Modal v-model="modal.verificationTimeline" :title="verificationTitle">
      <Timeline>
        <TimelineItem v-for="(item, index) in timelinePara" v-bind:key="item.verification_log_id">
            <p class="timeline-time">{{item.created_at}}</p>
            <p class="timeline-content">{{item.user_name}}</p>
            <p class="timeline-content">{{item.uploadfile_state_pre}} => {{item.uploadfile_state}}</p>
        </TimelineItem>
      </Timeline>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.verificationTimeline=false">Cancel</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/BusinessCheck/'

export default {
  data: function() {
    return {
      table: {
        checkTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'invoice_masterbi_bl',
              width: 150
            },
            {
              title: 'Customer',
              key: 'invoice_customer_name',
            },
            {
              title: 'Action',
              slot: 'action',
              width: 150
            },
            {
              title: 'Receipt Type',
              key: 'receipt_type',
              width: 150
            },
            {
              title: 'State',
              key: 'upload_state',
              render: common.selectRender(this, 'UPLOAD_STATE'),
              width: 150
            },
            {
              title: 'Apply Name',
              key: 'user_name',
              width: 150
            },
            {
              title: 'Amount',
              slot: 'amount',
              width: 150
            },
            {
              title: 'COMMENT',
              key: 'comment',
              render: common.tooltipCellLengthRender(20)
            },
            {
              title: 'Create At',
              key: 'uploadfile_created_at',
            }
          ],
          data: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        },
        overdueTable: {
          columns: [
            {
              title: 'Contaienr No',
              key: 'invoice_containers_no',
              width: 120
            },
            {
              title: 'Size',
              key: 'invoice_containers_size',
            },
            {
              title: 'Return Date',
              key: 'overdue_invoice_containers_return_date',
            },
            {
              title: 'Days',
              key: 'overdue_invoice_containers_overdue_days',
            },
            {
              title: 'Amount',
              key: 'overdue_invoice_containers_overdue_amount',
            },
          ],
          data: []
        },
        mnrTable: {
          columns: [
            {
              title: 'Contaienr#',
              key: 'mnr_ledger_container_no',
              width: 120
            },
            {
              title: 'D/V Amount',
              key: 'mnr_ledger_dv_amount',
            },
            {
              title: 'Actual',
              key: 'mnr_ledger_actual_charge_amount',
            },
            {
              title: 'Declaring',
              key: 'mnr_ledger_loss_declaring_date',
            },
            {
              title: 'Payment',
              key: 'mnr_ledger_payment_date',
            },
          ],
          data: []
        }
      },
      pagePara: {},
      search_data: {
        date: [
          moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD'),
          moment().format('YYYY-MM-DD')
        ],
        upload_state: 'PB',
        bl: '',
      },
      modal: { invoiceDetail: false, verificationTimeline: false},
      workPara: {},
      verificationTitle: '',
      timelinePara: []
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
          upload_state: this.search_data.upload_state,
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
        await this.$http.post(apiUrl + 'approve', { uploadfile_id: row.uploadfile_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    decline: async function(row) {
      try {
        await this.$http.post(apiUrl + 'decline', { uploadfile_id: row.uploadfile_id })
        this.getTableData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actInvoiceDetailModal: async function(row) {
      try {
        let response = await this.$http.post(apiUrl + 'getInvoiceDetail', { invoice_masterbi_id: row.invoice_masterbi_id })
        this.workPara = response.data.info
        this.modal.invoiceDetail = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actOverdueInvoiceDetailModal: async function(row) {
      try {
        let response = await this.$http.post(apiUrl + 'getOverdueInvoiceDetail', { invoice_masterbi_id: row.invoice_masterbi_id, uploadfile_id: row.uploadfile_id })
        this.workPara = response.data.info
        this.modal.invoiceDetail = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actMNRInvoiceDetailModal: async function(row) {
      try {
        let response = await this.$http.post(apiUrl + 'getMNRInvoiceDetail', { container_mnr_ledger_id: row.container_mnr_ledger_id})
        this.workPara = response.data.info
        this.modal.invoiceDetail = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actVerificationTimelineModal: async function(row) {
      try {
        let response = await this.$http.post(apiUrl + 'getTimeline', { uploadfile_id: row.uploadfile_id})
        this.timelinePara = response.data.info
        if(this.timelinePara && this.timelinePara.length > 0) {
          this.verificationTitle = row.invoice_masterbi_bl + ' : ' + row.receipt_type
          this.modal.verificationTimeline = true
        }else {
          this.$Message.warning('no verification records')
        }
      } catch (error) {
        this.$commonact.fault(error)
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
.timeline-content{
  padding-left: 5px;
}
</style>