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
      Employee Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="维护">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="Search Name Phone" v-model="table.userTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getUserData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addUserModal">Add Employee</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="userTable" :columns="table.userTable.rows" :data="table.userTable.data">
        <template slot-scope="{ row, index }" slot="user_service_name">
          <Select v-model="workPara.user_service_name">
            <Option v-for="item in pagePara.VesselServiceINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyUserModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteUser(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.userTable.total" :page-size="table.userTable.limit" @on-change="getUserData"/>
    </panel>
    <Modal v-model="modal.userModal" title="Employee">
      <Form :model="workPara" :label-width="100" :rules="formRule.ruleUserModal" ref="formUser">
        <FormItem label="Username" prop="user_username">
          <Input placeholder="Username" v-model="workPara.user_username" :disabled="action === 'modify'"/>
        </FormItem>
        <FormItem label="Vessel Service" prop="user_service_name">
          <Select v-model="workPara.user_service_name">
            <Option v-for="item in pagePara.VesselServiceINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Name" prop="user_name">
          <Input placeholder="Name" v-model="workPara.user_name"/>
        </FormItem>
        <FormItem label="Email" prop="user_email">
          <Input placeholder="Email" v-model="workPara.user_email"/>
        </FormItem>
        <FormItem label="Phone" prop="user_phone">
          <Input placeholder="Phone" v-model="workPara.user_phone"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.userModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitUser">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/Employee/'

export default {
  name: 'OperatorControl',
  data: function() {
    return {
      modal: { userModal: false },
      table: {
        userTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Username',
              key: 'user_username'
            },
            {
              title: 'Vessel Service',
              key: 'user_service_name',
              render: common.selectRender(this, 'VesselServiceINFO'),
            },
            {
              title: 'Name',
              key: 'user_name'
            },
            {
              title: 'Phone',
              key: 'user_phone'
            },
            {
              title: 'Email',
              key: 'user_email'
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
        ruleUserModal: {
          user_username: [{ required: true, trigger: 'change', message: 'Enter Username' }],
          user_service_name: [{ required: true, trigger: 'change', message: 'Choose Service Name' }],
          user_name: [{ required: true, trigger: 'change', message: 'Enter Name' }],
          user_email: [{ required: true, type: 'email', rigger: 'change', message: 'Enter Email' }]
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
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
    this.getUserData(1)
  },
  methods: {
    getUserData: async function(index) {
      try {
        if (index) {
          this.table.userTable.offset = (index - 1) * this.table.userTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.userTable.search_text,
          offset: this.table.userTable.offset,
          limit: this.table.userTable.limit
        })
        let data = response.data.info
        this.table.userTable.total = data.total
        this.table.userTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addUserModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formUser.resetFields()
      this.modal.userModal = true
    },
    modifyUserModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formUser.resetFields()
      this.modal.userModal = true
    },
    submitUser: function() {
      this.$refs.formUser.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('Add Employee Success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('Modify Employee Success')
            }
            this.getUserData()
            this.modal.userModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteUser: function(row) {
      this.$commonact.confirm('Delete Employee?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { user_id: row.user_id })
          this.$Message.success('Delete Employee Success')
          this.getUserData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>