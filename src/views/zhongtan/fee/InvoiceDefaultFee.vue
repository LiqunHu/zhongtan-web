<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Fixed Invoice Fee</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Fixed Invoice Fee
      <small>Fixed Invoice Fee...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Fixed Invoice Fee">
        <template slot="beforeBody">
            <div class="panel-toolbar">
            <div class="form-inline">
                <div class="form-group m-r-2">
                    <Select clearable v-model="search_data.fee_cargo_type" style="width:180px" @on-change="getTableData">
                        <Option v-for="item in pagePara.CARGO_TYPE" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </div>
                <div class="form-group m-r-2">
                    <input type="text" class="form-control" v-model="search_data.fee_name" placeholder="Search Fee Name" style="width: 200px" />
                </div>
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="getTableData">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
                <div class="form-group m-r-10">
                    <button type="button" class="btn btn-info" @click="addDefaultFeeModal">ADD FEE</button>
                </div>
            </div>
            </div>
        </template>
        <Table stripe size="small" ref="checkTable" :columns="table.checkTable.columns" :data="table.checkTable.data" :height="table.checkTable.height">
            <template slot-scope="{ row, index }" slot="action">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="updateDefaultFeeModal(row)">
                <i class="fa fa-edit"></i>
            </a>
            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteDefaultFeeAct(row)">
                <i class="fa fa-times"></i>
            </a>
            </template>
        </Table>
        <Page class="m-t-10" :total="table.checkTable.total" :page-size="table.checkTable.limit" @on-change="getTableData" />
    </panel>
    <Modal v-model="modal.addOrUpdateFee" :title="textMap[dialogStatus]" width="600">
        <Form ref="feeForm" :model="feeForm" :rules="feeRule" :label-width="120" style="padding-right: 80px;">
            <FormItem label="Cargo Type" prop="fee_cargo_type">
                <RadioGroup v-model="feeForm.fee_cargo_type">
                    <Radio v-for="item in pagePara.CARGO_TYPE" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;" :disabled ="dialogStatus === 'update'">{{item.text}}</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem label="Name" prop="fee_name" v-if="feeForm.fee_cargo_type === 'IM'">
                <Select v-model="feeForm.fee_name" filterable :disabled ="dialogStatus === 'update'">
                    <Option v-for="item in pagePara.IM_FEE_NAME" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
            </FormItem>
            <FormItem label="Name" prop="fee_name" v-if="feeForm.fee_cargo_type === 'TR'">
                <Select v-model="feeForm.fee_name" filterable :disabled ="dialogStatus === 'update'">
                    <Option v-for="item in pagePara.TR_FEE_NAME" :value="item.id" :key="item.id" >{{ item.text }}</Option>
                </Select>
            </FormItem>
            <FormItem label="Fee Type" prop="fee_type">
                <RadioGroup v-model="feeForm.fee_type">
                    <Radio v-for="item in pagePara.FEE_TYPE" v-bind:key="item.id" :label="item.id" style="margin-right: 50px;" :disabled ="dialogStatus === 'update'">{{item.text}}</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem label="Container Size" prop="fee_container_size" v-if="feeForm.fee_type === 'CON'">
                <Input v-model="feeForm.fee_container_size" placeholder="Enter your container size" :disabled ="dialogStatus === 'update'"></Input>
            </FormItem>
            <FormItem label="Amount" prop="fee_amount">
                <Input v-model="feeForm.fee_amount" placeholder="Enter your amount">
                    <Select slot="append" v-model="feeForm.fee_currency" style="width: 100px" :disabled ="dialogStatus === 'update'">
                        <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                </Input>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.addOrUpdateFee=false">Cancel</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'create'" @click="addDefaultFeeAct">Submit</Button>
            <Button type="primary" size="large" v-if="dialogStatus === 'update'" @click="updateDefaultFeeAct">Submit</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/fee/InvoiceDefaultFee/'

export default {
  data: function() {
    return {
        table: {
            checkTable: {
            columns: [
                {
                    title: 'Cargo Type',
                    key: 'fee_cargo_type',
                    render: common.selectRender(this, 'CARGO_TYPE'),
                },
                {
                    title: 'Name',
                    key: 'fee_name',
                },
                {
                    title: 'Type',
                    key: 'fee_type',
                    render: common.selectRender(this, 'FEE_TYPE'),
                },
                {
                    title: 'Container Size',
                    key: 'fee_container_size',
                },
                {
                    title: 'Amount',
                    key: 'fee_amount',
                },
                {
                    title: 'Currency',
                    key: 'fee_currency',
                },
                {
                    title: 'Action',
                    slot: 'action',
                    width: 150
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
            update: 'Edit Fee',
            create: 'Add Fee'
        },
        feeForm: {
            default_fee_id: '',
            fee_cargo_type: 'IM',
            fee_name: '',
            fee_type: 'BL',
            fee_container_size: '',
            fee_amount: '',
            fee_currency: 'USD'
        },
        feeRule: {
            fee_cargo_type: [
                { required: true, message: 'The cargo type cannot be empty', trigger: 'blur' }
            ],
            fee_name: [
                { required: true, message: 'The name cannot be empty', trigger: 'blur' }
            ],
            fee_type: [
                { required: true, message: 'The type cannot be empty', trigger: 'blur' }
            ],
            fee_container_size: [
                { required: true, message: 'The container size cannot be empty', trigger: 'blur' }
            ],
            fee_amount: [
                { required: true, message: 'The amount cannot be empty', trigger: 'blur' },
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
    searchData: function(e) {
      this.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getTableData: async function(index) {
      try {
        if (index) {
          this.table.checkTable.offset = (index - 1) * this.table.checkTable.limit
        }
        let searchPara = {
          fee_cargo_type: this.search_data.fee_cargo_type,
          fee_name: this.search_data.fee_name,
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
            default_fee_id: '',
            fee_cargo_type: 'IM',
            fee_name: '',
            fee_type: 'BL',
            fee_container_size: '',
            fee_amount: '',
            fee_currency: 'USD'
        }
    },
    addDefaultFeeModal: async function() {
        this.resetFeeForm()
        this.dialogStatus = 'create'
        this.modal.addOrUpdateFee = true
        this.$nextTick(() => {
            this.$refs['feeForm'].resetFields()
        })
    },
    addDefaultFeeAct: function() {
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
    updateDefaultFeeModal: async function(row) {
        this.resetFeeForm()
        this.feeForm = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.modal.addOrUpdateFee = true
    },
    updateDefaultFeeAct: async function() {
        this.$refs['feeForm'].validate(async valid => {
            if (valid) {
                try {
                    await this.$http.post(apiUrl + 'update', this.feeForm)
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
    deleteDefaultFeeAct: async function(row) {
        try {
            await this.$http.post(apiUrl + 'delete', row)
            this.getTableData()
            this.$Message.success('Delete Fee Success')
        } catch (error) {
            this.$commonact.fault(error)
        }
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