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
      EDI Depot Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="EDI Depot">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="depot name" v-model="table.ediDepotTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getEdiDepotData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addEdiDepotModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="ediDepotTable" :columns="table.ediDepotTable.rows" :data="table.ediDepotTable.data" :border="table.ediDepotTable.data && table.ediDepotTable.data.length > 0" :height="mainTableHeight">
        <template slot-scope="{ row, index }" slot="edi_depot_send_edi">
          <i-switch v-model="row.edi_depot_send_edi" size="large" true-value="1" false-value="0" disabled>
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </template>
        <template slot-scope="{ row, index }" slot="edi_depot_empty_release">
          <i-switch v-model="row.edi_depot_empty_release" size="large" true-value="1" false-value="0" disabled>
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </template>
        <template slot-scope="{ row, index }" slot="edi_depot_is_wharf">
          <i-switch v-model="row.edi_depot_is_wharf" size="large" true-value="1" false-value="0" disabled>
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyEdiDepotModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteEdiDepot(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.ediDepotTable.total" :page-size="table.ediDepotTable.limit" @on-change="getEdiDepotData"/>
    </panel>
    <Modal v-model="modal.ediDepotModal" title="Discharge Port">
      <Form :model="workPara" :label-width="160" :rules="formRule.ruleEdiDepotModal" ref="formEdiDepot">
        <FormItem label="Depot Name" prop="edi_depot_name" style="margin-bottom: 0px;">
          <Input placeholder="Depot Name" v-model="workPara.edi_depot_name"/>
        </FormItem>
        <FormItem label="Sender Email" prop="edi_depot_sender_email" style="margin-bottom: 0px;">
          <Input placeholder="Sender Email" v-model="workPara.edi_depot_sender_email"/>
        </FormItem>
        <FormItem label="Gate Regex" prop="edi_depot_gate_in_out_regex" style="margin-bottom: 0px;">
          <Input placeholder="Gate IN/OUT Regex" v-model="workPara.edi_depot_gate_in_out_regex"/>
        </FormItem>
        <FormItem label="CNT Regex" prop="edi_depot_cnt_regex" style="margin-bottom: 0px;">
          <Input placeholder="CNT Regex" v-model="workPara.edi_depot_cnt_regex"/>
        </FormItem>
        <FormItem label="DMT Regex" prop="edi_depot_dmt_regex" style="margin-bottom: 0px;">
          <Input placeholder="DMT Regex" v-model="workPara.edi_depot_dmt_regex"/>
        </FormItem>
        <FormItem label="DMT Format" prop="edi_depot_dmt_format" style="margin-bottom: 0px;">
          <Input placeholder="DMT Format" v-model="workPara.edi_depot_dmt_format"/>
        </FormItem>
        <FormItem label="Carrier Regex" prop="edi_depot_carrier_regex" style="margin-bottom: 0px;">
          <Input placeholder="Carrier Regex" v-model="workPara.edi_depot_carrier_regex"/>
        </FormItem>
        <FormItem label="BL Regex" prop="edi_depot_bl_regex" style="margin-bottom: 0px;">
          <Input placeholder="BL Regex" v-model="workPara.edi_depot_bl_regex"/>
        </FormItem>
        <FormItem label="Storing Order Email" prop="edi_depot_storing_order_email" style="margin-bottom: 0px;">
          <Input placeholder="Storing Order Email" v-model="workPara.edi_depot_storing_order_email"/>
        </FormItem>
        <FormItem label="Send EDI" prop="edi_depot_send_edi" style="margin-bottom: 0px;">
          <i-switch v-model="workPara.edi_depot_send_edi" size="large" true-value="1" false-value="0">
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </FormItem>
        <FormItem label="Send EDI Email" prop="edi_depot_send_edi_email" style="margin-bottom: 0px;">
          <Input placeholder="Send EDI Email" v-model="workPara.edi_depot_send_edi_email"/>
        </FormItem>
        <FormItem label="Empty Release" prop="edi_depot_empty_release" style="margin-bottom: 0px;">
          <i-switch v-model="workPara.edi_depot_empty_release" size="large" true-value="1" false-value="0">
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </FormItem>
        <FormItem label="Empty Release Email" prop="edi_depot_empty_release_email" style="margin-bottom: 0px;">
          <Input placeholder="Send EDI Email" type="textarea" v-model="workPara.edi_depot_empty_release_email"/>
        </FormItem>
        <FormItem label="Wharf" prop="edi_depot_is_wharf" style="margin-bottom: 0px;">
          <i-switch v-model="workPara.edi_depot_is_wharf" size="large" true-value="1" false-value="0">
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </FormItem>
        <FormItem label="Depot Address" style="margin-bottom: 0px;">
          <Input placeholder="Depot Address" type="textarea" v-model="workPara.edi_depot_address"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.ediDepotModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitEdiDepot">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/EdiDepotConfig/'

export default {
  name: 'EdiDepotConfig',
  data: function() {
    return {
      modal: { ediDepotModal: false },
      mainTableHeight: common.getTableHeight(),
      table: {
        ediDepotTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Depot Name',
              key: 'edi_depot_name',
              width: 150,
              align: 'center'
            },
            {
              title: 'Sender Email',
              key: 'edi_depot_sender_email',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE Regex',
              key: 'edi_depot_gate_in_out_regex',
              width: 200,
              align: 'center'
            },
            {
              title: 'CNT Regex',
              key: 'edi_depot_cnt_regex',
              width: 250,
              align: 'center'
            },
            {
              title: 'DMT Regex',
              key: 'edi_depot_dmt_regex',
              width: 200,
              align: 'center'
            },
            {
              title: 'DMT Format',
              key: 'edi_depot_dmt_format',
              width: 200,
              align: 'center'
            },
            {
              title: 'Carrier Regex',
              key: 'edi_depot_carrier_regex',
              width: 250,
              align: 'center'
            },
            {
              title: 'BL Regex',
              key: 'edi_depot_bl_regex',
              width: 250,
              align: 'center'
            },
            {
              title: 'Storing Order Email',
              key: 'edi_depot_storing_order_email',
              width: 200,
              align: 'center'
            },
            {
              title: 'Send EDI',
              slot: 'edi_depot_send_edi',
              width: 200,
              align: 'center'
            },
            {
              title: 'Send EDI Email',
              key: 'edi_depot_send_edi_email',
              width: 200,
              align: 'center'
            },
            {
              title: 'Empty Release',
              slot: 'edi_depot_empty_release',
              width: 200,
              align: 'center'
            },
            {
              title: 'Empty Release Email',
              key: 'edi_depot_empty_release_email',
              width: 200,
              align: 'center'
            },
            {
              title: 'Wharf',
              slot: 'edi_depot_is_wharf',
              width: 200,
              align: 'center'
            },
            {
              title: 'Depot Address',
              key: 'edi_depot_address',
              width: 200,
              align: 'center'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100,
              align: 'center'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_text: ''
        }
      },
      formRule: {
        ruleEdiDepotModal: {
          edi_depot_name: [{ required: true, trigger: 'blur', message: 'Enter Depot Name' }],
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
    const initPage = async () => {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
        this.getEdiDepotData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getEdiDepotData: async function(index) {
      try {
        if (index) {
          this.table.ediDepotTable.offset = (index - 1) * this.table.ediDepotTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.ediDepotTable.search_text,
          offset: this.table.ediDepotTable.offset,
          limit: this.table.ediDepotTable.limit
        })
        let data = response.data.info
        this.table.ediDepotTable.total = data.total
        this.table.ediDepotTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addEdiDepotModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formEdiDepot.resetFields()
      this.modal.ediDepotModal = true
    },
    modifyEdiDepotModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formEdiDepot.resetFields()
      this.modal.ediDepotModal = true
    },
    submitEdiDepot: function() {
      this.$refs.formEdiDepot.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify success')
              this.modal.ediDepotModal = false
            }
            this.getEdiDepotData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteEdiDepot: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { edi_depot_id: row.edi_depot_id })
          this.$Message.success('delete success')
          this.getEdiDepotData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>