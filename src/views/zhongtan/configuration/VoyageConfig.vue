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
      Voyage Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="voyage name、operator、code" v-model="table.voyageTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getVoyageData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addVoyageModal">Add Voyage</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="voyageTable" :columns="table.voyageTable.rows" :data="table.voyageTable.data">
        <template slot-scope="{ row, index }" slot="vessel_id">
          <Select v-model="row.vessel_id">
            <Option v-for="item in pagePara.VesselINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyVesselModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteVessel(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.voyageTable.total" :page-size="table.voyageTable.limit" @on-change="getVoyageData"/>
    </panel>
    <Modal v-model="modal.voyageModal" title="Voyage">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleVoyageModal" ref="formVoyage">
        <FormItem label="Vessel Name" prop="vessel_id">
          <Select v-model="workPara.vessel_id">
            <Option v-for="item in pagePara.VesselINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Voyage Number" prop="voyage_number">
          <Input placeholder="Voyage Number" v-model="workPara.voyage_number"/>
        </FormItem>
        <FormItem label="ETA Date" prop="voyage_eta_date">
          <DatePicker type="date" v-model="workPara.voyage_eta_date"></DatePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.voyageModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitVoyage">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/VoyageConfig/'

export default {
  name: 'VoyageConfig',
  data: function() {
    return {
      modal: { voyageModal: false },
      table: {
        voyageTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Vessel Name',
              slot: 'vessel_id'
            },
            {
              title: 'Voyage Number',
              key: 'voyage_number'
            },
            {
              title: 'ETA DATE',
              key: 'voyage_eta_date'
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
        ruleVoyageModal: {
          vessel_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose vessel' }],
          voyage_number: [{ required: true, trigger: 'change', message: 'Enter voyage number' }],
          voyage_eta_date: [{ required: true, type: 'date', trigger: 'change', message: 'Please select date' }]
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
        this.getVoyageData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getVoyageData: async function(index) {
      try {
        if (index) {
          this.table.voyageTable.offset = (index - 1) * this.table.voyageTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.voyageTable.search_text,
          offset: this.table.voyageTable.offset,
          limit: this.table.voyageTable.limit
        })
        let data = response.data.info
        this.table.voyageTable.total = data.total
        this.table.voyageTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addVoyageModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formVoyage.resetFields()
      this.modal.voyageModal = true
    },
    modifyVesselModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formVoyage.resetFields()
      this.modal.voyageModal = true
    },
    submitVoyage: function() {
      this.$refs.formVoyage.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getVoyageData()
            this.modal.voyageModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteVessel: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { voyage_id: row.voyage_id })
          this.$Message.success('delete success')
          this.getVoyageData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>