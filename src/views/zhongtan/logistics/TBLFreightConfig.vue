<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Logistics</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      TBL Freight Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="TBL Freight Config">
        <template slot="beforeBody">
            <div class="panel-toolbar">
                <div class="form-inline">
                    <div class="form-group m-r-2">
                        <i-select v-model="search_data.freight_config_vendor" clearable filterable placeholder = "select vendor">
                            <i-option  v-for="item in pagePara.COMMON_VENDOR" :value="item.vendor_id" :key="item.vendor_id" :label="item.vendor_code + '/' + item.vendor_name">
                                <span>{{item.vendor_code}}</span>
                                <span style="float:right;color:#ccc">{{item.vendor_name}}</span>
                            </i-option>
                        </i-select>
                    </div>
                    <div class="form-group m-r-10">
                        <button type="button" class="btn btn-info" @click="getTableData">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                    <div class="form-group m-r-10">
                        <button type="button" class="btn btn-info" @click="addFreightConfigModal">ADD</button>
                    </div>
                </div>
            </div>
        </template>
        <Table stripe size="small" ref="ruleTable" :columns="table.ruleTable.columns" :data="table.ruleTable.data" :height="table.ruleTable.height" :border="table.ruleTable.data && table.ruleTable.data.length > 0">
            <template slot-scope="{ row, index }" slot="freight_config_vendor">
               {{row.vendor_code}}/{{row.vendor_name}}
            </template>
            <template slot-scope="{ row, index }" slot="freight_config_business_type">
               <Tag color="primary" v-if="row.freight_config_business_type === 'I'">IMPORT</Tag>
               <Tag color="success" v-if="row.freight_config_business_type === 'E'">EXPORT</Tag>
            </template>
            <template slot-scope="{ row, index }" slot="freight_config_size_type">
               {{row.freight_config_size_type}} [
                <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.freight_config_size_type">{{item.container_size_name}}</span> ]
            </template>
            <template slot-scope="{ row, index }" slot="freight_config_advance">
               {{row.freight_config_advance}}%&nbsp;({{row.freight_config_advance_amount}})
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <a href="#" class="btn btn-primary btn-icon btn-sm" @click="updateFreightModal(row)">
                    <i class="fa fa-edit"></i>
                </a>
                <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteFreightAct(row)">
                    <i class="fa fa-times"></i>
                </a>
            </template>
        </Table>
        <Page class="m-t-10" :total="table.ruleTable.total" :page-size="table.ruleTable.limit" @on-change="getTableData" show-total/>
        <Modal v-model="modal.freightConfigModal" :title="textMap[modalStatus]" width="600">
            <Form ref="freightConfigForm" :model="freightConfigForm" :rules="chargeRules" :label-width="150" style="padding-right: 80px;">
                <FormItem label="Vendor" prop="freight_config_vendor">
                    <i-select v-model="freightConfigForm.freight_config_vendor" clearable filterable placeholder = "select vendor" :disabled="modalStatus === 'update'">
                        <i-option  v-for="item in pagePara.COMMON_VENDOR" :value="item.vendor_id" :key="item.vendor_id" :label="item.vendor_code + '/' + item.vendor_name">
                            <span>{{item.vendor_code}}</span>
                            <span style="float:right;color:#ccc">{{item.vendor_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Business Type" prop="freight_config_business_type">
                    <RadioGroup v-model="freightConfigForm.freight_config_business_type" @on-change="changeBusinessType">
                        <Radio v-for="item in pagePara.BUSINESS_TYPE" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;" :disabled="modalStatus === 'update'">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Cargo Type" prop="freight_config_cargo_type" v-if="freightConfigForm.freight_config_business_type ==='I'">
                    <RadioGroup v-model="freightConfigForm.freight_config_cargo_type">
                        <Radio v-for="item in importCargoTypeFileter" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Cargo Type" prop="freight_config_cargo_type" v-if="freightConfigForm.freight_config_business_type ==='E'">
                    <RadioGroup v-model="freightConfigForm.freight_config_cargo_type">
                        <Radio v-for="item in exportCargoTypeFileter" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Freight POL" prop="freight_config_pol" v-if="freightConfigForm.freight_config_business_type ==='I'">
                    <i-select v-model="freightConfigForm.freight_config_pol" clearable multiple filterable placeholder = "select freight pol" disabled>
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Freight POL" prop="freight_config_pol" v-if="modalStatus === 'create' && freightConfigForm.freight_config_business_type ==='E'">
                    <i-select v-model="freightConfigForm.freight_config_pol" clearable multiple filterable placeholder = "select freight pol">
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Freight POL" prop="freight_config_pol_update" v-if="modalStatus === 'update' && freightConfigForm.freight_config_business_type ==='E'">
                    <i-select v-model="freightConfigForm.freight_config_pol_update" clearable filterable placeholder = "select freight pol">
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Freight POD" prop="freight_config_pod" v-if="modalStatus === 'create' && freightConfigForm.freight_config_business_type ==='I'">
                    <i-select v-model="freightConfigForm.freight_config_pod" clearable multiple filterable placeholder = "select freight pod">
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Freight POD" prop="freight_config_pod_update" v-if="modalStatus === 'update' && freightConfigForm.freight_config_business_type ==='I'">
                    <i-select v-model="freightConfigForm.freight_config_pod_update" clearable filterable placeholder = "select freight pod">
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Freight POD" prop="freight_config_pod" v-if="freightConfigForm.freight_config_business_type ==='E'">
                    <i-select v-model="freightConfigForm.freight_config_pod" clearable multiple filterable placeholder = "select freight pod" disabled>
                        <i-option  v-for="item in pagePara.FREIGHT_PLACE" :value="item.freight_place_code" :key="item.freight_place_code" :label="item.freight_place_code">
                            <span>{{item.freight_place_code}}</span>
                            <span style="float:right;color:#ccc">{{item.freight_place_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Carrier Type" prop="freight_config_carrier">
                    <RadioGroup v-model="freightConfigForm.freight_config_carrier">
                        <Radio v-for="item in carrierFileter" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Container Size" prop="freight_config_size_type" v-if="modalStatus === 'create'">
                    <i-select v-model="freightConfigForm.freight_config_size_type" clearable multiple filterable placeholder = "select container size type">
                        <i-option  v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                            <span>{{item.container_size_code}}</span>
                            <span style="float:right;color:#ccc">{{item.container_size_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Container Type" prop="freight_config_size_type_update" v-if="modalStatus === 'update'">
                    <i-select v-model="freightConfigForm.freight_config_size_type_update" clearable filterable placeholder = "select container size type">
                        <i-option  v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                            <span>{{item.container_size_code}}</span>
                            <span style="float:right;color:#ccc">{{item.container_size_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Total Freight" prop="freight_config_amount">
                    <Input v-model="freightConfigForm.freight_config_amount" clearable placeholder="charge amount" @on-change="changeFreight"/>
                </FormItem>
                <FormItem label="Advance" prop="freight_config_advance">
                    <Row>
                        <i-col span="12">
                            <Input v-model="freightConfigForm.freight_config_advance" clearable placeholder="advance" @on-change="changeFreight">
                                <span slot="append" style="display:block; width: 30px">%</span>
                            </Input>
                        </i-col>
                        <i-col span="1">&nbsp;</i-col>
                        <i-col span="11">
                            <Input v-model="freightConfigForm.freight_config_advance_amount" disabled placeholder="charge amount"/>
                        </i-col>
                    </Row>
                </FormItem>
                <FormItem label="Enabled Date" prop="freight_config_enabled_date">
                    <DatePicker type="date" placeholder="Enabled Date" v-model="freightConfigForm.freight_config_enabled_date" format="yyyy-MM-dd" @on-change="enabledToDateChange"></DatePicker>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="modal.freightConfigModal=false">Cancel</Button>
                <Button type="primary" size="large" v-if="modalStatus === 'create'" @click="addFreightAct">Add Submit</Button>
                <Button type="primary" size="large" v-if="modalStatus === 'update'" @click="updateFreightAct">Update Submit</Button>
            </div>
        </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/logistics/TBLFreightConfig/'

export default {
  name: 'OverdueCalculationConfig',
  data: function() {
    return {
      modal: {freightConfigModal: false},
      modalStatus: 'create',
      textMap: {
        update: 'Edit TBL Freight Config',
        create: 'Add TBL Freight Config'
      },
      importCargoTypeFileter: [
          {id: 'IMPORT', text: 'IM'},
          {id: 'TRANSIT', text: 'TR'}
      ],
      exportCargoTypeFileter: [
          {id: 'LOCAL', text: 'LOCAL'},
          {id: 'TRANSIT', text: 'TRANSIT'}
      ],
      carrierFileter: [
          {id: 'COS', text: 'COSCO'},
          {id: 'OOL', text: 'OOCL'}
      ],
      pagePara: {},
      table: {
        ruleTable: {
          columns: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Vendor',
              slot: 'freight_config_vendor',
              align: 'center'
            },
            {
              title: 'Business type',
              slot: 'freight_config_business_type',
              align: 'center'
            },
            {
              title: 'Cargo type',
              key: 'freight_config_cargo_type',
            },
            {
              title: 'POL',
              key: 'freight_config_pol',
            },
            {
              title: 'POD',
              key: 'freight_config_pod',
            },
            {
              title: 'Carrier',
              key: 'freight_config_carrier',
            },
            {
              title: 'Container',
              slot: 'freight_config_size_type',
            },
            {
              title: 'Freight',
              key: 'freight_config_amount',
            },
            {
              title: 'Advance',
              slot: 'freight_config_advance',
            },
            {
              title: 'Enabled Date',
              key: 'freight_config_enabled_date',
            },
            {
                title: 'Action',
                slot: 'action',
                width: 150
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        }
      },
      search_data: {
        overdue_charge_business_type: 'I',
        overdue_charge_cargo_type: '',
        overdue_charge_discharge_port: '',
        overdue_charge_carrier: '',
        overdue_charge_container_size: '',
        overdue_charge_container_type: ''
      },
      freightConfigFormOld: {},
      freightConfigForm: {
        freight_config_vendor: '',
        freight_config_business_type: 'I',
        freight_config_cargo_type: 'IMPORT',
        freight_config_pol: ['TZDAR'],
        freight_config_pod: '',
        freight_config_carrier: 'COS',
        freight_config_size_type: [],
        freight_config_amount: '',
        freight_config_advance: '',
        freight_config_advance_amount: '',
        freight_config_enabled_date: moment().format('YYYY-MM-DD')
      },
      overdueChargeFree: false,
      chargeRules: {
        freight_config_vendor: [
            { required: true, message: 'The vendor cannot be empty', trigger: 'change' }
        ],
        freight_config_business_type: [
            { required: true, message: 'The business type cannot be empty', trigger: 'change' }
        ],
        freight_config_cargo_type: [
            { required: true, message: 'The cargo type cannot be empty', trigger: 'change' }
        ],
        freight_config_pol: [
            { type: 'array', min: 1, required: true, trigger: 'change', message: 'select config pol'}
        ],
        freight_config_pol_update: [
            { required: true, message: 'The cargo type cannot be empty', trigger: 'change' }
        ],
        freight_config_pod: [
            { type: 'array', min: 1, required: true, trigger: 'change', message: 'select config pod'}
        ],
        freight_config_pod_update: [
            { required: true, message: 'The cargo type cannot be empty', trigger: 'change' }
        ],
        freight_config_carrier: [
            { required: true, message: 'The carrier cannot be empty', trigger: 'change' }
        ],
        freight_config_size_type: [
            { type: 'array', min: 1, required: true, trigger: 'change', message: 'select container size type'}
        ],
        freight_config_size_type_update: [
            { required: true, message: 'The cargo type cannot be empty', trigger: 'change' }
        ],
        freight_config_amount: [
            { required: true, message: 'The feight cannot be empty', trigger: 'blur' },
            { type: 'number', message: 'The feight must be number', trigger: 'blur' , transform(value) { return Number(value)}}
        ],
        freight_config_advance: [
            { required: true, message: 'The advance cannot be empty', trigger: 'blur' },
            { type: 'number', message: 'The advance must be number', trigger: 'blur' , transform(value) { return Number(value)}},
            {type: 'number', asyncValidator: (rule, value) => {
                return new Promise((resolve, reject) => {
                    if (value <= 0) {
                        reject('The advance must greater than 0')
                    } else if(value >= 100) {
                        reject('The advance must less than 100')
                    } else {
                        resolve();
                    }
                });
            }}
        ],
        freight_config_enabled_date: [
            { required: true, message: 'The enabled date cannot be empty', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    try {
      this.getPara()
      this.getTableData(1)
    } catch (error) {
      this.$commonact.fault(error)
    }
  },
  methods: {
    getPara: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'init', {})
        this.pagePara = JSON.parse(JSON.stringify(response.data.info))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.ruleTable.offset = (index - 1) * this.table.ruleTable.limit
        }
        let searchPara = {
          search_data: this.search_data,
          offset: this.table.ruleTable.offset,
          limit: this.table.ruleTable.limit
        }
        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.ruleTable.total = data.total
        this.table.ruleTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetFreightForm: function() {
        this.freightConfigForm = {
            freight_config_vendor: '',
            freight_config_business_type: 'I',
            freight_config_cargo_type: 'IMPORT',
            freight_config_pol: ['TZDAR'],
            freight_config_pod: '',
            freight_config_carrier: 'COS',
            freight_config_size_type: [],
            freight_config_amount: '',
            freight_config_advance: '',
            freight_config_advance_amount: '',
            freight_config_enabled_date: moment().format('YYYY-MM-DD')
      }
      this.overdueChargeFree = false
    },
    addFreightConfigModal: async function() {
        this.$nextTick(() => {
            this.$refs['freightConfigForm'].resetFields()
        })
        this.resetFreightForm()
        this.modalStatus = 'create'
        this.modal.freightConfigModal = true
    },
    changeBusinessType: function(e) {
        if(this.freightConfigForm.freight_config_business_type === 'I') {
            this.freightConfigForm.freight_config_cargo_type = 'IM'
            this.freightConfigForm.freight_config_pol = ['TZDAR']
            this.freightConfigForm.freight_config_pod = []
        } else if(this.freightConfigForm.freight_config_business_type === 'E') {
            this.freightConfigForm.freight_config_cargo_type = 'LOCAL'
            this.freightConfigForm.freight_config_pol = []
            this.freightConfigForm.freight_config_pod = ['TZDAR']
        }
    },
    changeFreight: function(e) {
        if(this.freightConfigForm.freight_config_amount && this.freightConfigForm.freight_config_advance) {
            this.freightConfigForm.freight_config_advance_amount = this.freightConfigForm.freight_config_amount * this.freightConfigForm.freight_config_advance / 100
        }
    },
    addFreightAct: async function() {
        this.$refs['freightConfigForm'].validate(async valid => {
            if (valid) {
                try {
                    await this.$http.post(apiUrl + 'add', this.freightConfigForm)
                    this.getTableData()
                    this.$Message.success('Add Success')
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    updateFreightModal: async function(row) {
        this.$nextTick(() => {
            this.$refs['freightConfigForm'].resetFields()
        })
        this.resetFreightForm()
        this.freightConfigFormOld = Object.assign({}, row)
        this.freightConfigForm = Object.assign({}, row) // copy obj
        if(this.freightConfigForm.freight_config_business_type === 'I') {
            this.freightConfigForm.freight_config_pol = [this.freightConfigForm.freight_config_pol]
            this.freightConfigForm.freight_config_pod_update = this.freightConfigForm.freight_config_pod
        } else {
            this.freightConfigForm.freight_config_pol_update = this.freightConfigForm.freight_config_pol
            this.freightConfigForm.freight_config_pod = [this.freightConfigForm.freight_config_pod]
        }
        this.freightConfigForm.freight_config_size_type_update = this.freightConfigForm.freight_config_size_type
        this.modalStatus = 'update'
        this.modal.freightConfigModal = true
    },
    updateFreightAct: async function() {
        this.$refs['freightConfigForm'].validate(async valid => {
            if (valid) {
                try {
                    await this.$http.post(apiUrl + 'modify',  { old: this.freightConfigFormOld, new: this.freightConfigForm })
                    this.getTableData()
                    this.$Message.success('Edit Success')
                    this.modal.freightConfigModal = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    deleteFreightAct: async function(row) {
        this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', row)
          this.$Message.success('delete success')
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    enabledToDateChange: async function(date) {
      this.freightConfigForm.freight_config_enabled_date = date
    },
    searchDataChange: async function(date) {
      this.search_data.enabled_date = date
    },
  }
}
</script>