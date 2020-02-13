<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Home</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Home
      <small>header small text goes here...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="vessel.search_data.date" placeholder="Vessel Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select clearable v-model="vessel.search_data.collect" style="width:180px" @on-change="getMasterbiData">
                <Option v-for="item in pagePara.COLLECT_FLAG" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="vessel.search_data.vesselName" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="vessel.search_data.bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getVoyageData">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="loadImportModal">Load</button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="saveData">Save</button>
            </div>
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vessel.height">
              <Row v-for="item in vessel.data" v-bind:key="item.invoice_vessel_id">
                <Col>
                  <div @click="checkVoyage(item.invoice_vessel_id)">
                    <Card>
                      <p slot="title">{{item.invoice_vessel_name}}({{item.invoice_vessel_code}}) - {{item.invoice_vessel_voyage}}</p>
                      <a href="#" slot="extra" @click.prevent="actdeleteVoyageModal(item)">
                        <Icon type="ios-close" />
                      </a>
                      <Row>
                        <Col span="11">
                          <p>ETA: {{item.invoice_vessel_eta}}</p>
                        </Col>
                        <Col span="13">Do release: {{item.invoice_do_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                      <Row>
                        <Col span="11">
                          <p>ATA: {{item.invoice_vessel_ata}}</p>
                        </Col>
                        <Col span="13">In release: {{item.invoice_invoice_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                      <Row>
                        <Col span="11">
                          <p>ATD: {{item.invoice_vessel_atd}}</p>
                        </Col>
                        <Col span="13">Re release: {{item.invoice_receipt_release_rcount}}/{{item.invoice_acount}}</Col>
                      </Row>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Scroll>
          </div>
        </Col>
        <Col span="17" offset="1">
          <Tabs :animated="false" @on-click="changeTab">
            <TabPane label="MasterBl">
              <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
                <template slot-scope="{ row, index }" slot="Invoice">
                  <Tooltip content="Deposit" v-if="!row.invoice_masterbi_invoice_release_date">
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDepositModal(row)">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                  </Tooltip>
                  <Tooltip :content="row.invoice_masterbi_invoice_release_date_fmt" v-if="row.invoice_masterbi_invoice_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm" @click="actDepositModal(row)">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                  </Tooltip>
                </template>
                <template slot-scope="{ row, index }" slot="Do">
                  <Tooltip content="Generate Do" v-if="!row.invoice_masterbi_do_release_date">
                    <a href="#" class="btn btn-green btn-icon btn-sm disabled" @click="actDownLoadDoModal(row)" v-if="!row.invoice_masterbi_receipt_release_date">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadDoModal(row)" v-else>
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                  <Tooltip :content="row.invoice_masterbi_do_release_date_fmt" v-if="row.invoice_masterbi_do_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm" @click="actDownLoadDoModal(row)">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                </template>
                <template slot-scope="{ row, index }" slot="Collect">
                  <a href="#" class="btn btn-info btn-xs" @click="actChangeCollectFlag(row, 'PREPAID')" v-if="row.invoice_masterbi_freight == 'COLLECT'">Collect</a>
                  <a href="#" class="btn btn-indigo btn-xs" @click="actChangeCollectFlag(row, 'COLLECT')" v-if="row.invoice_masterbi_freight !== 'COLLECT'">Prepaid</a>
                </template>
                <template slot-scope="{ row, index }" slot="files">
                  <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
                    <Button type="text" style="text-decoration:underline">Files</Button>
                    <template slot="content">
                      <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                        <template slot-scope="{ row, index }" slot="act">
                          <Tooltip content="Download">
                            <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                              <i class="fa fa-download"></i>
                            </a>
                          </Tooltip>
                          <Tooltip content="Release" v-if="!row.release_date && (row.filetype === 'Deposit' || row.filetype === 'Fee' || row.filetype === 'DO')">
                            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="doRealse(row, index)">
                              <i class="fa fa-share-square"></i>
                            </a>
                          </Tooltip>
                        </template>
                      </Table>
                    </template>
                  </Poptip>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_cargo_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_cargo_type" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_bl_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_bl_type" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_destination">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_destination" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_delivery">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_delivery" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_loading">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_loading" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_container_no">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_container_no" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_goods_description">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_goods_description" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_package_no">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_package_no" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_package_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_package_unit" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_weight">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_weight" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_weight_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_weight_unit" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_volume">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_volume" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_volume_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_volume_unit" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_invoice_value">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_invoice_value" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_invoice_currency">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_invoice_currency" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_freight_charge">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_freight_charge" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_freight_currency">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_freight_currency" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_imdg">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_imdg" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_packing_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_packing_type" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_code">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_code" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_name" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_tel" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_name" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_tel" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_address" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_tin" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_name" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_tel" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_address" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_tin" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_name" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_tel" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_address" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_tin" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_shipping_mark">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_shipping_mark" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_net_weight">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_net_weight" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_net_weight_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_net_weight_unit" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_line_code">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_line_code" size="small" />
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_terminal_code">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_terminal_code" size="small" />
                </template>
              </Table>
              <Page class="m-t-10" :total="table.masterbiTable.total" :page-size="table.masterbiTable.limit" @on-change="getMasterbiData" />
            </TabPane>
            <TabPane label="Containers">
              <Table stripe size="small" ref="containersTable" :columns="table.containersTable.columns" :data="table.containersTable.data" :height="table.containersTable.height"></Table>
              <Page class="m-t-10" :total="table.containersTable.total" :page-size="table.containersTable.limit" @on-change="getContainersData" />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </panel>
    <Modal v-model="modal.importModal" title="Import">
      <Form :model="workPara" :label-width="120">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xlsx']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/invoice/Invoice/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.importModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="importData">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.downLoadDoModal" title="Download Do" width="600">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Delivery to" prop="invoice_masterbi_delivery_to">
              <Input placeholder="Delivery to" v-model="workPara.invoice_masterbi_delivery_to" :disabled="!!workPara.invoice_masterbi_do_release_date" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="VALID TO" prop="invoice_masterbi_valid_to">
              <DatePicker type="date" placeholder="VALID TO" v-model="workPara.invoice_masterbi_valid_to" :disabled="!!workPara.invoice_masterbi_do_release_date"></DatePicker>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.downLoadDoModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadDo">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.depositModal" title="Deposit" width="600">
      <Form :model="workPara" :label-width="120">
        <FormItem label="Customer" prop="invoice_masterbi_customer_id">
          <Select v-model="workPara.invoice_masterbi_customer_id" filterable remote :remote-method="searchCustomer" :loading="deposit.customer.loading" placeholder="Customer">
            <Option v-for="item in deposit.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
          </Select>
          <!-- <AutoComplete v-model="workPara.invoice_masterbi_customer" :data="autocomplete.customer" @on-search="getCustomerData" placeholder="M/S."></AutoComplete> -->
        </FormItem>
        <FormItem label="Carrier" prop="invoice_masterbi_carrier">
          <Select v-model="workPara.invoice_masterbi_carrier">
            <Option v-for="item in pagePara.RECEIPT_TYPE_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Divider />
        <RadioGroup v-model="deposit.depositType" vertical @on-change="chooseDepositType" style="width:100%">
          <Radio label="Container Deposit">
            <span>Container Deposit</span>
          </Radio>
          <FormItem label="Deposit Amount" prop="invoice_masterbi_deposit">
            <Input placeholder="Deposit Amount" v-model="workPara.invoice_masterbi_deposit" :disabled="!deposit.disableFlag" />
          </FormItem>
          <Divider />
          <Radio label="Invoice Fee">
            <span>Invoice Fee</span>
          </Radio>
        </RadioGroup>
        <div style="padding-left: 50px;">
          <CheckboxGroup v-model="deposit.fees">
            <Checkbox label="CONTAINER TRANSFER" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="CONTAINER TRANSFER" v-model="workPara.invoice_masterbi_transfer" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('CONTAINER TRANSFER') >= 0)" />
            <Checkbox label="LIFT ON LIFT OFF" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="LIFT ON LIFT OFF" v-model="workPara.invoice_masterbi_lolf" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('LIFT ON LIFT OFF') >= 0)" />
            <Checkbox label="LCL" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="LCL" v-model="workPara.invoice_masterbi_lcl" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('LCL') >= 0)" />
            <Checkbox label="AMENDMENT" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="AMENDMENT" v-model="workPara.invoice_masterbi_amendment" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('AMENDMENT') >= 0)" />
            <Checkbox label="TASAC" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="TASAC" v-model="workPara.invoice_masterbi_tasac" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('TASAC') >= 0)" />
            <Checkbox label="BILL PRINGTING" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="BILL PRINGTING" v-model="workPara.invoice_masterbi_printing" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('BILL PRINGTING') >= 0)" />
            <Checkbox label="OCEAN FREIGHT" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="OCEAN FREIGHT" v-model="workPara.invoice_masterbi_of" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('OCEAN FREIGHT') >= 0)" />
            <Checkbox label="OTHERS" :disabled="deposit.disableFlag"></Checkbox>
            <Input placeholder="OTHERS" v-model="workPara.invoice_masterbi_others" :disabled="!(deposit.disableFlag === false && deposit.fees.indexOf('OTHERS') >= 0)" />
          </CheckboxGroup>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.depositModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="depositDo">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.deleteVoyageModal" title="Delete Voyage" width="600">
      <Form :model="workPara" :label-width="120">
        <Row>
          <Col>
            <FormItem label="Voyage No." prop="voyage_no">
              <Input placeholder="Voyage No." v-model="workPara.voyage_no" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.deleteVoyageModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="deleteVoyage">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
import printJS from 'print-js'
const moment = require('moment')
const _ = require('lodash')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/invoice/Invoice/'

export default {
  data: function() {
    return {
      modal: { importModal: false, downLoadDoModal: false, depositModal: false, deleteVoyageModal: false },
      table: {
        masterbiTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'invoice_masterbi_bl',
              width: 150
            },
            {
              title: 'Invoice',
              slot: 'Invoice',
              width: 80
            },
            {
              title: 'Do',
              slot: 'Do',
              width: 60
            },
            {
              title: 'Collect',
              slot: 'Collect',
              width: 120
            },
            {
              title: 'Files',
              slot: 'files',
              width: 100
            },
            {
              title: 'Cargo Classification',
              slot: 'invoice_masterbi_cargo_type',
              width: 100
            },
            {
              title: '*B/L Type',
              slot: 'invoice_masterbi_bl_type',
              width: 100
            },
            {
              title: 'Place of Destination',
              slot: 'invoice_masterbi_destination',
              width: 130
            },
            {
              title: 'Place of Delivery',
              slot: 'invoice_masterbi_delivery',
              width: 130
            },
            {
              title: 'Port of Loading',
              slot: 'invoice_masterbi_loading',
              width: 130
            },
            {
              title: 'Number of Containers',
              slot: 'invoice_masterbi_container_no',
              width: 100
            },
            {
              title: 'Description of Goods',
              slot: 'invoice_masterbi_goods_description',
              width: 200
            },
            {
              title: 'Number of Package',
              slot: 'invoice_masterbi_package_no',
              width: 100
            },
            {
              title: 'Package Unit',
              slot: 'invoice_masterbi_package_unit',
              width: 100
            },
            {
              title: 'Gross Weight',
              slot: 'invoice_masterbi_gross_weight',
              width: 100
            },
            {
              title: 'Gross Weight Unit',
              slot: 'invoice_masterbi_gross_weight_unit',
              width: 100
            },
            {
              title: 'Gross Volume',
              slot: 'invoice_masterbi_gross_volume',
              width: 100
            },
            {
              title: 'Gross Volume Unit',
              slot: 'invoice_masterbi_gross_volume_unit',
              width: 100
            },
            {
              title: 'Invoice Value',
              slot: 'invoice_masterbi_invoice_value',
              width: 100
            },
            {
              title: 'Invoice Currency',
              slot: 'invoice_masterbi_invoice_currency',
              width: 100
            },
            {
              title: 'Freight Charge',
              slot: 'invoice_masterbi_freight_charge',
              width: 100
            },
            {
              title: 'Freight Currency',
              slot: 'invoice_masterbi_freight_currency',
              width: 100
            },
            {
              title: 'IMDG Code',
              slot: 'invoice_masterbi_imdg',
              width: 100
            },
            {
              title: 'Packing Type',
              slot: 'invoice_masterbi_packing_type',
              width: 100
            },
            {
              title: 'Forwarder Code',
              slot: 'invoice_masterbi_forwarder_code',
              width: 150
            },
            {
              title: 'Forwarder Name',
              slot: 'invoice_masterbi_forwarder_name',
              width: 200
            },
            {
              title: 'Forwarder Tel',
              slot: 'invoice_masterbi_forwarder_tel',
              width: 150
            },
            {
              title: 'Exporter Name',
              slot: 'invoice_masterbi_exporter_name',
              width: 200
            },
            {
              title: 'Exporter Tel',
              slot: 'invoice_masterbi_exporter_tel',
              width: 100
            },
            {
              title: 'Exporter Address',
              slot: 'invoice_masterbi_exporter_address',
              width: 200
            },
            {
              title: 'Exporter TIN',
              slot: 'invoice_masterbi_exporter_tin',
              width: 100
            },
            {
              title: 'Consignee Name',
              slot: 'invoice_masterbi_consignee_name',
              tooltip: true,
              width: 200
            },
            {
              title: 'Consignee Tel',
              slot: 'invoice_masterbi_consignee_tel',
              width: 100
            },
            {
              title: 'Consignee Address',
              slot: 'invoice_masterbi_consignee_address',
              width: 200
            },
            {
              title: 'Consignee TIN',
              slot: 'invoice_masterbi_consignee_tin',
              width: 100
            },
            {
              title: 'Notify Name',
              slot: 'invoice_masterbi_notify_name',
              width: 200
            },
            {
              title: 'Notify Tel',
              slot: 'invoice_masterbi_notify_tel',
              width: 100
            },
            {
              title: 'Notify Address',
              slot: 'invoice_masterbi_notify_address',
              width: 200
            },
            {
              title: 'Notify TIN',
              slot: 'invoice_masterbi_notify_tin',
              width: 100
            },
            {
              title: 'Shipping Mark',
              slot: 'invoice_masterbi_shipping_mark',
              width: 200
            },
            {
              title: 'Net Weight',
              slot: 'invoice_masterbi_net_weight',
              width: 100
            },
            {
              title: 'Net Weight Unit',
              slot: 'invoice_masterbi_net_weight_unit',
              width: 100
            },
            {
              title: 'LineAgent Code',
              slot: 'invoice_masterbi_line_code',
              width: 100
            },
            {
              title: 'TerminalCode',
              slot: 'invoice_masterbi_terminal_code',
              width: 100
            }
          ],
          data: [],
          unchanged: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        },
        containersTable: {
          columns: [
            {
              title: '#M B/L No',
              key: 'invoice_containers_bl',
              width: 150
            },
            {
              title: 'Type Of Container',
              key: 'invoice_containers_type',
              width: 100
            },
            {
              title: 'Container No',
              key: 'invoice_containers_no',
              width: 150
            },
            {
              title: 'Container Size',
              key: 'invoice_containers_size',
              width: 100
            },
            {
              title: 'Seal No.1',
              key: 'invoice_containers_seal1',
              width: 100
            },
            {
              title: 'Seal No.2',
              key: 'invoice_containers_seal2',
              width: 100
            },
            {
              title: 'Seal No.3',
              key: 'invoice_containers_seal3',
              width: 100
            },
            {
              title: 'Freight Indicator',
              key: 'invoice_containers_freight_indicator',
              width: 100
            },
            {
              title: 'No Of Package',
              key: 'invoice_containers_package_no',
              width: 100
            },
            {
              title: 'Package Unit',
              key: 'invoice_containers_package_unit',
              width: 100
            },
            {
              title: 'Volumn',
              key: 'invoice_containers_volumn',
              width: 100
            },
            {
              title: 'Volumn Unit',
              key: 'invoice_containers_volumn_unit',
              width: 100
            },
            {
              title: 'Weight',
              key: 'invoice_containers_weight',
              width: 100
            },
            {
              title: 'Weight Unit',
              key: 'invoice_containers_weight_unit',
              width: 100
            },
            {
              title: 'Plug type of reefer',
              key: 'invoice_containers_plug_reefer',
              width: 100
            },
            {
              title: 'Minimum Temperature',
              key: 'invoice_containers_min_temperature',
              width: 100
            },
            {
              title: 'Maximum Temperature',
              key: 'invoice_containers_max_temperature',
              width: 100
            }
          ],
          data: [],
          height: common.getTableHeight() - 80,
          limit: 10,
          offset: 0,
          total: 0
        },
        filesTable: {
          columns: [
            {
              title: 'Create Date',
              key: 'date',
              width: 120
            },
            {
              title: 'Type',
              key: 'filetype',
              width: 80
            },
            {
              title: 'Action',
              slot: 'act',
              width: 100
            },
            {
              title: 'Released Date',
              key: 'release_date',
              width: 150,
              render: (h, params) => {
                return h('div', params.row.release_date ? moment(params.row.release_date).format('DD/MM/YYYY hh:mm') : '')
              }
            }
          ]
        }
      },
      pagePara: {},
      workPara: {},
      headers: common.uploadHeaders(),
      action: '',
      files: {
        fileList: []
      },
      vessel: {
        data: [],
        search_data: {
          date: [
            moment()
              .subtract(30, 'days')
              .format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD')
          ],
          vesselName: '',
          bl: '',
          collect: ''
        },
        current: '',
        height: common.getTableHeight()
      },
      deposit: {
        depositType: 'Container Deposit',
        fees: [],
        disableFlag: true,
        customer: {
          options: [],
          loading: false
        }
      },
      currentTab: 0
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: async function() {
    await this.getPara()
    await this.getVoyageData()
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
    loadImportModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.modal.importModal = true
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileList = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleImportbefore(file) {
      this.$Spin.show()
    },
    handleImportSuccess(res, file, fileList) {
      this.$Spin.hide()
      this.$Notice.success({
        title: 'Success',
        desc: 'File Import Success'
      })
      this.getPara()
      this.getImportData()
    },
    handleImportError(error, file, fileList) {
      this.$Spin.hide()
      this.$Notice.error({
        title: 'Error',
        desc: 'File Import Failed'
      })
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select pdf.'
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 4M.'
      })
    },
    importData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload xml file')
        }
        this.workPara.upload_files = this.files.fileList
        await this.$http.post(apiUrl + 'uploadImport', this.workPara)
        this.$Message.success('submit success')
        this.getVoyageData()
        this.modal.importModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchData: function(e) {
      this.vessel.search_data.date = JSON.parse(JSON.stringify(e))
    },
    getVoyageData: async function() {
      try {
        let searchPara = {
          start_date: this.vessel.search_data.date[0],
          end_date: this.vessel.search_data.date[1],
          vesselName: this.vessel.search_data.vesselName,
          bl: this.vessel.search_data.bl,
          limit: 10,
          offset: 0
        }

        let response = await this.$http.post(apiUrl + 'searchVoyage', searchPara)
        let data = response.data.info
        this.vessel.data = JSON.parse(JSON.stringify(data.vessels))
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.masterbl.rows))
        this.table.masterbiTable.total = data.masterbl.total
        this.table.containersTable.data = []
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    checkVoyage: async function(invoice_vessel_id) {
      if (this.vessel.current != invoice_vessel_id) {
        this.vessel.current = invoice_vessel_id
        if (this.currentTab === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
      }
    },
    changeTab: function(name) {
      if (this.currentTab != name) {
        this.currentTab = name
        if (name === 0) {
          this.getMasterbiData(1)
        } else {
          this.getContainersData(1)
        }
      }
    },
    getMasterbiData: async function(index) {
      if (this.vessel.current) {
        if (index) {
          this.table.masterbiTable.offset = (index - 1) * this.table.masterbiTable.limit
        }
        let searchPara = {
          invoice_vessel_id: this.vessel.current,
          collect: this.vessel.search_data.collect,
          offset: this.table.masterbiTable.offset,
          limit: this.table.masterbiTable.limit
        }

        let response = await this.$http.post(apiUrl + 'getMasterbiData', searchPara)
        let data = response.data.info
        this.table.masterbiTable.total = data.total
        this.table.masterbiTable.data = JSON.parse(JSON.stringify(data.rows))
        this.table.masterbiTable.unchanged = JSON.parse(JSON.stringify(data.rows))
      }
    },
    getContainersData: async function(index) {
      if (index) {
        this.table.containersTable.offset = (index - 1) * this.table.containersTable.limit
      }
      let searchPara = {
        invoice_vessel_id: this.vessel.current,
        offset: this.table.containersTable.offset,
        limit: this.table.containersTable.limit
      }

      let response = await this.$http.post(apiUrl + 'getContainersData', searchPara)
      let data = response.data.info
      this.table.containersTable.total = data.total
      this.table.containersTable.data = JSON.parse(JSON.stringify(data.rows))
    },
    actDownLoadDoModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.modal.downLoadDoModal = true
    },
    downloadDo: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'downloadDo', this.workPara)
        printJS(response.data.info.url)
        this.$Message.success('do success')
        this.modal.downLoadDoModal = false
        this.getMasterbiData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    doRealse: async function(row, index) {
      try {
        await this.$http.post(apiUrl + 'doRelease', { file_id: row.file_id })
        this.getVoyageData()
        this.getMasterbiData()
        this.$Message.success('release success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actDepositModal: function(row) {
      this.deposit.customer.loading = true
      this.deposit.customer.options = JSON.parse(JSON.stringify(row.customerINFO))
      this.deposit.customer.loading = false
      this.deposit.depositType = 'Container Deposit'
      this.deposit.fees = []
      this.$nextTick(function() {
        this.workPara = JSON.parse(JSON.stringify(row))
        this.modal.depositModal = true
      })
    },
    chooseDepositType: function() {
      if (this.deposit.depositType === 'Invoice Fee') {
        this.deposit.disableFlag = false
        this.deposit.fees = []
        this.workPara.invoice_masterbi_transfer = ''
        this.workPara.invoice_masterbi_lolf = ''
        this.workPara.invoice_masterbi_lcl = ''
        this.workPara.invoice_masterbi_amendment = ''
        this.workPara.invoice_masterbi_tasac = ''
        this.workPara.invoice_masterbi_printing = ''
        this.workPara.invoice_masterbi_of = ''
        this.workPara.invoice_masterbi_others = ''
      } else {
        this.deposit.disableFlag = true
        this.deposit.fees = []
      }
    },
    // getCustomerData: async function() {
    //   try {
    //     let response = await this.$http.post(apiUrl + 'searchCustomer', { search_text: this.workPara.invoice_masterbi_customer })
    //     this.autocomplete.msdata = JSON.parse(JSON.stringify(response.data.info))
    //   } catch (error) {
    //     this.$commonact.fault(error)
    //   }
    // },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.deposit.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.deposit.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.deposit.customer.loading = false
      } else {
        this.deposit.customer.options = []
      }
    },
    depositDo: async function() {
      try {
        if (!this.workPara.invoice_masterbi_customer_id) {
          return this.$Message.error('Please choose customer')
        }

        if (!this.workPara.invoice_masterbi_carrier) {
          return this.$Message.error('Please choose carrier')
        }
        let response = await this.$http.post(apiUrl + 'depositDo', _.extend(this.workPara, this.deposit))
        printJS(response.data.info.url)
        this.$Message.success('deposit success')
        this.modal.depositModal = false
        this.getMasterbiData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    actChangeCollectFlag: async function(row, cflag) {
      try {
        await this.$http.post(apiUrl + 'changeCollect', { invoice_masterbi_id: row.invoice_masterbi_id, act: cflag })
        this.getMasterbiData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    saveData: async function() {
      if (this.table.masterbiTable.data.length > 0) {
        let changeData = []
        for (let i = 0; i < this.table.masterbiTable.data.length; i++) {
          if (JSON.stringify(this.table.masterbiTable.data[i]) !== JSON.stringify(this.table.masterbiTable.unchanged[i])) {
            changeData.push(this.table.masterbiTable.data[i])
          }
        }
        if (changeData.length > 0) {
          try {
            await this.$http.post(apiUrl + 'changebl', { changedbl: changeData })
            this.getMasterbiData()
            this.$Message.success('save success')
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      }
    },
    actdeleteVoyageModal: function(item) {
      this.workPara = JSON.parse(JSON.stringify(item))
      this.modal.deleteVoyageModal = true
    },
    deleteVoyage: function() {
      try {
        let _self = this
        _self.$commonact.confirm(`Delete the file?`, async () => {
          if (_self.workPara.voyage_no !== _self.workPara.invoice_vessel_voyage) {
            return _self.$Message.error('Please enter right Voyage No.')
          }
          await _self.$http.post(apiUrl + 'deleteVoyage', { invoice_vessel_id: _self.workPara.invoice_vessel_id })
          _self.getVoyageData()
          _self.getMasterbiData()
          _self.modal.deleteVoyageModal = false
        })
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
  }
}
</script>