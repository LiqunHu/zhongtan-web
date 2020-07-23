<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Equipment Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Empty Stock Management
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Empty Stock Management">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              ATA&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.ata_date" placeholder="ATA Date" style="width: 180px" @on-change="searchAtaDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              GATE IN&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.gate_in_date" placeholder="GATE IN Date" style="width: 180px" @on-change="searchGateInDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              GATE OUT&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.gate_out_date" placeholder="GATE OUT Date" style="width: 180px" @on-change="searchGateOutDate"></DatePicker>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportTableData">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
          <div class="form-inline" style="margin-top: 10px;">
            <div class="form-group m-r-2">
              <input type="number" class="form-control" v-model.number="search_data.storing_min_days" placeholder="Storing MIN Days" style="width: 105px" />
              <input type="number" class="form-control" v-model.number="search_data.storing_max_days" placeholder="Storing MIN Days" style="width: 105px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_vessel_name" placeholder="Vessel Name" style="width: 180px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_bl" placeholder="Vessel Name" style="width: 180px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.invoice_containers_no" placeholder="Container No" style="width: 180px" />
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="invoice_containers_size">
            {{row.invoice_containers_size}} [
            <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.invoice_containers_size">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-primary btn-icon btn-sm" @click.prevent="editModal(row)">
            <i class="fa fa-edit "/>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTable.total" show-sizer :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
      <Modal v-model="modal.editModal" title="Overdue Calculation" width="600">
        <Form ref="containerForm" :model="containerForm" :label-width="200" style="padding-right: 80px;">
          <FormItem label="Gate Out Terminal Date">
            <DatePicker type="date" placeholder="Gate Out Terminal Date" v-model="containerForm.invoice_containers_gate_out_terminal_date" format="dd/MM/yyyy" @on-change="gateOutTerminalChange"></DatePicker>
          </FormItem>
          <FormItem label="Gate In Terminal Date">
            <DatePicker type="date" placeholder="Gate In Terminal Date" v-model="containerForm.invoice_containers_gate_in_terminal_date" format="dd/MM/yyyy" @on-change="gateInTerminalChange"></DatePicker>
          </FormItem>
          <FormItem label="Remark">
            <i-input type="textarea" v-model="containerForm.invoice_containers_gate_remark" placeholder="Please Input ..."></i-input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="modal.editModal = false">Cancel</Button>
          <Button type="primary" size="large" @click="editAct">Submit</Button>
        </div>
      </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/EmptyStockManagement/'

export default {
  name: 'EmptyStockManagement',
  data: function() {
    return {
      modal: { editModal: false },
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'Container#',
              key: 'invoice_containers_no',
              width: 130,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'invoice_containers_size',
              width: 120,
              align: 'center'
            },
            {
              title: 'Line',
              key: 'invoice_containers_bl_line',
              width: 80,
              align: 'center'
            },
            {
              title: 'Discharge Date',
              key: 'invoice_vessel_ata',
              width: 140,
              align: 'center'
            },
            {
              title: 'Gate Out Terminal Date',
              key: 'invoice_containers_gate_out_terminal_date',
              width: 120,
              align: 'center',
            },
            {
              title: 'Gate In Terminal Date',
              key: 'invoice_containers_gate_in_terminal_date',
              width: 120,
              align: 'center',
            },
            {
              title: 'Depot Name',
              key: 'invoice_containers_depot_name',
              width: 120,
              align: 'center',
            },
            {
              title: 'Gate In Depot Date',
              key: 'invoice_containers_actually_return_date',
              width: 120,
              align: 'center',
            },
            {
              title: 'Detention Days',
              key: 'invoice_containers_detention_days',
              width: 120,
              align: 'center',
            },
            {
              title: 'Gate Out Depot Date',
              key: 'invoice_containers_actually_gate_out_date',
              width: 120,
              align: 'center',
            },
            {
              title: 'Storing Days',
              key: 'invoice_containers_storing_days',
              width: 120,
              align: 'center',
            },
            {
              title: 'Remark',
              key: 'invoice_containers_gate_remark',
              width: 200,
              align: 'center',
            },
            {
              title: 'Act',
              slot: 'action',
              width: 80,
              align: 'center',
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      search_data: {
        ata_date: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        gate_in_date: '',
        gate_out_date: '',
        storing_min_days: '',
        storing_max_days: '',
        invoice_vessel_name: '',
        invoice_containers_bl: '',
        invoice_containers_no: ''
      },
      containerForm: {}
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
    searchAtaDate: function(e) {
      this.search_data.ata_date = JSON.parse(JSON.stringify(e))
    },
    searchGateInDate: function(e) {
      this.search_data.gate_in_date = JSON.parse(JSON.stringify(e))
    },
    searchGateOutDate: function(e) {
      this.search_data.gate_out_date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.containerTable.offset = (index - 1) * this.table.containerTable.limit
        }
        let searchPara = {
          search_data: this.search_data,
          offset: this.table.containerTable.offset,
          limit: this.table.containerTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.containerTable.total = data.total
        this.table.containerTable.data = JSON.parse(JSON.stringify(data.rows))
        if(this.table.containerTable.data) {
          for(let d of this.table.containerTable.data) {
            if((d.invoice_containers_laden_release_date && d.invoice_containers_laden_release_overdue_amount && parseInt(d.invoice_containers_laden_release_overdue_amount) > 0) || (d.invoice_containers_empty_return_date && d.invoice_containers_empty_return_overdue_amount && parseInt(d.invoice_containers_empty_return_overdue_amount) > 0)) {
              d._disabled = false
            } else {
              d._disabled = true
            }
          }
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetTableSizer: function(pageSizer) {
        this.table.containerTable.limit = pageSizer
        this.getTableData(1)
    },
    editModal: async function(row) {
      try {
        this.containerForm = Object.assign({}, row)
        this.modal.editModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    gateOutTerminalChange: async function(date) {
      this.containerForm.invoice_containers_gate_out_terminal_date = date
    },
    gateInTerminalChange: async function(date) {
      this.containerForm.invoice_containers_gate_in_terminal_date = date
    },
    editAct: async function() {
      try {
        await this.$http.post(apiUrl + 'saveContainer', this.containerForm)
        this.modal.editModal = false
        this.getTableData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    exportTableData: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'exportEmptyStock',
            method: 'post',
            data: {search_data: this.search_data},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Empty Stock Management ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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
