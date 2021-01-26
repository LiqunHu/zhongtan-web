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
      Allot Depot Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="userTable" :columns="table.userTable.rows" :data="table.userTable.data">
        <template slot-scope="{ row, index }" slot="allot_depot_rules">
          <Card :bordered="false">
            <p slot="title">COSCO</p>
            <Row>
              <Col v-for="(item, index) in row.allot_depot_rules.COSCO" :key="index" span="8">{{item.depot_name}} : {{item.depot_percent}}%</Col>
            </Row>
          </Card>
          <Card :bordered="false">
            <p slot="title">OOCL</p>
            <Row>
              <Col v-for="(item, index) in row.allot_depot_rules.OOCL" :key="index" span="8">{{item.depot_name}} : {{item.depot_percent}}%</Col>
            </Row>
          </Card>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteAllotDepot(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.userTable.total" :page-size="table.userTable.limit" @on-change="getData"/>
    </panel>
    <Modal v-model="modal.configModal" title="Allot Depot">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Enabled">
          <DatePicker type="date" placeholder="Enabled date" v-model="workPara.allot_depot_enabled" @on-change="enabledDateChange"></DatePicker>
        </FormItem>
        <Card :bordered="false">
            <p slot="title">COSCO</p>
            <FormItem :label="item.depot_name" v-for="(item, index) in workPara.allot_depot_rules.COSCO" :key="index" style="margin-bottom: 0px;">
              <InputNumber
                :min="0"
                :max="100"
                :precision="0"
                v-model="item.depot_percent"
                :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"></InputNumber>
            </FormItem>
        </Card>
        <Card :bordered="false">
            <p slot="title">OOCL</p>
            <FormItem :label="item.depot_name" v-for="(item, index) in workPara.allot_depot_rules.OOCL" :key="index" style="margin-bottom: 0px;">
              <InputNumber
                :min="0"
                :max="100"
                :precision="0"
                v-model="item.depot_percent"
                :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"></InputNumber>
            </FormItem>
        </Card>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.configModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitAllotDepot">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/configuration/AllotDepotConfig/'

export default {
  name: 'AllotDepotConfig',
  data: function() {
    return {
      modal: { configModal: false },
      table: {
        userTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Enabled Date',
              key: 'allot_depot_enabled',
              width: 200,
            },
            {
              title: 'Allot Rule',
              slot: 'allot_depot_rules'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100,
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
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
        this.workPara = {
          allot_depot_id: '',
          allot_depot_enabled: '',
          allot_depot_rules: JSON.parse(JSON.stringify(this.pagePara.allotRules))
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
    this.getData(1)
  },
  methods: {
    getData: async function(index) {
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
    addModal: async function() {
      this.workPara = {
        allot_depot_id: '',
        allot_depot_enabled: '',
        allot_depot_rules: JSON.parse(JSON.stringify(this.pagePara.allotRules))
      }
      this.action = 'add'
      this.modal.configModal = true
    },
    modifyModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.modal.configModal = true
    },
    submitAllotDepot: async function() {
      try {
        if (this.action === 'add') {
          await this.$http.post(apiUrl + 'add', this.workPara)
          this.$Message.success('Add Allot Rule Success')
        } else if (this.action === 'modify') {
          await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
          this.$Message.success('Modify Allot Rule Success')
        }
        this.getData()
        this.modal.configModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    deleteAllotDepot: async function(row) {
      this.$commonact.confirm('Delete Allot Rule?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { allot_depot_id: row.allot_depot_id })
          this.$Message.success('Delete Success')
          this.getData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    enabledDateChange: async function(date) {
      this.workPara.allot_depot_enabled = date
    }
  }
}
</script>