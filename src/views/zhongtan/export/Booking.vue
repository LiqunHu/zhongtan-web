<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Export</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Booking
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="table.bookingTable.search_data" placeholder="Application Date" style="width: 200px"></DatePicker>
            </div>

            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getBookingData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>

            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="actBookingModal">Booking</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="bookingTable" :columns="table.bookingTable.rows" :data="table.bookingTable.data">
        <template slot-scope="{ row, index }" slot="port_country">
          <Select v-model="row.port_country" disabled>
            <Option v-for="item in pagePara.PortCountryINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyPortModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deletePort(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.bookingTable.total" :page-size="table.bookingTable.limit" @on-change="getBookingData"/>
    </panel>
    <Modal v-model="modal.bookingModal" title="Booking" width="1100">
      <div style="height: 600px">
        <vue-scroll>
          <Form :model="workPara" :label-width="120" :rules="formRule.ruleBookingModal" ref="formPort">
            <Row>
              <Col span="9">
                <FormItem label="Vessel" prop="billlading_vessel_id">
                  <Select v-model="workPara.billlading_vessel_id" @on-change="vesselChange">
                    <Option v-for="item in pagePara.VesselINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <FormItem label="Voyage" prop="billlading_voyage_id">
                  <Select v-model="workPara.billlading_voyage_id">
                    <Option v-for="item in VoyageINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Divider/>
            <Row>
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Consignee (Name & Address)</b>
                </h4>
                <FormItem label="Name" prop="billlading_consignee_name">
                  <Input placeholder="Name" v-model="workPara.billlading_consignee_name"/>
                </FormItem>
                <FormItem label="Address" prop="billlading_consignee_address">
                  <Input type="textarea" :rows="2" placeholder="Address" v-model="workPara.billlading_consignee_address"/>
                </FormItem>
                <FormItem label="telephone" prop="billlading_consignee_tel">
                  <Input placeholder="telephone" v-model="workPara.billlading_consignee_tel"/>
                </FormItem>
              </Col>
              <Col offset="1" span="1">
                <button type="button" class="btn btn-default" @click="sameCopy">
                  <i class="fa fa-angle-double-right"></i>
                </button>
              </Col>
              <Col offset="1" span="9">
                <h4 class="text-middle m-b-10">
                  <b>Notify Party (Name & Address)</b>
                </h4>
                <FormItem label="Name" prop="billlading_notify_name">
                  <Input placeholder="Name" v-model="workPara.billlading_notify_name"/>
                </FormItem>
                <FormItem label="Address" prop="billlading_notify_address">
                  <Input type="textarea" :rows="2" placeholder="Address" v-model="workPara.billlading_notify_address"/>
                </FormItem>
                <FormItem label="telephone" prop="billlading_notify_tel">
                  <Input placeholder="telephone" v-model="workPara.billlading_notify_tel"/>
                </FormItem>
              </Col>
            </Row>
            <Divider/>
            <Row>
              <Col span="9">
                <FormItem label="Port of Loading" prop="billlading_loading_port_id">
                  <Select v-model="workPara.billlading_loading_port_id">
                    <Option v-for="item in pagePara.PortINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="Port of Discharg" prop="billlading_discharge_port_id">
                  <Select v-model="workPara.billlading_discharge_port_id">
                    <Option v-for="item in pagePara.PortINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="Place of Deliver" prop="billlading_delivery_place">
                  <Input type="textarea" :rows="2" placeholder="Place of Deliver" v-model="workPara.billlading_delivery_place"/>
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <FormItem label="No of Original B/L" prop="billlading_original_num">
                  <Input placeholder="No of Original B/L" v-model="workPara.billlading_original_num"/>
                </FormItem>
                <FormItem label="No of Copies B/L" prop="billlading_copys_num">
                  <Input placeholder="No of Copies B/L" v-model="workPara.billlading_copys_num"/>
                </FormItem>
              </Col>
            </Row>
            <Divider/>
            <Row>
              <Col span="24">
                <h4 class="text-middle m-b-10">
                  <b>Cargo Description</b>
                </h4>
                <Table stripe ref="goodsTable" :columns="table.goodsTable.rows" :data="table.goodsTable.data">
                  <template slot-scope="{ row, index }" slot="billlading_container_number">
                    <Input v-model="row.billlading_container_number" @on-blur="table.goodsTable.data[index] = row"/>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_type">
                    <Select v-model="row.billlading_container_type" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_size">
                    <Select v-model="row.billlading_container_size" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_goods_description">
                    <Input v-model="row.billlading_container_goods_description" @on-blur="table.goodsTable.data[index] = row"/>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_package_number">
                    <Input v-model="row.billlading_container_package_number" @on-blur="table.goodsTable.data[index] = row"/>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_package_unit">
                    <Select v-model="row.billlading_container_package_unit" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_package_unit">
                    <Select v-model="row.billlading_container_package_unit" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_gross_volume">
                    <Input v-model="row.billlading_container_gross_volume" @on-blur="table.goodsTable.data[index] = row"/>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_gross_volume_unit">
                    <Select v-model="row.billlading_container_gross_volume_unit" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_gross_weight">
                    <Input v-model="row.billlading_container_gross_weight" @on-blur="table.goodsTable.data[index] = row"/>
                  </template>
                  <template slot-scope="{ row, index }" slot="billlading_container_gross_unit">
                    <Select v-model="row.billlading_container_gross_unit" @on-change="table.goodsTable.data[index] = row">
                      <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                    </Select>
                  </template>
                  <template slot-scope="{ row, index }" slot="action">
                    <a v-if="index === (table.goodsTable.data.length - 1)" href="#" class="btn btn-info btn-icon btn-sm" @click="addGood()">
                      <i class="fa fa-plus"></i>
                    </a>
                    <a v-if="index !== 0" href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteGood(index)">
                      <i class="fa fa-times"></i>
                    </a>
                  </template>
                </Table>
              </Col>
            </Row>
            <Divider/>
            <Row>
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Stuffing & Equipment</b>
                </h4>
                <FormItem label="Place" prop="billlading_stuffing_place">
                  <Input placeholder="Place" v-model="workPara.billlading_stuffing_place"/>
                </FormItem>
                <FormItem label="Expected date" prop="billlading_stuffing_date">
                  <DatePicker type="date" placement="top" v-model="workPara.billlading_stuffing_date"></DatePicker>
                </FormItem>
                <FormItem label="Special requirement" prop="billlading_stuffing_requirement">
                  <Input type="textarea" :rows="2" placeholder="Special requirement" v-model="workPara.billlading_stuffing_requirement"/>
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <h4 class="text-middle m-b-10">
                  <b>Payment</b>
                </h4>
                <FormItem label="Pay type" prop="billlading_stuffing_place">
                  <Select>
                    <Option v-for="item in pagePara.PayTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="Payable at" prop="billlading_pay_date">
                  <DatePicker type="date" placement="top" v-model="workPara.billlading_pay_date"></DatePicker>
                </FormItem>
                <FormItem label="Status" prop="billlading_freight_currency">
                  <Select placement="top" v-model="workPara.billlading_freight_currency">
                    <Option v-for="item in pagePara.PayCurrencyINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </vue-scroll>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bookingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitBooking">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const apiUrl = '/api/zhongtan/export/Booking/'

export default {
  name: 'Booking',
  data: function() {
    return {
      modal: { bookingModal: false },
      table: {
        bookingTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Port Country',
              slot: 'port_country'
            },
            {
              title: 'Port Name',
              key: 'port_name'
            },
            {
              title: 'CN Port Name',
              key: 'port_name_cn'
            },
            {
              title: 'Port Code',
              key: 'port_code'
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
          search_data: [
            moment()
              .subtract(10, 'days')
              .format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD')
          ],
          search_text: ''
        },
        goodsTable: {
          rows: [
            {
              title: 'Vol.',
              slot: 'billlading_container_number'
            },
            {
              title: 'Type',
              slot: 'billlading_container_type'
            },
            {
              title: 'Size',
              slot: 'billlading_container_size'
            },
            {
              title: 'Description',
              slot: 'billlading_container_goods_description'
            },
            {
              title: 'Package No',
              slot: 'billlading_container_package_number'
            },
            {
              title: 'Package Unit',
              slot: 'billlading_container_package_unit'
            },
            {
              title: 'Volume',
              slot: 'billlading_container_gross_volume'
            },
            {
              title: 'Volume Unit',
              slot: 'billlading_container_gross_volume_unit'
            },
            {
              title: 'Weight',
              slot: 'billlading_container_gross_weight'
            },
            {
              title: 'Weight Unit',
              slot: 'billlading_container_gross_unit'
            },
            {
              title: 'Action',
              slot: 'action'
            }
          ],
          data: []
        }
      },
      formRule: {
        ruleBookingModal: {
          billlading_vessel_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose vessel' }],
          billlading_voyage_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose voyage' }],
          billlading_consignee_name: [{ required: true, trigger: 'change', message: 'Enter consignee name' }],
          billlading_consignee_address: [{ required: true, trigger: 'change', message: 'Enter consignee address' }],
          billlading_consignee_tel: [{ required: true, trigger: 'change', message: 'Enter consignee telephone' }],
          billlading_notify_name: [{ required: true, trigger: 'change', message: 'Enter notify party name' }],
          billlading_notify_address: [{ required: true, trigger: 'change', message: 'Enter notify party address' }],
          billlading_notify_tel: [{ required: true, trigger: 'change', message: 'Enter notify party telephone' }],
          billlading_loading_port_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose port' }],
          billlading_discharge_port_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose port' }],
          billlading_delivery_place: [{ required: true, trigger: 'change', message: 'Enter deliver place' }],
          billlading_original_num: [{ required: true, trigger: 'change', message: 'Enter Original B/L' }],
          billlading_copys_num: [{ required: true, trigger: 'change', message: 'Enter Copies B/L' }],
          billlading_stuffing_place: [{ required: true, trigger: 'change', message: 'Enter Stuffing Place' }],
          billlading_stuffing_date: [{ required: true, type: 'date', trigger: 'change', message: 'Choose Expected date' }],
          billlading_pay_date: [{ required: true, type: 'date', trigger: 'change', message: 'Choose Payable at' }],
          billlading_freight_currency: [{ required: true, trigger: 'change', message: 'Choose Status' }]
        }
      },
      pagePara: {},
      VoyageINFO: [],
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
        this.getBookingData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    vesselChange: async function(value) {
      let rsp = await this.$http.post(apiUrl + 'searchVoyage', {
        vessel_id: value
      })
      this.workPara.billlading_voyage_id = null
      this.VoyageINFO = JSON.parse(JSON.stringify(rsp.data.info.VoyageINFO))
    },
    sameCopy: function() {
      this.$set(this.workPara, 'billlading_notify_name', this.workPara.billlading_consignee_name)
      this.$set(this.workPara, 'billlading_notify_address', this.workPara.billlading_consignee_address)
      this.$set(this.workPara, 'billlading_notify_tel', this.workPara.billlading_consignee_tel)
    },
    addGood: function() {
      this.table.goodsTable.data.push({
        billlading_container_number: null,
        billlading_container_type: '',
        billlading_container_size: '',
        billlading_container_goods_description: '',
        billlading_container_package_number: null,
        billlading_container_package_unit: 'BAG',
        billlading_container_gross_volume: null,
        billlading_container_gross_volume_unit: 'M3',
        billlading_container_gross_weight: null,
        billlading_container_gross_unit: 'KG'
      })
    },
    deleteGood: function(index) {
      this.table.goodsTable.data.splice(index, 1)
    },
    getBookingData: async function(index) {
      try {
        if (index) {
          this.table.bookingTable.offset = (index - 1) * this.table.bookingTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.bookingTable.search_text,
          offset: this.table.bookingTable.offset,
          limit: this.table.bookingTable.limit
        })
        let data = response.data.info
        this.table.bookingTable.total = data.total
        this.table.bookingTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actBookingModal: async function() {
      this.workPara = {}
      this.table.goodsTable.data = [
        {
          billlading_container_number: null,
          billlading_container_type: '',
          billlading_container_size: '',
          billlading_container_goods_description: '',
          billlading_container_package_number: null,
          billlading_container_package_unit: 'BAG',
          billlading_container_gross_volume: null,
          billlading_container_gross_volume_unit: 'M3',
          billlading_container_gross_weight: null,
          billlading_container_gross_unit: 'KG'
        }
      ]
      this.action = 'add'
      this.$refs.formPort.resetFields()
      this.modal.bookingModal = true
    },
    modifyPortModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formPort.resetFields()
      this.modal.bookingModal = true
    },
    submitBooking: function() {
      this.$refs.formPort.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              this.workPara.billlading_goods = JSON.parse(JSON.stringify(this.table.goodsTable.data))
              await this.$http.post(apiUrl + 'booking', this.workPara)
              this.$Message.success('booking success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getBookingData()
            this.modal.bookingModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deletePort: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { port_id: row.port_id })
          this.$Message.success('delete success')
          this.getBookingData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    }
  }
}
</script>