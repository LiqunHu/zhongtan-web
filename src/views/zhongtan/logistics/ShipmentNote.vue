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
      Payment Note
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Payment Note">
      <template slot="beforeBody">
        <div class="panel-toolbar">
            <Row>
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <input type="text" placeholder="B/L#" v-model.trim="searchPara.shipment_list_bill_no" class="form-control" style="width:199px; margin-right:7px;">
                  <input type="text" placeholder="CONTAINER#" v-model.trim="searchPara.shipment_list_container_no" class="form-control" style="width:199px; margin-right:7px;">
                  <Select v-model="searchPara.shipment_list_cntr_owner" clearable placeholder="CNTR OWNER" style="width:199px; margin-right:7px;">
                    <Option v-for="item in cntrOwnerFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_vendor" clearable placeholder="VENDOR" style="width:199px">
                    <Option v-for="item in pagePara.VENDOR" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="getShipmentNoteData(1)">
                    <i class="fa fa-search"></i>Search
                  </button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="addShipmentListModal">AddPayment</button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="applyPaymentModal" :disabled="applyPaymentDisabled">ApplyPayment</button>
                </div>
                <div class="form-group m-r-10">
                  <button type="button" class="btn btn-info" @click="exportAct">Export</button>
                </div>
              </div>
            </Row>
            <Row style="margin-top:7px;">
              <div class="form-inline">
                <div class="input-group m-r-10">
                  <Select v-model="searchPara.shipment_list_payment_status" clearable placeholder="PAYMENT STATUS" style="width:199px; margin-right:7px;">
                    <Option v-for="item in pagePara.PAYMENT_STATUS" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_business_type" clearable placeholder="BUSINESS TYPE" style="width:199px; margin-right:7px;">
                    <Option v-for="item in businessTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <Select v-model="searchPara.shipment_list_cargo_type" clearable placeholder="CARGO TYPE" style="width:199px; margin-right:7px;">
                    <Option v-for="item in cargoTypeFilter" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_in_date" placeholder="DISCHARGE/GATE OUT" @on-change="searchInDateChange" format="yyyy-MM-dd" style="margin-right:7px;"></DatePicker>
                  <DatePicker type="daterange" :value="searchPara.shipment_list_out_date" placeholder="EMPTY RETURN/LOADING" @on-change="searchOutDateChange" format="yyyy-MM-dd"></DatePicker>
                </div>
              </div>
            </Row>
        </div>
      </template>
      <Table stripe ref="shipmentTable" :columns="table.shipmentTable.rows" :data="table.shipmentTable.data" @on-select="paymentSelect" @on-select-cancel="paymentSelectCancel" @on-selection-change="paymentSelectedChange">
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="690" v-if="row.files && row.files.length > 0">
            <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="act">
                  <template>
                    <Tooltip content="Download">
                      <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                        <i class="fa fa-download"></i>
                      </a>
                    </Tooltip>
                    <Tooltip content="Undo">
                      <a href="#" class="btn btn-warning btn-icon btn-sm" v-on:click="undoPaymentNote(row)">
                        <i class="fa fa-undo"></i>
                      </a>
                    </Tooltip>
                  </template>
                </template>
                <template slot-scope="{ row, index }" slot="amount">
                  {{row.amount}}({{row.currency}})
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_payment_status">
          <Tag color="default" v-if="row.shipment_list_payment_status === '1'">NEW PAYMENT NOTE</Tag>
          <Tag color="warning" v-if="row.shipment_list_payment_status === '2'">APPLY ADVANCE</Tag>
          <Tag color="primary" v-if="row.shipment_list_payment_status === '3'">ADVANCE PAYMENT</Tag>
          <Tag color="warning" v-if="row.shipment_list_payment_status === '4'">APPLY BALANCE</Tag>
          <Tag color="success" v-if="row.shipment_list_payment_status === '5'">BALANCE PAYMENT</Tag>
          <Tag color="warning" v-if="row.shipment_list_payment_status === '6'">EXTRA CHARGES</Tag>
          <Tag color="success" v-if="row.shipment_list_payment_status === '7'">EXTRA PAYMENT</Tag>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
          {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_advance_payment_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_balance_payment">
          {{row.shipment_list_balance_payment}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_balance_payment_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_extra_charges_usd">
          {{row.shipment_list_extra_charges_usd}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_extra_charges_usd_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_extra_charges_tzs">
          {{row.shipment_list_extra_charges_tzs}}
          <Row class="right-bottom-title">
            <span>{{row.shipment_list_extra_charges_tzs_date}}</span>
          </Row>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
          <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
            IMPORT
          </span>
          <span v-else>
            {{row.shipment_list_cargo_type}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_in_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_discharge_date}}
          </span>
          <span v-else>
            {{row.shipment_list_depot_gate_out_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_out_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_empty_return_date}}
          </span>
          <span v-else>
            {{row.shipment_list_loading_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteShipment(row)" v-if="row.shipment_list_payment_status === '1'">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.shipmentTable.total" :current="table.shipmentTable.current" show-total :page-size="table.shipmentTable.limit" @on-change="getShipmentNoteData"/>
    </panel>
    <Modal v-model="modal.addShipmentModal" title="Add Shipment Note" width="1000">
      <Form ref="addShipment" :model="addSearchData" :label-width="120" :rules="addSearchRule" inline>
        <FormItem label="B/L#" prop="bill_no">
          <Input placeholder="B/L#" v-model="addSearchData.bill_no"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="searchShipmentList">Search</Button>
        </FormItem>
      </Form>
      <Table border ref="searchTable" :columns="table.searchTable.rows" :data="table.searchTable.data" @on-select="searchPaymentSelect" @on-select-cancel="searchPaymentSelectCancel" max-height="400">
        <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
          {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_vendor">
          {{row.shipment_list_vendor_code}}/{{row.shipment_list_vendor_name}}
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
          <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
            IMPORT
          </span>
          <span v-else>
            {{row.shipment_list_cargo_type}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_in_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_discharge_date}}
          </span>
          <span v-else>
            {{row.shipment_list_depot_gate_out_date}}
          </span>
        </template>
        <template slot-scope="{ row, index }" slot="shipment_list_out_date">
          <span v-if="row.shipment_list_business_type === 'I'">
            {{row.shipment_list_empty_return_date}}
          </span>
          <span v-else>
            {{row.shipment_list_loading_date}}
          </span>
        </template>
      </Table>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.addShipmentModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="addShipmentList">ADD</Button>
      </div>
    </Modal>
    <Modal v-model="modal.applyPaymentModal" title="Apply Payment" width="1000">
      <Tabs v-model="applyPaymentAction">
        <TabPane label="ADVANCE" name="ADVANCE">
          <Table border ref="advanceTable" :columns="table.advanceTable.rows" :data="table.advanceTable.data" @on-select="advanceSelect" @on-select-cancel="advanceSelectCancel" max-height="400">
            <template slot-scope="{ row, index }" slot="shipment_list_advance_payment">
              {{row.shipment_list_advance_payment}}({{row.shipment_list_advance_percent}}%)
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_vendor">
              {{row.shipment_list_vendor_code}}/{{row.shipment_list_vendor_name}}
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
        </TabPane>
        <TabPane label="BALANCE" name="BALANCE">
          <Table border ref="balanceTable" :columns="table.balanceTable.rows" :data="table.balanceTable.data" max-height="400">
            <template slot-scope="{ row, index }" slot="shipment_list_balance_payment" >
              <div v-if="row.shipment_list_balance_payment_edit">
                <Input v-model="row.shipment_list_balance_payment" style="width: 100px" @keyup.native='keyupNumberFormat($event, index, "shipment_list_balance_payment")'/>
                <Icon type="md-checkmark" size="16" color="#19be6b" style="cursor: pointer; margin-left:7px;" v-on:click="submitEditBalance(row)"/>
                <Icon type="md-close" size="16" color="#ed4014" style="cursor: pointer; margin-left:7px;" v-on:click="closedEditBalance(row)"/>
              </div>
              <div v-else>
                {{row.shipment_list_balance_payment}}<Icon type="ios-create-outline" size="16" style="cursor: pointer; margin-left:7px;" v-on:click="enabledEditBalance(row)"/>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_vendor">
              {{row.shipment_list_vendor_code}}/{{row.shipment_list_vendor_name}}
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
        </TabPane>
        <TabPane label="EXTRA" name="EXTRA">
          <Table border ref="extraTable" :columns="table.extraTable.rows" :data="table.extraTable.data" max-height="400" :span-method="extraHandleSpan">
            <template slot-scope="{ row, index }" slot="extra_act">
              <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
                <Button type="text" style="text-decoration:underline" v-if="row.extra_files && row.extra_files.length > 0">Files[{{row.extra_files.length}}]</Button>
                <template slot="content">
                  <Table stripe size="small" :columns="table.extraFilesTable.columns" :data="row.extra_files">
                    <template slot-scope="{ row, index }" slot="act">
                      <template>
                        <Tooltip content="Download">
                          <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                            <i class="fa fa-download"></i>
                          </a>
                        </Tooltip>
                      </template>
                    </template>
                    <template slot-scope="{ row, index }" slot="amount">
                      {{row.amount}}({{row.currency}})
                    </template>
                  </Table>
                </template>
              </Poptip>
              <Icon type="md-add" size="24" color="#2b85e4" style="cursor: pointer; padding-top: 10px;" v-on:click="applyPaymentExtraModalAct(row)"/>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_vendor">
              {{row.shipment_list_vendor_code}}/{{row.shipment_list_vendor_name}}
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_cargo_type">
              <span v-if="row.shipment_list_business_type === 'I' && row.shipment_list_cargo_type === 'LOCAL'">
                IMPORT
              </span>
              <span v-else>
                {{row.shipment_list_cargo_type}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_in_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_discharge_date}}
              </span>
              <span v-else>
                {{row.shipment_list_depot_gate_out_date}}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="shipment_list_out_date">
              <span v-if="row.shipment_list_business_type === 'I'">
                {{row.shipment_list_empty_return_date}}
              </span>
              <span v-else>
                {{row.shipment_list_loading_date}}
              </span>
            </template>
          </Table>
        </TabPane>
      </Tabs>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.applyPaymentModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="applyPaymentAct">Apply</Button>
      </div>
    </Modal>
    <Modal v-model="modal.applyPaymentExtraModal" title="Payment Extra" width="800">
      <Form ref="paymentExtra" :model="paymentExtraForm" :rules="paymentExtraRules" :label-width="160" style="padding-right: 80px;">
        <FormItem label="B/L#" prop="payment_extra_bl_no">
          {{paymentExtraForm.payment_extra_bl_no}}
        </FormItem>
        <FormItem label="Extra Attachment" prop="payment_extra_files">
          <Upload
            ref="upload"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            type="drag"
            action="/api/zhongtan/logistics/ShipmentNote/upload">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="Amount" prop="payment_extra_amount">
          <Input v-model="paymentExtraForm.payment_extra_amount" placeholder="Enter your amount">
            <Select slot="append" v-model="paymentExtraForm.payment_extra_currency" style="width: 100px">
              <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
            </Select>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
          <Button type="text" size="large" @click="modal.applyPaymentExtraModal=false">Cancel</Button>
          <Button type="primary" size="large" @click="applyPaymentExtraAct">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Password Check" width="600" :mask-closable="false">
      <Form :label-width="120">
        <FormItem v-show="false">
            <Input type="password" style='width:0;opacity:0;'></Input>
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
            <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="checkPasswordCancel">Cancel</Button>
        <Button type="primary" size="large" @click="checkPasswordAct">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/logistics/ShipmentNote/'

export default {
  name: 'ShipmentList',
  data: function() {
    return {
      modal: { addShipmentModal: false, applyPaymentModal: false, applyPaymentExtraModal: false, checkPasswordModal: false },
      table: {
        shipmentTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Act',
              slot: 'action',
              width: 60
            },
            {
              title: 'Files',
              slot: 'files',
              width: 100
            },
            {
              title: 'STATUS',
              slot: 'shipment_list_payment_status',
              width: 180,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              key: 'shipment_list_vendor_name',
              width: 150,
              align: 'center'
            },
            {
              title: 'FREIGHT#USD',
              key: 'shipment_list_total_freight',
              width: 150,
              align: 'center'
            },
            {
              title: 'FREIGHT#TZS',
              key: 'shipment_list_total_freight_tzs',
              width: 150,
              align: 'center'
            },
            {
              title: 'ADVANCE#',
              slot: 'shipment_list_advance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'BALANCE#',
              slot: 'shipment_list_balance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'EXTRA#USD',
              slot: 'shipment_list_extra_charges_usd',
              width: 150,
              align: 'center'
            },
            {
              title: 'EXTRA#TZS',
              slot: 'shipment_list_extra_charges_tzs',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            
            {
              title: 'POL#',
              key: 'shipment_list_port_of_loading',
              width: 200,
              align: 'center'
            },
            {
              title: 'POD#',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'EMPTY RETURN/LOADING',
              slot: 'shipment_list_out_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'CARGO WEIGHT',
              key: 'shipment_list_cargo_weight',
              width: 150,
              align: 'center'
            },
            {
              title: 'DAR CUSTOMS RELEASE DATE',
              key: 'shipment_list_dar_customs_release_date',
              width: 240,
              align: 'center'
            },
            {
              title: 'TRUCK DEPARTURE DATE',
              key: 'shipment_list_truck_departure_date',
              width: 210,
              align: 'center'
            },
            {
              title: 'TRUCK PLATE#',
              key: 'shipment_list_truck_plate',
              width: 150,
              align: 'center'
            },
            {
              title: 'ATA TZ BORDER',
              key: 'shipment_list_ata_tz_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA FOREIGN BORDER',
              key: 'shipment_list_ata_foreing_border',
              width: 200,
              align: 'center'
            },
            {
              title: 'BORDER RELEASE DATE',
              key: 'shipment_list_border_release_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'ATA DESTINATION',
              key: 'shipment_list_ata_destination',
              width: 200,
              align: 'center'
            },
            {
              title: 'DELIVERY (UNLOADING) DATE',
              key: 'shipment_list_delivery_date',
              width: 250,
              align: 'center'
            },
            {
              title: 'REMARK',
              key: 'shipment_list_remark',
              width: 150,
              align: 'center'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          current: 1
        },
        filesTable: {
          columns: [
            {
              title: 'Action',
              slot: 'act',
              width: 100
            },
            {
              title: 'Type',
              key: 'filetype',
              width: 150
            }, 
            {
              title: 'Amount',
              slot: 'amount',
              width: 150
            }, 
            {
              title: 'Create By',
              key: 'creater',
              width: 100
            },
            {
              title: 'Create Date',
              key: 'date',
              width: 150
            }
          ]
        },
        searchTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'FREIGHT#',
              key: 'shipment_list_total_freight',
              width: 150,
              align: 'center'
            },
            {
              title: 'ADVANCE#',
              slot: 'shipment_list_advance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'BALANCE#',
              key: 'shipment_list_balance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              slot: 'shipment_list_vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        advanceTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'ADVANCE#',
              slot: 'shipment_list_advance_payment',
              width: 150,
              align: 'center'
            },
            {
              title: 'VENDOR',
              slot: 'shipment_list_vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        balanceTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'BALANCE#',
              slot: 'shipment_list_balance_payment',
              width: 200,
              align: 'center'
            },
            {
              title: 'VENDOR',
              slot: 'shipment_list_vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        extraTable: {
          rows: [
            {
              type: 'selection',
              width: 60,
              align: 'center'
            },
            {
              type: 'index',
              width: 80,
              align: 'center'
            },
            {
              title: 'Act',
              slot: 'extra_act',
              width: 150,
              align: 'center'
            },
            {
              title: 'B/L#',
              key: 'shipment_list_bill_no',
              width: 180,
              align: 'center'
            },
            {
              title: 'VENDOR',
              slot: 'shipment_list_vendor',
              width: 150,
              align: 'center'
            },
            {
              title: 'CONTAINER#',
              key: 'shipment_list_container_no',
              width: 150,
              align: 'center'
            },
            {
              title: 'Charges(USD)',
              key: 'shipment_list_extra_charges_usd',
              width: 150,
              align: 'center'
            },
            {
              title: 'Charges(TZS)',
              key: 'shipment_list_extra_charges_tzs',
              width: 150,
              align: 'center'
            },
            {
              title: 'TYPE',
              key: 'shipment_list_business_type',
              width: 80,
              align: 'center'
            },
            {
              title: 'CNTR OWNER',
              key: 'shipment_list_cntr_owner',
              width: 150,
              align: 'center'
            },
            {
              title: 'SIZE TYPE',
              key: 'shipment_list_size_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'CARGO TYPE',
              slot: 'shipment_list_cargo_type',
              width: 150,
              align: 'center'
            },
            {
              title: 'POL',
              key: 'shipment_list_port_of_loading',
              width: 150,
              align: 'center'
            },
            {
              title: 'POD',
              key: 'shipment_list_port_of_destination',
              width: 150,
              align: 'center'
            },
            {
              title: 'DISCHARGE/GATE OUT',
              slot: 'shipment_list_in_date',
              width: 200,
              align: 'center'
            },
            {
              title: 'GATE IN/LOADING',
              slot: 'shipment_list_out_date',
              width: 200,
              align: 'center'
            }
          ],
          data: [],
          total: 0
        },
        extraFilesTable: {
          columns: [
            {
              title: 'Action',
              slot: 'act',
              width: 100
            },
            {
              title: 'Amount',
              slot: 'amount',
              width: 150
            }, 
            {
              title: 'Create By',
              key: 'created_by',
              width: 100
            },
            {
              title: 'Create Date',
              key: 'created_at',
              width: 150
            }
          ]
        }
      },
      pagePara: {},
      searchPara: {
        shipment_list_bill_no: '',
        shipment_list_container_no: '',
        shipment_list_cntr_owner: '',
        shipment_list_cargo_type: '',
        shipment_list_business_type: '',
        shipment_list_in_date: '',
        shipment_list_out_date: '',
        shipment_list_vendor: ''
      },
      businessTypeFilter: [
        {id: 'I', text: 'IMPORT'},
        {id: 'E', text: 'EXPORT'}
      ],
      cargoTypeFilter: [
        {id: 'LOCAL', text: 'IMPORT/LOCAL'},
        {id: 'TRANSIT', text: 'TRANSIT'}
      ],
      cntrOwnerFilter: [
        {id: 'COS', text: 'COSCO'},
        {id: 'OOL', text: 'OOCL'}
      ],
      oldPara: {},
      workPara: {},
      action: '',
      addSearchData: {
        bill_no: ''
      },
      addSearchRule: {
        bill_no: [{ required: true, trigger: 'blur', message: 'Enter B/L#' }]
      },
      checkPassword: '',
      paymentSelectedAll: false,
      applyPaymentDisabled: true,
      applyPaymentAction: 'ADVANCE',
      paymentExtraForm: {
        payment_extra_bl_no: '',
        payment_extra_shipment_id: '',
        payment_extra_vendor: '',
        payment_extra_cntr_owner: '',
        payment_extra_business_type: '',
        payment_extra_cargo_type: '',
        payment_extra_files: [],
        payment_extra_amount: '',
        payment_extra_currency: ''
      },
      paymentExtraRules: {
        payment_extra_amount: [
          { required: true, message: 'The amount cannot be empty', trigger: 'blur' },
          { type: 'number', message: 'The amount must be number', trigger: 'blur' , transform(value) { return Number(value)}}
        ],
        payment_extra_files: [
          { type: 'array', min: 1, required: true, trigger: 'change', message: 'upload extra Attachment'}
        ]
      },
      uploadHeaders: common.uploadHeaders()
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
        this.getShipmentNoteData(1)
      } catch (error) {
        this.$commonact.fault(error)
      }
    }

    initPage()
  },
  methods: {
    getShipmentNoteData: async function(index) {
      try {
        if (index) {
          this.table.shipmentTable.offset = (index - 1) * this.table.shipmentTable.limit
          this.table.shipmentTable.current = index
        }
        let response = await this.$http.post(apiUrl + 'search', {
          searchPara: this.searchPara,
          offset: this.table.shipmentTable.offset,
          limit: this.table.shipmentTable.limit
        })
        let data = response.data.info
        this.table.shipmentTable.total = data.total
        this.table.shipmentTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    exportAct: async function() {
      try {
        let response = await this.$http.request({
            url: apiUrl + 'export',
            method: 'post',
            data: {searchPara: this.searchPara},
            responseType: 'blob'
          })
        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Logistics Payment Note.xlsx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addShipmentListModal: async function() {
      this.addSearchData = {
        bill_no: ''
      }
      this.table.searchTable.data = []
      this.table.searchTable.total = 0
      this.action = 'add'
      this.$refs.addShipment.resetFields()
      this.modal.addShipmentModal = true
    },
    searchShipmentList: async function() {
      this.$refs.addShipment.validate(async valid => {
        if (valid) {
          try {
            let response = await this.$http.post(apiUrl + 'searchShipmentList', {search_data: this.addSearchData})
            let data = response.data.info
            this.table.searchTable.data = JSON.parse(JSON.stringify(data.rows))
            this.table.searchTable.total = data.total
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    searchPaymentSelect: async function(selection, row) {
      if(this.table.searchTable.data) {
        for(let d of this.table.searchTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = true
          }
        }
      }
    },
    searchPaymentSelectCancel: async function(selection, row) {
      if(this.table.searchTable.data) {
        for(let d of this.table.searchTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = false
          }
        }
      }
    },
    searchInDateChange: async function(e) {
      this.searchPara.shipment_list_in_date = JSON.parse(JSON.stringify(e))
    },
    searchOutDateChange: async function(e) {
      this.searchPara.shipment_list_out_date = JSON.parse(JSON.stringify(e))
    },
    addShipmentList: async function() {
      let selection = this.$refs.searchTable.getSelection()
      if(selection && selection.length > 0) {
        try {
          await this.$http.post(apiUrl + 'add', {add_shipment_list: selection})
          this.modal.addShipmentModal = false
          this.getShipmentNoteData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please select shipment list')
      }
    },
    paymentSelect: async function(selection, row) {
      if(this.table.shipmentTable.data) {
        for(let d of this.table.shipmentTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = true
          }
        }
      }
    },
    paymentSelectCancel: async function(selection, row) {
      if(this.table.shipmentTable.data) {
        for(let d of this.table.shipmentTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = false
          }
        }
      }
    },
    paymentSelectedChange: async function(selection) {
      if(selection && selection.length > 0) {
        this.applyPaymentDisabled = false
      } else {
        this.applyPaymentDisabled = true
      }
      if(selection && selection.length === this.table.shipmentTable.data.length) {
        this.paymentSelectedAll = true
      } else {
        this.paymentSelectedAll = false
      }
    },
    applyPaymentModal: async function() {
      try {
        await this.getApplyPaymentData()
        this.modal.applyPaymentModal = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    getApplyPaymentData: async function() {
      let param = {paymentSelectedAll: this.paymentSelectedAll}
      if(this.paymentSelectedAll) {
        param.searchPara = this.searchPara
      } else {
        param.selection = this.$refs.shipmentTable.getSelection()
      }
      let response = await this.$http.post(apiUrl + 'applyPaymentSearch', param)
      let data = response.data.info
      this.table.advanceTable.data = data.advance_list
      this.table.advanceTable.total = data.advance_total
      this.table.balanceTable.data = data.balance_list
      this.table.balanceTable.total = data.balance_total
      this.table.extraTable.data = data.extra_list
      this.table.extraTable.total = data.extra_total
    },
    advanceSelect: async function(selection, row) {
      if(this.table.advanceTable.data) {
        for(let d of this.table.advanceTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = true
          }
        }
      }
    },
    advanceSelectCancel: async function(selection, row) {
      if(this.table.advanceTable.data) {
        for(let d of this.table.advanceTable.data) {
          if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
            d._checked = false
          }
        }
      }
    },
    enabledEditBalance: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.oldPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'paymentBalanceEdit'
      this.modal.checkPasswordModal = true
    },
    paymentBalanceEditAct: async function() {
      this.table.balanceTable.data[this.workPara._index].shipment_list_balance_payment_edit = true
    },
    submitEditBalance: async function(row) {
      try {
        if(row.shipment_list_balance_payment) {
          await this.$http.post(apiUrl + 'paymentBalanceEdit', {old: this.oldPara, new: row})
          await this.getApplyPaymentData()
          this.getShipmentNoteData(1)
          this.$Message.success('edit success')
          this.table.balanceTable.data[row._index].shipment_list_balance_payment_edit = false
        } else {
          this.$Message.error('please input balance')
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    closedEditBalance: async function(row) {
      this.table.balanceTable.data[row._index].shipment_list_balance_payment_edit = false
    },
    extraHandleSpan: function({row, column, rowIndex, columnIndex}) {
      if(column.title === 'Act' || column.title === 'B/L#' || column.title === 'Files') {
        return this.getExtraLayout(row, rowIndex, columnIndex)
      }
    },
    getExtraLayout: function(row, rowIndex, columnIndex) {
      let rowspan = 0
      let colspan = 1
      let tableData = this.table.extraTable.data
      for(let d of tableData) {
        if(d.shipment_list_bill_no === row.shipment_list_bill_no) {
          rowspan++
        }
      }
      if(rowspan > 1) {
        if(rowIndex > 0 && tableData[rowIndex - 1].shipment_list_bill_no === row.shipment_list_bill_no) {
          return [0, 0]
        } else {
          return [rowspan, colspan]
        }
      } else {
        return [1, 1]
      }
    },
    applyPaymentAct: async function() {
      let selection = []
      if(this.applyPaymentAction === 'ADVANCE') {
        selection = this.$refs.advanceTable.getSelection()
      } else if(this.applyPaymentAction === 'BALANCE') {
        selection = this.$refs.balanceTable.getSelection()
      } else if(this.applyPaymentAction === 'EXTRA') {
        selection = this.$refs.extraTable.getSelection()
      }
      if(selection && selection.length > 0) {
        try {
          await this.$http.post(apiUrl + 'applyPayment', { applyAction: this.applyPaymentAction, applyData: selection })
          this.$Message.success('apply success')
          this.getShipmentNoteData(1)
          this.modal.applyPaymentModal = false
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please select apply payment')
      }
    },
    deleteShipment: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'ShipmentNoteDelete'
      this.modal.checkPasswordModal = true
    },
    deleteShipmentAct: async function() {
      this.$commonact.confirm('delete shipment note?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { shipment_list_id: this.workPara.shipment_list_id })
          this.$Message.success('delete success')
          this.getShipmentNoteData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    undoPaymentNote: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.checkPassword = ''
      this.checkPasswordType = 'PaymentNoteUndo'
      this.modal.checkPasswordModal = true
    },
    undoPaymentNoteAct: async function() {
      this.$commonact.confirm('undo payment note?', async () => {
        try {
          await this.$http.post(apiUrl + 'undoPayment', this.workPara)
          this.$Message.success('Undo success')
          this.getShipmentNoteData(1)
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    keyupNumberFormat: async function(e, index, key) {
        if(e.target.value) {
            e.target.value = e.target.value.replace(/\s+/g, '')
            let nagtiveFlg = e.target.value.indexOf('-') === 0
            e.target.value = e.target.value.replace(/[^\d.]/g, '')
            e.target.value = e.target.value.replace(/\.{2,}/g, '.')
            e.target.value = e.target.value.replace(/^\./g, '0.')
            e.target.value = e.target.value.replace(/^\d*\.\d*\./g, e.target.value.substring(0,e.target.value.length-1))
            e.target.value = e.target.value.replace(/^0[^\\.]+/g, '0')
            e.target.value = e.target.value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
            e.target.value = nagtiveFlg ? '-' + e.target.value : e.target.value
            this.table.balanceTable.data[index][key] = e.target.value
        } else {
            this.table.balanceTable.data[index][key] = ''
        }
    },
    handleUploadSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.paymentExtraForm.payment_extra_files = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
    },
    handleUploadRemove(file, fileList) {
        const index = this.paymentExtraForm.payment_extra_files.indexOf(file)
        this.paymentExtraForm.payment_extra_files.splice(index, 1)
    },
    applyPaymentExtraModalAct: async function(row) {
      this.$nextTick(() => {
        this.$refs['paymentExtra'].resetFields()
      })
      this.paymentExtraForm = {
        payment_extra_bl_no: row.shipment_list_bill_no,
        payment_extra_shipment_id: row.shipment_list_id,
        payment_extra_vendor: row.shipment_list_vendor,
        payment_extra_cntr_owner: row.shipment_list_cntr_owner,
        payment_extra_business_type: row.shipment_list_business_type,
        payment_extra_cargo_type: row.shipment_list_cargo_type,
        payment_extra_files: [],
        payment_extra_amount: '',
        payment_extra_currency: 'USD'
      }
      this.modal.applyPaymentExtraModal = true
    },
    applyPaymentExtraAct: async function() {
      this.$refs['paymentExtra'].validate(async valid => {
        if (valid) {
          try {
            await this.$http.post(apiUrl + 'applyPaymentExtra', this.paymentExtraForm)
            this.$Message.success('apply success')
            this.modal.applyPaymentExtraModal = false
            this.modal.applyPaymentModal = false
            this.getShipmentNoteData(1)
          } catch (error) {
            this.$commonact.fault(error)
          }
        } else {
          this.$Message.error('Validate Fail!')
        }
      })
    },
    checkPasswordCancel: async function() {
      this.modal.checkPasswordModal = false
    },
    checkPasswordAct: async function() {
      if (this.checkPassword) {
        try {
          let action = ''
          if (this.checkPasswordType === 'ShipmentNoteDelete' || this.checkPasswordType === 'PaymentNoteUndo' 
              || this.checkPasswordType === 'paymentBalanceEdit') {
            action = 'LOGISTICS_SHIPMENT_NOTE_DELETE'
          }
          let param = {
            action: action,
            checkPassword: common.md52(this.checkPassword)
          }
          await this.$http.post(apiUrl + 'checkPassword', param)
          this.modal.checkPasswordModal = false
          if (this.checkPasswordType === 'ShipmentNoteDelete') {
            await this.deleteShipmentAct()
          } else if (this.checkPasswordType === 'PaymentNoteUndo') {
            await this.undoPaymentNoteAct()
          } else if (this.checkPasswordType === 'paymentBalanceEdit') {
            await this.paymentBalanceEditAct()
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      } else {
        return this.$Message.error('Please enter right password')
      }
    }
  }
}
</script>
<style scoped>
.right-bottom-title {
  text-align: right;
  font-size: 12px;
  color: #9ea7b4;
}
</style>