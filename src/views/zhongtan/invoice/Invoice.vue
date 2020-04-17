<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Invoice,D/O release</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Invoice,D/O release
      <small>Invoice,D/O release...</small>
    </h1>
    <!-- end page-header -->
    <panel title="Invoice,D/O release">
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
                      <a href="#" slot="extra" @click.prevent="doDeleteVoyageModal(item)">
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
                      <Row v-if="item.invoice_vessel_call_sign">
                        <Col span="11">
                          <p>Call Sign: {{item.invoice_vessel_call_sign}}</p>
                        </Col>
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
                  <a href="#" class="btn btn-info btn-xs" @click="showChangeCollectModal(row, 'PREPAID')" v-if="row.invoice_masterbi_freight == 'COLLECT'">Collect</a>
                  <a href="#" class="btn btn-indigo btn-xs" @click="showChangeCollectModal(row, 'COLLECT')" v-if="row.invoice_masterbi_freight !== 'COLLECT'">Prepaid</a>
                </template>
                <template slot-scope="{ row, index }" slot="files">
                  <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
                    <Button type="text" style="text-decoration:underline">Files</Button>
                    <template slot="content">
                      <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                        <template slot-scope="{ row, index }" slot="act">
                          <template v-if="row.filetype === 'DO'">
                            <Tooltip content="Download">
                              <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                <i class="fa fa-download"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Release" v-if="!row.release_date">
                              <a href="#" class="btn btn-primary btn-icon btn-sm" @click="doRealse(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Send EDI" placement="right" v-if="row.release_date && !row.edi_state">
                              <a href="#" class="btn btn-success btn-icon btn-sm" @click="doCreateEdi(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Cancel EDI" placement="right" v-if="row.edi_state == '9'">
                              <a href="#" class="btn btn-danger btn-icon btn-sm" @click="doCancelEdi(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip>
                          </template>
                          <template v-else-if="row.state === 'AP'">
                            <Tooltip content="Download">
                              <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                <i class="fa fa-download"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Release" v-if="!row.release_date && (row.filetype === 'Deposit' || row.filetype === 'Fee' || row.filetype === 'DO' || row.filetype === 'Freight')">
                              <a href="#" class="btn btn-primary btn-icon btn-sm" @click="doRealse(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip>
                          </template>
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
      <Form :model="workPara" :label-width="130">
        <FormItem label="Customer" prop="invoice_masterbi_customer_id" style="margin-bottom: 0px;">
          <Select ref="customer" v-model="workPara.invoice_masterbi_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="deposit.customer.loading" placeholder="Customer">
            <Option v-for="item in deposit.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
          </Select>
          <!-- <AutoComplete v-model="workPara.invoice_masterbi_customer" :data="autocomplete.customer" @on-search="getCustomerData" placeholder="M/S."></AutoComplete> -->
        </FormItem>
        <FormItem label="Carrier" prop="invoice_masterbi_carrier" style="margin-bottom: 0px;">
          <Select v-model="workPara.invoice_masterbi_carrier">
            <Option v-for="item in pagePara.RECEIPT_TYPE_INFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <Divider />
        <Row>
          <Col span="12">
            <FormItem label="Vessel Name" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_vessel_name }}</span>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Vessel Voyage" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_vessel_voyage }}</span>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="#M B/L No" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_masterbi_bl }}</span>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Cargo Classification" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_masterbi_cargo_type }}</span>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="Port of Loading" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_masterbi_loading }}</span>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="Place of Destination" style="margin-bottom: 0px;">
              <span> {{ workPara.invoice_masterbi_destination }}</span>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="Container Size" style="margin-bottom: 0px;">
          <span style='white-space:pre;'> {{ workPara.container_size_type }}</span>
        </FormItem>
        <Checkbox v-model = "depositEdit" style="position: absolute; top: 366px; right: 20px;" @click.native="changeDepositEdit">EDIT</Checkbox>
        <Tabs active-key="Container Deposit" @on-click="currentFeeTabChanged">
          <Tab-pane :label="containerDepositFeeLabel" name = "Container Deposit" key="Container Deposit">
            <FormItem label="Deposit Amount" prop="invoice_masterbi_deposit" style="margin-bottom: 0px;">
              <Input placeholder="Deposit Amount" v-model="workPara.invoice_masterbi_deposit" :disabled = "!!workPara.invoice_masterbi_deposit_disabled && !depositEdit"> 
                <Select slot="append" v-model="workPara.invoice_container_deposit_currency" style="width: 80px" maxlength=10 show-word-limit :disabled = "!!workPara.invoice_masterbi_deposit_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Comment" prop="invoice_masterbi_deposit_comment" style="margin-bottom: 0px;">
              <Input v-model="workPara.invoice_masterbi_deposit_comment"  type="textarea" :maxlength="200" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="Deposit Amount Comment"/>
            </FormItem>
          </Tab-pane>
          <Tab-pane :label="oceanFreightFeeLabel" name = "Ocean Freight" key="Ocean Freight" >
            <FormItem label="Ocean Freight" prop="invoice_masterbi_of" style="margin-bottom: 0px;">
              <Input placeholder="Ocean Freight Fee" v-model="workPara.invoice_masterbi_of" :disabled = "!!workPara.invoice_masterbi_of_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_ocean_freight_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_ocean_freight_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Comment" prop="invoice_masterbi_of_comment" style="margin-bottom: 0px;">
              <Input v-model="workPara.invoice_masterbi_of_comment"  type="textarea" :maxlength="200" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="Ocean Freight Fee Comment"/>
            </FormItem>
          </Tab-pane>
          <Tab-pane :label="invoiceFeeLabel" name = "Invoice Fee" key="Invoice Fee">
            <FormItem label="B/L amendment" prop="invoice_masterbi_bl_amendment" style="margin-bottom: 0px;">
              <Input placeholder="B/L amendment" v-model="workPara.invoice_masterbi_bl_amendment" :disabled = "!!workPara.invoice_masterbi_bl_amendment_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="COD Charge" prop="invoice_masterbi_cod_charge" style="margin-bottom: 0px;">
              <Input placeholder="COD Charge" v-model="workPara.invoice_masterbi_cod_charge" :disabled = "!!workPara.invoice_masterbi_cod_charge_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Container Transfer" prop="invoice_masterbi_transfer" style="margin-bottom: 0px;">
              <Input placeholder="Container Transfer" v-model="workPara.invoice_masterbi_transfer" :disabled = "!!workPara.invoice_masterbi_transfer_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Lift On Lift Off" prop="invoice_masterbi_lolf" style="margin-bottom: 0px;">
              <Input placeholder="Lift On Lift Off" v-model="workPara.invoice_masterbi_lolf" :disabled = "!!workPara.invoice_masterbi_lolf_disabled && depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="LCL" prop="invoice_masterbi_lcl" style="margin-bottom: 0px;">
              <Input placeholder="LCL" v-model="workPara.invoice_masterbi_lcl" :disabled = "!!workPara.invoice_masterbi_lcl_disabled && depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Amendment" prop="invoice_masterbi_amendment" style="margin-bottom: 0px;">
              <Input placeholder="Amendment" v-model="workPara.invoice_masterbi_amendment" :disabled = "!!workPara.invoice_masterbi_amendment_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Tasac" prop="invoice_masterbi_tasac" style="margin-bottom: 0px;">
              <Input placeholder="Tasac" v-model="workPara.invoice_masterbi_tasac" :disabled = "!!workPara.invoice_masterbi_tasac_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Bill Pringting" prop="invoice_masterbi_printing" style="margin-bottom: 0px;">
              <Input placeholder="Bill Pringting" v-model="workPara.invoice_masterbi_printing" :disabled = "!!workPara.invoice_masterbi_printing_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Others" prop="invoice_masterbi_others" style="margin-bottom: 0px;">
              <Input placeholder="Others" v-model="workPara.invoice_masterbi_others" :disabled = "!!workPara.invoice_masterbi_others_disabled && !depositEdit">
                <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled = "!!workPara.invoice_fee_currency_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
              </Input>
            </FormItem>
            <FormItem label="Comment" prop="invoice_fee_comment" style="margin-bottom: 0px;">
              <Input v-model="workPara.invoice_fee_comment"  type="textarea" :maxlength="200" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="Invoice Fee Comment"/>
            </FormItem>
          </Tab-pane>
        </Tabs>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.depositModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="depositDo" v-if="!workPara.invoice_masterbi_invoice_release_date">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.deleteVoyageModal" title="Delete Voyage" width="600">
      <Form :model="workPara" :label-width="120">
        <FormItem label="Voyage No." prop="voyage_no">
          <Input placeholder="Voyage No." v-model="workPara.voyage_no" />
          <Input v-show="false"></Input>   
        </FormItem>
        <FormItem label="Password" prop="deleteVoyagePassword">
          <Input type="password" v-show="false"></Input>   
          <Input type="password" placeholder="Password" v-model="workPara.delete_voyage_password" autocomplete="off"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.deleteVoyageModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="deleteVoyage">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.colletChangeModal" title="Collet Change" width="600">
      <Form :model="workPara" :label-width="120">
        <FormItem v-show="false">
          <Input type="password" style='width:0;opacity:0;'></Input>       
        </FormItem>
        <FormItem label="Password" prop="colletChangePassword">
          <Input type="password" placeholder="Password" v-model="workPara.collet_change_password"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.colletChangeModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="actChangeCollectFlag">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.checkPasswordModal" title="Collet Change" width="600" :closable="false" :mask-closable="false">
      <Form :label-width="120">
        <FormItem v-show="false">
          <Input type="password" style='width:0;opacity:0;'></Input>       
        </FormItem>
        <FormItem label="Password" prop="checkPassword">
          <Input type="password" placeholder="Password" v-model="checkPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.checkPasswordModal = false; depositEdit = false;">Cancel</Button>
        <Button type="primary" size="large" @click="actCheckPassword">Submit</Button>
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
      modal: { importModal: false, downLoadDoModal: false, depositModal: false, deleteVoyageModal: false, colletChangeModal: false, checkPasswordModal: false },
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
              title: 'Freight Terms',
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
              title: 'State',
              key: 'state',
              render: common.selectRender(this, 'UPLOAD_STATE'),
              width: 150
            },
            {
              title: 'Action',
              slot: 'act',
              width: 150
            },
            {
              title: 'Release Date',
              key: 'release_date',
              width: 150
            },
            {
              title: 'Release User',
              key: 'release_user',
              width: 150
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
        customer: {
          options: [],
          loading: false
        }
      },
      currentTab: 0,
      containerDepositFeeLabel: '',
      oceanFreightFeeLabel: '',
      invoiceFeeLabel: '',
      checkPassword: '',
      depositEdit: false
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
      this.$refs.customer.reset()
      this.deposit.customer.loading = true
      this.deposit.customer.options = JSON.parse(JSON.stringify(row.customerINFO))
      this.deposit.customer.loading = false
      this.deposit.depositType = 'Container Deposit'
      this.deposit.fees = []
      this.$nextTick(function() {
        this.workPara = JSON.parse(JSON.stringify(row))
        this.depositEdit = false
        if(this.workPara.invoice_masterbi_deposit_state) {
          this.containerDepositFeeLabel = h => {
                return h("div", [
                  h("i", {class: 'fa fa-check'}),
                  h("span", "Container Deposit Fee")
                ])
              }
        } else {
          this.containerDepositFeeLabel = 'Container Deposit Fee'
        }
        if(this.workPara.invoice_ocean_freight_fee_state) {
          this.oceanFreightFeeLabel = h => {
            return h("div", [
              h("i", {class: 'fa fa-check'}),
              h("span", "Ocean Freight Fee")
            ])
          }
        } else {
          this.oceanFreightFeeLabel = 'Ocean Freight Fee'
        }
        if(this.workPara.invoice_fee_state) {
          this.invoiceFeeLabel = h => {
            return h("div", [
              h("i", {class: 'fa fa-check'}),
              h("span", "Invoice Fee")
            ])
          }
        } else {
          this.invoiceFeeLabel = 'Invoice Fee'
        }
        this.searchFixedDeposit()
      })
      this.modal.depositModal = true
    },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.deposit.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.deposit.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.deposit.customer.loading = false
        if(this.deposit.customer.options && this.deposit.customer.options.length === 1) {
          this.searchFixedDeposit()
        }
      } else {
        this.deposit.customer.options = []
      }
    },
    currentFeeTabChanged: function(name) {
      this.deposit.depositType = name
    },
    depositDo: async function() {
      try {
        if (!this.workPara.invoice_masterbi_customer_id) {
          return this.$Message.error('Please choose customer')
        }

        if (!this.workPara.invoice_masterbi_carrier) {
          return this.$Message.error('Please choose carrier')
        }
        
        await this.$http.post(apiUrl + 'depositDo', _.extend(this.workPara, this.deposit))
        // printJS(response.data.info.url)
        this.$Message.success('deposit success')
        this.modal.depositModal = false
        this.getMasterbiData()
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    showChangeCollectModal: async function(row, cflag) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.workPara.collect_flag = cflag
      this.modal.colletChangeModal = true
    },
    actChangeCollectFlag: async function() {
      try {
        if(!this.workPara.collet_change_password) {
          return this.$Message.error('Please enter right password')
        }
        await this.$http.post(apiUrl + 'changeCollect', { invoice_masterbi_id: this.workPara.invoice_masterbi_id, act: this.workPara.collect_flag, collet_change_password: common.md52(this.workPara.collet_change_password) })
        this.getMasterbiData()
        this.modal.colletChangeModal = false
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
    doDeleteVoyageModal: function(item) {
      this.workPara = JSON.parse(JSON.stringify(item))
      this.modal.deleteVoyageModal = true
    },
    deleteVoyage: function() {
      try {
        let _self = this
        if (_self.workPara.voyage_no !== _self.workPara.invoice_vessel_voyage) {
          return _self.$Message.error('Please enter right Voyage No.')
        }
        if(!_self.workPara.delete_voyage_password) {
          return _self.$Message.error('Please enter right password')
        }
        _self.$commonact.confirm(`Delete the vessel?`, async () => {
          try {
            await _self.$http.post(apiUrl + 'deleteVoyage', { invoice_vessel_id: _self.workPara.invoice_vessel_id, delete_voyage_password : common.md52(_self.workPara.delete_voyage_password)})
            _self.getVoyageData()
            _self.getMasterbiData()
            _self.modal.deleteVoyageModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        })
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    doCreateEdi: async function(row, index) {
      try {
        await this.$http.post(apiUrl + 'doCreateEdi', { invoice_masterbi_id: row.invoice_masterbi_id })
        this.getVoyageData()
        this.getMasterbiData()
        this.$Message.success('Send Edi Success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    doCancelEdi: async function(row, index) {
      try {
        await this.$http.post(apiUrl + 'doCancelEdi', { invoice_masterbi_id: row.invoice_masterbi_id })
        this.getVoyageData()
        this.getMasterbiData()
        this.$Message.success('Cancel Edi Success')
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    searchFixedDeposit: async function() {
      try {
        let response = await this.$http.post(apiUrl + 'searchFixedDeposit', _.extend(this.workPara, this.deposit))
        let fixedDeposit = JSON.parse(JSON.stringify(response.data.info))
        if(!this.workPara.invoice_masterbi_deposit_state) {
          this.workPara.invoice_masterbi_deposit = fixedDeposit['invoice_masterbi_deposit'] ? fixedDeposit['invoice_masterbi_deposit'] : this.workPara.invoice_masterbi_deposit
          this.workPara.invoice_container_deposit_currency = fixedDeposit['invoice_container_deposit_currency'] ? fixedDeposit['invoice_container_deposit_currency'] : this.workPara.invoice_container_deposit_currency
          this.workPara.invoice_masterbi_deposit_comment = fixedDeposit['invoice_masterbi_deposit_comment'] ? fixedDeposit['invoice_masterbi_deposit_comment'] : this.workPara.invoice_masterbi_deposit_comment

          this.workPara.invoice_masterbi_deposit_disabled = fixedDeposit['invoice_masterbi_deposit'] ? true : false
          this.workPara.invoice_container_deposit_currency_disabled = fixedDeposit['invoice_container_deposit_currency'] ? true : false
        }
        if(!this.workPara.invoice_ocean_freight_fee_state) {
          this.workPara.invoice_masterbi_of = fixedDeposit['invoice_masterbi_of'] ? fixedDeposit['invoice_masterbi_of'] : this.workPara.invoice_masterbi_of
          this.workPara.invoice_ocean_freight_fee_currency = fixedDeposit['invoice_ocean_freight_fee_currency'] ? fixedDeposit['invoice_ocean_freight_fee_currency'] : this.workPara.invoice_ocean_freight_fee_currency

          this.workPara.invoice_masterbi_of_disabled = fixedDeposit['invoice_masterbi_of'] ? true : false
          this.workPara.invoice_ocean_freight_fee_currency_disabled = fixedDeposit['invoice_ocean_freight_fee_currency'] ? true : false
        }
        if(!this.workPara.invoice_fee_state) {
          this.workPara.invoice_masterbi_bl_amendment = fixedDeposit['invoice_masterbi_bl_amendment'] ? fixedDeposit['invoice_masterbi_bl_amendment'] : this.workPara.invoice_masterbi_bl_amendment
          this.workPara.invoice_masterbi_cod_charge = fixedDeposit['invoice_masterbi_cod_charge'] ? fixedDeposit['invoice_masterbi_cod_charge'] : this.workPara.invoice_masterbi_cod_charge
          this.workPara.invoice_masterbi_transfer = fixedDeposit['invoice_masterbi_transfer'] ? fixedDeposit['invoice_masterbi_transfer'] : this.workPara.invoice_masterbi_transfer
          this.workPara.invoice_masterbi_lolf = fixedDeposit['invoice_masterbi_lolf'] ? fixedDeposit['invoice_masterbi_lolf'] : this.workPara.invoice_masterbi_lolf
          this.workPara.invoice_masterbi_lcl = fixedDeposit['invoice_masterbi_lcl'] ? fixedDeposit['invoice_masterbi_lcl'] : this.workPara.invoice_masterbi_lcl
          this.workPara.invoice_masterbi_amendment = fixedDeposit['invoice_masterbi_amendment'] ? fixedDeposit['invoice_masterbi_amendment'] : this.workPara.invoice_masterbi_amendment
          this.workPara.invoice_masterbi_tasac = fixedDeposit['invoice_masterbi_tasac'] ? fixedDeposit['invoice_masterbi_tasac'] : this.workPara.invoice_masterbi_tasac
          this.workPara.invoice_masterbi_printing = fixedDeposit['invoice_masterbi_printing'] ? fixedDeposit['invoice_masterbi_printing'] : this.workPara.invoice_masterbi_printing
          this.workPara.invoice_masterbi_others = fixedDeposit['invoice_masterbi_others'] ? fixedDeposit['invoice_masterbi_others'] : this.workPara.invoice_masterbi_others
          this.workPara.invoice_fee_currency = fixedDeposit['invoice_fee_currency'] ? fixedDeposit['invoice_fee_currency'] : this.workPara.invoice_fee_currency

          this.workPara.invoice_masterbi_bl_amendment_disabled = fixedDeposit['invoice_masterbi_bl_amendment'] ? true : false
          this.workPara.invoice_masterbi_cod_charge_disabled = fixedDeposit['invoice_masterbi_cod_charge'] ? true : false
          this.workPara.invoice_masterbi_transfer_disabled = fixedDeposit['invoice_masterbi_transfer'] ? true : false
          this.workPara.invoice_masterbi_lolf_disabled = fixedDeposit['invoice_masterbi_lolf'] ? true : false
          this.workPara.invoice_masterbi_lcl_disabled = fixedDeposit['invoice_masterbi_lcl'] ? true : false
          this.workPara.invoice_masterbi_amendment_disabled = fixedDeposit['invoice_masterbi_amendment'] ? true : false
          this.workPara.invoice_masterbi_tasac_disabled = fixedDeposit['invoice_masterbi_tasac'] ? true : false
          this.workPara.invoice_masterbi_printing_disabled = fixedDeposit['invoice_masterbi_printing'] ? true : false
          this.workPara.invoice_masterbi_others_disabled = fixedDeposit['invoice_masterbi_others'] ? true : false
          this.workPara.invoice_fee_currency_disabled = fixedDeposit['invoice_fee_currency'] ? true : false
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    changeDepositEdit: function() {
      if(!this.depositEdit) {
        try {
          this.modal.checkPasswordModal = true
        } catch (error) {
          this.$commonact.fault(error)
        }
      }
    },
    actCheckPassword: async function() {
      try {
        if(!this.checkPassword) {
          return this.$Message.error('Please enter right password')
        }
        await this.$http.post(apiUrl + 'checkPassword', { check_password: common.md52(this.checkPassword)})
        this.modal.checkPasswordModal = false
        this.depositEdit = true
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
  }
}
</script>