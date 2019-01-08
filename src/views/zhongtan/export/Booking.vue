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
      <Table stripe size="small" ref="bookingTable" :columns="table.bookingTable.rows" :data="table.bookingTable.data">
        <template slot-scope="{ row, index }" slot="edit">
          <Tooltip content="Edit bill lading">
            <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyBookingModal(row)">
              <i class="fa fa-edit"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Tooltip content="Cancel bill lading" v-if="row.billlading_state === 'PBK'">
            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="cancelBooking(row)">
              <i class="fa fa-times"></i>
            </a>
          </Tooltip>
          <Tooltip content="Pick up empty" v-if="row.billlading_state === 'BK'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="pickUpEmpty(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Submit Loading" v-if="row.billlading_state === 'PC' || row.billlading_state === 'RL'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="submitLoadingModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_voyage_id">
          <Select v-model="row.billlading_voyage_id" disabled>
            <Option v-for="item in row.VoyageINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_goods">
          <Poptip trigger="hover" width="1000">
            <Button type="text" style="text-decoration:underline">Goods</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.poptipGoodsTable.rows" :data="row.billlading_goods"></Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_containers">
          <Poptip trigger="hover" width="1000">
            <Button type="text" style="text-decoration:underline">Containers</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.poptipContainerTable.rows" :data="row.billlading_containers"></Table>
            </template>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.bookingTable.total" :page-size="table.bookingTable.limit" @on-change="getBookingData"/>
    </panel>
    <Modal v-model="modal.bookingModal" title="Booking" width="800">
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
            <div style="width: 700px">
              <Row v-if="action === 'add' || workPara.billlading_state === 'PBK'">
                <Col span="24">
                  <h4 class="text-middle m-b-10">
                    <b>Cargo Description</b>
                  </h4>
                  <Table stripe ref="goodsTable" :columns="table.goodsTable.rows" :data="table.goodsTable.data">
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_number">
                      <Input v-model="row.billlading_goods_container_number" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_type">
                      <Select v-model="row.billlading_goods_container_type" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_size">
                      <Select v-model="row.billlading_goods_container_size" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_type">
                      <Input v-model="row.billlading_goods_type" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_description">
                      <Input v-model="row.billlading_goods_description" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_package_number">
                      <Input v-model="row.billlading_goods_package_number" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_package_unit">
                      <Select v-model="row.billlading_goods_package_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_volume">
                      <Input v-model="row.billlading_goods_gross_volume" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_volume_unit">
                      <Select v-model="row.billlading_goods_gross_volume_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_weight">
                      <Input v-model="row.billlading_goods_gross_weight" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_unit">
                      <Select v-model="row.billlading_goods_gross_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_net_weight">
                      <Input v-model="row.billlading_goods_net_weight" @on-blur="table.goodsTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_net_unit">
                      <Select v-model="row.billlading_goods_net_unit" @on-change="table.goodsTable.data[index] = row">
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
              <Row v-else>
                <Col span="24">
                  <h4 class="text-middle m-b-10">
                    <b>Container Description</b>
                  </h4>
                  <Table stripe ref="containerTable" :columns="table.containerTable.rows" :data="table.containerTable.data">
                    <template slot-scope="{ row, index }" slot="container_no">
                      <Input v-model="row.container_no" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_type">
                      <Select v-model="row.container_type" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_size">
                      <Select v-model="row.container_size" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_goods_type">
                      <Input v-model="row.container_goods_type" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_goods_description">
                      <Input v-model="row.container_goods_description" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_seal_no1">
                      <Input v-model="row.container_seal_no1" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_freight_indicator">
                      <Input v-model="row.container_freight_indicator" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_package_no">
                      <Input v-model="row.container_package_no" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_package_unit">
                      <Select v-model="row.container_package_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_volume">
                      <Input v-model="row.container_volume" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_volume_unit">
                      <Select v-model="row.container_volume_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_weight">
                      <Input v-model="row.container_weight" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_weight_unit">
                      <Select v-model="row.container_weight_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_minmum_temperature">
                      <Input v-model="row.container_minmum_temperature" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_maxmum_temperature">
                      <Input v-model="row.container_maxmum_temperature" @on-blur="table.containerTable.data[index] = row"/>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_refer_plug">
                      <Select v-model="row.container_refer_plug" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.YNINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                  </Table>
                </Col>
              </Row>
            </div>
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
    <Modal v-model="modal.submitLoadingModal" title="Submit Loading" width="1100">
      <Row>
        <Col span="24">
          <h4 class="text-middle m-b-10">
            <b>Container Description</b>
          </h4>
          <Table stripe ref="containerTable" :columns="table.containerTable.rows" :data="table.containerTable.data">
            <template slot-scope="{ row, index }" slot="container_no">
              <Input v-model="row.container_no" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_type">
              <Select v-model="row.container_type" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_size">
              <Select v-model="row.container_size" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_goods_type">
              <Input v-model="row.container_goods_type" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_goods_description">
              <Input v-model="row.container_goods_description" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_seal_no1">
              <Input v-model="row.container_seal_no1" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_freight_indicator">
              <Input v-model="row.container_freight_indicator" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_package_no">
              <Input v-model="row.container_package_no" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_package_unit">
              <Select v-model="row.container_package_unit" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_volume">
              <Input v-model="row.container_volume" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_volume_unit">
              <Select v-model="row.container_volume_unit" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_weight">
              <Input v-model="row.container_weight" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_weight_unit">
              <Select v-model="row.container_weight_unit" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="billlading_goods_net_weight">
              <Input v-model="row.billlading_goods_net_weight" @on-blur="table.goodsTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="billlading_goods_net_unit">
              <Select v-model="row.billlading_goods_net_unit" @on-change="table.goodsTable.data[index] = row">
                <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_weight_unit">
              <Select v-model="row.container_weight_unit" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
            <template slot-scope="{ row, index }" slot="container_minmum_temperature">
              <Input v-model="row.container_minmum_temperature" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_maxmum_temperature">
              <Input v-model="row.container_maxmum_temperature" @on-blur="table.containerTable.data[index] = row"/>
            </template>
            <template slot-scope="{ row, index }" slot="container_refer_plug">
              <Select v-model="row.container_refer_plug" @on-change="table.containerTable.data[index] = row">
                <Option v-for="item in pagePara.YNINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </template>
          </Table>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.submitLoadingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitLoading">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/Booking/'

export default {
  name: 'Booking',
  data: function() {
    return {
      modal: { bookingModal: false, submitLoadingModal: false },
      table: {
        bookingTable: {
          rows: [
            {
              type: 'index',
              width: 40,
              align: 'center',
              fixed: 'left'
            },
            {
              title: 'Edit',
              slot: 'edit',
              width: 60,
              fixed: 'left'
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100,
              fixed: 'left'
            },
            {
              title: 'S/O',
              key: 'billlading_no',
              width: 100,
              fixed: 'left'
            },
            {
              title: 'Status',
              key: 'billlading_state',
              render: (h, params) => {
                let info = this.pagePara.BLSTATUSINFO.find(element => element.id === params.row.billlading_state)
                return h('span', { class: 'label ' + info.style }, info.text)
              },
              width: 150,
              fixed: 'left'
            },
            {
              title: 'Book Date',
              key: 'booking_date',
              width: 100
            },
            {
              title: 'Vessel',
              key: 'billlading_vessel_id',
              render: common.selectRender(this, 'VesselINFO'),
              width: 100
            },
            {
              title: 'Voyage',
              slot: 'billlading_voyage_id',
              width: 180
            },
            {
              title: 'Goods',
              slot: 'billlading_goods',
              width: 100
            },
            {
              title: 'Gontainers',
              slot: 'billlading_containers',
              width: 100
            },
            {
              title: 'Loading Port',
              key: 'billlading_loading_port_id',
              render: common.selectRender(this, 'PortINFO'),
              width: 140
            },
            {
              title: 'Discharge Port',
              key: 'billlading_discharge_port_id',
              render: common.selectRender(this, 'PortINFO'),
              width: 140
            },
            {
              title: 'Delivery Place',
              key: 'billlading_delivery_place',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Stuffing Place',
              key: 'billlading_stuffing_place',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Stuffing Date',
              key: 'billlading_stuffing_date',
              width: 100
            },
            {
              title: 'Stuffing requirement',
              key: 'billlading_stuffing_requirement',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Consignee Name',
              key: 'billlading_consignee_name',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Consignee Address',
              key: 'billlading_consignee_address',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Consignee telephone',
              key: 'billlading_consignee_tel',
              width: 100
            },
            {
              title: 'Notify Name',
              key: 'billlading_notify_name',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Notify Address',
              key: 'billlading_notify_address',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Notify telephone',
              key: 'billlading_notify_tel',
              width: 100
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
              slot: 'billlading_goods_container_number',
              width: 100
            },
            {
              title: 'Type',
              slot: 'billlading_goods_container_type',
              width: 100
            },
            {
              title: 'Size',
              slot: 'billlading_goods_container_size',
              width: 100
            },
            {
              title: 'Goods Type',
              slot: 'billlading_goods_type',
              width: 100
            },
            {
              title: 'Description',
              slot: 'billlading_goods_description',
              width: 100
            },
            {
              title: 'Package No',
              slot: 'billlading_goods_package_number',
              width: 100
            },
            {
              title: 'Package Unit',
              slot: 'billlading_goods_package_unit',
              width: 100
            },
            {
              title: 'Volume',
              slot: 'billlading_goods_gross_volume',
              width: 100
            },
            {
              title: 'Volume Unit',
              slot: 'billlading_goods_gross_volume_unit',
              width: 100
            },
            {
              title: 'Gross Weight',
              slot: 'billlading_goods_gross_weight',
              width: 100
            },
            {
              title: 'Gross Unit',
              slot: 'billlading_goods_gross_unit',
              width: 100
            },
            {
              title: 'Net Weight',
              slot: 'billlading_goods_net_weight',
              width: 100
            },
            {
              title: 'Net Unit',
              slot: 'billlading_goods_net_unit',
              width: 100
            },
            {
              title: 'Action',
              slot: 'action',
              width: 100
            }
          ],
          data: []
        },
        containerTable: {
          rows: [
            {
              title: 'Container No.',
              slot: 'container_no',
              width: 100
            },
            {
              title: 'Type',
              slot: 'container_type',
              width: 100
            },
            {
              title: 'Size',
              slot: 'container_size',
              width: 100
            },
            {
              title: 'Goods Type',
              slot: 'container_goods_type',
              width: 100
            },
            {
              title: 'Description',
              slot: 'container_goods_description',
              width: 100
            },
            {
              title: 'Seal No.',
              slot: 'container_seal_no1',
              width: 100
            },
            {
              title: 'Freight Indicator',
              slot: 'container_freight_indicator',
              width: 100
            },
            {
              title: 'Package No',
              slot: 'container_package_no',
              width: 100
            },
            {
              title: 'Package Unit',
              slot: 'container_package_unit',
              width: 100
            },
            {
              title: 'Volume',
              slot: 'container_volume',
              width: 100
            },
            {
              title: 'Volume Unit',
              slot: 'container_volume_unit',
              width: 100
            },
            {
              title: 'Weight',
              slot: 'container_weight',
              width: 100
            },
            {
              title: 'Weight Unit',
              slot: 'container_weight_unit',
              width: 100
            },
            {
              title: 'Min Temperature',
              slot: 'container_minmum_temperature',
              width: 100
            },
            {
              title: 'Max Temperature',
              slot: 'container_maxmum_temperature',
              width: 100
            },
            {
              title: 'Refer Plug',
              slot: 'container_refer_plug',
              width: 100
            }
          ],
          data: []
        },
        poptipGoodsTable: {
          rows: [
            {
              title: 'Vol.',
              key: 'billlading_goods_container_number'
            },
            {
              title: 'Type',
              key: 'billlading_goods_container_type',
              render: common.selectRender(this, 'ContainerTypeINFO')
            },
            {
              title: 'Size',
              key: 'billlading_goods_container_size',
              render: common.selectRender(this, 'ContainerSizeINFO')
            },
            {
              title: 'Goods Type',
              key: 'billlading_goods_type'
            },
            {
              title: 'Description',
              key: 'billlading_goods_description',
              render: common.tooltipRender()
            },
            {
              title: 'Package No',
              key: 'billlading_goods_package_number'
            },
            {
              title: 'Package Unit',
              key: 'billlading_goods_package_unit',
              render: common.selectRender(this, 'PackageUnitINFO')
            },
            {
              title: 'Volume',
              key: 'billlading_goods_gross_volume'
            },
            {
              title: 'Volume Unit',
              key: 'billlading_goods_gross_volume_unit',
              render: common.selectRender(this, 'VolumeUnitINFO')
            },
            {
              title: 'Gross Weight',
              key: 'billlading_goods_gross_weight'
            },
            {
              title: 'Gross Unit',
              key: 'billlading_goods_gross_unit',
              render: common.selectRender(this, 'WeightUnitINFO')
            },
            {
              title: 'Net Weight',
              key: 'billlading_goods_net_weight'
            },
            {
              title: 'Net Unit',
              key: 'billlading_goods_net_unit',
              render: common.selectRender(this, 'WeightUnitINFO')
            }
          ]
        },
        poptipContainerTable: {
          rows: [
            {
              title: 'Container No.',
              key: 'container_no'
            },
            {
              title: 'Type',
              key: 'container_type',
              render: common.selectRender(this, 'ContainerTypeINFO')
            },
            {
              title: 'Size',
              key: 'container_size',
              render: common.selectRender(this, 'ContainerSizeINFO')
            },
            {
              title: 'Goods Type',
              key: 'container_goods_type'
            },
            {
              title: 'Description.',
              key: 'billlading_goods_description'
            },
            {
              title: 'Seal No.',
              key: 'container_seal_no1'
            },
            {
              title: 'Freight Indicator',
              key: 'container_freight_indicator'
            },
            {
              title: 'Package No',
              key: 'container_package_no'
            },
            {
              title: 'Package Unit',
              key: 'container_package_unit',
              render: common.selectRender(this, 'PackageUnitINFO')
            },
            {
              title: 'Volume',
              key: 'container_volume'
            },
            {
              title: 'Volume Unit',
              key: 'container_volume_unit',
              render: common.selectRender(this, 'VolumeUnitINFO')
            },
            {
              title: 'Weight',
              key: 'container_weight'
            },
            {
              title: 'Weight Unit',
              key: 'container_weight_unit',
              render: common.selectRender(this, 'WeightUnitINFO')
            },
            {
              title: 'Min Temperature',
              key: 'container_minmum_temperature'
            },
            {
              title: 'Max Temperature',
              key: 'container_maxmum_temperature'
            },
            {
              title: 'Refer Plug',
              key: 'container_refer_plug',
              render: common.selectRender(this, 'YNINFO')
            }
          ]
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
        billlading_goods_container_number: null,
        billlading_goods_container_type: '',
        billlading_goods_container_size: '',
        billlading_goods_type: '',
        billlading_goods_description: '',
        billlading_goods_package_number: null,
        billlading_goods_package_unit: 'BAG',
        billlading_goods_gross_volume: null,
        billlading_goods_gross_volume_unit: 'M3',
        billlading_goods_gross_weight: null,
        billlading_goods_gross_unit: 'KG',
        billlading_goods_net_weight: null,
        billlading_goods_net_unit: 'KG'
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
      this.table.goodsTable.data = []
      this.table.goodsTable.data.push({
        billlading_goods_container_number: null,
        billlading_goods_container_type: '',
        billlading_goods_container_size: '',
        billlading_goods_type: '',
        billlading_goods_description: '',
        billlading_goods_package_number: null,
        billlading_goods_package_unit: 'BAG',
        billlading_goods_gross_volume: null,
        billlading_goods_gross_volume_unit: 'M3',
        billlading_goods_gross_weight: null,
        billlading_goods_gross_unit: 'KG',
        billlading_goods_net_weight: null,
        billlading_goods_net_unit: 'KG'
      })
      this.action = 'add'
      this.$refs.formPort.resetFields()
      this.modal.bookingModal = true
    },
    modifyBookingModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.table.goodsTable.data = JSON.parse(JSON.stringify(actrow.billlading_goods))
      this.table.containerTable.data = JSON.parse(JSON.stringify(actrow.billlading_containers))
      this.action = 'modify'
      this.$refs.formPort.resetFields()
      this.modal.bookingModal = true
    },
    submitBooking: function() {
      this.$refs.formPort.validate(async valid => {
        if (valid) {
          try {
            this.workPara.billlading_goods = JSON.parse(JSON.stringify(this.table.goodsTable.data))
            this.workPara.billlading_containers = JSON.parse(JSON.stringify(this.table.containerTable.data))
            if (this.action === 'add') {
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
    cancelBooking: function(row) {
      this.$commonact.confirm('cancel confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'cancel', { billlading_id: row.billlading_id })
          this.$Message.success('cancel success')
          this.getBookingData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    pickUpEmpty: function(row) {
      this.$commonact.confirm('Pick up empty?', async () => {
        try {
          await this.$http.post(apiUrl + 'pickUpEmpty', { billlading_id: row.billlading_id })
          this.$Message.success('Successful operation')
          this.getBookingData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    submitLoadingModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.table.containerTable.data = JSON.parse(JSON.stringify(row.billlading_containers))
      this.modal.submitLoadingModal = true
    },
    submitLoading: async function() {
      for (let c of this.table.containerTable.data) {
        if (c.container_no === '' || c.container_seal_no1 === '') {
          return this.$Message.error('Please enter Container No. & Seal No.')
        }
      }
      this.workPara.billlading_containers = JSON.parse(JSON.stringify(this.table.containerTable.data))
      await this.$http.post(apiUrl + 'submitloading', this.workPara)
      this.$Message.success('submit loading success')
      this.getBookingData()
      this.modal.submitLoadingModal = false
    }
  }
}
</script>