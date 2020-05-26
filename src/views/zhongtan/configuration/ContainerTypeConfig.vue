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
      Container Type Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="container type name、code" v-model="table.containerTypeTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getContainerTypeData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addContainerTypeModal">Add Container Type</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="containerTypeTable" :columns="table.containerTypeTable.rows" :data="table.containerTypeTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyContainerTypeModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteContainerType(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.containerTypeTable.total" :page-size="table.containerTypeTable.limit" @on-change="getContainerTypeData"/>
    </panel>
    <Modal v-model="modal.containerTypeModal" title="Container Type">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleContainerTypeModal" ref="formContainerType">
        <FormItem label="Container Type Code" prop="container_type_code">
          <Input placeholder="Container Type Code" v-model="workPara.container_type_code"/>
        </FormItem>
        <FormItem label="Container Type Name" prop="container_type_name">
          <Input placeholder="Container Type Name" v-model="workPara.container_type_name"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.containerTypeModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitContainerType">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/ContainerTypeConfig/'

export default {
  name: 'ContainerTypeConfig',
  data: function() {
    return {
      modal: { containerTypeModal: false },
      table: {
        containerTypeTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Container Type Code',
              key: 'container_type_code'
            },
            {
              title: 'Container Type Name',
              key: 'container_type_name'
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
        ruleContainerTypeModal: {
          container_type_name: [{ required: true, trigger: 'change', message: 'Enter container type name' }],
          container_type_code: [{ required: true, trigger: 'change', message: 'Enter container type code' }],
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
        this.getContainerTypeData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getContainerTypeData: async function(index) {
      try {
        if (index) {
          this.table.containerTypeTable.offset = (index - 1) * this.table.containerTypeTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.containerTypeTable.search_text,
          offset: this.table.containerTypeTable.offset,
          limit: this.table.containerTypeTable.limit
        })
        let data = response.data.info
        this.table.containerTypeTable.total = data.total
        this.table.containerTypeTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addContainerTypeModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formContainerType.resetFields()
      this.modal.containerTypeModal = true
    },
    modifyContainerTypeModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formContainerType.resetFields()
      this.modal.containerTypeModal = true
    },
    submitContainerType: function() {
      this.$refs.formContainerType.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add container type success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify container type success')
            }
            this.getContainerTypeData()
            this.modal.containerTypeModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteContainerType: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { container_type_id: row.container_type_id })
          this.$Message.success('delete success')
          this.getContainerTypeData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>