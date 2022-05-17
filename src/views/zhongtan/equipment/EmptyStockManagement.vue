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
              Discharg Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.discharge_date" placeholder="Discharg Date" style="width: 180px" @on-change="searchDischargeDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              GATE IN&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.gate_in_depot_date" placeholder="GATE IN Date" style="width: 180px" @on-change="searchGateInDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              GATE OUT&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.gate_out_depot_date" placeholder="GATE OUT Date" style="width: 180px" @on-change="searchGateOutDate"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              Loading Date&nbsp;&nbsp;<DatePicker type="daterange" :value="search_data.loading_date" placeholder="Loading Date" style="width: 180px" @on-change="searchLoadingDate"></DatePicker>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportTableData">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="refreshSizeType">
                <i class="fa fa-download"></i> Refresh Size/Type
              </button>
            </div>
          </div>
          <div class="form-inline" style="margin-top: 10px;">
            <!-- <div class="form-group m-r-2">
              Storing Days&nbsp;&nbsp;
              <input type="number" class="form-control" v-model.number="search_data.storing_days_min" placeholder="MIN" style="width: 93px" />
              <input type="number" class="form-control" v-model.number="search_data.storing_days_max" placeholder="MAX" style="width: 93px" />
            </div>
            <div class="form-group m-r-2">
              Detention Days&nbsp;&nbsp;
              <input type="number" class="form-control" v-model.number="search_data.detention_days_min" placeholder="MIN" style="width: 93px" />
              <input type="number" class="form-control" v-model.number="search_data.detention_days_max" placeholder="MAX" style="width: 93px" />
            </div> -->
            <div class="form-group m-r-2">
              Owner&nbsp;&nbsp;
              <Select filterable clearable v-model="search_data.contaienr_owner" style="width:150px" placeholder="Owner">
                <Option value="COSCO" key="COSCO">COSCO</Option>
                <Option value="OOCL" key="OOCL">OOCL</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              Container No&nbsp;&nbsp;
              <input type="text" class="form-control" v-model="search_data.containers_no" placeholder="Container No" style="width: 180px" />
            </div>
            <div class="form-group m-r-2">
              Size Type&nbsp;&nbsp;
              <Select filterable clearable v-model="search_data.size_type" style="width:150px" placeholder="Size Type">
                <Option v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code">{{ item.container_size_code }}[{{item.container_size_name}}]</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              Depot Name&nbsp;&nbsp;
              <Select filterable clearable v-model="search_data.depot" style="width:150px" placeholder="Depot">
                <Option v-for="item in pagePara.DEPOT" :value="item.edi_depot_name" :key="item.edi_depot_name">{{ item.edi_depot_name }}</Option>
              </Select>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="empty_stock_size_type">
            {{row.empty_stock_size_type}} [
            <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.empty_stock_size_type">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="empty_stock_depot_name">
          <div v-if="row.empty_stock_in_depot_name && row.empty_stock_out_depot_name && row.empty_stock_in_depot_name === row.empty_stock_out_depot_name">
            {{row.empty_stock_in_depot_name}}
          </div>
          <div v-else>
            <tag v-if="row.empty_stock_in_depot_name" color="success">I</Tag> {{row.empty_stock_in_depot_name}}<br/>
            <tag v-if="row.empty_stock_out_depot_name" color="primary">E</Tag> {{row.empty_stock_out_depot_name}}
          </div>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" :page-size="table.containerTable.limit" :pageSizeOpts = "table.containerTable.pageSizeOpts" show-total show-sizer show-elevator @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
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
import func from 'vue-editor-bridge'
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
              key: 'empty_stock_container_no',
              width: 130,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'empty_stock_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'Owner',
              key: 'empty_stock_container_owner',
              width: 80,
              align: 'center'
            },
            {
              title: 'Discharge Date',
              key: 'empty_stock_discharge_date',
              width: 140,
              align: 'center'
            },
            {
              title: 'Gate Out Terminal Date',
              key: 'empty_stock_gate_out_terminal_date',
              width: 180,
              align: 'center',
            },
            {
              title: 'Gate In Depot Date',
              key: 'empty_stock_gate_in_depot_date',
              width: 180,
              align: 'center',
            },
            {
              title: 'Gate Out Depot Date',
              key: 'empty_stock_gate_out_depot_date',
              width: 180,
              align: 'center',
            },
            {
              title: 'Gate In Terminal Date',
              key: 'empty_stock_gate_in_terminal_date',
              width: 180,
              align: 'center',
            },
            {
              title: 'Loading Date',
              key: 'empty_stock_loading_date',
              width: 140,
              align: 'center',
            },
            {
              title: 'Depot Name',
              slot: 'empty_stock_depot_name',
              width: 140,
            },
            {
              title: 'Storing Days',
              key: 'empty_stock_storing_days',
              width: 140,
              align: 'center',
            },
            {
              title: 'Detention Days',
              key: 'empty_stock_detention_days',
              width: 140,
              align: 'center',
            }
            // {
            //   title: 'Remark',
            //   key: 'invoice_containers_gate_remark',
            //   width: 200,
            //   align: 'center',
            // }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 60,
          limit: 20,
          offset: 0,
          total: 0,
          current: 1,
          pageSizeOpts: [20, 40, 60, 80]
        }
      },
      search_data: {},
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
    searchDischargeDate: function(e) {
      this.search_data.discharge_date = JSON.parse(JSON.stringify(e))
    },
    searchGateInDate: function(e) {
      this.search_data.gate_in_depot_date = JSON.parse(JSON.stringify(e))
    },
    searchGateOutDate: function(e) {
      this.search_data.gate_out_depot_date = JSON.parse(JSON.stringify(e))
    },
    searchLoadingDate: function(e) {
      this.search_data.loading_date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.containerTable.current = index
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
    },
    refreshSizeType: async function() {
      try {
        await this.$http.post(apiUrl + 'refreshEmptyStockSizeType', {})
        this.getTableData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
  }
}
</script>
<style scoped>
.right-bottom-title {
  text-align: right;
  font-size: 12px;
  color: #9ea7b4;
}
</style>