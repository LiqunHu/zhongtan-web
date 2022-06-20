<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Fee</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Export Fee Data
    </h1>
    <!-- end page-header -->
    <panel title="Export Fee Data">
        <template slot="beforeBody">
            <div class="panel-toolbar">
            <div class="form-inline">
                <div class="form-group m-r-2">
                    <input type="text" class="form-control" v-model="search_data.fee_data_code" placeholder="Search Fee Code" style="width: 200px" />
                </div>
                <div class="form-group m-r-2">
                    <input type="text" class="form-control" v-model="search_data.fee_data_name" placeholder="Search Fee Name" style="width: 200px" />
                </div>
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="getTableData">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="addFeeDataModal">ADD FEE</button>
                </div>
            </div>
            </div>
        </template>
        <Table stripe size="small" ref="checkTable" :columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height">
            <template slot-scope="{ row, index }" slot="fee_data_transit">
                <Tag color="error" v-if="row.fee_data_transit === '1'">TRANSIT $0</Tag>
            </template>
            <template slot-scope="{ row, index }" slot="fee_data_enabled_date">
                {{ row.fee_data_enabled_start_date }} - {{ row.fee_data_enabled_end_date }}
            </template>
            <template slot-scope="{ row, index }" slot="fee_data_config">
                <Row v-if="row.fee_data_receivable && row.fee_data_receivable === '1'" style="color:#00cc66;">
                    <Col span="12">
                        Receivable
                        <span v-if="row.fee_data_receivable_fixed === '1'">/Fixed</span>
                        <span v-if="row.fee_data_receivable_amount">/{{row.fee_data_receivable_amount}}{{row.fee_data_receivable_amount_currency}}</span>
                    </Col>
                    <Col span="12">
                        <Row v-if="row.fee_data_receivable_common_party">
                            <Col span="24">
                            DEFAULT PARTY: {{row.fee_data_receivable_common_party_name}}
                            </Col>
                        </Row>
                        <Row v-if="row.fee_data_receivable_cosco_party">
                            <Col span="24">
                            COSCO PARTY: {{row.fee_data_receivable_cosco_party_name}}
                            </Col>
                        </Row>
                        <Row v-if="row.fee_data_receivable_oocl_party">
                            <Col span="24">
                            OOCL PARTY: {{row.fee_data_receivable_oocl_party_name}}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row v-if="row.fee_data_payable && row.fee_data_payable === '1'" style="color:#3091f2;">
                    <Col span="12">
                        Receivable
                        <span v-if="row.fee_data_payable_fixed === '1'">/Fixed</span>
                        <span v-if="row.fee_data_payable_amount">/{{row.fee_data_payable_amount}}{{row.fee_data_payable_amount_currency}}</span>
                    </Col>
                    <Col span="12">
                        <Row v-if="row.fee_data_payable_common_party">
                            <Col span="24">
                            DEFAULT PARTY: {{row.fee_data_payable_common_party_name}}
                            </Col>
                        </Row>
                        <Row v-if="row.fee_data_payable_cosco_party">
                            <Col span="24">
                            COSCO PARTY: {{row.fee_data_payable_cosco_party_name}}
                            </Col>
                        </Row>
                        <Row v-if="row.fee_data_payable_oocl_party">
                            <Col span="24">
                            OOCL PARTY: {{row.fee_data_payable_oocl_party_name}}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <a href="#" class="btn btn-primary btn-icon btn-sm" @click="updateFeeDataModal(row)">
                    <i class="fa fa-edit"></i>
                </a>
                <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteFeeDataAct(row)">
                    <i class="fa fa-times"></i>
                </a>
            </template>
        </Table>
        <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.addOrUpdateFee" :title="textMap[dialogStatus]" width="70%">
        <Form ref="feeForm" :model="feeForm" :rules="feeRule" :label-width="120" style="padding-right: 40px;">
            <FormItem label="Code" prop="fee_data_code">
                <Input v-model="feeForm.fee_data_code" placeholder="Enter Fee Code" :disabled="dialogStatus === 'update'"/>
            </FormItem>
            <FormItem label="Name" prop="fee_data_name">
                <Input v-model="feeForm.fee_data_name" placeholder="Enter Fee Name"/>
            </FormItem>
            <FormItem label="TRANSIT" prop="fee_data_transit">
                <Checkbox v-model="feeForm.fee_data_transit" true-value="1" false-value="0">TRANSIT</Checkbox><font style="color: red;">* Selected, Receivable/Payable will be $0.</font>
            </FormItem>
            <FormItem label="Type" prop="fee_data_type">
                <RadioGroup v-model="feeForm.fee_data_type" >
                    <Radio v-for="item in pagePara.FEE_TYPE" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;" :disabled ="dialogStatus === 'update'">{{item.text}}</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem label="Enabled Date">
                <Row>
                    <Col span="12">
                        <DatePicker type="date" placeholder="Select Start Date" v-model="feeForm.fee_data_enabled_start_date" format="yyyy-MM-dd" @on-change="enabledStartDataChange"></DatePicker>
                    </Col>
                    <Col span="12">
                        <DatePicker type="date" placeholder="Select End Date" v-model="feeForm.fee_data_enabled_end_date" format="yyyy-MM-dd" @on-change="enabledEndDataChange"></DatePicker>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="Size&Type" prop="fee_data_container_size_create" v-if="feeForm.fee_data_type === 'CON' && dialogStatus === 'create'">
                <CheckboxGroup v-model="feeForm.fee_data_container_size_create">
                    <Checkbox v-for="item in pagePara.CONTAINER_SIZE" :label="item.container_size_code" :key="item.container_size_code">{{item.container_size_code}}[{{item.container_size_name}}]</Checkbox>
                </CheckboxGroup>
            </FormItem>
            <FormItem label="Size&Type" prop="fee_data_container_size" v-if="feeForm.fee_data_type === 'CON' && dialogStatus === 'update'">
                <CheckboxGroup v-model="feeForm.fee_data_container_size">
                    <Checkbox v-for="item in pagePara.CONTAINER_SIZE" :label="item.container_size_code" :key="item.container_size_code" disabled v-if="item.container_size_code === feeForm.fee_data_container_size">{{item.container_size_code}}[{{item.container_size_name}}]</Checkbox>
                </CheckboxGroup>
            </FormItem>
            <FormItem label="Config">
               <Row :gutter="16">
                    <Col span="4">Receivable/Payable</Col>
                    <Col span="4">Fixed</Col>
                    <Col span="6">Amount</Col>
                    <Col span="10">Party</Col>
                </Row>
                <Row :gutter="16">
                    <Col span="4"><Checkbox v-model="feeForm.fee_data_receivable" true-value="1" false-value="0">Receivable</Checkbox></Col>
                    <Col span="4">
                        <i-switch v-model="feeForm.fee_data_receivable_fixed" size="large" true-value="1" false-value="0">
                            <span slot="open">ON</span>
                            <span slot="close">OFF</span>
                        </i-switch>
                    </Col>
                    <Col span="6">
                        <Input v-model="feeForm.fee_data_receivable_amount" placeholder="Enter Default Amount">
                            <Select slot="append" v-model="feeForm.fee_data_receivable_amount_currency" style="width: 80px" :disabled ="dialogStatus === 'update'">
                                <Option v-for="item in pagePara.FEE_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                            </Select>
                        </Input>
                    </Col>
                    <Col span="10">
                        <Row>
                            <Col span="6">
                                DEFAULT
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_receivable_common_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col span="6">
                                COSCO
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_receivable_cosco_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col span="6">
                                OOCL
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_receivable_oocl_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row :gutter="16">
                    <Col span="4"><Checkbox v-model="feeForm.fee_data_payable" true-value="1" false-value="0">Payable</Checkbox></Col>
                    <Col span="4">
                        <i-switch v-model="feeForm.fee_data_payable_fixed" size="large" true-value="1" false-value="0">
                            <span slot="open">ON</span>
                            <span slot="close">OFF</span>
                        </i-switch>
                    </Col>
                    <Col span="6">
                        <Input v-model="feeForm.fee_data_payable_amount" placeholder="Enter Default Amount">
                            <Select slot="append" v-model="feeForm.fee_data_payable_amount_currency" style="width: 80px" :disabled ="dialogStatus === 'update'">
                                <Option v-for="item in pagePara.FEE_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                            </Select>
                        </Input>
                    </Col>
                    <Col span="10">
                        <Row>
                            <Col span="6">
                                DEFAULT
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_payable_common_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col span="6">
                                COSCO
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_payable_cosco_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col span="6">
                                OOCL
                            </Col>
                            <Col span="18">
                                <Select v-model="feeForm.fee_data_payable_oocl_party" clearable filterable>
                                    <Option v-for="item in pagePara.CUSTOMER" :value="item.user_id" :key="item.user_id">{{ item.user_name }}</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.addOrUpdateFee=false">Cancel</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'create'" @click="addFeeDataAct">Submit</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'update'" @click="updateFeeDataAct">Submit</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/fee/ExportFeeData/'

export default {
  data: function() {
    return {
        table: {
            checkTable: {
            columns: [
                {
                    title: 'Code',
                    key: 'fee_data_code',
                    width: 100
                },
                {
                    title: 'Name',
                    key: 'fee_data_name',
                    width: 200
                },
                {
                    title: 'Type',
                    key: 'fee_data_type',
                    render: common.selectRender(this, 'FEE_TYPE'),
                    width: 100
                },
                {
                    title: 'Size&Type',
                    key: 'fee_data_container_size',
                    width: 100
                },
                {
                    title: 'Transit',
                    slot: 'fee_data_transit',
                    width: 100
                },
                {
                    title: 'Enabled Date',
                    slot: 'fee_data_enabled_date',
                    width: 200
                },
                {
                    title: 'Config',
                    slot: 'fee_data_config',
                    width: 400
                },
                {
                    title: 'Action',
                    slot: 'action',
                    width: 150,
                    fixed: 'right'
                }
            ],
            data: [],
            height: common.getTableHeight() - 80,
            limit: 10,
            offset: 0,
            total: 0
            }
        },
        pagePara: {},
        search_data: {
            fee_cargo_type: '',
            fee_name: ''
        },
        modal: { addOrUpdateFee: false},
        dialogStatus: 'create',
        textMap: {
            update: 'Edit Fee Data',
            create: 'Add Fee Data'
        },
        oldForm: {},
        feeForm: {
            fee_data_id: '',
            fee_data_code: '',
            fee_data_name: '',
            fee_data_transit: '0',
            fee_data_type: 'BL',
            fee_data_container_size_create: [],
            fee_data_container_size: '',
            fee_data_receivable: '0',
            fee_data_receivable_fixed: '0',
            fee_data_receivable_amount: '',
            fee_data_receivable_amount_currency: 'USD',
            fee_data_payable: '0',
            fee_data_payable_fixed: '0',
            fee_data_payable_amount: '',
            fee_data_payable_amount_currency: 'USD'
        },
        feeRule: {
            fee_data_code: [
                { required: true, message: 'The cargo type cannot be empty', trigger: 'blur' }
            ],
            fee_data_name: [
                { required: true, message: 'The name cannot be empty', trigger: 'blur' }
            ],
            fee_data_type: [
                { required: true, message: 'The type cannot be empty', trigger: 'blur' }
            ],
            fee_data_container_size_create: [
                { required: true, type: 'array', message: 'The container size cannot be empty', trigger: 'change' }
            ],
            fee_data_container_size: [
                { required: true, message: 'The container size cannot be empty', trigger: 'blur' }
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
    searchData: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.checkTable.offset = (index - 1) * this.table.checkTable.limit
        }
        let searchPara = {
          fee_data_code: this.search_data.fee_data_code,
          fee_data_name: this.search_data.fee_data_name,
          offset: this.table.checkTable.offset,
          limit: this.table.checkTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.checkTable.total = data.total
        this.table.checkTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    resetFeeForm: function() {
        this.feeForm = {
            fee_data_id: '',
            fee_data_code: '',
            fee_data_name: '',
            fee_data_transit: '0',
            fee_data_type: 'BL',
            fee_data_container_size_create: [],
            fee_data_container_size: '',
            fee_data_receivable: '0',
            fee_data_receivable_fixed: '0',
            fee_data_receivable_amount: '',
            fee_data_receivable_amount_currency: 'USD',
            fee_data_payable: '0',
            fee_data_payable_fixed: '0',
            fee_data_payable_amount: '',
            fee_data_payable_amount_currency: 'USD'
        }
    },
    addFeeDataModal: async function() {
        this.resetFeeForm()
        this.dialogStatus = 'create'
        this.modal.addOrUpdateFee = true
        this.$nextTick(() => {
            this.$refs['feeForm'].resetFields()
        })
    },
    addFeeDataAct: function() {
        this.$refs['feeForm'].validate(async valid => {
            if (valid) {
                try {
                    await this.$http.post(apiUrl + 'create', this.feeForm)
                    this.getTableData()
                    this.$Message.success('Add Fee Success')
                    this.modal.addOrUpdateFee = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    updateFeeDataModal: async function(row) {
        this.resetFeeForm()
        this.oldForm = Object.assign({}, row)
        this.feeForm = Object.assign({}, row) // copy obj
        this.oldForm.is_necessary = row.is_necessary === '1'
        this.feeForm.is_necessary = row.is_necessary === '1'
        this.dialogStatus = 'update'
        this.modal.addOrUpdateFee = true
    },
    updateFeeDataAct: async function() {
        this.$refs['feeForm'].validate(async valid => {
            if (valid) {
                try {
                    await this.$http.post(apiUrl + 'update', {'old': this.oldForm, 'new': this.feeForm})
                    this.getTableData()
                    this.$Message.success('Update Fee Success')
                    this.modal.addOrUpdateFee = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                this.$Message.error('Validate Fail!')
            }
        })
    },
    deleteFeeDataAct: async function(row) {
        try {
            await this.$http.post(apiUrl + 'delete', row)
            this.getTableData()
            this.$Message.success('Delete Fee Success')
        } catch (error) {
            this.$commonact.fault(error)
        }
    },
    enabledStartDataChange: async function(date) {
      this.feeForm.fee_data_enabled_start_date = date
    },
    enabledEndDataChange: async function(date) {
      this.feeForm.fee_data_enabled_end_date = date
    }
  }
}
</script>
<style>
.timeline-time{
  font-size: 14px;
  font-weight: bold;
}
.timeline-content{
  padding-left: 5px;
}
</style>