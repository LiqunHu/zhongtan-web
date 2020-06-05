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
      Discharge Port Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="discharge port name、code" v-model="table.dischargePortTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getDischargePortData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addDischargePortModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="dischargePortTable" :columns="table.dischargePortTable.rows" :data="table.dischargePortTable.data" :border="table.dischargePortTable.data && table.dischargePortTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyDischargePortModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteDischargePort(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.dischargePortTable.total" :page-size="table.dischargePortTable.limit" @on-change="getDischargePortData"/>
    </panel>
    <Modal v-model="modal.dischargePortModal" title="Discharge Port">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleDischargePortModal" ref="formDischargePort">
        <FormItem label="NAME" prop="discharge_port_name">
          <Input placeholder="Discharge Port Name" v-model="workPara.discharge_port_name"/>
        </FormItem>
        <FormItem label="CODE" prop="discharge_port_code">
          <Input placeholder="Discharge Port Code" v-model="workPara.discharge_port_code"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.dischargePortModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitDischargePort">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/DischargePortConfig/'

export default {
  name: 'DischargePortConfig',
  data: function() {
    return {
      modal: { dischargePortModal: false },
      table: {
        dischargePortTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Discharge Port Name',
              key: 'discharge_port_name'
            },
            {
              title: 'Discharge Port Code',
              key: 'discharge_port_code'
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
        ruleDischargePortModal: {
          discharge_port_name: [{ required: true, trigger: 'change', message: 'Enter discharge port name' }],
          discharge_port_code: [{ required: true, trigger: 'change', message: 'Enter discharge port code' }],
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
        this.getDischargePortData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getDischargePortData: async function(index) {
      try {
        if (index) {
          this.table.dischargePortTable.offset = (index - 1) * this.table.dischargePortTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.dischargePortTable.search_text,
          offset: this.table.dischargePortTable.offset,
          limit: this.table.dischargePortTable.limit
        })
        let data = response.data.info
        this.table.dischargePortTable.total = data.total
        this.table.dischargePortTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addDischargePortModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formDischargePort.resetFields()
      this.modal.dischargePortModal = true
    },
    modifyDischargePortModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formDischargePort.resetFields()
      this.modal.dischargePortModal = true
    },
    submitDischargePort: function() {
      this.$refs.formDischargePort.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add discharge port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify discharge port success')
              this.modal.dischargePortModal = false
            }
            this.getDischargePortData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteDischargePort: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { discharge_port_id: row.discharge_port_id })
          this.$Message.success('delete success')
          this.getDischargePortData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>