<style>
  .ivu-table .table-info-row td{
      /* background-color: #49B6D6; */
      color: #ADADAD;
  }
</style>
<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Logistics</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Shipment List
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Shipment List">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="B/L#" v-model.trim="searchPara.shipment_list_bill_no" class="form-control">
              <Select v-model="searchPara.shipment_list_business_type" clearable placeholder="BUSINESS TYPE" style="width:180px">
                <Option v-for="item in businessTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
              <Select v-model="searchPara.shipment_list_cargo_type" clearable placeholder="CARGO TYPE" style="width:180px">
                <Option v-for="item in cargoTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
              <Select v-model="searchPara.shipment_list_cntr_owner" clearable placeholder="CNTR OWNER" style="width:180px">
                <Option v-for="item in cntrOwnerFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
              <DatePicker type="daterange" :value="searchPara.shipment_list_in_date" placeholder="DISCHARGE/GATE OUT" @on-change="searchInDateChange" format="yyyy-MM-dd"></DatePicker>
              <DatePicker type="daterange" :value="searchPara.shipment_list_out_date" placeholder="EMPTY RETURN/LOADING" @on-change="searchOutDateChange" format="yyyy-MM-dd"></DatePicker>
              <Select v-model="searchPara.shipment_list_vendor" clearable placeholder="VENDOR" style="width:180px">
                <Option v-for="item in pagePara.VENDOR" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getPortData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addShipmentListModal">Add</button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportAct">Export</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="shipmentTable" :row-class-name="freightRowClassName" :columns="table.shipmentTable.rows" :data="table.shipmentTable.data">
        <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
          <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
            IMPORT
          </span>
          <span v-else>
            {{row.shipment_list_cargo_type}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_in_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_discharge_date}}
          </span>
          <span v-else>
            {{row.shipment_list_depot_gate_out_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_out_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_empty_return_date}}
          </span>
          <span v-else>
            {{row.shipment_list_loading_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="editShipmentModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteShipment(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.shipmentTable.total" :current="table.shipmentTable.current" show-total :page-size="table.shipmentTable.limit" @on-change="getPortData"/>
    </panel>
    <Modal v-model="modal.addShipmentModal" title="Add Shipment List" width="1000">
      <Form ref="addShipment" :model="addSearchData" :label-width="120" :rules="addSearchRule" inline>
        <FormItem label="B/L#" prop="bill_no">
          <Input placeholder="B/L#" v-model="addSearchData.bill_no"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="searchShipmentList">Search</Button>
        </FormItem>
      </Form>
      <Table border ref="searchTable" :columns="table.searchTable.rows" :data="table.searchTable.data" @on-select="searchShipmentSelect" @on-select-cancel="searchShipmentSelectCancel" max-height="400">
        <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
          <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
            IMPORT
          </span>
          <span v-else>
            {{row.shipment_list_cargo_type}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_in_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_discharge_date}}
          </span>
          <span v-else>
            {{row.shipment_list_depot_gate_out_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_out_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_empty_return_date}}
          </span>
          <span v-else>
            {{row.shipment_list_loading_date}}
          </span>
        </template>
      </Table>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.addShipmentModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="addShipmentList">ADD</Button>
      </div>
    </Modal>
    <Modal v-model="modal.editShipmentModal" title="Edit Shipment List" width="600">
      <Form ref="editShipment" :model="workPara" :label-width="240" style="padding-right: 50px;">
        <FormItem label="B/L#" style="margin-bottom:0px;">
          {{workPara.shipment_list_bill_no}}
          <Tag color="primary" style="margin-left:20px;">{{workPara.shipment_list_business_type}}</Tag>
          <Tag color="success" v-if="workPara.shipment_list_business_type === 'I' && workPara.shipment_list_cargo_type === 'LOCAL'" style="margin-left:20px;">IMPORT</Tag>
          <Tag color="success" v-else style="margin-left:20px;">{{workPara.shipment_list_cargo_type}}</Tag>
        </FormItem>
        <FormItem label="SIZE TYPE" style="margin-bottom:0px;">
          {{workPara.shipment_list_size_type}}
        </FormItem>
        <FormItem label="CONTAINER#" style="margin-bottom:0px;">
          {{workPara.shipment_list_container_no}}
        </FormItem>
        <FormItem label="CARGO WEIGHT(KGS)" style="margin-bottom:0px;">
          {{workPara.shipment_list_cargo_weight}}
        </FormItem>
        <FormItem label="DISCHARGE DATE" style="margin-bottom:0px;" v-if="workPara.shipment_list_business_type === 'I'">
          {{workPara.shipment_list_discharge_date}}
        </FormItem>
        <FormItem label="GATE OUT DATE" style="margin-bottom:0px;" v-else>
          {{workPara.shipment_list_depot_gate_out_date}}
        </FormItem>
        <FormItem label="EMPTY RETURN DATE" style="margin-bottom:0px;" v-if="workPara.shipment_list_business_type === 'I'">
          {{workPara.shipment_list_empty_return_date}}
        </FormItem>
        <FormItem label="LOADING DATE" style="margin-bottom:0px;" v-else>
          {{workPara.shipment_list_loading_date}}
        </FormItem>
        <FormItem label="POL#" style="margin-bottom:0px;">
          <Input placeholder="PORT OF LOADING" v-model.trim="workPara.shipment_list_port_of_loading"/>
        </FormItem>
        <FormItem label="POD#" style="margin-bottom:0px;">
          <Input placeholder="PORT OF DESTINATION" v-model.trim="workPara.shipment_list_port_of_destination"/>
        </FormItem>
        <FormItem label="DAR CUSTOMS RELEASE DATE" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_dar_customs_release_date" @on-change="releaseDateChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="TRUCK DEPARTURE DATE" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_truck_departure_date" @on-change="departureDateChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="TRUCK PLATE#" style="margin-bottom:0px;">
          <Input placeholder="TRUCK PLATE#" v-model.trim="workPara.shipment_list_truck_plate"/>
        </FormItem>
        <FormItem label="ATA TZ BORDER" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_ata_tz_border" @on-change="ataTzBorderChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="ATA FOREIGN BORDER" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_ata_foreing_border" @on-change="ataForeignBorderChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="BORDER RELEASE DATE" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_border_release_date" @on-change="borderReleaseDateChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="ATA DESTINATION" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_ata_destination" @on-change="ataDestinationChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="DELIVERY (UNLOADING) DATE" style="margin-bottom:0px;">
          <DatePicker type="date" :value = "workPara.shipment_list_delivery_date" @on-change="deliveryDateChange" format="yyyy-MM-dd" style="width:278px;"></DatePicker>
        </FormItem>
        <FormItem label="VENDOR" style="margin-bottom:0px;">
          <Select v-model="workPara.shipment_list_vendor" clearable filterable placeholder="VENDOR" style="width:278px">
            <Option v-for="item in pagePara.VENDOR" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="REMARK" style="margin-bottom:0px;">
          <Input v-model.trim="workPara.shipment_list_remark" maxlength="200" :rows="2" show-word-limit type="textarea" style="width: 278px" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.editShipmentModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="modifyShipmentList">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :mask-closable="false">
      <Form :label-width="120">
        <FormItem v-show="false">
            <Input type="password" style='width:0;opacity:0;'></Input>
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
            <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="checkPasswordCancel">Cancel</Button>
        <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/logistics/ShipmentList/'

export default {
  name: 'ShipmentList',
  data: function() {
    return {
      modal: { addShipmentModal: false, editShipmentModal: false, checkPasswordModal: false },
      table: {
        shipmentTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'shipment_list_vendor_name',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL#',
              key: 'shipment_list_port_of_loading',
              width: 200,
              align: 'center'
            },
            {
              title: 'POD#',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'EMPTY RETURN/LOADING',
              slot: 'shipment_list_out_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'CARGO WEIGHT',
              key: 'shipment_list_cargo_weight',
              width: 150,
              align: 'center'
            },
            {
              title: 'DAR CUSTOMS RELEASE DATE',
              key: 'shipment_list_dar_customs_release_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'TRUCK DEPARTURE DATE',
              key: 'shipment_list_truck_departure_date',
              width: 210,
              align: 'center'
            },
            {
              title: 'TRUCK PLATE#',
              key: 'shipment_list_truck_plate',
              width: 150,
              align: 'center'
            },
            {
              title: 'ATA TZ BORDER',
              key: 'shipment_list_ata_tz_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA FOREIGN BORDER',
              key: 'shipment_list_ata_foreing_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'BORDER RELEASE DATE',
              key: 'shipment_list_border_release_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA DESTINATION',
              key: 'shipment_list_ata_destination',
              width: 200,
              align: 'center'
            },
            {
              title: 'DELIVERY (UNLOADING) DATE',
              key: 'shipment_list_delivery_date',
              width: 250,
              align: 'center'
            },
            {
              title: 'REMARK',
              key: 'shipment_list_remark',
              width: 150,
              align: 'center'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          current: 1
        },
        searchTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO WEIGHT',
              key: 'shipment_list_cargo_weight',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        }
      },
      pagePara: {},
      searchPara: {
        shipment_list_bill_no: '',
        shipment_list_cntr_owner: '',
        shipment_list_cargo_type: '',
        shipment_list_business_type: '',
        shipment_list_in_date: '',
        shipment_list_out_date: '',
        shipment_list_vendor: ''
      },
      businessTypeFilter: [
        {id: 'I', text: 'IMPORT'},
        {id: 'E', text: 'EXPORT'}
      ],
      cargoTypeFilter: [
        {id: 'LOCAL', text: 'IMPORT/LOCAL'},
        {id: 'TRANSIT', text: 'TRANSIT'}
      ],
      cntrOwnerFilter: [
        {id: 'COS', text: 'COSCO'},
        {id: 'OOL', text: 'OOCL'}
      ],
      oldPara: {},
      workPara: {},
      action: '',
      addSearchData: {
        bill_no: ''
      },
      addSearchRule: {
        bill_no: [{ required: true, trigger: 'blur', message: 'Enter B/L#' }]
      },
      checkPassword: ''
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    const initPage = async () => {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
        this.getPortData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getPortData: async function(index) {
      try {
        if (index) {
          this.table.shipmentTable.offset = (index - 1) * this.table.shipmentTable.limit
          this.table.shipmentTable.current = index
        }
        let response = await this.$http.post(apiUrl + 'search', {
          searchPara: this.searchPara,
          offset: this.table.shipmentTable.offset,
          limit: this.table.shipmentTable.limit
        })
        let data = response.data.info
        this.table.shipmentTable.total = data.total
        this.table.shipmentTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    exportAct: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'export',
            method: 'post',
            data: {searchPara: this.searchPara},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Logistics Shipment List.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addShipmentListModal: async function() {
      this.addSearchData = {
        bill_no: ''
      }
      this.table.searchTable.data = []
      this.table.searchTable.total = 0
      this.action = 'add'
      this.$refs.addShipment.resetFields()
      this.modal.addShipmentModal = true
    },
    searchShipmentList: async function() {
      this.$refs.addShipment.validate(async valid => {
        if (valid) {
          try {
            let response = await this.$http.post(apiUrl + 'searchShipmentList', {search_data: this.addSearchData})
            let data = response.data.info
            this.table.searchTable.data = JSON.parse(JSON.stringify(data.rows))
            this.table.searchTable.total = data.total
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    editShipmentModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.modal.editShipmentModal = true
    },
    releaseDateChange: async function(e) {
      this.workPara.shipment_list_dar_customs_release_date = JSON.parse(JSON.stringify(e))
    },
    departureDateChange: async function(e) {
      this.workPara.shipment_list_truck_departure_date = JSON.parse(JSON.stringify(e))
    },
    ataTzBorderChange: async function(e) {
      this.workPara.shipment_list_ata_tz_border = JSON.parse(JSON.stringify(e))
    },
    ataForeignBorderChange: async function(e) {
      this.workPara.shipment_list_ata_foreing_border = JSON.parse(JSON.stringify(e))
    },
    borderReleaseDateChange: async function(e) {
      this.workPara.shipment_list_border_release_date = JSON.parse(JSON.stringify(e))
    },
    ataDestinationChange: async function(e) {
      this.workPara.shipment_list_ata_destination = JSON.parse(JSON.stringify(e))
    },
    deliveryDateChange: async function(e) {
      this.workPara.shipment_list_delivery_date = JSON.parse(JSON.stringify(e))
    },
    searchInDateChange: async function(e) {
      this.searchPara.shipment_list_in_date = JSON.parse(JSON.stringify(e))
    },
    searchOutDateChange: async function(e) {
      this.searchPara.shipment_list_out_date = JSON.parse(JSON.stringify(e))
    },
    searchShipmentSelect: async function(selection, row) {
      if(this.table.searchTable.data) {
        for(let d of this.table.searchTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = true
          }
        }
      }
    },
    searchShipmentSelectCancel: async function(selection, row) {
      if(this.table.searchTable.data) {
        for(let d of this.table.searchTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = false
          }
        }
      }
    },
    addShipmentList: async function() {
      let selection = this.$refs.searchTable.getSelection()
      if(selection && selection.length > 0) {
        try {
          await this.$http.post(apiUrl + 'add', {add_shipment_list: selection})
          this.modal.addShipmentModal = false
          this.getPortData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please select shipment list')
      }
    },
    modifyShipmentList: async function() {
      if(this.oldPara.shipment_list_vendor && this.oldPara.shipment_list_vendor !== this.workPara.shipment_list_vendor) {
        this.checkPassword = ''
        this.checkPasswordType = 'ShipmentListEdit'
        this.modal.checkPasswordModal = true
      } else {
        try {
          await this.$http.post(apiUrl + 'modify', {old: this.oldPara, new: this.workPara})
          this.modal.editShipmentModal = false
          this.getPortData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
    },
    deleteShipment: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'ShipmentListDelete'
      this.modal.checkPasswordModal = true
    },
    deleteShipmentAct: async function() {
      this.$commonact.confirm('delete shipment?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { shipment_list_id: this.workPara.shipment_list_id })
          this.$Message.success('delete success')
          this.getPortData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'ShipmentListDelete' || this.checkPasswordType === 'ShipmentListEdit') {
            action = 'LOGISTICS_SHIPMENT_LIST_DELETE'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'ShipmentListDelete') {
            await this.deleteShipmentAct()
          } else if(this.checkPasswordType === 'ShipmentListEdit') {
            try {
              await this.$http.post(apiUrl + 'modify', {old: this.oldPara, new: this.workPara})
              this.modal.editShipmentModal = false
              this.getPortData(1)
            } catch (error) {
              this.$commonact.fault(error)
            }
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    },
    freightRowClassName (row, index) {
      if(row.shipment_list_payment_status === '0' && row.shipment_list_receivable_status === '0') {
        return 'table-info-row'
      } else {
        return ''
      }
    }
  }
}
</script>