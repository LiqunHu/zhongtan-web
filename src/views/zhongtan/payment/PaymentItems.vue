<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Payment</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Payment Items
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Payment Items">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="payment items name、code" v-model="table.paymentItems.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getPaymentItemsData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addPaymentItemsModal">Add</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="paymentItems" :columns="table.paymentItems.rows" :data="table.paymentItems.data" :border="table.paymentItems.data && table.paymentItems.data.length > 0">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyPaymentItemsModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deletePaymentItems(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
        <template slot-scope="{ row, index }" slot="payment_items_type">
          <template v-if="row.payment_items_type">
            {{ row.payment_items_type_name }} ({{ row.payment_items_type }})
          </template>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.paymentItems.total" :page-size="table.paymentItems.limit" @on-change="getPaymentItemsData"/>
    </panel>
    <Modal v-model="modal.paymentItemsModal" title="Freight Place" width="1000">
      <Form :model="workPara" :label-width="120" :rules="formRule.rulePaymentItemsModal" ref="formPaymentItems">
        <FormItem label="Code" prop="payment_items_code">
          <Input placeholder="Discharge Port Code" maxlength="20" v-model="workPara.payment_items_code"/>
        </FormItem>
        <FormItem label="Name" prop="payment_items_name">
          <Input placeholder="Discharge Port Name" maxlength="100" v-model="workPara.payment_items_name"/>
        </FormItem>
        <FormItem label="Type" prop="payment_items_type">
          <Select v-model="workPara.payment_items_type">
              <Option v-for="item in pagePara.PAYMENT_ITEM_TYPE" :value="item.id" :key="item.id">
                {{ item.text }}({{ item.id }})
              </Option>
          </Select>
        </FormItem>
        <FormItem label="Payable">
          <Row>
            <Col :span="12">
              <Card title="Debit" dis-hover>
                <Row>
                  <Col :span="8">
                    <Input placeholder="subject code" maxlength="20" v-model="workPara.item_code_payable_debit_1"/>
                  </Col>
                  <Col :span="16">
                    <Select placeholder="carrier" v-model="workPara.item_code_payable_debit_carrier_1" filterable clearable multiple>
                        <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">
                          {{ item.user_name }}
                        </Option>
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col :span="8">
                    <Input placeholder="subject code" maxlength="20" v-model="workPara.item_code_payable_debit_2"/>
                  </Col>
                  <Col :span="16">
                    <Select placeholder="carrier" v-model="workPara.item_code_payable_debit_carrier_2" filterable clearable multiple>
                        <Option v-for="item in pagePara.COMMON_CUSTOMER" :value="item.user_id" :key="item.user_id">
                          {{ item.user_name }}
                        </Option>
                    </Select>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col :span="12">
              <Card title="Credit" dis-hover>
                <Row>
                  <Col :span="24">
                    <Input placeholder="subject code" maxlength="20" v-model="workPara.item_code_payable_credit"/>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="Payment">
          <Row>
            <Col :span="12">
              <Card title="Debit" dis-hover>
                <Row>
                  <Col :span="24">
                    <Input placeholder="subject code" maxlength="20" v-model="workPara.item_code_payment_debit"/>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col :span="12">
              <Card title="Credit" dis-hover>
                <Row>
                  <Col :span="24">
                    <Input placeholder="item_code_payment_credit" maxlength="20" v-model="workPara.item_code_payment_credit"/>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.paymentItemsModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitPaymentItemsPort">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import PaymentItemsExpand from './PaymentItemsExpand.vue'
const apiUrl = '/api/zhongtan/payment/PaymentItems/'

export default {
  name: 'PaymentItems',
  data: function() {
    return {
      modal: { paymentItemsModal: false },
      table: {
        paymentItems: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              type: 'expand',
              width: 50,
              render: (h, params) => {
                  return h(PaymentItemsExpand, {
                      props: {  row: params.row  }
                  })
              }
            },
            {
              title: 'Code',
              key: 'payment_items_code'
            },
            {
              title: 'Name',
              key: 'payment_items_name'
            },
            {
              title: 'Type',
              slot: 'payment_items_type'
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
        rulePaymentItemsModal: {
          payment_items_code: [{ required: true, trigger: 'change', message: 'Enter payment item code' }],
          payment_items_name: [{ required: true, trigger: 'change', message: 'Enter payment item name' }],
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
        this.getPaymentItemsData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getPaymentItemsData: async function(index) {
      try {
        if (index) {
          this.table.paymentItems.offset = (index - 1) * this.table.paymentItems.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.paymentItems.search_text,
          offset: this.table.paymentItems.offset,
          limit: this.table.paymentItems.limit
        })
        let data = response.data.info
        this.table.paymentItems.total = data.total
        this.table.paymentItems.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addPaymentItemsModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formPaymentItems.resetFields()
      this.modal.paymentItemsModal = true
    },
    modifyPaymentItemsModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formPaymentItems.resetFields()
      this.modal.paymentItemsModal = true
    },
    submitPaymentItemsPort: function() {
      this.$refs.formPaymentItems.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add payment item success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify payment item success')
            }
            this.modal.paymentItemsModal = false
            this.getPaymentItemsData()
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deletePaymentItems: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { freight_place_id: row.freight_place_id })
          this.$Message.success('delete success')
          this.getPaymentItemsData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>