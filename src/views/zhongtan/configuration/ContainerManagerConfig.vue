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
      Container Manager Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="voyage name〝operator〝code" v-model="table.dataTable.search_text" class="form-control" />
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getTableData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addDataModal">Add Container Manager</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="dataTable" :columns="table.dataTable.rows" :data="table.dataTable.data">
        <template slot-scope="{ row, index }" slot="vessel_id">
          <Select v-model="row.vessel_id" disabled>
            <Option v-for="item in pagePara.VesselINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyDataModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteData(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.dataTable.total" :page-size="table.dataTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.dataModal" title="Container Manager">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleDataModal" ref="formData">
        <FormItem label="Manager Name" prop="container_manager_name">
          <Input placeholder="Manager Name" v-model="workPara.container_manager_name" />
        </FormItem>
        <FormItem label="Manager Email" prop="container_manager_email">
          <Input placeholder="Manager Email" v-model="workPara.container_manager_email" />If there are more than one, Separated with,
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.dataModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitData">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
// const Isemail = require('isemail')
const apiUrl = '/api/zhongtan/configuration/ContainerManagerConfig/'

export default {
  name: 'ContainerManagerConfig',
  data: function() {
    return {
      modal: { dataModal: false },
      table: {
        dataTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Manager Name',
              key: 'container_manager_name'
            },
            {
              title: 'Manager Email',
              key: 'container_manager_email'
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
        ruleDataModal: {
          container_manager_name: [{ required: true, trigger: 'change', message: 'Enter manager name' }],
          container_manager_email: [
            {
              required: true,
              validator: (rule, value, callback) => {
                // let mails = value.split(',')
                // for (let m of mails) {
                //   if (m) {
                //     if (!Isemail.validate(m)) {
                //       return callback(new Error('Enter manager email'))
                //     }
                //   }
                // }
                callback()
              },
              trigger: 'change',
              message: 'Enter manager email'
            }
          ]
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
        this.getTableData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.dataTable.offset = (index - 1) * this.table.dataTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.dataTable.search_text,
          offset: this.table.dataTable.offset,
          limit: this.table.dataTable.limit
        })
        let data = response.data.info
        this.table.dataTable.total = data.total
        this.table.dataTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addDataModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formData.resetFields()
      this.modal.dataModal = true
    },
    modifyDataModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formData.resetFields()
      this.modal.dataModal = true
    },
    submitData: function() {
      this.$refs.formData.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getTableData()
            this.modal.dataModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteData: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { container_manager_id: row.container_manager_id })
          this.$Message.success('delete success')
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>