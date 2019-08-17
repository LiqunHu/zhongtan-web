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
      Vessel Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="vessel name、operator、code" v-model="table.vesselTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getVesselData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addVesselModal">Add Vessel</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="vesselTable" :columns="table.vesselTable.rows" :data="table.vesselTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyVesselModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <!-- <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteVessel(row)">
            <i class="fa fa-times"></i>
          </a> -->
        </template>
      </Table>
      <Page class="m-t-10" :total="table.vesselTable.total" :page-size="table.vesselTable.limit" @on-change="getVesselData"/>
    </panel>
    <Modal v-model="modal.vesselModal" title="Vessel">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleVesselModal" ref="formVessel">
        <FormItem label="Vessel Service" prop="vessel_service_name">
          <Select v-model="workPara.vessel_service_name" :disabled="action === 'modify'">
            <Option v-for="item in pagePara.VesselServiceINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Vessel Name" prop="vessel_name">
          <Input placeholder="Vessel Name" v-model="workPara.vessel_name"/>
        </FormItem>
        <FormItem label="Vessel Operator" prop="vessel_operator">
          <Input placeholder="Vessel Operator" v-model="workPara.vessel_operator"/>
        </FormItem>
        <FormItem label="Vessel Code" prop="vessel_code">
          <Input placeholder="Vessel Code" v-model="workPara.vessel_code"/>
        </FormItem>
        <FormItem label="State" prop="state">
          <Select v-model="workPara.state" v-show="action === 'modify'">
            <Option v-for="item in pagePara.STATUSINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.vesselModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitVessel">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/VesselConfig/'

export default {
  name: 'VesselConfig',
  data: function() {
    return {
      modal: { vesselModal: false },
      table: {
        vesselTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Vessel Service',
              key: 'vessel_service_name',
              render: common.selectRender(this, 'VesselServiceINFO')
            },
            {
              title: 'Vessel Name',
              key: 'vessel_name'
            },
            {
              title: 'Vessel Operator',
              key: 'vessel_operator'
            },
            {
              title: 'Vessel Code',
              key: 'vessel_code'
            },
            {
              title: 'State',
              key: 'state',
              render: common.selectRender(this, 'STATUSINFO')
            },
            {
              title: 'Action',
              slot: 'action'
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
        ruleVesselModal: {
          vessel_service_name: [{ required: true, trigger: 'change', message: 'Choose service' }],
          vessel_name: [{ required: true, trigger: 'change', message: 'Enter vessel name' }],
          vessel_operator: [{ required: true, trigger: 'change', message: 'Enter vessel name' }],
          vessel_code: [{ required: true, trigger: 'change', message: 'Enter vessel code' }]
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
        this.getVesselData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getVesselData: async function(index) {
      try {
        if (index) {
          this.table.vesselTable.offset = (index - 1) * this.table.vesselTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.vesselTable.search_text,
          offset: this.table.vesselTable.offset,
          limit: this.table.vesselTable.limit
        })
        let data = response.data.info
        this.table.vesselTable.total = data.total
        this.table.vesselTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addVesselModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formVessel.resetFields()
      this.modal.vesselModal = true
    },
    modifyVesselModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formVessel.resetFields()
      this.modal.vesselModal = true
    },
    submitVessel: function() {
      this.$refs.formVessel.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getVesselData()
            this.modal.vesselModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteVessel: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { vessel_id: row.vessel_id })
          this.$Message.success('delete success')
          this.getVesselData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>