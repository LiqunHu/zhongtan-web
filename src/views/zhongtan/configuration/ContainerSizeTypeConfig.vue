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
      CTNR Type Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="CTNR Type Config">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="container size name、code" v-model="table.containerSizeTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getContainerSizeData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addContainerSizeModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="containerSizeTable" :columns="table.containerSizeTable.rows" :data="table.containerSizeTable.data" border>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyContainerSizeModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteContainerSize(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerSizeTable.total" :page-size="table.containerSizeTable.limit" @on-change="getContainerSizeData"/>
    </panel>
    <Modal v-model="modal.containerSizeModal" title="Container Size">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleContainerSizeModal" ref="formContainerSize">
        <FormItem label="CTNR TYPE" prop="container_size_name">
          <Input placeholder="CTNR TYPE" v-model="workPara.container_size_name"/>
        </FormItem>
        <FormItem label="CODE" prop="container_size_code">
          <Input placeholder="CODE" v-model="workPara.container_size_code"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.containerSizeModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitContainerSize">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/ContainerSizeConfig/'

export default {
  name: 'ContainerSizeConfig',
  data: function() {
    return {
      modal: { containerSizeModal: false },
      table: {
        containerSizeTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'CTNR TYPE',
              key: 'container_size_name'
            },
            {
              title: 'CODE',
              key: 'container_size_code'
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
        ruleContainerSizeModal: {
          container_size_name: [{ required: true, trigger: 'change', message: 'Enter container size name' }],
          container_size_code: [{ required: true, trigger: 'change', message: 'Enter container size code' }],
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
        this.getContainerSizeData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getContainerSizeData: async function(index) {
      try {
        if (index) {
          this.table.containerSizeTable.offset = (index - 1) * this.table.containerSizeTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.containerSizeTable.search_text,
          offset: this.table.containerSizeTable.offset,
          limit: this.table.containerSizeTable.limit
        })
        let data = response.data.info
        this.table.containerSizeTable.total = data.total
        this.table.containerSizeTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addContainerSizeModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formContainerSize.resetFields()
      this.modal.containerSizeModal = true
    },
    modifyContainerSizeModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formContainerSize.resetFields()
      this.modal.containerSizeModal = true
    },
    submitContainerSize: function() {
      this.$refs.formContainerSize.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.workPara = {}
              this.$Message.success('add success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify success')
              this.modal.containerSizeModal = false
            }
            this.getContainerSizeData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteContainerSize: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { container_size_id: row.container_size_id })
          this.$Message.success('delete success')
          this.getContainerSizeData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>