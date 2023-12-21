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
      Bank Info Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="CTNR Type Config">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="container size name、code" v-model="table.bankInfoTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getBankInfoData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addBankInfoModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="bankInfoTable" :columns="table.bankInfoTable.rows" :data="table.bankInfoTable.data" :border="table.bankInfoTable.data && table.bankInfoTable.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyBankInfoModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteBankInfo(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.bankInfoTable.total" :page-size="table.bankInfoTable.limit" @on-change="getBankInfoData"/>
    </panel>
    <Modal v-model="modal.bankInfoModal" title="Bank Info">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleBankInfoModal" ref="formBankInfo">
        <FormItem label="Bank Code" prop="bank_code">
          <Input placeholder="Bank Code" v-model="workPara.bank_code"/>
        </FormItem>
        <FormItem label="Bank Name" prop="bank_name">
          <Input placeholder="Bank Name" v-model="workPara.bank_name"/>
        </FormItem>
        <FormItem label="Remark" prop="bank_remark">
          <Input placeholder="Remark" v-model="workPara.bank_remark"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bankInfoModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitBankInfo">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/BankInfoConfig/'

export default {
  name: 'BankInfoConfig',
  data: function() {
    return {
      modal: { bankInfoModal: false },
      table: {
        bankInfoTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'CODE',
              key: 'bank_code'
            },
            {
              title: 'NAME',
              key: 'bank_name'
            },
            {
              title: 'REMARK',
              key: 'bank_remark'
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
        ruleBankInfoModal: {
          bank_code: [{ required: true, trigger: 'change', message: 'Enter Bank Code name' }],
          bank_name: [{ required: true, trigger: 'change', message: 'Enter Bank Name code' }]
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
        this.getBankInfoData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getBankInfoData: async function(index) {
      try {
        if (index) {
          this.table.bankInfoTable.offset = (index - 1) * this.table.bankInfoTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.bankInfoTable.search_text,
          offset: this.table.bankInfoTable.offset,
          limit: this.table.bankInfoTable.limit
        })
        let data = response.data.info
        this.table.bankInfoTable.total = data.total
        this.table.bankInfoTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addBankInfoModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formBankInfo.resetFields()
      this.modal.bankInfoModal = true
    },
    modifyBankInfoModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formBankInfo.resetFields()
      this.modal.bankInfoModal = true
    },
    submitBankInfo: function() {
      this.$refs.formBankInfo.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.workPara = {}
              this.$Message.success('add success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify success')
              this.modal.bankInfoModal = false
            }
            this.getBankInfoData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteBankInfo: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { bank_id: row.bank_id })
          this.$Message.success('delete success')
          this.getBankInfoData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
  }
}
</script>