<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">系统管理</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      操作密码
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="维护">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="search name" v-model="table.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getPassordData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="panel-toolbar">
              <button type="button" class="btn btn-info" @click="addModal">新增操作密码</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="passwordTable" :columns="table.rows" :data="table.data" :border="table.data && table.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deletePassword(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.total" :page-size="table.limit" @on-change="getPassordData"/>
    </panel>
    <Modal v-model="modal.operationPasswordModal" title="Operation Password" width="640">
      <Form :model="workPara" :label-width="120" :rules="formRule" ref="formGroup">
        <FormItem label="DESCRIPTION" prop="operation_desc">
          <Input placeholder="DESCRIPTION" v-model="workPara.operation_desc"/>
        </FormItem>
        <FormItem label="ACTION" prop="operation_action">
          <Input placeholder="ACTION" v-model="workPara.operation_action" :disabled="action === 'modify'"/>
        </FormItem>
        <FormItem label="PASSWORD" prop="operation_password">
          <Input placeholder="PASSWORD" v-model="workPara.operation_password"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.operationPasswordModal=false">取消</Button>
        <Button type="primary" size="large" @click="submitPassword()">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/common/system/OperationPassword/'

export default {
  name: 'OperationPasswordControl',
  data() {
    return {
      modal: {operationPasswordModal: false},
      table: {
        rows: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: 'DESCRIPTION',
            key: 'operation_desc',
            align: 'center'
          },
          {
            title: 'ACTION',
            key: 'operation_action',
            align: 'center'
          },
          {
            title: 'PASSWORD',
            key: 'operation_password',
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
      },
      formRule: {
        operation_desc: [{ required: true, message: 'The description cannot be empty', trigger: 'blur' }],
        operation_action: [{ required: true, message: 'The action cannot be empty', trigger: 'blur' }],
        operation_password: [{ required: true, message: 'The password cannot be empty', trigger: 'blur' }]
      },
      workPara: {},
      pagePara: {},
      pageTree: [],
      actNode: {},
      action: ''
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getPassordData(1)
  },
  methods: {
    getPassordData: async function(index) {
      try {
        if (index) {
          this.table.offset = (index - 1) * this.table.limit
        }
        let response = await this.$http.post(apiUrl + 'search', {search_text: this.table.search_text, offset: this.table.offset, limit: this.table.limit})
        let data = response.data.info
        this.table.total = data.total
        this.table.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addModal: async function() {
      await this.getPageTreeData()
      this.workPara = {}
      this.action = 'add'
      this.modal.operationPasswordModal = true
    },
    modifyModal: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.action = 'modify'
      this.modal.operationPasswordModal = true
    },
    getPageTreeData: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'searchPage', {})
        this.pageTree = response.data.info
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    renderPageTreedata: function(h, { root, node, data }) {
      return common.treeIconRender(h, { root, node, data }, this, this.$refs.pageTree, 'ios-folder-open', 'ios-cog')
    },
    submitPassword: async function() {
      let param = {
        ...this.workPara
      }
      if(this.action === 'add') {
        await this.$http.post(apiUrl + 'add', param)
      } else {
        await this.$http.post(apiUrl + 'modify', param)
      }
      this.modal.operationPasswordModal = false
      this.getPassordData(1)
    },
    deletePassword: async function(row) {
      await this.$http.post(apiUrl + 'delete', row)
      this.getPassordData(1)
    }
  }
}
</script>