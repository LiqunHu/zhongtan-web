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
      Port Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="port name、name cn、number" v-model="table.portTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getPortData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addPortModal">Add Port</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="portTable" :columns="table.portTable.rows" :data="table.portTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyPortModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deletePort(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.portTable.total" :page-size="table.portTable.limit" @on-change="getPortData"/>
    </panel>
    <Modal v-model="modal.portModal" title="Port">
      <Form :model="workPara" :label-width="120" :rules="formRule.rulePortModal" ref="formPort">
        <FormItem label="Port Name" prop="port_name">
          <Input placeholder="Port Name" v-model="workPara.port_name"/>
        </FormItem>
        <FormItem label="Port CN Name" prop="port_name_cn">
          <Input placeholder="Port CN Name" v-model="workPara.port_name_cn"/>
        </FormItem>
        <FormItem label="Port Code" prop="port_code">
          <Input placeholder="Port Code" v-model="workPara.port_code"/>
        </FormItem>
        <FormItem label="Port Country" prop="port_country">
          <Input placeholder="Port Code" v-model="workPara.port_country"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.portModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitPort">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/PortConfig/'

export default {
  name: 'PortConfig',
  data: function() {
    return {
      modal: { portModal: false },
      table: {
        portTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Port Country',
              key: 'port_country'
            },
            {
              title: 'Port Name',
              key: 'port_name'
            },
            {
              title: 'CN Port Name',
              key: 'port_name_cn'
            },
            {
              title: 'Port Code',
              key: 'port_code'
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
        rulePortModal: {
          port_name: [{ required: true, trigger: 'change', message: 'Enter port name' }],
          port_name_cn: [{ required: true, trigger: 'change', message: 'Enter port name cn' }],
          port_code: [{ required: true, trigger: 'change', message: 'Enter port code' }],
          port_country: [{ required: true, trigger: 'change', message: 'Enter port country' }]
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
          this.table.portTable.offset = (index - 1) * this.table.portTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.portTable.search_text,
          offset: this.table.portTable.offset,
          limit: this.table.portTable.limit
        })
        let data = response.data.info
        this.table.portTable.total = data.total
        this.table.portTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addPortModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formPort.resetFields()
      this.modal.portModal = true
    },
    modifyPortModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formPort.resetFields()
      this.modal.portModal = true
    },
    submitPort: function() {
      this.$refs.formPort.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getPortData()
            this.modal.portModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deletePort: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { port_id: row.port_id })
          this.$Message.success('delete success')
          this.getPortData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>