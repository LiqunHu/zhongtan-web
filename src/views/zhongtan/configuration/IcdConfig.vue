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
      ICD Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="icd name、code" v-model="table.icdTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getIcdData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addIcdModal">Add ICD</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="icdTable" :columns="table.icdTable.rows" :data="table.icdTable.data" :height="mainTableHeight">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyIcdModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteIcd(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.icdTable.total" :page-size="table.icdTable.limit" @on-change="getIcdData"/>
    </panel>
    <Modal v-model="modal.icdModal" title="Icd">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleIcdModal" ref="formIcd">
        <FormItem label="Icd Name" prop="icd_name">
          <Input placeholder="Icd Name" v-model.trim="workPara.icd_name"/>
        </FormItem>
        <FormItem label="Icd Code" prop="icd_code">
          <Input placeholder="Icd Code" v-model.trim="workPara.icd_code"/>
        </FormItem>
        <FormItem label="Icd Tel">
          <Input placeholder="Icd Tel" v-model.trim="workPara.icd_tel"/>
        </FormItem>
        <FormItem label="Icd Edi Type">
          <Select v-model="workPara.icd_edi_type" @on-change="changeIcdEdiType">
            <Option v-for="item in pagePara.ICD_EDI_TYPE" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Icd Email">
          <Input placeholder="Icd Email" v-model.trim="workPara.icd_email"/>
        </FormItem>
        <FormItem label="SFTP Server" v-if="workPara.icd_edi_type == 'SFTP'">
          <Input placeholder="SFTP Server" v-model.trim="workPara.icd_server_name"/>
        </FormItem>
        <FormItem label="SFTP Port" v-if="workPara.icd_edi_type == 'SFTP'">
          <Input placeholder="SFTP Port" v-model.trim="workPara.icd_server_port"/>
        </FormItem>
        <FormItem label="SFTP Username" v-if="workPara.icd_edi_type == 'SFTP'">
          <Input placeholder="SFTP Username" v-model.trim="workPara.icd_server_username"/>
        </FormItem>
        <FormItem label="SFTP Password" v-if="workPara.icd_edi_type == 'SFTP'">
          <Input placeholder="SFTP Password" v-model.trim="workPara.icd_server_password"/>
        </FormItem>
        <FormItem label="SFTP Upload Path" v-if="workPara.icd_edi_type == 'SFTP'">
          <Input placeholder="SFTP Upload Path" v-model.trim="workPara.icd_server_path"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.icdModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitIcd">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/IcdConfig/'

export default {
  name: 'IcdConfig',
  data: function() {
    return {
      modal: { icdModal: false },
      mainTableHeight: common.getTableHeight(),
      table: {
        icdTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Icd Name',
              key: 'icd_name'
            },
            {
              title: 'Icd Code',
              key: 'icd_code'
            },
            {
              title: 'Icd Email',
              key: 'icd_email'
            },
            {
              title: 'Icd SFTP',
              key: 'icd_sftp_info'
            },
            {
              title: 'Icd Tel',
              key: 'icd_tel'
            },
            {
              title: 'Icd Edi Type',
              key: 'icd_edi_type'
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
        ruleIcdModal: {
          icd_name: [{ required: true, trigger: 'change', message: 'Enter icd name' }],
          icd_code: [{ required: true, trigger: 'change', message: 'Enter icd code' }],
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
        this.getIcdData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getIcdData: async function(index) {
      try {
        if (index) {
          this.table.icdTable.offset = (index - 1) * this.table.icdTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.icdTable.search_text,
          offset: this.table.icdTable.offset,
          limit: this.table.icdTable.limit
        })
        let data = response.data.info
        this.table.icdTable.total = data.total
        this.table.icdTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addIcdModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formIcd.resetFields()
      this.modal.icdModal = true
    },
    modifyIcdModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formIcd.resetFields()
      this.modal.icdModal = true
    },
    changeIcdEdiType: function(val) {
      
    },
    submitIcd: function() {
      this.$refs.formIcd.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add icd success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify icd success')
            }
            this.getIcdData()
            this.modal.icdModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteIcd: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { icd_id: row.icd_id })
          this.$Message.success('delete success')
          this.getIcdData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>