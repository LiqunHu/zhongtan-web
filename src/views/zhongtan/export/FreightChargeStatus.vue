<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Export Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Freight Charge Status
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Freight Charge Status">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbl_bl" placeholder="#M B/L No" style="width: 140px" />
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.charge_status" placeholder="Charge Status" clearable style="width:140px">
                <Option v-for="item in chargeStatus" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.vessel_id" placeholder="Select Vessel" clearable filterable style="width:140px">
                <Option v-for="item in pagePara.VESSELS" :value="item.export_vessel_id" :key="item.export_vessel_id">{{ item.export_vessel_name + '/' + item.export_vessel_voyage }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="search_data.etd_date" placeholder="ETD Date" style="width: 140px" @on-change="searchETDData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.receivable_agent" placeholder="Select Agent" clearable filterable style="width:140px">
                <Option v-for="item in pagePara.AGENTS" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.bgf_flg" placeholder="Select BGF" clearable filterable style="width:140px">
                <Option value="1" key="1">BGF</Option>
                <Option value="2" key="2">NON BGF</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="search_data.sales_code" placeholder="Sales Code" filterable clearable>
                <Option v-for="(item, index) in pagePara.SALES_CODE" :value="item.user_code" :key="index" :label="item.user_code">
                  <span>{{item.user_code}}</span>
                  <span style="float: right;">{{item.user_name}}</span>
                </Option>
              </Select>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getTableData(1)">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportFreightCharge()"> 
                <i class="fa fa-download" style="padding-right:7px;"></i> Export
              </button>
            </div>
            <!-- <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="loadingListAct()"> 
                <i class="fa fa-upload" style="padding-right:7px;"></i> Loading List
              </button>
            </div> -->
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data" :height="table.containerTable.height" :border="table.containerTable.data && table.containerTable.data.length > 0" :span-method="handleSpan">
        <template slot-scope="{ row, index }" slot="shipment_list_bl_print">
          <Poptip trigger="hover" placement="right" v-if="row.shipment_list_bl_print_user" width="300">
            <Button type="success" size="small" v-if="row.shipment_list_bl_print === 'YES'" v-on:click="blPrintChange(row)">{{row.shipment_list_bl_print}}</Button>
            <Button type="error" size="small" v-if="row.shipment_list_bl_print === 'NO'" v-on:click="blPrintChange(row)">{{row.shipment_list_bl_print}}</Button>
            <template slot="content">
              <Row>
                <Col span="6">Op: </Col>
                <Col span="18">{{row.shipment_list_bl_print_user_name}}</Col>
              </Row>
              <Row>
                <Col span="6">Time: </Col>
                <Col span="18">{{row.shipment_list_bl_print_time}}</Col>
              </Row>
            </template>
          </Poptip>
          <Button type="success" size="small" v-if="!row.shipment_list_bl_print_user && row.shipment_list_bl_print === 'YES'" v-on:click="blPrintChange(row)">{{row.shipment_list_bl_print}}</Button>
          <Button type="error" size="small" v-if="!row.shipment_list_bl_print_user && row.shipment_list_bl_print === 'NO'" v-on:click="blPrintChange(row)">{{row.shipment_list_bl_print}}</Button>
        </template>
        <template slot-scope="{ row, index }" slot="export_masterbl_bl">
          <Tag color="primary" v-if="row.loading_list_import === '1'">L</Tag>
          <Tag color="success" v-if="row.proforma_import === '1'">P</Tag>
          {{row.export_masterbl_bl}}
        </template>
        <template slot-scope="{ row, index }" slot="export_charge_status">
          <Tag color="error" v-if="row.blacklist === '1'"><Icon type="md-lock" />HOLD</Tag>
          <Tag color="success" v-else-if="row.charge_status === 'RELEASE'">RELEASE</Tag>
          <Tag color="error" v-else>HOLD</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="export_vessel">
          {{row.export_vessel_name + ' / ' + row.export_vessel_voyage}}
        </template>
         <template slot-scope="{ row, index }" slot="container_size_type">
            {{row.container_size_type}} [
            <span v-for="(item, index) in pagePara.CONTAINER_SIZE" :key="index" v-if="item.container_size_code === row.container_size_type">{{item.container_size_name}}</span> ]
        </template>
        <template slot-scope="{ row, index }" slot="container_no">
          <Tag color="primary" v-if="row.container_loading_list_import === '1'">L</Tag>
          <Tag color="success" v-if="row.container_proforma_import === '1'">P</Tag>
          {{row.container_no}}
        </template>
        <template slot-scope="{ row, index }" slot="receivable_detail">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
              <Tag color="default" v-if="item.shipment_fee_status === 'NE'">NEW ${{item.total_amount}}</Tag>
              <Tag color="primary" v-else-if="item.shipment_fee_status === 'SA'">SAVE ${{item.total_amount}}</Tag>
              <Tag color="primary" v-else-if="item.shipment_fee_status === 'SU'">SUBMIT ${{item.total_amount}}</Tag>
              <Tag color="success" v-else-if="item.shipment_fee_status === 'AP'">APPROVE ${{item.total_amount}}</Tag>
              <Tag color="error" v-else-if="item.shipment_fee_status === 'DE'">DECLINE ${{item.total_amount}}</Tag>
              <Tag color="error" v-else-if="item.shipment_fee_status === 'UN'">UNDO ${{item.total_amount}}</Tag>
              <span v-else-if="item.shipment_fee_status === 'IN'">
                <Poptip trigger="hover" placement="right" transfer="" width="500">
                  <Tag color="success" >INVOICE ${{item.total_amount}}</Tag>
                  <div slot="content">
                    <Table stripe :columns="table.invoiceTable.columns" :data="item.invoice_detail" height="300"></Table>
                  </div>
                </Poptip>
              </span>
              <span v-else-if="item.shipment_fee_status === 'RE'">
                <Poptip trigger="hover" placement="right" transfer="" width="500">
                  <Tag color="success" >RECEIPT ${{item.total_amount}}</Tag>
                  <div class="api" slot="content">
                    <Table stripe :columns="table.invoiceTable.columns" :data="item.invoice_detail" height="300"></Table>
                  </div>
                </Poptip>
              </span>
              <Tag color="warning" v-else-if="item.shipment_fee_status === 'BA'">BALANCE ${{item.total_amount}}</Tag>
            </ListItem>
          </List>
        </template>
        <template slot-scope="{ row, index }" slot="receivable_receipt">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
               <Tag color="default">{{item.shipment_fee_receipt_no}}</Tag>
            </ListItem>
          </List>
        </template>
        <template slot-scope="{ row, index }" slot="receivable_agent">
          <List size="small" v-if="row.receivable_detail" v-for="(item, index) in row.receivable_detail" :key="index">
            <ListItem>
              <Tag color="default">{{item.user_name}}</Tag>
            </ListItem>
          </List>
        </template>
      </Table>
      <Page class="m-t-10" :current="table.containerTable.current" :total="table.containerTable.total" show-sizer show-total :page-size="table.containerTable.limit" @on-change="getTableData" @on-page-size-change="resetTableSizer"/>
    </panel>
    <Modal v-model="modal.loadingListModal" title="Loading List">
      <Form :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xls', 'xlsx', 'XLS', 'XLSX']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/export/FreightChargeStatus/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.loadingListModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="loadingListData">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :mask-closable="false" :closable="false">
      <Form :label-width="120">
        <FormItem v-show="false">
            <Input type="password" style='width:0;opacity:0;'></Input>
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
            <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.checkPasswordModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/FreightChargeStatus/'

export default {
  name: 'FreightChargeStatus',
  data: function() {
    return {
      modal: {loadingListModal: false, checkPasswordModal: false},
      headers: common.uploadHeaders(),
      chargeStatus: [
        { id: 'RELEASE', text: 'RELEASE' },
        { id: 'HOLD', text: 'HOLD' }
      ],
      pagePara: {},
      table: {
        containerTable: {
          columns: [
            {
              title: 'B/L PRINT',
              slot: 'shipment_list_bl_print',
              width: 100,
              align: 'center'
            },
            {
              title: '#M B/L No',
              slot: 'export_masterbl_bl',
              width: 240,
              align: 'center'
            },
            {
              title: 'B/L Status',
              slot: 'export_charge_status',
              width: 120,
              align: 'center'
            },
            {
              title: 'Vessel Voyage',
              slot: 'export_vessel',
              width: 150,
              align: 'center'
            },
            {
              title: 'ETD',
              key: 'export_vessel_etd',
              width: 120,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'export_masterbl_port_of_load',
              width: 120,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'export_masterbl_port_of_discharge',
              width: 120,
              align: 'center'
            },
            {
              title: 'Container No',
              slot: 'container_no',
              width: 200,
              align: 'center'
            },
            {
              title: 'Size/Type',
              slot: 'container_size_type',
              width: 120,
              align: 'center'
            },
            {
              title: 'Receivable',
              key: 'total_amount',
              width: 120,
              align: 'center'
            },
            {
              title: 'Receivable Amount',
              slot: 'receivable_detail',
              width: 160,
              align: 'center'
            },
            {
              title: 'Receipt#',
              slot: 'receivable_receipt',
              width: 200,
              align: 'center'
            },
            {
              title: 'Agent',
              slot: 'receivable_agent',
              width: 360,
              align: 'center'
            },
            {
              title: 'Shipper',
              key: 'export_masterbl_shipper_company',
              width: 160,
              align: 'center'
            },
            {
              title: 'Sales Code',
              key: 'export_masterbl_sales_code',
              width: 160,
              align: 'center'
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight(),
          current: 1,
          limit: 10,
          offset: 0,
          total: 0
        },
        invoiceTable: {
          columns: [
            {
              title: 'Invoice No#',
              key: 'shipment_fee_invoice_no',
              align: 'center'
            },
            {
              title: 'Fee Code',
              key: 'fee_data_code',
              align: 'center'
            },
            {
              title: 'Fee Amount',
              key: 'shipment_fee_amount',
              align: 'center'
            }
          ]
        }
      },
      search_data: {
        masterbl_bl: '',
        charge_status: '',
        vessel_id: '',
        etd_date: '',
        receivable_agent: '',
        bgf_flg: false
      },
      files: {
        fileList: []
      },
      checkPassword: ''
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
    searchETDData: function(e) {
      this.search_data.etd_date = JSON.parse(JSON.stringify(e))
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
        if(this.table.containerTable.data) {
          for(let d of this.table.containerTable.data) {
            if(d.export_container_cal_demurrage_amount && d.export_container_cal_receipt_amount && parseInt(d.export_container_cal_demurrage_amount) === parseInt(d.export_container_cal_receipt_amount)) {
              d._disabled = true
            } else if(d.export_container_cal_demurrage_amount && parseInt(d.export_container_cal_demurrage_amount) > 0) {
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
    handleSpan: function({row, column, rowIndex, columnIndex}) {
      if(column.title !== 'Container No' && column.title !== 'Size/Type') {
        return this.getLayout(row, rowIndex, columnIndex)
      }
    },
    getLayout: function(row, rowIndex, columnIndex) {
      let rowspan = 0
      let colspan = 1
      let tableData = this.table.containerTable.data
      for(let d of tableData) {
        if(d.export_masterbl_id === row.export_masterbl_id) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].export_masterbl_id === row.export_masterbl_id) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    exportFreightCharge: async function() {
      this.checkPassword = ''
      this.checkPasswordType = 'exportFreight'
      this.modal.checkPasswordModal = true
    },
    loadingListAct: async function() {
      this.$refs.upload.fileList = []
      this.files.fileList = []
      this.modal.loadingListModal = true
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileList = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
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
    loadingListData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload pdf file')
        }
        await this.$http.post(apiUrl + 'loadingListData', {upload_files: this.files.fileList})
        this.$Message.success('submit success')
        this.modal.loadingListModal = false
        this.getTableData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    blPrintChange: async function(row) {
      this.$commonact.confirm('Submit ' + (row.shipment_list_bl_print === 'YES' ? 'NO' : 'YES') + ' ?', async() => {
        try {
          if(row.shipment_list_bl_print === 'YES') {
            this.workPara = JSON.parse(JSON.stringify(row))
            this.checkPassword = ''
            this.checkPasswordType = 'blPrint'
            this.modal.checkPasswordModal = true
          } else {
            await this.$http.post(apiUrl + 'blPrint', {export_masterbl_id: row.export_masterbl_id})
            this.getTableData(1)
          }
        }catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'blPrint') {
            action = 'FRIGHT_CHARGE_ACTION'
          } else if (this.checkPasswordType === 'exportFreight') {
            action = 'FRIGHT_CHARGE_EXPORT_ACTION'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'blPrint') {
            await this.$http.post(apiUrl + 'blPrint', {export_masterbl_id: this.workPara.export_masterbl_id})
            this.getTableData(1)
          } else if(this.checkPasswordType === 'exportFreight') {
            let searchPara = {
              search_data: this.search_data
            }
            let response = await this.$http.request({url: apiUrl + 'exportFreight', method: 'post', data: searchPara, responseType: 'blob'})
            let blob = response.data
            let reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = e => {
              let a = document.createElement('a')
              a.download = 'Freight Charge List.xlsx'
              a.href = e.target.result
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
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