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
      Customer Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="Search Name Phone" v-model="table.userTable.search_text" class="form-control">
              <input type="text" placeholder="Search TIN" v-model="table.userTable.search_tin" class="form-control">
              <input type="text" placeholder="Search Finance Info" v-model="table.userTable.search_finance" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getUserData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="userTable" :columns="table.userTable.rows" :data="table.userTable.data">
        <template slot-scope="{ row, index }" slot="user_customer_type">
          <div v-for="item in pagePara.USER_CUSTOMER_TYPE" v-bind:key="item.id">
            <Tag :color="item.color" v-if="row.user_customer_type == item.id">{{item.text}}</Tag>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="user_rate">
          <Rate v-model="row.user_rate" disabled></Rate>
        </template>
        <template slot-scope="{ row, index }" slot="user_blacklist">
          <i-switch v-model="row.user_blacklist" @on-change="changeBlacklist(row)" size="large" true-value="1" false-value="0" disabled>
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
          </i-switch>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.userTable.total" :page-size="table.userTable.limit" @on-change="getUserData"/>
    </panel>
    <Modal v-model="modal.userModal" title="Customer">
      <Form :model="workPara" :label-width="100" :rules="formRule.ruleUserModal" ref="formUser">
        <FormItem label="Username" prop="user_username">
          <Input placeholder="Username" v-model="workPara.user_username" :disabled="action === 'modify'"/>
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
        <FormItem label="Address" prop="user_address">
          <Input placeholder="Address" v-model="workPara.user_address"/>
        </FormItem>
        <FormItem label="Type" prop="user_type">
          <Select v-model="workPara.user_customer_type">
            <Option v-for="item in pagePara.USER_CUSTOMER_TYPE" :value="item.id" :key="item.id">{{item.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="TIN" prop="user_tin">
          <Input placeholder="TIN" v-model="workPara.user_tin"/>
        </FormItem>
        <FormItem label="VRN" prop="user_vrn">
          <Input placeholder="VRN" v-model="workPara.user_vrn"/>
        </FormItem>
        <FormItem label="BANK USD" prop="user_bank_account_usd">
          <Input placeholder="BANK USD" v-model="workPara.user_bank_account_usd"/>
        </FormItem>
        <FormItem label="BANK TZS" prop="user_bank_account_tzs">
          <Input placeholder="BANK TZS" v-model="workPara.user_bank_account_tzs"/>
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
const apiUrl = '/api/zhongtan/configuration/Customer/'

export default {
  name: 'CustomerControl',
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
              key: 'user_username',
              width: 200,
            },
            {
              title: 'Name',
              key: 'user_name',
              width: 300,
            },
            {
              title: 'Type',
              slot: 'user_customer_type',
              width: 150,
            },
            {
              title: 'Rate',
              slot: 'user_rate',
              width: 180,
            },
            {
              title: 'Phone',
              key: 'user_phone',
              width: 150,
            },
            {
              title: 'Email',
              key: 'user_email',
              width: 200,
            },
            {
              title: 'Address',
              key: 'user_address',
              render: common.tooltipRender(),
              width: 150,
            },
            {
              title: 'TIN',
              key: 'user_tin',
              width: 150,
            },
            {
              title: 'VRN',
              key: 'user_vrn',
              width: 150,
            },
            {
              title: 'BANK USD',
              key: 'user_bank_account_usd',
              width: 150,
            },
            {
              title: 'BANK TZS',
              key: 'user_bank_account_tzs',
              width: 150,
            },
            {
              title: 'Blacklist',
              slot: 'user_blacklist',
              width: 100,
            },
            {
              title: 'U8 Customer Code',
              key: 'u8_code',
              width: 200,
            },
            {
              title: 'U8 Customer Alias',
              key: 'u8_alias',
              width: 200,
            },
            {
              title: 'U8 Vendor Code',
              key: 'u8_vendor_code',
              width: 100,
            },
            {
              title: 'U8 Vendor Alias',
              key: 'u8_vendor_alias',
              width: 200,
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_text: '',
          search_tin: '',
          search_finance: ''
        }
      },
      formRule: {
        ruleUserModal: {
          user_username: [{ required: true, trigger: 'change', message: 'Enter Username' }],
          user_name: [{ required: true, trigger: 'change', message: 'Enter Name' }],
          user_email: [{ required: true, type: 'email', rigger: 'change', message: 'Enter Email' }],
          user_address: [{ required: true, rigger: 'change', message: 'Enter Address' }]
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
          search_tin: this.table.userTable.search_tin,
          search_finance: this.table.userTable.search_finance,
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
      this.workPara = {
        user_customer_type: '1'
      }
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
              this.$Message.success('Add Customer Success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('Modify Customer Success')
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
      this.$commonact.confirm('Delete Customer?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { user_id: row.user_id })
          this.$Message.success('Delete Success')
          this.getUserData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    changeBlacklist: async function(row) {
      try {
        await this.$http.post(apiUrl + 'changeBlacklist', row)
        if(row.user_blacklist === '1'){
          this.$Message.success('add blacklist Success')
        } else {
          this.$Message.success('remove blacklist Success')
        }
        this.getUserData()
      } catch (error) {
        if(row.user_blacklist === '1'){
          row.user_blacklist = '0'
        } else {
          row.user_blacklist = '1'
        }
        this.$commonact.fault(error)
      }
    }
  }
}
</script>