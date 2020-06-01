<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Equipment Control</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Overdue Calculation Config
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Overdue Calculation">
        <template slot="beforeBody">
            <div class="panel-toolbar">
                <div class="form-inline">
                    <div class="form-group m-r-2">
                        <Select clearable v-model="search_data.overdue_charge_cargo_type" placeholder = "select cargo type" style="width:180px">
                            <Option v-for="item in cargoTypeFileter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                        </Select>
                    </div>
                    <div class="form-group m-r-2">
                        <i-select v-model="search_data.overdue_charge_discharge_port" clearable placeholder = "select discharge port" style="width:180px">
                            <i-option  v-for="item in pagePara.DISCHARGE_PORT" :value="item.discharge_port_code" :key="item.discharge_port_code" :label="item.discharge_port_code">
                                <span>{{item.discharge_port_code}}</span>
                                <span style="float:right;color:#ccc">{{item.discharge_port_name}}</span>
                            </i-option>
                        </i-select>
                    </div>
                    <div class="form-group m-r-2">
                        <Select clearable v-model="search_data.overdue_charge_carrier" placeholder = "select carrier" style="width:180px">
                            <Option v-for="item in carrierFileter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                        </Select>
                    </div>
                    <div class="form-group m-r-2">
                        <i-select v-model="search_data.overdue_charge_container_size" clearable placeholder = "select container size" style="width:180px">
                            <i-option  v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                                <span>{{item.container_size_code}}</span>
                                <span style="float:right;color:#ccc">{{item.container_size_name}}</span>
                            </i-option>
                        </i-select>
                    </div>
                    <div class="form-group m-r-10">
                        <button type="button" class="btn btn-info" @click="getTableData">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                    <div class="form-group m-r-10">
                        <button type="button" class="btn btn-info" @click="addChageRuleModal">ADD CHARGE RULE</button>
                    </div>
                </div>
            </div>
        </template>
        <Table stripe size="small" ref="ruleTable" :columns="table.ruleTable.columns" :data="table.ruleTable.data" :height="table.ruleTable.height" border>
            <template slot-scope="{ row, index }" slot="overdue_charge_container">
               {{row.overdue_charge_container_size}} [
                <span v-for="item in pagePara.CONTAINER_SIZE" v-if="item.container_size_code === row.overdue_charge_container_size">{{item.container_size_name}}</span> ]
            </template>
            <template slot-scope="{ row, index }" slot="overdue_charge_day">
               {{row.overdue_charge_min_day}} - {{row.overdue_charge_max_day}} Day
            </template>
            <template slot-scope="{ row, index }" slot="overdue_charge">
                <span v-if="!row.overdue_charge_amount || row.overdue_charge_amount === '0'">Free</span>
                <span v-else>{{row.overdue_charge_currency}} {{row.overdue_charge_amount}}</span>
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <a href="#" class="btn btn-primary btn-icon btn-sm" @click="updateChageRuleModal(row)">
                    <i class="fa fa-edit"></i>
                </a>
                <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteChageRuleAct(row)">
                    <i class="fa fa-times"></i>
                </a>
            </template>
        </Table>
        <Page class="m-t-10" :total="table.ruleTable.total" :page-size="table.ruleTable.limit" @on-change="getTableData" />
        <Modal v-model="modal.chargeRuleModal" :title="textMap[modalStatus]" width="600">
            <Form ref="chargeRuleForm" :model="chargeRuleForm" :rules="chargeRules" :label-width="120" style="padding-right: 80px;">
                <FormItem label="Cargo Type" prop="overdue_charge_cargo_type">
                    <RadioGroup v-model="chargeRuleForm.overdue_charge_cargo_type">
                        <Radio v-for="item in cargoTypeFileter" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Discharge Port" prop="overdue_charge_discharge_port_multiple" v-if="modalStatus === 'create'">
                    <i-select v-model="chargeRuleForm.overdue_charge_discharge_port_multiple" clearable multiple filterable placeholder = "select discharge port">
                        <i-option  v-for="item in pagePara.DISCHARGE_PORT" :value="item.discharge_port_code" :key="item.discharge_port_code" :label="item.discharge_port_code">
                            <span>{{item.discharge_port_code}}</span>
                            <span style="float:right;color:#ccc">{{item.discharge_port_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Discharge Port" prop="overdue_charge_discharge_port" v-if="modalStatus === 'update'">
                    <i-select v-model="chargeRuleForm.overdue_charge_discharge_port" clearable filterable placeholder = "select discharge port">
                        <i-option  v-for="item in pagePara.DISCHARGE_PORT" :value="item.discharge_port_code" :key="item.discharge_port_code" :label="item.discharge_port_code">
                            <span>{{item.discharge_port_code}}</span>
                            <span style="float:right;color:#ccc">{{item.discharge_port_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Cargo Type" prop="overdue_charge_carrier">
                    <RadioGroup v-model="chargeRuleForm.overdue_charge_carrier">
                        <Radio v-for="item in carrierFileter" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;">{{item.text}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Container Size" prop="overdue_charge_container_size_multiple" v-if="modalStatus === 'create'">
                    <i-select v-model="chargeRuleForm.overdue_charge_container_size_multiple" clearable multiple filterable placeholder = "select container size type">
                        <i-option  v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                            <span>{{item.container_size_code}}</span>
                            <span style="float:right;color:#ccc">{{item.container_size_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <FormItem label="Container Type" prop="overdue_charge_container_size" v-if="modalStatus === 'update'">
                    <i-select v-model="chargeRuleForm.overdue_charge_container_size" clearable filterable placeholder = "select container size type">
                        <i-option  v-for="item in pagePara.CONTAINER_SIZE" :value="item.container_size_code" :key="item.container_size_code" :label="item.container_size_code">
                            <span>{{item.container_size_code}}</span>
                            <span style="float:right;color:#ccc">{{item.container_size_name}}</span>
                        </i-option>
                    </i-select>
                </FormItem>
                <Row>
                    <i-col span="14">
                        <FormItem label="Day" prop="overdue_charge_min_day">
                            <Input v-model="chargeRuleForm.overdue_charge_min_day" clearable placeholder="min day">
                                <span slot="append" style="display:block; width: 40px">Day</span>
                            </Input>
                        </FormItem>
                    </i-col>
                    <i-col span="2" style="text-align: center">-</i-col>
                    <i-col span="8">
                        <Input v-model="chargeRuleForm.overdue_charge_max_day" clearable  placeholder="max day">
                            <span slot="append" style="display:block; width: 40px">Day</span>
                        </Input>
                    </i-col>
                </Row>
                <FormItem label="Charge Amount" prop="overdue_charge_amount">
                    <Input v-model="chargeRuleForm.overdue_charge_amount" clearable placeholder="charge amount" :disabled="overdueChargeFree">
                        <Checkbox slot="prepend" v-model="overdueChargeFree" style="margin-bottom: 0px; width: 40px">Free</Checkbox>
                        <span slot="append" style="display:block; width: 40px">{{chargeRuleForm.overdue_charge_currency}}</span>
                    </Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="modal.chargeRuleModal=false">Cancel</Button>
                <Button type="primary" size="large" v-if="modalStatus === 'create'" @click="addChageRuleAct">Add Submit</Button>
                <Button type="primary" size="large" v-if="modalStatus === 'update'" @click="updateChageRuleAct">Update Submit</Button>
            </div>
        </Modal>
    </panel>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/equipment/OverdueCalculationConfig/'

export default {
  name: 'OverdueCalculationConfig',
  data: function() {
    return {
      modal: {chargeRuleModal: false},
      modalStatus: 'create',
      textMap: {
        update: 'Edit Charge Rule',
        create: 'Add Charge Rule'
      },
      cargoTypeFileter: [
          {id: 'IM', text: 'IM'},
          {id: 'TR', text: 'TR'}
      ],
      carrierFileter: [
          {id: 'COSCO', text: 'COSCO'},
          {id: 'OOCL', text: 'OOCL'}
      ],
      pagePara: {},
      table: {
        ruleTable: {
          columns: [
            {
              title: 'Cargo type',
              key: 'overdue_charge_cargo_type',
            },
            {
              title: 'Discharge port',
              key: 'overdue_charge_discharge_port',
            },
            {
              title: 'Carrier',
              key: 'overdue_charge_carrier',
            },
            {
              title: 'Container',
              slot: 'overdue_charge_container',
            },
            {
              title: 'Day',
              slot: 'overdue_charge_day',
            },
            {
              title: 'Charge',
              slot: 'overdue_charge',
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
          overdue_charge_cargo_type: '',
          overdue_charge_discharge_port: '',
          overdue_charge_carrier: '',
          overdue_charge_container_size: '',
          overdue_charge_container_type: ''
      },
      chargeRuleFormOld: {},
      chargeRuleForm: {
          overdue_charge_rule_id: '',
          overdue_charge_cargo_type: '',
          overdue_charge_discharge_port: '',
          overdue_charge_carrier: '',
          overdue_charge_container_size: '',
          overdue_charge_min_day: '',
          overdue_charge_max_day: '',
          overdue_charge_amount: '',
          overdue_charge_currency: 'USD'
      },
      overdueChargeFree: false,
      chargeRules: {
            overdue_charge_cargo_type: [
                { required: true, message: 'The cargo type cannot be empty', trigger: 'change' }
                
            ],
            overdue_charge_discharge_port: [
                {required: true, trigger: 'change', message: 'select discharge port'}
            ],
            overdue_charge_discharge_port_multiple: [
                { type: 'array', min: 1, required: true, trigger: 'change', message: 'select discharge port'}
            ],
            overdue_charge_carrier: [
                { required: true, message: 'The carrier cannot be empty', trigger: 'change' }
            ],
            overdue_charge_container_size: [
                {required: true, trigger: 'change', message: 'select container size type'}
            ],
            overdue_charge_container_size_multiple: [
                { type: 'array', min: 1, required: true, trigger: 'change', message: 'select container size type'}
            ],
            overdue_charge_min_day: [
                { required: true, message: 'The min day cannot be empty', trigger: 'blur' },
                { type: 'number', message: 'The min day must be number', trigger: 'blur' , transform(value) { return Number(value)}}
            ],
            overdue_charge_max_day: [
                { type: 'number', message: 'The min day must be number', trigger: 'blur' , transform(value) { return Number(value)}}
            ],
            overdue_charge_amount: [
                { type: 'number', message: 'The amount must be number', trigger: 'blur' , transform(value) { return Number(value)}}
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
    resetChageRuleForm: function() {
        this.chargeRuleForm = {
          overdue_charge_rule_id: '',
          overdue_charge_cargo_type: 'IM',
          overdue_charge_discharge_port: '',
          overdue_charge_carrier: 'COSCO',
          overdue_charge_container_size: '',
          overdue_charge_min_day: '',
          overdue_charge_max_day: '',
          overdue_charge_amount: '',
          overdue_charge_currency: 'USD'
      }
      this.overdueChargeFree = false
    },
    addChageRuleModal: async function() {
        this.$nextTick(() => {
            this.$refs['chargeRuleForm'].resetFields()
        })
        this.resetChageRuleForm()
        this.modalStatus = 'create'
        this.modal.chargeRuleModal = true
    },
    addChageRuleAct: async function() {
        this.$refs['chargeRuleForm'].validate(async valid => {
            if (valid) {
                try {
                    if(this.overdueChargeFree) {
                        this.chargeRuleForm.overdue_charge_amount = '0'
                    }
                    if(!this.chargeRuleForm.overdue_charge_amount) {
                        this.$commonact.fault('charge amount must input')
                    }
                    await this.$http.post(apiUrl + 'add', this.chargeRuleForm)
                    this.getTableData()
                    this.$Message.success('Add Success')
                    this.modal.chargeRuleModal = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    updateChageRuleModal: async function(row) {
        this.$nextTick(() => {
            this.$refs['chargeRuleForm'].resetFields()
        })
        this.resetChageRuleForm()
        this.chargeRuleFormOld = Object.assign({}, row)
        this.chargeRuleForm = Object.assign({}, row) // copy obj
        this.overdueChargeFree = (!row.overdue_charge_amount || row.overdue_charge_amount === '0')
        this.modalStatus = 'update'
        this.modal.chargeRuleModal = true
    },
    updateChageRuleAct: async function() {
        this.$refs['chargeRuleForm'].validate(async valid => {
            if (valid) {
                try {
                    if(this.overdueChargeFree) {
                        this.chargeRuleForm.overdue_charge_amount = '0'
                    }
                    if(!this.chargeRuleForm.overdue_charge_amount) {
                        this.$commonact.fault('charge amount must input')
                    }
                    await this.$http.post(apiUrl + 'modify',  { old: this.chargeRuleFormOld, new: this.chargeRuleForm })
                    this.getTableData()
                    this.$Message.success('Edit Success')
                    this.modal.chargeRuleModal = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    deleteChageRuleAct: async function(row) {
        this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', row)
          this.$Message.success('delete success')
          this.getTableData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>