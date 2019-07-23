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
      Billlading No. Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="voyage name、operator、code" v-model="table.dataTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getTableData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addDataModal">Add Billlading No. Batch</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="dataTable" :columns="table.dataTable.rows" :data="table.dataTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteData(row)" v-show="row.state === '1'">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.dataTable.total" :page-size="table.dataTable.limit" @on-change="getTableData"/>
    </panel>
    <Modal v-model="modal.dataModal" title="Billladingno Batch">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleDataModal" ref="formData">
        <FormItem label="Vessel Service" prop="billladingno_batch_vessel_service">
          <Select v-model="workPara.billladingno_batch_vessel_service">
            <Option v-for="item in pagePara.VesselServiceINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Fix String" prop="billladingno_batch_fix_string">
          <Input placeholder="Fix String" v-model="workPara.billladingno_batch_fix_string"/>
        </FormItem>
        <FormItem label="Fix String End" prop="billladingno_batch_fix_string_end">
          <Input placeholder="Fix StringEnd" v-model="workPara.billladingno_batch_fix_string_end"/>
        </FormItem>
        <FormItem label="Number String Length" prop="billladingno_batch_number_length">
          <Input placeholder="Number Length" v-model="workPara.billladingno_batch_number_length"/>
        </FormItem>
        <FormItem label="Number Start" prop="billladingno_batch_number_start">
          <Input placeholder="Number Start" v-model="workPara.billladingno_batch_number_start"/>
        </FormItem>
        <FormItem label="Billlading No Count" prop="billladingno_batch_count">
          <Input placeholder="Billlading No Count" v-model="workPara.billladingno_batch_count" @on-blur="genRangeString()"/>
        </FormItem>
        <FormItem label="Number Range">{{rangeString}}</FormItem>
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
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/configuration/BillladingNoConfig/'

export default {
  name: 'BillladingNoConfig',
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
              title: 'Vessel Service',
              key: 'billladingno_batch_vessel_service',
              render: common.selectRender(this, 'VesselServiceINFO')
            },
            {
              title: 'Fix String',
              key: 'billladingno_batch_fix_string'
            },
            {
              title: 'Fix String End',
              key: 'billladingno_batch_fix_string_end'
            },
            {
              title: 'Number String Length',
              key: 'billladingno_batch_number_length'
            },
            {
              title: 'Number Start',
              key: 'billladingno_batch_number_start'
            },
            {
              title: 'BL. Count',
              key: 'billladingno_batch_count'
            },
            {
              title: 'BL. Used',
              key: 'billladingno_batch_use_count'
            },
            {
              title: 'State',
              key: 'state',
              render: common.selectRender(this, 'STATUSINFO')
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
          billladingno_batch_vessel_service: [{ required: true, trigger: 'change', message: 'Select Vessel Service' }],
          billladingno_batch_fix_string: [{ required: true, trigger: 'change', message: 'Enter Fix String' }],
          billladingno_batch_number_length: [{ required: true, trigger: 'change', message: 'Enter Number String Length' }],
          billladingno_batch_number_start: [{ required: true, trigger: 'change', message: 'Enter Batch Number Start' }],
          billladingno_batch_count: [{ required: true, trigger: 'change', message: 'Enter Batch Number Count' }]
        }
      },
      pagePara: {},
      workPara: {},
      rangeString: ''
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
      this.$refs.formData.resetFields()
      this.modal.dataModal = true
    },
    submitData: function() {
      this.$refs.formData.validate(async valid => {
        if (valid) {
          try {
            await this.$http.post(apiUrl + 'add', this.workPara)
            this.$Message.success('add port success')
            this.getTableData()
            this.modal.dataModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteData: function(row) {
      this.$commonact.confirm('cancel the batch confirmed? The rest b/l No. will invalid', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { billladingno_batch_id: row.billladingno_batch_id })
          this.$Message.success('cancel success')
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    genRangeString: function() {
      this.$refs.formData.validate(async valid => {
        if (valid) {
          let fixStr = this.workPara.billladingno_batch_fix_string
          let numLen = parseInt(this.workPara.billladingno_batch_number_length) * -1
          let numStart = parseInt(this.workPara.billladingno_batch_number_start)
          let blCount = parseInt(this.workPara.billladingno_batch_count)
          let blStart = fixStr + ('0000000000000000000000000000000' + numStart).slice(numLen) + (this.workPara.billladingno_batch_fix_string_end || '')
          let blEnd = fixStr + ('0000000000000000000000000000000' + (numStart + blCount - 1)).slice(numLen) + (this.workPara.billladingno_batch_fix_string_end  || '')
          this.rangeString = blStart + ' ---- ' + blEnd
        }
      })
    }
  }
}
</script>