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
              <button type="button" class="btn btn-info" @click="loadImportModal('Container')">Load</button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="loadImportModal('bulk')">Bulk Load</button>
            </div>
            <div class="form-group m-r-3">
              <Button-group>
                <i-button class="btn btn-warning" @click="changeTableEdit">EDIT</i-button>
                <i-button class="btn btn-info" @click="saveData">Save</i-button>
              </Button-group>
              <!-- <button type="button" class="btn btn-info" @click="saveData">Save</button> -->
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
                        <p slot="title">
                            <i class="fa fa-ship" v-if="item.invoice_vessel_type === 'Bulk'" title="BULK SHIP"></i>
                            <i class="fa fa-cubes" v-else title="CONTAINER SHIP"></i> {{item.invoice_vessel_name}}({{item.invoice_vessel_code}})-{{item.invoice_vessel_voyage}}
                        </p>
                        <a href="#" slot="extra" @click.stop="editVesselAct(item)" title="Edit">
                            <i class="fa fa-edit"></i>
                        </a>
                        <a href="#" slot="extra" @click.stop="deleteVesselAct(item)" title="Remove" style="color: red; margin-left: 5px;">
                            <i class="fa fa-times"></i>
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
                        <Row>
                            <Col span="11">
                            <p>Call Sign: {{item.invoice_vessel_call_sign}}</p>
                            </Col>
                            <Col span="13">Container: {{item.invoice_container_soc_count}}/{{item.invoice_container_count}}</Col>
                        </Row>
                        <Row v-if="item.return_depot" v-for="(item1, index1) in item.return_depot" :key="index1" >
                            <Col span="11">DEPOT: {{item1.depot_name}}</Col>
                            <Col span="13">COUNT: {{item1.depot_count}}</Col>
                        </Row>
                    </Card>
                </div>
                </Col>
            </Row>
        </Scroll>
    </div>
    </Col>
    <Col span="17" offset="1">
    <Tabs :animated="true" @on-click="changeTab">
        <TabPane label="MasterBl">
            <Table stripe size="small" ref="masterbiTable" :columns="table.masterbiTable.columns" :data="table.masterbiTable.data" :height="table.masterbiTable.height">
                <template slot-scope="{ row, index }" slot="invoice_masterbi_bl">
                    <i class="fa fa-bell" v-if="row.has_same_container_no" style="color:green;"></i>
                    <i class="fa fa-ship" v-if="row.invoice_masterbi_vessel_type === 'Bulk'"></i>
                    <i class="fa fa-cubes" v-else></i>
                    <font color="#1890ff" style="margin-left:5px; margin-right:5px;" v-if="row.container_has_soc">SOC</font>
                    {{row.invoice_masterbi_bl}}
                    <a href="#" style="color: red; margin-left: 5px;" @click="deleteMasterbl(row)">
                        <i class="fa fa-times"></i>
                    </a>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_masterbi_do_disabled">
                  <i-switch v-model="row.invoice_masterbi_do_disabled" @on-change="changeDoDisabled(row)" size="large" true-value="1" false-value="0">
                      <span slot="open">ON</span>
                      <span slot="close">OFF</span>
                  </i-switch>
                </template>
                <template slot-scope="{ row, index }" slot="Invoice">
                  <Tooltip content="Deposit" v-if="!row.invoice_masterbi_invoice_release_date">
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDepositModal(row)" v-if="row.invoice_masterbi_invoice_state">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                    <a href="#" class="btn btn-info btn-icon btn-sm" @click="actDepositModalCheck(row)" v-else title="blacklist">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                  <Tooltip :content="row.invoice_masterbi_invoice_release_date_fmt" v-if="row.invoice_masterbi_invoice_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm" @click="actDepositModal(row)" v-if="row.invoice_masterbi_invoice_state">
                      <i class="fa fa-money-bill-alt"></i>
                    </a>
                    <a href="#" class="btn btn-info btn-icon btn-sm" @click="actDepositModalCheck(row)" v-else title="blacklist">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                </template>
                <template slot-scope="{ row, index }" slot="Do">
                  <Tooltip content="Generate Do" v-if="!row.invoice_masterbi_do_release_date">
                    <a href="#" class="btn btn-green btn-icon btn-sm" @click="actDownLoadDoModal(row)" v-if="row.invoice_masterbi_do_state">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                    <a href="#" class="btn btn-info btn-icon btn-sm" @click="actDownLoadDoModalCheck(row)" v-else :title="row.invoice_masterbi_do_state_message">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                  <Tooltip :content="row.invoice_masterbi_do_release_date_fmt" v-if="row.invoice_masterbi_do_release_date">
                    <a href="#" class="btn btn-pink btn-icon btn-sm" @click="actDownLoadDoModal(row)" v-if="row.invoice_masterbi_do_state">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                    <a href="#" class="btn btn-pink btn-icon btn-sm" @click="actDownLoadDoModalCheck(row)" v-else :title="row.invoice_masterbi_do_state_message">
                      <i class="fa fa-object-ungroup"></i>
                    </a>
                  </Tooltip>
                </template>
                <template slot-scope="{ row, index }" slot="Collect">
                  <a href="#" class="btn btn-info btn-xs" @click="showChangeCollectModal(row, 'PREPAID')" v-if="row.invoice_masterbi_freight == 'COLLECT'">Collect</a>
                  <a href="#" class="btn btn-indigo btn-xs" @click="showChangeCollectModal(row, 'COLLECT')" v-if="row.invoice_masterbi_freight !== 'COLLECT'">Prepaid</a>
                </template>
                <template slot-scope="{ row, index }" slot="files">
                  <Poptip trigger="hover" placement="bottom" :transfer="true" width="555" v-if="row.files && row.files.length > 0">
                    <Button type="text" style="text-decoration:underline">Files [{{row.files.length}}]</Button>
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
                            <Tooltip content="Send EDI" placement="right" v-if="row.release_date && (!row.edi_state || row.edi_state === '1' )">
                              <a href="#" class="btn btn-success btn-icon btn-sm" @click="doCreateEdi(row, index)">
                                <i class="fa fa-envelope"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Replace EDI" placement="right" v-if="row.edi_state && row.edi_state != '1'">
                              <a href="#" class="btn btn-success btn-icon btn-sm" @click="doReplaceEdi(row, index)">
                                <i class="fa fa-envelope-open"></i>
                              </a>
                            </Tooltip>
                            <Tooltip content="Cancel EDI" placement="right" v-if="row.edi_state && row.edi_state != '1'">
                              <a href="#" class="btn btn-danger btn-icon btn-sm" @click="doCancelEdi(row, index)">
                                <i class="fa fa-envelope-open"></i>
                              </a>
                            </Tooltip>
                          </template>
                            <template v-else-if="row.state === 'AP'">
                                <Tooltip content="Download">
                                <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                                    <i class="fa fa-download"></i>
                                </a>
                                </Tooltip>
                            <!-- <Tooltip content="Release" v-if="!row.release_date && (row.filetype === 'Deposit' || row.filetype === 'Fee' || row.filetype === 'DO' || row.filetype === 'Freight')">
                              <a href="#" class="btn btn-primary btn-icon btn-sm" @click="doRealse(row, index)">
                                <i class="fa fa-share-square"></i>
                              </a>
                            </Tooltip> -->
                          </template>
                </template>
            </Table>
            </template>
            </Poptip>
            </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_cargo_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_cargo_type" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_bl_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_bl_type" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_destination">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_destination" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_delivery">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_delivery" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_loading">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_loading" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_container_no">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_container_no" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_goods_description">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_goods_description" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_package_no">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_package_no" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_package_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_package_unit" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_weight">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_weight" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_weight_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_weight_unit" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_volume">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_volume" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_gross_volume_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_gross_volume_unit" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_invoice_value">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_invoice_value" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_invoice_currency">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_invoice_currency" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_freight_charge">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_freight_charge" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_freight_currency">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_freight_currency" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_imdg">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_imdg" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_packing_type">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_packing_type" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_code">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_code" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_name" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_forwarder_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_forwarder_tel" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_name" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_tel" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_address" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_exporter_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_exporter_tin" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_name" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_tel" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_address" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_consignee_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_consignee_tin" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_name">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_name" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_tel">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_tel" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_address">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_address" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_notify_tin">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_notify_tin" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_shipping_mark">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_shipping_mark" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_net_weight">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_net_weight" size="small" :disabled="tableEdit"/>
                </template>
            <template slot-scope="{ row, index }" slot="invoice_masterbi_net_weight_unit">
                  <Input v-model="table.masterbiTable.data[index].invoice_masterbi_net_weight_unit" size="small" :disabled="tableEdit"/>
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
            <Table stripe size="small" ref="containersTable" :columns="table.containersTable.columns" :data="table.containersTable.data" :height="table.containersTable.height">
                <template slot-scope="{ row, index }" slot="invoice_containers_bl">
                    <i class="fa fa-bell" v-if="row.has_same_container_no" style="color:green;"></i>
                    {{row.invoice_containers_bl}}
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_type">
                  <i-switch v-model="row.invoice_containers_type" @on-change="changeContainersType(row)" size="large" true-value="S" false-value="C">
                      <span slot="open">SOC</span>
                      <span slot="close">I/O</span>
                  </i-switch>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_no">
                  <Input v-model="table.containersTable.data[index].invoice_containers_no" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_size">
                  <Input v-model="table.containersTable.data[index].invoice_containers_size" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_seal1">
                  <Input v-model="table.containersTable.data[index].invoice_containers_seal1" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_seal2">
                  <Input v-model="table.containersTable.data[index].invoice_containers_seal2" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_seal3">
                  <Input v-model="table.containersTable.data[index].invoice_containers_seal3" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_freight_indicator">
                  <Input v-model="table.containersTable.data[index].invoice_containers_freight_indicator" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_package_no">
                  <Input v-model="table.containersTable.data[index].invoice_containers_package_no" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_package_unit">
                  <Input v-model="table.containersTable.data[index].invoice_containers_package_unit" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_volumn">
                  <Input v-model="table.containersTable.data[index].invoice_containers_volumn" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_volumn_unit">
                  <Input v-model="table.containersTable.data[index].invoice_containers_volumn_unit" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_weight">
                  <Input v-model="table.containersTable.data[index].invoice_containers_weight" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_weight_unit">
                  <Input v-model="table.containersTable.data[index].invoice_containers_weight_unit" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_plug_reefer">
                  <Input v-model="table.containersTable.data[index].invoice_containers_plug_reefer" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_min_temperature">
                  <Input v-model="table.containersTable.data[index].invoice_containers_min_temperature" size="small" :disabled="tableEdit"/>
                </template>
                <template slot-scope="{ row, index }" slot="invoice_containers_max_temperature">
                  <Input v-model="table.containersTable.data[index].invoice_containers_max_temperature" size="small" :disabled="tableEdit"/>
                </template>
            </Table>
            <Page class="m-t-10" :total="table.containersTable.total" :page-size="table.containersTable.limit" @on-change="getContainersData" />
        </TabPane>
    </Tabs>
    </Col>
</Row>
</panel>
<Modal v-model="modal.importModal" title="Import" :mask-closable="false">
    <Form :model="workPara" :label-width="120">
        <FormItem label="Files">
            <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
                <Icon type="ios-document" size="60" />
            </div>
            <Upload ref="upload" :headers="headers" :show-upload-list="false" :on-success="handleSuccess" :format="['xlsx']" :max-size="4096" :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize" type="drag" action="/api/zhongtan/invoice/Invoice/upload"
                style="display: inline-block;width:58px;">
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
<Modal v-model="modal.downLoadDoModal" title="Download Do" width="600" :mask-closable="false">
    <Form :model="workPara" :label-width="160">
        <Row>
            <Col>
                <FormItem label="Delivery to" prop="invoice_masterbi_delivery_to">
                    <Select v-model="workPara.invoice_masterbi_delivery_to" filterable clearable placeholder="Delivery" style="width:400px" 
                            :disabled="(!doDeliverValidToEdit && workPara.invoice_masterbi_delivery_to_customer_type !== '2') && !(workPara.invoice_masterbi_vessel_type === 'Bulk' && workPara.invoice_masterbi_cargo_type === 'TR' && workPara.invoice_masterbi_freight === 'PREPAID')">
                        <Option v-for="item in delivery.options" :value="item" :key="item">{{item}}</Option>
                    </Select>
                </FormItem>
            </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk'">
            <Col>
                <FormItem label="VALID TO" prop="invoice_masterbi_valid_to">
                    <Input v-if="!doDeliverValidToEdit" v-model="workPara.invoice_masterbi_valid_to" disabled/>
                    <DatePicker v-else type="date" placeholder="VALID TO" v-model="workPara.invoice_masterbi_valid_to" @on-change="validToDateChange" format="yyyy-MM-dd"></DatePicker>
                </FormItem>
            </Col>
        </Row>
        <Row v-else>
            <Col>
                <FormItem label="VALID TO" prop="invoice_masterbi_valid_to">
                    <DatePicker type="date" placeholder="VALID TO" v-model="workPara.invoice_masterbi_valid_to" @on-change="validToDateChange" format="yyyy-MM-dd"></DatePicker>
                </FormItem>
            </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk'">
            <Col>
                <FormItem label="FCL" prop="invoice_masterbi_do_fcl">
                    <RadioGroup v-model="workPara.invoice_masterbi_do_fcl">
                        <Radio value="FCL/FCL" label="FCL/FCL" style="margin-right: 50px;" :disabled="!doDeliverValidToEdit"></Radio>
                        <Radio value="FCL/LCL" label="FCL/LCL" style="margin-right: 50px;" :disabled="!doDeliverValidToEdit"></Radio>
                    </RadioGroup>
                </FormItem>
            </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk'">
            <Col>
            <FormItem label="LADEN RELEASE ICD" prop="invoice_masterbi_do_icd">
                <i-select v-model="workPara.invoice_masterbi_do_icd" :disabled="!doDeliverValidToEdit">
                    <i-option v-for="item in pagePara.ICD" :value="item.icd_name" :key="item.icd_name" :label="item.icd_name">
                        <span>{{item.icd_name}}</span>
                        <span style="float:right;color:#ccc">{{item.icd_code}}</span>
                    </i-option>
                </i-select>
            </FormItem>
            </Col>
        </Row>
        <Row v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk' && !workPara.container_has_soc">
            <Col>
            <FormItem label="RETURN DEPOT" prop="invoice_masterbi_do_return_depot">
                <i-select v-model="workPara.invoice_masterbi_do_return_depot" :disabled="workPara.invoice_masterbi_do_return_depot_disabled && !doDeliverValidToEdit">
                    <i-option v-for="item in pagePara.DEPOT" :value="item.edi_depot_name" :key="item.edi_depot_id" :label="item.edi_depot_name">
                        <span>{{item.edi_depot_name}}</span>
                    </i-option>
                </i-select>
            </FormItem>
            </Col>
        </Row>
    </Form>
    <div slot="footer">
        <a href="#" style="float:left; padding-top:10px;" @click.prevent="changeDoDeliverValidToEdit" title="Edit">
            <i class="fa fa-edit"></i>Edit
        </a>
        <Button type="text" size="large" @click="modal.downLoadDoModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="downloadDo">Submit</Button>
    </div>
</Modal>
<Modal v-model="modal.depositModal" title="Deposit" width="600" :mask-closable="false">
    <Form :model="workPara" :label-width="140">
        <FormItem label="Customer" prop="invoice_masterbi_customer_id" style="margin-bottom: 0px;">
            <Select ref="customer" v-model="workPara.invoice_masterbi_customer_id" filterable clearable remote :remote-method="searchCustomer" :loading="deposit.customer.loading" placeholder="Customer" @on-change="doChangeCustomer">
            <Option v-for="item in deposit.customer.options" :value="item.id" :key="item.id">{{item.text}}<i v-if="item.balcklist === '1'" class="fa fa-ban" style="float: right; color: red;" title="Blacklist"></i><i v-if="item.fixed" class="fa fa-lock" style="float: right; margin-right: 10px;" title="Fixed"></i></Option>
          </Select>
        </FormItem>
        <FormItem label="Carrier" prop="invoice_masterbi_carrier" style="margin-bottom: 0px;">
            <Select v-model="workPara.invoice_masterbi_carrier" :disabled="!!workPara.invoice_masterbi_carrier">
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
            <FormItem label="Cargo" style="margin-bottom: 0px;">
                <span> {{ workPara.invoice_masterbi_cargo_type }} / {{ workPara.invoice_masterbi_freight }}</span>
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
            <FormItem label="Destination" style="margin-bottom: 0px;">
                <span> {{ workPara.invoice_masterbi_destination }}</span>
            </FormItem>
            </Col>
        </Row>
        <FormItem label="Container Size" style="margin-bottom: 0px;" v-if="workPara.invoice_masterbi_vessel_type !== 'Bulk'">
            <span style='white-space:pre;'> {{ workPara.container_size_type }}</span>
        </FormItem>
        <Checkbox v-model="depositEdit" v-if="deposit.depositType=='Container Deposit'" style="position: absolute; top: 366px; right: 20px;" @on-change="changeDepositEdit">EDIT</Checkbox>
        <Checkbox v-model="invoiceFeeEdit" v-if="deposit.depositType=='Invoice Fee'" style="position: absolute; top: 366px; right: 20px;" @on-change="changeInvoiceFeeEdit">EDIT</Checkbox>
        <Tabs ref="depositTabs" active-key="Container Deposit" @on-click="currentFeeTabChanged">
            <Tab-pane :label="containerDepositFeeLabel" name="Container Deposit" key="Container Deposit" :disabled="workPara.invoice_masterbi_vessel_type === 'Bulk'">
                <FormItem label="Deposit Amount" prop="invoice_masterbi_deposit" style="margin-bottom: 0px;">
                    <Input placeholder="Deposit Amount" v-model="workPara.invoice_masterbi_deposit" :disabled="!!workPara.invoice_masterbi_deposit_disabled && !depositEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_deposit_necessary" :disabled="workPara.invoice_masterbi_deposit_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_deposit')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_container_deposit_currency" style="width: 80px" maxlength=10 show-word-limit :disabled="!!workPara.invoice_masterbi_deposit_disabled && !depositEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Comment" prop="invoice_masterbi_deposit_comment" style="margin-bottom: 0px;">
                    <Input v-model="workPara.invoice_masterbi_deposit_comment" type="textarea" :maxlength="200" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="Deposit Amount Comment" />
                </FormItem>
            </Tab-pane>
            <Tab-pane :label="invoiceFeeLabel" name="Invoice Fee" key="Invoice Fee">
                <FormItem label="Ocean Freight" prop="invoice_masterbi_of" style="margin-bottom: 0px;">
                    <Input placeholder="Ocean Freight Fee" v-model="workPara.invoice_masterbi_of" :disabled="!!workPara.invoice_masterbi_of_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_of_necessary" :disabled="workPara.invoice_masterbi_of_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_of')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_masterbi_of_currency" style="width: 80px" :disabled="!!workPara.invoice_masterbi_of_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="B/L amendment" prop="invoice_masterbi_bl_amendment" style="margin-bottom: 0px;">
                    <Input placeholder="B/L amendment" v-model="workPara.invoice_masterbi_bl_amendment" :disabled="!!workPara.invoice_masterbi_bl_amendment_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_bl_amendment_necessary" :disabled="workPara.invoice_masterbi_bl_amendment_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_bl_amendment')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="COD Charge" prop="invoice_masterbi_cod_charge" style="margin-bottom: 0px;">
                    <Input placeholder="COD Charge" v-model="workPara.invoice_masterbi_cod_charge" :disabled="!!workPara.invoice_masterbi_cod_charge_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_cod_charge_necessary" :disabled="workPara.invoice_masterbi_cod_charge_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_cod_charge')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Container Transfer" prop="invoice_masterbi_transfer" style="margin-bottom: 0px;">
                    <Input placeholder="Container Transfer" v-model="workPara.invoice_masterbi_transfer" :disabled="!!workPara.invoice_masterbi_transfer_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_transfer_necessary" :disabled="workPara.invoice_masterbi_transfer_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_transfer')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Lift On Lift Off" prop="invoice_masterbi_lolf" style="margin-bottom: 0px;">
                    <Input placeholder="Lift On Lift Off" v-model="workPara.invoice_masterbi_lolf" :disabled="!!workPara.invoice_masterbi_lolf_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_lolf_necessary" :disabled="workPara.invoice_masterbi_lolf_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_lolf')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="LCL" prop="invoice_masterbi_lcl" style="margin-bottom: 0px;">
                    <Input placeholder="LCL" v-model="workPara.invoice_masterbi_lcl" :disabled="!!workPara.invoice_masterbi_lcl_disabled && invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_lcl_necessary" :disabled="workPara.invoice_masterbi_lcl_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_lcl')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Amendment" prop="invoice_masterbi_amendment" style="margin-bottom: 0px;">
                    <Input placeholder="Amendment" v-model="workPara.invoice_masterbi_amendment" :disabled="!!workPara.invoice_masterbi_amendment_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_amendment_necessary" :disabled="workPara.invoice_masterbi_amendment_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_amendment')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Tasac" prop="invoice_masterbi_tasac" style="margin-bottom: 0px;">
                    <Input placeholder="Tasac" v-model="workPara.invoice_masterbi_tasac" :disabled="!!workPara.invoice_masterbi_tasac_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_tasac_necessary" :disabled="workPara.invoice_masterbi_tasac_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_tasac')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Bill Pringting" prop="invoice_masterbi_printing" style="margin-bottom: 0px;">
                    <Input placeholder="Bill Pringting" v-model="workPara.invoice_masterbi_printing" :disabled="!!workPara.invoice_masterbi_printing_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_printing_necessary" :disabled="workPara.invoice_masterbi_printing_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_printing')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Others" prop="invoice_masterbi_others" style="margin-bottom: 0px;">
                    <Input placeholder="Others" v-model="workPara.invoice_masterbi_others" :disabled="!!workPara.invoice_masterbi_others_disabled && !invoiceFeeEdit">
                    <Checkbox slot="prepend" v-model="workPara.invoice_masterbi_others_necessary" :disabled="workPara.invoice_masterbi_others_necessary_disabled" style="margin-bottom: 0px;" @on-change="changeFixedAct('invoice_masterbi_others')">Fixed</Checkbox>
                    <Select slot="append" v-model="workPara.invoice_fee_currency" style="width: 80px" :disabled="!!workPara.invoice_fee_currency_disabled && !invoiceFeeEdit">
                  <Option v-for="item in pagePara.RECEIPT_CURRENCY" :value="item.id" :key="item.id">{{ item.text }}</Option>
                </Select>
                    </Input>
                </FormItem>
                <FormItem label="Comment" prop="invoice_fee_comment" style="margin-bottom: 0px;">
                    <Input v-model="workPara.invoice_fee_comment" type="textarea" :maxlength="200" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="Invoice Fee Comment" />
                </FormItem>
            </Tab-pane>
        </Tabs>
    </Form>
    <div slot="footer">
        <Button type="text" size="large" @click="modal.depositModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="depositDo" v-if="deposit.depositType=='Container Deposit'" :disabled="!depositEdit && (workPara.invoice_masterbi_customer_blacklist || (workPara.invoice_masterbi_deposit_fixed == '1' && !!workPara.invoice_masterbi_deposit_release_date)) && !changeCustomer">Submit</Button>
        <Button type="primary" size="large" @click="depositDo" v-if="deposit.depositType=='Invoice Fee'" :disabled="!invoiceFeeEdit && workPara.invoice_masterbi_customer_blacklist && !changeCustomer">Submit</Button>
    </div>
</Modal>
<Modal v-model="modal.deleteVoyageModal" title="Delete Voyage" width="600" :mask-closable="false">
    <Form :model="workPara" :label-width="120">
        <FormItem label="Voyage No." prop="voyage_no">
            <Input placeholder="Voyage No." v-model="workPara.voyage_no" />
        </FormItem>
    </Form>
    <div slot="footer">
        <Button type="text" size="large" @click="modal.deleteVoyageModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="doDeleteVoyageAct">Submit</Button>
    </div>
</Modal>
<Modal v-model="modal.colletChangeModal" title="Collet Change" width="600" :mask-closable="false">
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
        <Button type="text" size="large" @click="cancelCheckPassword">Cancel</Button>
        <Button type="primary" size="large" @click="actCheckPassword">Submit</Button>
    </div>
</Modal>
<Modal v-model="modal.editVesselModal" title="Edit Vessel" width="600" :mask-closable="false">
    <Form ref="vesselForm" :model="vesselForm" :rules="formRules" :label-width="120">
        <FormItem label="Vessel Name" prop="invoice_vessel_name">
            <Input placeholder="Vessel Name" v-model="vesselForm.invoice_vessel_name" clearable></Input>
        </FormItem>
        <FormItem label="Vessel Voyage" prop="invoice_vessel_voyage">
            <Input placeholder="Vessel Voyage" v-model="vesselForm.invoice_vessel_voyage" clearable></Input>
        </FormItem>
        <FormItem label="Vessel Code" prop="invoice_vessel_code" v-if="vesselForm.invoice_vessel_type != 'Bulk'">
            <Input placeholder="Vessel Code" v-model="vesselForm.invoice_vessel_code" clearable></Input>
        </FormItem>
        <FormItem label="Call Sign" prop="invoice_vessel_call_sign" v-if="vesselForm.invoice_vessel_type != 'Bulk'">
            <Input placeholder="Vessel Call Sign" v-model="vesselForm.invoice_vessel_call_sign" clearable></Input>
        </FormItem>
        <FormItem label="Vessel ETA" prop="invoice_vessel_eta">
            <DatePicker type="date" placeholder="Select Vessel ETA" v-model="vesselForm.invoice_vessel_eta" format="dd/MM/yyyy" @on-change="vesselEtaDateChange"></DatePicker>
        </FormItem>
        <FormItem label="Vessel ATA" prop="invoice_vessel_ata">
            <DatePicker type="date" placeholder="Select Vessel ATA" v-model="vesselForm.invoice_vessel_ata" format="dd/MM/yyyy" @on-change="vesselAtaDateChange"></DatePicker>
        </FormItem>
        <FormItem label="Vessel ATD" prop="invoice_vessel_atd">
            <DatePicker type="date" placeholder="Select Vessel ATD" v-model="vesselForm.invoice_vessel_atd" format="dd/MM/yyyy" @on-change="vesselAtdDateChange"></DatePicker>
        </FormItem>
    </Form>
    <div slot="footer">
        <Button type="text" size="large" @click="modal.editVesselModal = false">Cancel</Button>
        <Button type="primary" size="large" @click="doEditVesselAct">Submit</Button>
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
                modal: {
                    importModal: false,
                    downLoadDoModal: false,
                    depositModal: false,
                    deleteVoyageModal: false,
                    colletChangeModal: false,
                    checkPasswordModal: false,
                    editVesselModal: false
                },
                table: {
                    masterbiTable: {
                        columns: [{
                            title: '#M B/L No',
                            slot: 'invoice_masterbi_bl',
                            width: 220
                        }, {
                            title: 'D/O Disabled',
                            slot: 'invoice_masterbi_do_disabled',
                            width: 120
                        }, {
                            title: 'Invoice',
                            slot: 'Invoice',
                            width: 80
                        }, {
                            title: 'Do',
                            slot: 'Do',
                            width: 60
                        }, {
                            title: 'Freight Terms',
                            slot: 'Collect',
                            width: 120
                        }, {
                            title: 'Files',
                            slot: 'files',
                            width: 100
                        }, {
                            title: 'Cargo Classification',
                            slot: 'invoice_masterbi_cargo_type',
                            width: 100
                        }, {
                            title: '*B/L Type',
                            slot: 'invoice_masterbi_bl_type',
                            width: 100
                        }, {
                            title: 'Place of Destination',
                            slot: 'invoice_masterbi_destination',
                            width: 130
                        }, {
                            title: 'Place of Delivery',
                            slot: 'invoice_masterbi_delivery',
                            width: 130
                        }, {
                            title: 'Port of Loading',
                            slot: 'invoice_masterbi_loading',
                            width: 130
                        }, {
                            title: 'Number of Containers',
                            slot: 'invoice_masterbi_container_no',
                            width: 100
                        }, {
                            title: 'Description of Goods',
                            slot: 'invoice_masterbi_goods_description',
                            width: 200
                        }, {
                            title: 'Number of Package',
                            slot: 'invoice_masterbi_package_no',
                            width: 100
                        }, {
                            title: 'Package Unit',
                            slot: 'invoice_masterbi_package_unit',
                            width: 100
                        }, {
                            title: 'Gross Weight',
                            slot: 'invoice_masterbi_gross_weight',
                            width: 100
                        }, {
                            title: 'Gross Weight Unit',
                            slot: 'invoice_masterbi_gross_weight_unit',
                            width: 100
                        }, {
                            title: 'Gross Volume',
                            slot: 'invoice_masterbi_gross_volume',
                            width: 100
                        }, {
                            title: 'Gross Volume Unit',
                            slot: 'invoice_masterbi_gross_volume_unit',
                            width: 100
                        }, {
                            title: 'Invoice Value',
                            slot: 'invoice_masterbi_invoice_value',
                            width: 100
                        }, {
                            title: 'Invoice Currency',
                            slot: 'invoice_masterbi_invoice_currency',
                            width: 100
                        }, {
                            title: 'Freight Charge',
                            slot: 'invoice_masterbi_freight_charge',
                            width: 100
                        }, {
                            title: 'Freight Currency',
                            slot: 'invoice_masterbi_freight_currency',
                            width: 100
                        }, {
                            title: 'IMDG Code',
                            slot: 'invoice_masterbi_imdg',
                            width: 100
                        }, {
                            title: 'Packing Type',
                            slot: 'invoice_masterbi_packing_type',
                            width: 100
                        }, {
                            title: 'Forwarder Code',
                            slot: 'invoice_masterbi_forwarder_code',
                            width: 150
                        }, {
                            title: 'Forwarder Name',
                            slot: 'invoice_masterbi_forwarder_name',
                            width: 200
                        }, {
                            title: 'Forwarder Tel',
                            slot: 'invoice_masterbi_forwarder_tel',
                            width: 150
                        }, {
                            title: 'Exporter Name',
                            slot: 'invoice_masterbi_exporter_name',
                            width: 200
                        }, {
                            title: 'Exporter Tel',
                            slot: 'invoice_masterbi_exporter_tel',
                            width: 100
                        }, {
                            title: 'Exporter Address',
                            slot: 'invoice_masterbi_exporter_address',
                            width: 200
                        }, {
                            title: 'Exporter TIN',
                            slot: 'invoice_masterbi_exporter_tin',
                            width: 100
                        }, {
                            title: 'Consignee Name',
                            slot: 'invoice_masterbi_consignee_name',
                            tooltip: true,
                            width: 200
                        }, {
                            title: 'Consignee Tel',
                            slot: 'invoice_masterbi_consignee_tel',
                            width: 100
                        }, {
                            title: 'Consignee Address',
                            slot: 'invoice_masterbi_consignee_address',
                            width: 200
                        }, {
                            title: 'Consignee TIN',
                            slot: 'invoice_masterbi_consignee_tin',
                            width: 100
                        }, {
                            title: 'Notify Name',
                            slot: 'invoice_masterbi_notify_name',
                            width: 200
                        }, {
                            title: 'Notify Tel',
                            slot: 'invoice_masterbi_notify_tel',
                            width: 100
                        }, {
                            title: 'Notify Address',
                            slot: 'invoice_masterbi_notify_address',
                            width: 200
                        }, {
                            title: 'Notify TIN',
                            slot: 'invoice_masterbi_notify_tin',
                            width: 100
                        }, {
                            title: 'Shipping Mark',
                            slot: 'invoice_masterbi_shipping_mark',
                            width: 200
                        }, {
                            title: 'Net Weight',
                            slot: 'invoice_masterbi_net_weight',
                            width: 100
                        }, {
                            title: 'Net Weight Unit',
                            slot: 'invoice_masterbi_net_weight_unit',
                            width: 100
                        }, {
                            title: 'LineAgent Code',
                            slot: 'invoice_masterbi_line_code',
                            width: 100
                        }, {
                            title: 'TerminalCode',
                            slot: 'invoice_masterbi_terminal_code',
                            width: 100
                        }],
                        data: [],
                        unchanged: [],
                        height: common.getTableHeight() - 80,
                        limit: 10,
                        offset: 0,
                        total: 0
                    },
                    containersTable: {
                        columns: [{
                            title: '#M B/L No',
                            slot: 'invoice_containers_bl',
                            width: 150
                        }, {
                            title: 'Type Of Container',
                            slot: 'invoice_containers_type',
                            width: 100
                        }, {
                            title: 'Container No',
                            slot: 'invoice_containers_no',
                            width: 150
                        }, {
                            title: 'Container Size',
                            slot: 'invoice_containers_size',
                            width: 100
                        }, {
                            title: 'Seal No.1',
                            slot: 'invoice_containers_seal1',
                            width: 100
                        }, {
                            title: 'Seal No.2',
                            slot: 'invoice_containers_seal2',
                            width: 100
                        }, {
                            title: 'Seal No.3',
                            slot: 'invoice_containers_seal3',
                            width: 100
                        }, {
                            title: 'Freight Indicator',
                            slot: 'invoice_containers_freight_indicator',
                            width: 100
                        }, {
                            title: 'No Of Package',
                            slot: 'invoice_containers_package_no',
                            width: 100
                        }, {
                            title: 'Package Unit',
                            slot: 'invoice_containers_package_unit',
                            width: 100
                        }, {
                            title: 'Volumn',
                            slot: 'invoice_containers_volumn',
                            width: 100
                        }, {
                            title: 'Volumn Unit',
                            slot: 'invoice_containers_volumn_unit',
                            width: 100
                        }, {
                            title: 'Weight',
                            slot: 'invoice_containers_weight',
                            width: 100
                        }, {
                            title: 'Weight Unit',
                            slot: 'invoice_containers_weight_unit',
                            width: 100
                        }, {
                            title: 'Plug type of reefer',
                            slot: 'invoice_containers_plug_reefer',
                            width: 100
                        }, {
                            title: 'Minimum Temperature',
                            slot: 'invoice_containers_min_temperature',
                            width: 100
                        }, {
                            title: 'Maximum Temperature',
                            slot: 'invoice_containers_max_temperature',
                            width: 100
                        }],
                        data: [],
                        unchanged: [],
                        height: common.getTableHeight() - 80,
                        limit: 10,
                        offset: 0,
                        total: 0
                    },
                    filesTable: {
                        columns: [{
                            title: 'Create Date',
                            key: 'date',
                            width: 120
                        }, {
                            title: 'Type',
                            key: 'filetype',
                            width: 80
                        }, {
                            title: 'Receipt Type',
                            key: 'receipt_type',
                            width: 80
                        }, {
                            title: 'State',
                            key: 'state',
                            render: common.selectRender(this, 'UPLOAD_STATE'),
                            width: 150
                        }, {
                            title: 'Action',
                            slot: 'act',
                            width: 150
                        }, {
                            title: 'Release Date',
                            key: 'release_date',
                            width: 150
                        }, {
                            title: 'Release User',
                            key: 'release_user',
                            width: 150
                        }]
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
                checkPasswordType: '',
                depositEdit: false,
                invoiceFeeEdit: false,
                changeCustomer: false,
                doDeliverValidToEdit: false,
                formRules: {
                    invoice_vessel_name: [{
                        required: true,
                        message: 'The vessel name cannot be empty',
                        trigger: 'blur'
                    }],
                    invoice_vessel_code: [{
                        required: true,
                        message: 'The vessel code cannot be empty',
                        trigger: 'blur'
                    }],
                    invoice_vessel_voyage: [{
                        required: true,
                        message: 'The vessel voyage cannot be empty',
                        trigger: 'blur'
                    }],
                    invoice_vessel_call_sign: [{
                        required: true,
                        message: 'The vessel call sign cannot be empty',
                        trigger: 'blur'
                    }]
                },
                vesselForm: {
                    invoice_vessel_id: '',
                    invoice_vessel_name: '',
                    invoice_vessel_code: '',
                    invoice_vessel_voyage: '',
                    invoice_vessel_eta: '',
                    invoice_vessel_ata: '',
                    invoice_vessel_atd: '',
                    invoice_vessel_call_sign: '',
                },
                delivery: {
                    options: []
                },
                tableEdit: true,
                importFileType: ''
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
            loadImportModal: async function(importFileType) {
                this.workPara = {}
                this.$refs.upload.fileList = []
                this.files.fileList = []
                this.action = 'add'
                this.importFileType = importFileType
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
                    this.workPara.importFileType = this.importFileType
                    await this.$http.post(apiUrl + 'uploadImport', this.workPara)
                    this.$Message.success('submit success')
                    this.getVoyageData()
                    this.modal.importModal = false
                    this.importFileType = ''
                } catch (error) {
                    this.$refs.upload.fileList = []
                    this.files.fileList = []
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
                    this.table.masterbiTable.unchanged = JSON.parse(JSON.stringify(data.masterbl.rows))
                    this.table.masterbiTable.total = data.masterbl.total
                    this.table.containersTable.data = []
                    if (this.vessel.search_data.bl && data.vessels && data.vessels.length === 1) {
                        this.vessel.current = data.vessels[0].invoice_vessel_id
                    }
                    if (this.currentTab != 0) {
                        this.refreshTableData()
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            checkVoyage: async function(invoice_vessel_id) {
                if (this.vessel.current != invoice_vessel_id) {
                    this.vessel.current = invoice_vessel_id
                    this.refreshTableData()
                }
            },
            changeTab: function(name) {
                if (this.currentTab != name) {
                    this.currentTab = name
                    this.refreshTableData()
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
                    bl: this.vessel.search_data.bl,
                    offset: this.table.containersTable.offset,
                    limit: this.table.containersTable.limit
                }

                let response = await this.$http.post(apiUrl + 'getContainersData', searchPara)
                let data = response.data.info
                this.table.containersTable.total = data.total
                this.table.containersTable.data = JSON.parse(JSON.stringify(data.rows))
                this.table.containersTable.unchanged = JSON.parse(JSON.stringify(data.rows))
            },
            actDownLoadDoModal: async function(row) {
                await this.getPara()
                this.workPara = JSON.parse(JSON.stringify(row))
                this.delivery.options = JSON.parse(JSON.stringify(this.pagePara.DELIVER))
                if (row.invoice_masterbi_delivery_to) {
                    const index = this.delivery.options.indexOf(row.invoice_masterbi_delivery_to)
                    if (index < 0) {
                        this.delivery.options.unshift(row.invoice_masterbi_delivery_to)
                    }
                }
                if (this.workPara.invoice_masterbi_lcl) {
                    this.workPara.invoice_masterbi_do_fcl = 'FCL/LCL'
                }else if (!this.workPara.invoice_masterbi_do_fcl) {
                    if (this.workPara.invoice_masterbi_lcl) {
                        this.workPara.invoice_masterbi_do_fcl = 'FCL/LCL'
                    } else {
                        this.workPara.invoice_masterbi_do_fcl = 'FCL/FCL'
                    }
                }

                if (this.pagePara.DELIVER.ICD) {
                    let defaultICD = false
                    for (let i = 0; i < this.pagePara.DELIVER.ICD.length; i++) {
                        if (this.pagePara.DELIVER.ICD[i].icd_name === 'TICTS TERMINAL') {
                            defaultICD = true
                            break
                        }
                    }
                    if (!defaultICD) {
                        this.pagePara.DELIVER.ICD.push({
                            'icd_name': 'TICTS TERMINAL',
                            'icd_code': 'WTTZDL002'
                        })
                    }
                } else {
                    this.pagePara.DELIVER.ICD = [{
                        'icd_name': 'TICTS TERMINAL',
                        'icd_code': 'WTTZDL002'
                    }]
                }
                if (!this.workPara.invoice_masterbi_do_icd) {
                    this.workPara.invoice_masterbi_do_icd = 'TICTS TERMINAL'
                }

                if (!this.workPara.invoice_masterbi_do_return_depot) {
                    this.workPara.invoice_masterbi_do_return_depot = 'FANTUZZI'
                }
                this.doDeliverValidToEdit = false
                this.modal.downLoadDoModal = true
            },
            actDownLoadDoModalCheck: function(row) {
                this.workPara = JSON.parse(JSON.stringify(row))
                this.checkPassword = ''
                this.modal.checkPasswordModal = true
                this.checkPasswordType = 'downLoadDoModalCheck'
            },
            downloadDo: async function() {
                try {
                    let response = await this.$http.post(apiUrl + 'deliveryCheck', this.workPara)
                    let retData = response.data.info
                    if(retData.result) {
                        this.downloadDoAct()
                    } else {
                        this.$commonact.confirm(retData.message, async() => {
                            try {
                                this.checkPassword = ''
                                this.modal.checkPasswordModal = true
                                this.checkPasswordType = 'downLoadDoDeliveryCheck'
                            } catch (error) {
                                this.$commonact.fault(error)
                            }
                        })
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            downloadDoAct: async function() {
                 try {
                    let response = await this.$http.post(apiUrl + 'downloadDo', this.workPara)
                    printJS(response.data.info.url)
                    this.$Message.success('do success')
                    this.modal.downLoadDoModal = false
                    this.refreshTableData()
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            doRealse: async function(row, index) {
                try {
                    await this.$http.post(apiUrl + 'doRelease', {
                        file_id: row.file_id
                    })
                    this.refreshTableData()
                    this.$Message.success('release success')
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            actDepositModalCheck: function(row) {
                this.workPara = JSON.parse(JSON.stringify(row))
                this.checkPassword = ''
                this.modal.checkPasswordModal = true
                this.checkPasswordType = 'depositModalCheck'
            },
            actDepositModal: function(row) {
                this.$refs.customer.reset()
                this.deposit.customer.loading = true
                this.deposit.customer.options = JSON.parse(JSON.stringify(row.customerINFO))
                this.deposit.customer.loading = false
                this.deposit.fees = []
                this.$nextTick(function() {
                    this.workPara = JSON.parse(JSON.stringify(row))
                    this.depositEdit = false
                    this.changeCustomer = false
                    this.workPara.invoice_masterbi_customer_blacklist = true
                    if (this.workPara.invoice_masterbi_vessel_type && this.workPara.invoice_masterbi_vessel_type === 'Bulk') {
                        this.deposit.depositType = 'Invoice Fee'
                        this.$refs.depositTabs.activeKey = 'Invoice Fee'
                    } else {
                        this.deposit.depositType = 'Container Deposit'
                        this.$refs.depositTabs.activeKey = 'Container Deposit'
                        // if(!this.workPara.invoice_masterbi_deposit_date) {
                        //     this.searchFixedDeposit()
                        // }
                    }
                    if (this.workPara.invoice_masterbi_deposit_state) {
                        this.containerDepositFeeLabel = h => {
                            return h("div", [
                                h("i", {
                                    class: 'fa fa-check'
                                }),
                                h("span", "Container Deposit Fee")
                            ])
                        }
                    } else {
                        this.containerDepositFeeLabel = 'Container Deposit Fee'
                    }
                    if (this.workPara.invoice_fee_state) {
                        this.invoiceFeeLabel = h => {
                            return h("div", [
                                h("i", {
                                    class: 'fa fa-check'
                                }),
                                h("span", "Invoice Fee")
                            ])
                        }
                    } else {
                        this.invoiceFeeLabel = 'Invoice Fee'
                    }
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
                    if (this.deposit.customer.options && this.deposit.customer.options.length === 1) {
                        this.searchFixedDeposit()
                    }
                } else {
                    this.deposit.customer.options = []
                }
            },
            doChangeCustomer: function(value) {
                if(value) {
                    this.changeCustomer = true
                }
            },
            currentFeeTabChanged: function(name) {
                this.depositEdit = false
                this.invoiceFeeEdit = false
                this.deposit.depositType = name
                if(this.workPara.invoice_masterbi_customer_id) {
                    this.searchFixedDeposit()
                }
            },
            depositDo: async function(depositType) {
                try {
                    if (!this.workPara.invoice_masterbi_customer_id) {
                        return this.$Message.error('Please choose customer')
                    }

                    if (!this.workPara.invoice_masterbi_carrier) {
                        return this.$Message.error('Please choose carrier')
                    }
                    let param = _.extend(this.workPara, this.deposit)
                    param.depositEdit = this.depositEdit
                    await this.$http.post(apiUrl + 'depositDo', param)
                        // printJS(response.data.info.url)
                    this.$Message.success('deposit success')
                    this.modal.depositModal = false
                    this.refreshTableData()
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
                    if (!this.workPara.collet_change_password) {
                        return this.$Message.error('Please enter right password')
                    }
                    await this.$http.post(apiUrl + 'changeCollect', {
                        invoice_masterbi_id: this.workPara.invoice_masterbi_id,
                        act: this.workPara.collect_flag,
                        collet_change_password: common.md52(this.workPara.collet_change_password)
                    })
                    this.refreshTableData()
                    this.modal.colletChangeModal = false
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            saveData: async function() {
                if (this.currentTab === 0) {
                    if (this.table.masterbiTable.data.length > 0) {
                        let changeData = []
                        for (let i = 0; i < this.table.masterbiTable.data.length; i++) {
                            if (JSON.stringify(this.table.masterbiTable.data[i]) !== JSON.stringify(this.table.masterbiTable.unchanged[i])) {
                                changeData.push(this.table.masterbiTable.data[i])
                            }
                        }
                        if (changeData.length > 0) {
                            try {
                                await this.$http.post(apiUrl + 'changebl', {
                                    changedbl: changeData
                                })
                                this.refreshTableData()
                                this.tableEdit = true
                                this.$Message.success('save success')
                            } catch (error) {
                                this.$commonact.fault(error)
                            }
                        }
                    }
                } else {
                    if (this.table.containersTable.data.length > 0) {
                        //
                        let changeData = []
                        for (let i = 0; i < this.table.containersTable.data.length; i++) {
                            if (JSON.stringify(this.table.containersTable.data[i]) !== JSON.stringify(this.table.containersTable.unchanged[i])) {
                                changeData.push(this.table.containersTable.data[i])
                            }
                        }
                        if (changeData.length > 0) {
                            try {
                                await this.$http.post(apiUrl + 'changeCn', {
                                    changeCn: changeData
                                })
                                this.refreshTableData()
                                this.tableEdit = true
                                this.$Message.success('save success')
                            } catch (error) {
                                this.$commonact.fault(error)
                            }
                        }
                    }
                }
            },
            doDeleteVoyageAct: function() {
                try {
                    let _self = this
                    if (_self.workPara.voyage_no !== _self.workPara.invoice_vessel_voyage) {
                        return _self.$Message.error('Please enter right Voyage No.')
                    }
                    _self.$commonact.confirm(`Delete the vessel?`, async() => {
                        try {
                            await _self.$http.post(apiUrl + 'deleteVoyage', {
                                invoice_vessel_id: _self.workPara.invoice_vessel_id
                            })
                            this.refreshTableData()
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
                this.$commonact.confirm(`SEND TO ICD?`, async() => {
                    try {
                        await this.$http.post(apiUrl + 'doCreateEdi', {
                            invoice_masterbi_id: row.invoice_masterbi_id
                        })
                        this.refreshTableData()
                        this.$Message.success('Send Edi Success')
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                })
            },
            doReplaceEdi: async function(row, index) {
                this.$commonact.confirm(`RESEND TO ICD?`, async() => {
                    try {
                        await this.$http.post(apiUrl + 'doReplaceEdi', {
                            invoice_masterbi_id: row.invoice_masterbi_id
                        })
                        this.refreshTableData()
                        this.$Message.success('Replace Edi Success')
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                })
            },
            doCancelEdi: async function(row, index) {
                this.$commonact.confirm(`CANCEL ICD?`, async() => {
                    try {
                        await this.$http.post(apiUrl + 'doCancelEdi', {
                            invoice_masterbi_id: row.invoice_masterbi_id
                        })
                        this.refreshTableData()
                        this.$Message.success('Cancel Edi Success')
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                })
            },
            searchFixedDeposit: async function() {
                try {
                    let response = await this.$http.post(apiUrl + 'searchFixedDeposit', _.extend(this.workPara, this.deposit))
                    let fixedDeposit = JSON.parse(JSON.stringify(response.data.info))
                    if (this.deposit.depositType === 'Invoice Fee') {
                        // Invoice Fee - Ocean
                        await this.resetInvoiceOcean(fixedDeposit)
                        // Invoice Fee
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_bl_amendment')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_cod_charge')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_transfer')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_lolf')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_lcl')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_amendment')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_tasac')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_printing')
                        await this.resetInvoiceFee(fixedDeposit, 'invoice_masterbi_others')
                    } else {
                        // container deposit
                        await this.resetInvoiceDeposit(fixedDeposit)
                    }
                    this.workPara.invoice_masterbi_customer_blacklist = fixedDeposit.invoice_masterbi_customer_blacklist
                    this.$forceUpdate()
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            resetInvoiceDeposit: async function(fixedDeposit) {
                this.workPara.invoice_masterbi_deposit_necessary_disabled = true
                if (fixedDeposit['invoice_masterbi_deposit_fixed'] && fixedDeposit['invoice_masterbi_deposit_fixed'] === '1') {
                    this.workPara.invoice_masterbi_deposit = fixedDeposit['invoice_masterbi_deposit']
                    this.workPara.invoice_container_deposit_currency = this.workPara.invoice_container_deposit_currency ? this.workPara.invoice_container_deposit_currency : fixedDeposit['invoice_container_deposit_currency']
                    this.workPara.invoice_masterbi_deposit_comment = this.workPara.invoice_masterbi_deposit_comment ? this.workPara.invoice_masterbi_deposit_comment : fixedDeposit['invoice_masterbi_deposit_comment']
                    this.workPara.invoice_masterbi_deposit_necessary = true
                    this.workPara.invoice_masterbi_deposit_fixed = '1'
                    this.workPara.invoice_masterbi_deposit_fixed_id = fixedDeposit['invoice_masterbi_deposit_fixed_id']
                } else if (fixedDeposit['invoice_masterbi_deposit_necessary']) {
                    if (fixedDeposit['invoice_masterbi_deposit_necessary'] === '1') {
                        this.workPara.invoice_masterbi_deposit = this.workPara.invoice_masterbi_deposit ? this.workPara.invoice_masterbi_deposit : fixedDeposit['invoice_masterbi_deposit']
                        this.workPara.invoice_container_deposit_currency = this.workPara.invoice_container_deposit_currency ? this.workPara.invoice_container_deposit_currency : fixedDeposit['invoice_container_deposit_currency']
                        this.workPara.invoice_masterbi_deposit_comment = this.workPara.invoice_masterbi_deposit_comment ? this.workPara.invoice_masterbi_deposit_comment : fixedDeposit['invoice_masterbi_deposit_comment']
                    } else {
                        this.workPara.invoice_container_deposit_currency = this.workPara.invoice_container_deposit_currency ? this.workPara.invoice_container_deposit_currency : 'USD'
                        this.workPara.invoice_masterbi_deposit_temp = fixedDeposit['invoice_masterbi_deposit']
                        this.workPara.invoice_container_deposit_currency_temp = fixedDeposit['invoice_container_deposit_currency']
                        this.workPara.invoice_masterbi_deposit_comment_temp = fixedDeposit['invoice_masterbi_deposit_comment']
                        this.workPara.invoice_masterbi_deposit_necessary_disabled = false
                    }
                    this.workPara.invoice_masterbi_deposit_fixed = '0'
                    this.workPara.invoice_masterbi_deposit_fixed_id = ''
                    this.workPara.invoice_masterbi_deposit_necessary = fixedDeposit['invoice_masterbi_deposit_necessary'] === '1' ? true : false
                    this.workPara.invoice_masterbi_deposit_type = fixedDeposit['invoice_masterbi_deposit_type']
                } else {
                    this.workPara.invoice_masterbi_deposit_necessary = false
                }
                this.workPara.invoice_masterbi_deposit_disabled = fixedDeposit['invoice_masterbi_deposit'] || fixedDeposit['invoice_masterbi_deposit'] >= 0 ? true : false
                this.workPara.invoice_container_deposit_currency_disabled = fixedDeposit['invoice_container_deposit_currency'] ? true : false
            },
            resetInvoiceOcean: async function(fixedDeposit) {
                this.workPara.invoice_masterbi_of_necessary_disabled = true
                if (fixedDeposit['invoice_masterbi_of_fixed'] && fixedDeposit['invoice_masterbi_of_fixed'] === '1') {
                    this.workPara.invoice_masterbi_of = fixedDeposit['invoice_masterbi_of']
                    this.workPara.invoice_masterbi_of_currency = this.workPara.invoice_masterbi_of_currency ? this.workPara.invoice_masterbi_of_currency : fixedDeposit['invoice_masterbi_of_currency']
                    this.workPara.invoice_masterbi_of_necessary = true
                    this.workPara.invoice_masterbi_of_fixed = '1'
                } else if (fixedDeposit['invoice_masterbi_of_necessary']) {
                    if (fixedDeposit['invoice_masterbi_of_necessary'] === '1') {
                        this.workPara.invoice_masterbi_of = this.workPara.invoice_masterbi_of ? this.workPara.invoice_masterbi_of : fixedDeposit['invoice_masterbi_of']
                        this.workPara.invoice_masterbi_of_currency = this.workPara.invoice_masterbi_of_currency ? this.workPara.invoice_masterbi_of_currency : fixedDeposit['invoice_masterbi_of_currency']
                        this.workPara.invoice_masterbi_of_necessary_disabled = true
                    } else {
                        this.workPara.invoice_masterbi_of_temp = fixedDeposit['invoice_masterbi_of']
                        this.workPara.invoice_masterbi_of_currency_temp = fixedDeposit['invoice_masterbi_of_currency']
                        this.workPara.invoice_masterbi_of_necessary_disabled = false
                    }
                    this.workPara.invoice_masterbi_of_type = fixedDeposit['invoice_masterbi_of_type']
                    this.workPara.invoice_masterbi_of_necessary = fixedDeposit['invoice_masterbi_of_necessary'] === '1' ? true : false
                } else {
                    this.workPara.invoice_masterbi_of_necessary = false
                }
                this.workPara.invoice_masterbi_of_disabled = fixedDeposit['invoice_masterbi_of'] ? true : false
                this.workPara.invoice_masterbi_of_currency_disabled = fixedDeposit['invoice_masterbi_of_currency'] ? true : false
            },
            resetInvoiceFee: async function(fixedDeposit, feeName) {
                this.workPara[feeName + '_necessary_disabled'] = true
                if (fixedDeposit[feeName + '_necessary']) {
                    this.workPara[feeName + '_type'] = fixedDeposit[feeName + '_type']
                    this.workPara[feeName + '_necessary'] = fixedDeposit[feeName + '_necessary'] === '1' ? true : false
                    if (fixedDeposit[feeName + '_necessary'] === '1') {
                        this.workPara[feeName] = this.workPara[feeName] ? this.workPara[feeName] : fixedDeposit[feeName]
                        this.workPara.invoice_fee_currency = this.workPara.invoice_fee_currency ? this.workPara.invoice_fee_currency : fixedDeposit['invoice_fee_currency']
                        this.workPara[feeName + '_necessary_disabled'] = true
                    } else {
                        this.workPara[feeName + '_temp'] = fixedDeposit[feeName]
                        this.workPara.invoice_fee_currency_temp = fixedDeposit['invoice_fee_currency']
                        this.workPara[feeName + '_necessary_disabled'] = false
                        if (this.workPara[feeName] && this.workPara[feeName] === fixedDeposit[feeName]) {
                            this.workPara[feeName + '_necessary'] = true
                        }
                    }
                }
                this.workPara[feeName + '_disabled'] = fixedDeposit[feeName] ? true : false
            },
            changeFixedAct: function(item) {
                if (this.workPara[item + '_necessary']) {
                    this.workPara[item] = this.workPara[item + '_temp']
                    this.workPara[item + '_currency'] = this.workPara[item + '_currency_temp']
                } else {
                    this.workPara[item] = ''
                    this.workPara[item + '_currency'] = ''
                }
            },
            changeDepositEdit: function() {
                if (this.depositEdit) {
                    try {
                        this.modal.checkPasswordModal = true
                        this.checkPassword = ''
                        this.checkPasswordType = 'depositEdit'
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                }
            },
            changeInvoiceFeeEdit: function() {
                if (this.invoiceFeeEdit) {
                    try {
                        this.modal.checkPasswordModal = true
                        this.checkPassword = ''
                        this.checkPasswordType = 'invoiceFeeEdit'
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                }
            },
            changeDoDeliverValidToEdit: function() {
                if (!this.doDeliverValidToEdit) {
                    try {
                        this.modal.checkPasswordModal = true
                        this.checkPassword = ''
                        this.checkPasswordType = 'doDeliverValidToEdit'
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                } else {
                    this.doDeliverValidToEdit = false
                }
            },
            deleteVesselAct: function(item) {
                try {
                    this.workPara = JSON.parse(JSON.stringify(item))
                    this.checkPassword = ''
                    this.modal.checkPasswordModal = true
                    this.checkPasswordType = 'doVesselDelete'
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            editVesselAct: function(item) {
                try {
                    this.$nextTick(function() {
                        this.resetVesselForm()
                        this.$refs['vesselForm'].resetFields()
                        this.vesselForm = JSON.parse(JSON.stringify(item))
                        this.checkPassword = ''
                        this.modal.checkPasswordModal = true
                        this.checkPasswordType = 'doVesselEdit'
                    })
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            actCheckPassword: async function() {
                try {
                    if (!this.checkPassword) {
                        return this.$Message.error('Please enter right password')
                    }
                    let action = ''
                    if (this.checkPasswordType === 'depositEdit' || this.checkPasswordType === 'depositModalCheck') {
                        action = 'IMPORT_DEPOSIT_EDIT'
                    } else if (this.checkPasswordType === 'invoiceFeeEdit') {
                        action = 'IMPORT_INVOICE_FEE_EDIT'
                    } else if (this.checkPasswordType === 'doVesselDelete' || this.checkPasswordType === 'doVesselEdit') {
                        action = 'IMPORT_VESSEL_EDIT'
                    } else if (this.checkPasswordType === 'doTableEdit') {
                        action = 'IMPORT_RELEASE_EDIT'
                    } else if (this.checkPasswordType === 'doDisabledChange') {
                        action = 'IMPORT_DO_STATE_EDIT'
                    } else if (this.checkPasswordType === 'downLoadDoModalCheck' || this.checkPasswordType === 'doDeliverValidToEdit' 
                                || this.checkPasswordType === 'downLoadDoDeliveryCheck') {
                        action = 'IMPORT_DO_EDIT'
                    } else if (this.checkPasswordType === 'doDeleteMasterbl') {
                        action = 'IMPORT_RELEASE_DELETE'
                    } else if (this.checkPasswordType === 'containersTypeChange') {
                        action = 'IMPORT_SOC_EDIT'
                    } 
                    let param = {
                        action: action,
                        checkPassword: common.md52(this.checkPassword)
                    }
                    await this.$http.post(apiUrl + 'checkPassword', param)
                    this.modal.checkPasswordModal = false
                    if (this.checkPasswordType === 'depositEdit') {
                        this.depositEdit = true
                    } if (this.checkPasswordType === 'invoiceFeeEdit') {
                        this.invoiceFeeEdit = true
                    } else if (this.checkPasswordType === 'doVesselDelete') {
                        this.modal.deleteVoyageModal = true
                    } else if (this.checkPasswordType === 'doVesselEdit') {
                        this.modal.editVesselModal = true
                    } else if (this.checkPasswordType === 'doTableEdit') {
                        this.tableEdit = false
                    } else if (this.checkPasswordType === 'doDeliverValidToEdit') {
                        this.doDeliverValidToEdit = true
                    } else if (this.checkPasswordType === 'downLoadDoModalCheck') {
                        this.actDownLoadDoModal(this.workPara)
                    } else if (this.checkPasswordType === 'doDisabledChange') {
                        this.changeDoDisabledAct(this.workPara)
                    } else if (this.checkPasswordType === 'depositModalCheck') {
                        this.actDepositModal(this.workPara)
                    } else if (this.checkPasswordType === 'doDeleteMasterbl') {
                        this.deleteMasterblAct(this.workPara)
                    } else if (this.checkPasswordType === 'containersTypeChange') {
                        this.changeContainersTypeAct(this.workPara)
                    } else if (this.checkPasswordType === 'downLoadDoDeliveryCheck') {
                        this.downloadDoAct()
                    } 
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            cancelCheckPassword: async function() {
                this.modal.checkPasswordModal = false
                this.depositEdit = false
                this.invoiceFeeEdit = false
                if (this.checkPasswordType === 'doDisabledChange' || this.checkPasswordType === 'containersTypeChange') {
                    this.refreshTableData()
                }
            },
            resetVesselForm: function() {
                this.vesselForm = {
                    invoice_vessel_id: '',
                    invoice_vessel_name: '',
                    invoice_vessel_code: '',
                    invoice_vessel_voyage: '',
                    invoice_vessel_eta: '',
                    invoice_vessel_ata: '',
                    invoice_vessel_atd: '',
                    invoice_vessel_call_sign: '',
                }
            },
            doEditVesselAct: async function() {
                this.$refs['vesselForm'].validate(async valid => {
                    if (valid) {
                        try {
                            await this.$http.post(apiUrl + 'doEditVessel', this.vesselForm)
                            this.refreshTableData()
                            this.modal.editVesselModal = false
                        } catch (error) {
                            this.$commonact.fault(error)
                        }
                    } else {
                        this.$Message.error('Validate Fail!')
                    }
                })
            },
            changeTableEdit: function() {
                if (this.tableEdit) {
                    try {
                        this.modal.checkPasswordModal = true
                        this.checkPassword = ''
                        this.checkPasswordType = 'doTableEdit'
                    } catch (error) {
                        this.$commonact.fault(error)
                    }
                } else {
                    this.tableEdit = true
                }
            },
            validToDateChange: async function(date) {
                this.workPara.invoice_masterbi_valid_to = date
            },
            vesselEtaDateChange: async function(date) {
                this.vesselForm.invoice_vessel_eta = date
            },
            vesselAtaDateChange: async function(date) {
                this.vesselForm.invoice_vessel_ata = date
            },
            vesselAtdDateChange: async function(date) {
                this.vesselForm.invoice_vessel_atd = date
            },
            changeDoDisabled: function(item) {
                try {
                    this.workPara = JSON.parse(JSON.stringify(item))
                    this.checkPassword = ''
                    this.modal.checkPasswordModal = true
                    this.checkPasswordType = 'doDisabledChange'
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            changeDoDisabledAct: async function(row) {
                try {
                    await this.$http.post(apiUrl + 'changeDoDisabled', row)
                    if (row.invoice_masterbi_do_disabled === '1') {
                        this.$Message.success('D/O disabled Success')
                    } else {
                        this.$Message.success('D/O enabled Success')
                    }
                    this.refreshTableData()
                } catch (error) {
                    if (row.invoice_masterbi_do_disabled === '1') {
                        row.invoice_masterbi_do_disabled = '0'
                    } else {
                        row.invoice_masterbi_do_disabled = '1'
                    }
                    this.$commonact.fault(error)
                }
            },
            deleteMasterbl: function(item) {
                try {
                    this.workPara = JSON.parse(JSON.stringify(item))
                    this.checkPassword = ''
                    this.modal.checkPasswordModal = true
                    this.checkPasswordType = 'doDeleteMasterbl'
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            deleteMasterblAct: async function(item) {
                try {
                    await this.$http.post(apiUrl + 'deleteMasterbl', item)
                    this.$Message.success('delete ' + item.invoice_masterbi_bl + ' success')
                    this.refreshTableData()
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            refreshTableData() {
                if (this.currentTab === 0) {
                    if (this.vessel.search_data.vesselName || this.vessel.search_data.bl) {
                        this.getVoyageData()
                    } else {
                        this.getMasterbiData(1)
                    }
                } else {
                    this.getContainersData(1)
                }
            },
            changeContainersType: function(item) {
                try {
                    this.workPara = JSON.parse(JSON.stringify(item))
                    this.checkPassword = ''
                    this.modal.checkPasswordModal = true
                    this.checkPasswordType = 'containersTypeChange'
                } catch (error) {
                    this.$commonact.fault(error)
                }
            },
            changeContainersTypeAct: async function(row) {
                try {
                    await this.$http.post(apiUrl + 'changeContainersType', row)
                    if (row.invoice_containers_type === 'S') {
                        this.$Message.success('SOC Success')
                    } else {
                        this.$Message.success('I/O Success')
                    }
                    this.refreshTableData()
                } catch (error) {
                    if (row.invoice_masterbi_do_disabled === 'S') {
                        row.invoice_masterbi_do_disabled = 'C'
                    } else {
                        row.invoice_masterbi_do_disabled = 'S'
                    }
                    this.$commonact.fault(error)
                }
            },
        }
    }
</script>