<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">System Configuration</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Ventor Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Ventor Control">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="Search Code Name" v-model="table.vendorTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getVendorData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addVendorModal">Add</button>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="exportVendorReport">
                <i class="fa fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="vendorTable" :columns="table.vendorTable.rows" :data="table.vendorTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyVendorModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteVendor(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.vendorTable.total" :current="table.vendorTable.current" :page-size="table.vendorTable.limit" @on-change="getVendorData"/>
    </panel>
    <Modal v-model="modal.vendorModal" title="Vendor">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleVendorModal" ref="formVendor">
        <FormItem label="Code" prop="vendor_code">
          <Input placeholder="Vendor Code" v-model="workPara.vendor_code"/>
        </FormItem>
        <FormItem label="Name" prop="vendor_name">
          <Input placeholder="Name" v-model="workPara.vendor_name"/>
        </FormItem>
        <FormItem label="Email" prop="vendor_email">
          <Input placeholder="Email" v-model="workPara.vendor_email"/>
        </FormItem>
        <FormItem label="Phone" prop="vendor_phone">
          <Input placeholder="Phone" v-model="workPara.vendor_phone"/>
        </FormItem>
        <FormItem label="Address" prop="vendor_address">
          <Input placeholder="Address" v-model="workPara.vendor_address"/>
        </FormItem>
        <FormItem label="Bank Name" prop="vendor_bank_name">
          <Input placeholder="Bank Name" v-model="workPara.vendor_bank_name"/>
        </FormItem>
        <FormItem label="Bank Account" prop="vendor_bank_account">
          <Input placeholder="Bank Account" v-model="workPara.vendor_bank_account"/>
        </FormItem>
        <FormItem label="Bank Address" prop="vendor_bank_address">
          <Input placeholder="Bank Address" v-model="workPara.vendor_bank_address"/>
        </FormItem>
        <FormItem label="Swift Code" prop="vendor_swift_code">
          <Input placeholder="Swift Code" v-model="workPara.vendor_swift_code"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.vendorModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitVendor">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/VendorControl/'

export default {
  name: 'VendorControl',
  data: function() {
    return {
      modal: { vendorModal: false },
      table: {
        vendorTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100,
            },
            {
              title: 'CODE',
              key: 'vendor_code',
              width: 200,
            },
            {
              title: 'Name',
              key: 'vendor_name',
              width: 200,
            },
            {
              title: 'EMAIL',
              key: 'vendor_email',
              width: 200,
            },
            {
              title: 'PHONE',
              key: 'vendor_phone',
              width: 200,
            },
            {
              title: 'ADDRESS',
              key: 'vendor_address',
              render: common.tooltipRender(),
              width: 200,
            },
            {
              title: 'BANK NAME',
              key: 'vendor_bank_name',
              width: 200,
            },
            {
              title: 'BANK ACCOUNT',
              key: 'vendor_bank_account',
              width: 200,
            },
            {
              title: 'BANK ADDRESS',
              key: 'vendor_bank_address',
              width: 200,
            },
            {
              title: 'SWIFT CODE',
              key: 'vendor_swift_code',
              width: 200,
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          current: 1,
          search_text: ''
        }
      },
      formRule: {
        ruleVendorModal: {
          vendor_code: [{ required: true, trigger: 'change', message: 'Enter Vendor Code' }],
          vendor_name: [{ required: true, trigger: 'change', message: 'Enter Vendor Name' }]
        }
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: ''
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getVendorData(1)
  },
  methods: {
    getVendorData: async function(index) {
      try {
        if (index) {
          this.table.vendorTable.offset = (index - 1) * this.table.vendorTable.limit
          this.table.vendorTable.current = index
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.vendorTable.search_text,
          offset: this.table.vendorTable.offset,
          limit: this.table.vendorTable.limit
        })
        let data = response.data.info
        this.table.vendorTable.total = data.total
        this.table.vendorTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addVendorModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formVendor.resetFields()
      this.modal.vendorModal = true
    },
    modifyVendorModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formVendor.resetFields()
      this.modal.vendorModal = true
    },
    submitVendor: function() {
      this.$refs.formVendor.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('Add Vendor Success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('Modify Vendor Success')
            }
            this.getVendorData()
            this.modal.vendorModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteVendor: function(row) {
      this.$commonact.confirm('Delete Vendor?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { vendor_id: row.vendor_id })
          this.$Message.success('Delete Success')
          this.getVendorData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    exportVendorReport: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'export',
            method: 'post',
            data: {search_data: this.search_data},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'vendor ' + moment().format('YYYYMMDDHHmmSS') + '.xlsx'
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