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
      Freight Place
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Freight Place">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="freight place name、code" v-model="table.freightPlace.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getFreightPlaceData(1)">
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
      <Table stripe ref="freightPlace" :columns="table.freightPlace.rows" :data="table.freightPlace.data" :border="table.freightPlace.data && table.freightPlace.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyFreightPlaceModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteFreightPlacePort(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.freightPlace.total" :page-size="table.freightPlace.limit" @on-change="getFreightPlaceData"/>
    </panel>
    <Modal v-model="modal.freightPlaceModal" title="Freight Place">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleFreightPlaceModal" ref="formFreightPlace">
        <FormItem label="NAME" prop="freight_place_name">
          <Input placeholder="Discharge Port Name" v-model="workPara.freight_place_name"/>
        </FormItem>
        <FormItem label="CODE" prop="freight_place_code">
          <Input placeholder="Discharge Port Code" v-model="workPara.freight_place_code"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.freightPlaceModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitFreightPlacePort">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/FreightPlaceControl/'

export default {
  name: 'FreightPlaceControl',
  data: function() {
    return {
      modal: { freightPlaceModal: false },
      table: {
        freightPlace: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Name',
              key: 'freight_place_name'
            },
            {
              title: 'Code',
              key: 'freight_place_code'
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
        ruleFreightPlaceModal: {
          freight_place_name: [{ required: true, trigger: 'change', message: 'Enter freight place name' }],
          freight_place_code: [{ required: true, trigger: 'change', message: 'Enter freight place code' }],
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
        this.getFreightPlaceData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getFreightPlaceData: async function(index) {
      try {
        if (index) {
          this.table.freightPlace.offset = (index - 1) * this.table.freightPlace.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.freightPlace.search_text,
          offset: this.table.freightPlace.offset,
          limit: this.table.freightPlace.limit
        })
        let data = response.data.info
        this.table.freightPlace.total = data.total
        this.table.freightPlace.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addDischargePortModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formFreightPlace.resetFields()
      this.modal.freightPlaceModal = true
    },
    modifyFreightPlaceModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formFreightPlace.resetFields()
      this.modal.freightPlaceModal = true
    },
    submitFreightPlacePort: function() {
      this.$refs.formFreightPlace.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add freight place success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify freight place success')
            }
            this.modal.freightPlaceModal = false
            this.getFreightPlaceData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteFreightPlacePort: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { freight_place_id: row.freight_place_id })
          this.$Message.success('delete success')
          this.getFreightPlaceData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>