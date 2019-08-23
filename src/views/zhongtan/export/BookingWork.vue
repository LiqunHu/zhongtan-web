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
          <div class="form-inline clearfix">
            <div class="form-group m-r-2">
              <DatePicker type="daterange" :value="table.bookingTable.search_data.date" placeholder="Application Date" style="width: 200px" @on-change="searchData"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <Select v-model="table.bookingTable.search_data.billlading_state" style="width:180px">
                <Option v-for="item in pagePara.BLSTATUSINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select
                v-model="table.bookingTable.search_data.customer.value"
                filterable
                remote
                :remote-method="searchCustomer"
                :loading="table.bookingTable.search_data.customer.loading"
                placeholder="customer"
              >
                <Option v-for="item in table.bookingTable.search_data.customer.options" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Select
                v-model="table.bookingTable.search_data.vessel.value"
                filterable
                remote
                :remote-method="searchVessel"
                :loading="table.bookingTable.search_data.vessel.loading"
                placeholder="vessel"
              >
                <Option v-for="item in table.bookingTable.search_data.vessel.options" :value="item.id" :key="item.id">{{item.text}}</Option>
              </Select>
            </div>
            <div class="form-group m-r-2">
              <Input placeholder="S/O" v-model="table.bookingTable.search_data.search_text" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="getBookingData(1)">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="ml-auto">
              <div class="btn-group">
                <Dropdown class="btn btn-info">
                  <i class="fas fa-lg fa-fw fa-th"></i>
                  <Dropdown-menu slot="list">
                    <CheckboxGroup v-model="table.bookingTable.ColumnsChecked" @on-change="changeTableColumns">
                      <Checkbox label="Service" class="check-item"></Checkbox>
                      <Checkbox label="Book Date" class="check-item"></Checkbox>
                      <Checkbox label="Fee" class="check-item"></Checkbox>
                      <Checkbox label="Shipper" class="check-item"></Checkbox>
                      <Checkbox label="Declare Number" class="check-item"></Checkbox>
                      <Checkbox label="Files" class="check-item"></Checkbox>
                      <Checkbox label="Vessel" class="check-item"></Checkbox>
                      <Checkbox label="Voyage" class="check-item"></Checkbox>
                      <Checkbox label="Goods" class="check-item"></Checkbox>
                      <Checkbox label="Containers" class="check-item"></Checkbox>
                      <Checkbox label="Loading Port" class="check-item"></Checkbox>
                      <Checkbox label="Discharge Port" class="check-item"></Checkbox>
                      <Checkbox label="Delivery Place" class="check-item"></Checkbox>
                      <Checkbox label="Stuffing Place" class="check-item"></Checkbox>
                      <Checkbox label="Stuffing Date" class="check-item"></Checkbox>
                      <Checkbox label="Stuffing requirement" class="check-item"></Checkbox>
                      <Checkbox label="CSO" class="check-item"></Checkbox>
                      <Checkbox label="Shipper Name" class="check-item"></Checkbox>
                      <Checkbox label="Shipper Address" class="check-item"></Checkbox>
                      <Checkbox label="Shipper telephone" class="check-item"></Checkbox>
                      <Checkbox label="Consignee Name" class="check-item"></Checkbox>
                      <Checkbox label="Consignee Address" class="check-item"></Checkbox>
                      <Checkbox label="Consignee telephone" class="check-item"></Checkbox>
                      <Checkbox label="Notify Name" class="check-item"></Checkbox>
                      <Checkbox label="Notify Address" class="check-item"></Checkbox>
                      <Checkbox label="Notify telephone" class="check-item"></Checkbox>
                    </CheckboxGroup>
                  </Dropdown-menu>
                </Dropdown>
                <button class="btn btn-info" @click="downBooking">
                  <i class="fas fa-lg fa-fw fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <Table stripe size="small" ref="bookingTable" :columns="table.bookingTable.columns" :data="table.bookingTable.data" :height="table.bookingTable.height">
        <template slot-scope="{ row, index }" slot="edit">
          <Tooltip content="Edit bill lading">
            <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyBookingModal(row)">
              <i class="fa fa-edit"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Tooltip content="Cancel bill lading" v-if="row.billlading_state === 'PBK' || userInfo.user_service_name === 'ALL'">
            <a href="#" class="btn btn-danger btn-icon btn-sm" @click="cancelBooking(row)">
              <i class="fa fa-times"></i>
            </a>
          </Tooltip>
          <Tooltip content="Booking bill lading" v-if="row.billlading_state === 'PBK'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="confirmBookingModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip
            content="Download BOOKING APPLICATION"
            v-if="row.billlading_state !== 'PBK' && row.billlading_state !== 'IV' && row.billlading_state !== 'FBD' && row.billlading_state !== 'CP' && row.billlading_state !== 'SI'"
          >
            <a href="#" class="btn btn-green btn-icon btn-sm" @click="DownloadBooking(row)">
              <i class="fa fa-download"></i>
            </a>
          </Tooltip>
          <Tooltip content="Request container confirm" v-if="row.billlading_state === 'PA'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="pickUpEmptyConfirmModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Submit Loading List to Customs" v-if="row.billlading_state === 'SL'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="submitCustoms(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Reject Loading List" v-if="row.billlading_state === 'SL'">
            <a href="#" class="btn btn-yellow btn-icon btn-sm" @click="rejectLoadingModal(row)">
              <i class="fa fa-times"></i>
            </a>
          </Tooltip>
          <Tooltip content="Feedback Declare Number" v-if="row.billlading_state === 'SC'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="feedbackDeclareNumberModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Loading Permission" v-if="row.billlading_state === 'CA'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="loadingPermissionModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Send CDS" v-if="row.billlading_state === 'SI'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="sendCDS(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Feedback Billlading Draft" v-if="row.billlading_state === 'CP'||row.billlading_state === 'FBD'">
            <a href="#" class="btn btn-primary btn-icon btn-sm" @click="feedbackBLDraftModal(row)">
              <i class="fa fa-dot-circle"></i>
            </a>
          </Tooltip>
          <Tooltip content="Generate Invoice" v-if="row.billlading_state === 'FBD'">
            <a href="#" class="btn btn-success btn-icon btn-sm" @click="generateInvoiceModal(row)">
              <i class="fa fa-money-bill-alt"></i>
            </a>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="fees">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="200">
            <Button type="text" style="text-decoration:underline">{{row.fees.sum_fee}}</Button>
            <template slot="content">
              FREIGHT: {{row.fees.billlading_invoice_freight}}
              <br />
              B/LANDING: {{row.fees.billlading_invoice_blanding}}
              <br />
              TASAC: {{row.fees.billlading_invoice_tasac}}
              <br />
              AMMENDMENT FEE: {{row.fees.billlading_invoice_ammendment}}
              <br />
              ISP: {{row.fees.billlading_invoice_isp}}
              <br />
              SURCHAGE: {{row.fees.billlading_invoice_surchage}}
              <br />
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="customerINFO">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="300">
            <Button type="text" style="text-decoration:underline">{{row.customerINFO.name}}</Button>
            <template slot="content">
              Phone: {{row.customerINFO.phone}}
              <br />
              Email: {{row.customerINFO.email}}
              <br />
              Address: {{row.customerINFO.address}}
              <br />
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="files">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="555">
            <Button type="text" style="text-decoration:underline">Files</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.filesTable.columns" :data="row.files">
                <template slot-scope="{ row, index }" slot="url">
                  <a :href="row.url" class="btn btn-primary btn-icon btn-sm" target="_blank">
                    <i class="fa fa-download"></i>
                  </a>
                </template>
              </Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_voyage_id">
          <Select v-model="row.billlading_voyage_id" disabled>
            <Option v-for="item in row.VoyageINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_goods">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="800">
            <Button type="text" style="text-decoration:underline">Goods</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.poptipGoodsTable.columns" :data="row.billlading_goods"></Table>
            </template>
          </Poptip>
        </template>
        <template slot-scope="{ row, index }" slot="billlading_containers">
          <Poptip trigger="hover" placement="bottom" :transfer="true" width="800">
            <Button type="text" style="text-decoration:underline">Containers</Button>
            <template slot="content">
              <Table stripe size="small" :columns="table.poptipContainerTable.columns" :data="row.billlading_containers"></Table>
            </template>
          </Poptip>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.bookingTable.total" :page-size="table.bookingTable.limit" @on-change="getBookingData" />
    </panel>
    <Modal v-model="modal.bookingModal" title="Booking" width="800">
      <div style="height: 600px">
        <vue-scroll>
          <Form :model="workPara" :label-width="120" :rules="formRule.ruleBookingModal" ref="formBooking">
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
            <Divider />
            <Row>
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Shipper (Name & Address)</b>
                </h4>
                <FormItem label="Name" prop="billlading_shipper_name">
                  <Input placeholder="Name" v-model="workPara.billlading_shipper_name" />
                </FormItem>
                <FormItem label="Address" prop="billlading_shipper_address">
                  <Input type="textarea" :rows="2" placeholder="Address" v-model="workPara.billlading_shipper_address" />
                </FormItem>
                <FormItem label="telephone" prop="billlading_shipper_tel">
                  <Input placeholder="telephone" v-model="workPara.billlading_shipper_tel" />
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <strong>
                  <h4>CHINESE-TANZANIAN JOINT SHIPPING COMPANY.</h4>
                  <br />
                  <br />31, KISUTU ROAD
                  <br />P. O. Box – 696, Dar Es Salaam, Tanzania.
                  <br />Tel: +255 (22) 2113389
                  <br />Fax: +255 (22) 2113388
                </strong>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Consignee (Name & Address)</b>
                </h4>
                <FormItem label="Name" prop="billlading_consignee_name">
                  <Input placeholder="Name" v-model="workPara.billlading_consignee_name" />
                </FormItem>
                <FormItem label="Address" prop="billlading_consignee_address">
                  <Input type="textarea" :rows="2" placeholder="Address" v-model="workPara.billlading_consignee_address" />
                </FormItem>
                <FormItem label="telephone" prop="billlading_consignee_tel">
                  <Input placeholder="telephone" v-model="workPara.billlading_consignee_tel" />
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
                  <Input placeholder="Name" v-model="workPara.billlading_notify_name" />
                </FormItem>
                <FormItem label="Address" prop="billlading_notify_address">
                  <Input type="textarea" :rows="2" placeholder="Address" v-model="workPara.billlading_notify_address" />
                </FormItem>
                <FormItem label="telephone" prop="billlading_notify_tel">
                  <Input placeholder="telephone" v-model="workPara.billlading_notify_tel" />
                </FormItem>
              </Col>
            </Row>
            <Divider />
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
                  <Input type="textarea" :rows="2" placeholder="Place of Deliver" v-model="workPara.billlading_delivery_place" />
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <FormItem label="CSO" prop="billlading_cso">
                  <Input placeholder="CSO" v-model="workPara.billlading_cso" />
                </FormItem>
                <FormItem label="No of Original B/L" prop="billlading_original_num">
                  <Input placeholder="No of Original B/L" v-model="workPara.billlading_original_num" />
                </FormItem>
                <FormItem label="No of Copies B/L" prop="billlading_copys_num">
                  <Input placeholder="No of Copies B/L" v-model="workPara.billlading_copys_num" />
                </FormItem>
              </Col>
            </Row>
            <Divider />
            <div style="width: 700px">
              <Row v-if="workPara.billlading_state === 'PBK'">
                <Col span="24">
                  <h4 class="text-middle m-b-10">
                    <b>Cargo Description</b>
                  </h4>
                  <Table stripe size="small" ref="goodsTable" :columns="table.goodsTable.columns" :data="table.goodsTable.data">
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_number">
                      <Input v-model="row.billlading_goods_container_number" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_type">
                      <Select :transfer="true" v-model="row.billlading_goods_container_type" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_container_size">
                      <Select :transfer="true" v-model="row.billlading_goods_container_size" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_type">
                      <Input v-model="row.billlading_goods_type" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_description">
                      <Input v-model="row.billlading_goods_description" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_package_number">
                      <Input v-model="row.billlading_goods_package_number" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_package_unit">
                      <Select :transfer="true" v-model="row.billlading_goods_package_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_volume">
                      <Input v-model="row.billlading_goods_gross_volume" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_volume_unit">
                      <Select :transfer="true" v-model="row.billlading_goods_gross_volume_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_weight">
                      <Input v-model="row.billlading_goods_gross_weight" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_gross_unit">
                      <Select :transfer="true" v-model="row.billlading_goods_gross_unit" @on-change="table.goodsTable.data[index] = row">
                        <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_net_weight">
                      <Input v-model="row.billlading_goods_net_weight" @on-blur="table.goodsTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="billlading_goods_net_unit">
                      <Select :transfer="true" v-model="row.billlading_goods_net_unit" @on-change="table.goodsTable.data[index] = row">
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
                  <Table stripe size="small" ref="containerTable" :columns="table.containerTable.columns" :data="table.containerTable.data">
                    <template slot-scope="{ row, index }" slot="container_no">
                      <Input v-model="row.container_no" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_type">
                      <Select :transfer="true" v-model="row.container_type" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerTypeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_size">
                      <Select :transfer="true" v-model="row.container_size" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.ContainerSizeINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_goods_type">
                      <Input v-model="row.container_goods_type" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_goods_description">
                      <Input v-model="row.container_goods_description" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_seal_no1">
                      <Input v-model="row.container_seal_no1" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_freight_indicator">
                      <Input v-model="row.container_freight_indicator" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_package_no">
                      <Input v-model="row.container_package_no" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_package_unit">
                      <Select :transfer="true" v-model="row.container_package_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.PackageUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_volume">
                      <Input v-model="row.container_volume" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_volume_unit">
                      <Select :transfer="true" v-model="row.container_volume_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.VolumeUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_weight">
                      <Input v-model="row.container_weight" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_weight_unit">
                      <Select :transfer="true" v-model="row.container_weight_unit" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.WeightUnitINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                    <template slot-scope="{ row, index }" slot="container_minmum_temperature">
                      <Input v-model="row.container_minmum_temperature" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_maxmum_temperature">
                      <Input v-model="row.container_maxmum_temperature" @on-blur="table.containerTable.data[index] = row" />
                    </template>
                    <template slot-scope="{ row, index }" slot="container_refer_plug">
                      <Select :transfer="true" v-model="row.container_refer_plug" @on-change="table.containerTable.data[index] = row">
                        <Option v-for="item in pagePara.YNINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                      </Select>
                    </template>
                  </Table>
                </Col>
              </Row>
            </div>
            <Divider />
            <Row>
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Stuffing & Equipment</b>
                </h4>
                <FormItem label="Place" prop="billlading_stuffing_place">
                  <Input placeholder="Place" v-model="workPara.billlading_stuffing_place" />
                </FormItem>
                <FormItem label="Expected date" prop="billlading_stuffing_date">
                  <DatePicker type="date" placement="top" v-model="workPara.billlading_stuffing_date"></DatePicker>
                </FormItem>
                <FormItem label="Special requirement" prop="billlading_stuffing_requirement">
                  <Input type="textarea" :rows="2" placeholder="Special requirement" v-model="workPara.billlading_stuffing_requirement" />
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <h4 class="text-middle m-b-10">
                  <b>Payment</b>
                </h4>
                <FormItem label="Forwarder" prop="billlading_forwarder_name">
                  <Input placeholder="Forwarder" v-model="workPara.billlading_forwarder_name" />
                </FormItem>
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
            <Divider />
            <Row v-if="userInfo.user_service_name === 'ALL'">
              <Col span="9">
                <h4 class="text-middle m-b-10">
                  <b>Important</b>
                </h4>
                <FormItem label="Status" prop="billlading_state">
                  <Select placement="top" v-model="workPara.billlading_state">
                    <Option v-for="item in pagePara.BLSTATUSINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="BL. No" prop="billlading_no">
                  <Input placeholder="BL. No" v-model="workPara.billlading_no" />
                </FormItem>
              </Col>
              <Col offset="3" span="9">
                <h4 class="text-middle m-b-10">
                  <b>Fee</b>
                </h4>
                <FormItem label="FREIGHT" prop="billlading_invoice_freight_f">
                  <Input placeholder="FREIGHT" v-model="workPara.billlading_invoice_freight_f" />
                </FormItem>
                <FormItem label="B/LANDING" prop="billlading_feu_standard_f">
                  <Input placeholder="B/LANDING" v-model="workPara.billlading_invoice_blanding_f" />
                </FormItem>
                <FormItem label="TASAC" prop="billlading_invoice_tasac_f">
                  <Input placeholder="TASAC" v-model="workPara.billlading_invoice_tasac_f" />
                </FormItem>
                <FormItem label="AMMENDMENT FEE" prop="billlading_invoice_ammendment_f">
                  <Input placeholder="AMMENDMENT FEE" v-model="workPara.billlading_invoice_ammendment_f" />
                </FormItem>
                <FormItem label="ISP" prop="billlading_invoice_isp_f">
                  <Input placeholder="ISP" v-model="workPara.billlading_invoice_isp_f" />
                </FormItem>
                <FormItem label="SURCHAGE" prop="billlading_invoice_surchage_f">
                  <Input placeholder="SURCHAGE" v-model="workPara.billlading_invoice_surchage_f" />
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
    <Modal v-model="modal.confirmBookingModal" title="Booking">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleConfirmBookingModal" ref="formConfirmBooking">
        <FormItem label="Vessel" prop="billlading_vessel_id">
          <Select v-model="workPara.billlading_vessel_id" @on-change="vesselChange">
            <Option v-for="item in pagePara.VesselINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Voyage" prop="billlading_voyage_id">
          <Select v-model="workPara.billlading_voyage_id">
            <Option v-for="item in VoyageINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Billlading No." prop="billlading_no">
          <Input placeholder="Billlading No." v-model="workPara.billlading_no" />
        </FormItem>
        <FormItem label="CSO" prop="billlading_cso">
          <Input placeholder="CSO" v-model="workPara.billlading_cso" />
        </FormItem>
        <FormItem label="FREIGHT" prop="billlading_invoice_freight">
          <Input placeholder="FREIGHT" v-model="workPara.billlading_invoice_freight" />
        </FormItem>
        <FormItem label="B/LANDING" prop="billlading_invoice_blanding">
          <Input placeholder="B/LANDING" v-model="workPara.billlading_invoice_blanding" />
        </FormItem>
        <FormItem label="TASAC" prop="billlading_invoice_tasac">
          <Input placeholder="TASAC" v-model="workPara.billlading_invoice_tasac" />
        </FormItem>
        <FormItem label="AMMENDMENT FEE" prop="billlading_invoice_ammendment">
          <Input placeholder="AMMENDMENT FEE" v-model="workPara.billlading_invoice_ammendment" />
        </FormItem>
        <FormItem label="ISP" prop="billlading_invoice_isp">
          <Input placeholder="ISP" v-model="workPara.billlading_invoice_isp" />
        </FormItem>
        <FormItem label="SURCHAGE" prop="billlading_invoice_surchage">
          <Input placeholder="SURCHAGE" v-model="workPara.billlading_invoice_surchage" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.confirmBookingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="confirmBookingAct">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.pickUpEmptyConfirmModal" title="Booking">
      <Form :model="workPara" :label-width="120" :rules="formRule.rulePickUpEmptyConfirmModal" ref="formPickUpEmptyConfirm">
        <FormItem label="Continer Manager" prop="container_manager_id">
          <Select v-model="workPara.container_manager_id">
            <Option v-for="item in pagePara.ContainerManagerINFO" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.pickUpEmptyConfirmModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="pickUpEmptyConfirm">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.rejectLoadingModal" title="Reject Loading">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleRejectLoadingModal" ref="formRejectLoading">
        <FormItem label="Reject Reason" prop="reject_reason">
          <Input type="textarea" :rows="2" placeholder="Reject Reason" v-model="workPara.reject_reason" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.rejectLoadingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="rejectLoading">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.feedbackDeclareNumberModal" title="Revert Declare Number">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleRevertDeclareNumberModal" ref="formRevertDeclareNumber">
        <FormItem label="Declare Number" prop="billlading_declare_number">
          <Input :rows="2" placeholder="Declare Number" v-model="workPara.billlading_declare_number" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.feedbackDeclareNumberModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="feedbackDeclareNumber">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.loadingPermissionModal" title="Loading Permission">
      <div v-for="f in files" v-bind:key="f.name" class="upload-list">
        <Icon type="ios-document" size="60" />
      </div>
      <Upload
        ref="upload"
        :headers="headers"
        :show-upload-list="false"
        :on-success="handleSuccess"
        :format="['pdf']"
        :max-size="4096"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        type="drag"
        action="/api/zhongtan/export/BookingWork/upload"
        style="display: inline-block;width:58px;"
      >
        <div style="width: 58px;height:58px;line-height: 58px;">
          <Icon type="md-add" size="20"></Icon>
        </div>
      </Upload>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.loadingPermissionModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="loadingPermission">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.feedbackBLDraftModal" title="Billlading Draft">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Remark" prop="uploadfile_remark">
          <Input type="textarea" :rows="4" placeholder="Remark" v-model="workPara.uploadfile_remark" />
        </FormItem>
        <FormItem label="Files">
          <div v-for="f in files" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="blupload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleBLSuccess"
            :format="['pdf']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/export/BookingWork/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.feedbackBLDraftModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="feedbackBLDraft">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.generateInvoiceModal" title="Generate Invoice">
      <Form :model="workPara" :label-width="150" :rules="formRule.ruleGenerateInvoiceModal" ref="generateInvoice">
        <h4 class="text-middle m-b-10">
          <b>Invoice</b>
        </h4>
        <FormItem label="FREIGHT" prop="billlading_invoice_freight">
          <Input placeholder="FREIGHT" v-model="workPara.billlading_invoice_freight" />
        </FormItem>
        <FormItem label="B/LANDING" prop="billlading_invoice_blanding">
          <Input placeholder="B/LANDING" v-model="workPara.billlading_invoice_blanding" />
        </FormItem>
        <FormItem label="TASAC" prop="billlading_invoice_tasac">
          <Input placeholder="TASAC" v-model="workPara.billlading_invoice_tasac" />
        </FormItem>
        <FormItem label="AMMENDMENT FEE" prop="billlading_invoice_ammendment">
          <Input placeholder="AMMENDMENT FEE" v-model="workPara.billlading_invoice_ammendment" />
        </FormItem>
        <FormItem label="ISP" prop="billlading_invoice_isp">
          <Input placeholder="ISP" v-model="workPara.billlading_invoice_isp" />
        </FormItem>
        <FormItem label="SURCHAGE" prop="billlading_invoice_surchage">
          <Input placeholder="SURCHAGE" v-model="workPara.billlading_invoice_surchage" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.generateInvoiceModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="generateInvoice">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/BookingWork/'

export default {
  name: 'BookingWork',
  data: function() {
    return {
      modal: {
        bookingModal: false,
        confirmBookingModal: false,
        pickUpEmptyConfirmModal: false,
        loadingPermissionModal: false,
        rejectLoadingModal: false,
        feedbackDeclareNumberModal: false,
        feedbackBLDraftModal: false,
        generateInvoiceModal: false
      },
      table: {
        bookingTable: {
          fixColumns: [
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
              width: 130,
              fixed: 'left'
            },
            {
              title: 'S/O',
              key: 'billlading_no',
              width: 150,
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
            }
          ],
          fullColumns: [
            {
              title: 'Service',
              key: 'billlading_service_name',
              render: common.selectRender(this, 'VesselServiceINFO'),
              width: 100
            },
            {
              title: 'Book Date',
              key: 'booking_date',
              width: 100
            },
            {
              title: 'Fee',
              slot: 'fees',
              width: 120
            },
            {
              title: 'Customer',
              slot: 'CustomerINFO',
              width: 100
            },
            {
              title: 'Declare Number',
              key: 'billlading_declare_number',
              render: common.tooltipRender(),
              width: 120
            },
            {
              title: 'Files',
              slot: 'files',
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
              title: 'Containers',
              slot: 'billlading_containers',
              width: 120
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
              width: 130
            },
            {
              title: 'Stuffing Place',
              key: 'billlading_stuffing_place',
              render: common.tooltipRender(),
              width: 120
            },
            {
              title: 'Stuffing Date',
              key: 'billlading_stuffing_date',
              width: 120
            },
            {
              title: 'Stuffing requirement',
              key: 'billlading_stuffing_requirement',
              render: common.tooltipRender(),
              width: 170
            },
            {
              title: 'CSO',
              key: 'billlading_cso',
              width: 120
            },
            {
              title: 'Shipper Name',
              key: 'billlading_shipper_name',
              render: common.tooltipRender(),
              width: 140
            },
            {
              title: 'Shipper Address',
              key: 'billlading_shipper_address',
              render: common.tooltipRender(),
              width: 150
            },
            {
              title: 'Shipper telephone',
              key: 'billlading_shipper_tel',
              width: 170
            },
            {
              title: 'Consignee Name',
              key: 'billlading_consignee_name',
              render: common.tooltipRender(),
              width: 140
            },
            {
              title: 'Consignee Address',
              key: 'billlading_consignee_address',
              render: common.tooltipRender(),
              width: 150
            },
            {
              title: 'Consignee telephone',
              key: 'billlading_consignee_tel',
              width: 170
            },
            {
              title: 'Notify Name',
              key: 'billlading_notify_name',
              render: common.tooltipRender(),
              width: 130
            },
            {
              title: 'Notify Address',
              key: 'billlading_notify_address',
              render: common.tooltipRender(),
              width: 130
            },
            {
              title: 'Notify telephone',
              key: 'billlading_notify_tel',
              width: 140
            }
          ],
          columns: [
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
              width: 130,
              fixed: 'left'
            },
            {
              title: 'S/O',
              key: 'billlading_no',
              width: 150,
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
              title: 'Service',
              key: 'billlading_service_name',
              render: common.selectRender(this, 'VesselServiceINFO'),
              width: 100
            },
            {
              title: 'Book Date',
              key: 'booking_date',
              width: 100
            },
            {
              title: 'Fee',
              slot: 'fees',
              width: 120
            },
            {
              title: 'Customer',
              slot: 'customerINFO',
              width: 100
            },
            {
              title: 'Declare Number',
              key: 'billlading_declare_number',
              render: common.tooltipRender(),
              width: 120
            },
            {
              title: 'Files',
              slot: 'files',
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
              title: 'Containers',
              slot: 'billlading_containers',
              width: 120
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
              width: 130
            },
            {
              title: 'Stuffing Place',
              key: 'billlading_stuffing_place',
              render: common.tooltipRender(),
              width: 120
            },
            {
              title: 'Stuffing Date',
              key: 'billlading_stuffing_date',
              width: 120
            },
            {
              title: 'Stuffing requirement',
              key: 'billlading_stuffing_requirement',
              render: common.tooltipRender(),
              width: 170
            },
            {
              title: 'CSO',
              key: 'billlading_cso',
              width: 120
            },
            {
              title: 'Shipper Name',
              key: 'billlading_shipper_name',
              render: common.tooltipRender(),
              width: 140
            },
            {
              title: 'Shipper Address',
              key: 'billlading_shipper_address',
              render: common.tooltipRender(),
              width: 150
            },
            {
              title: 'Shipper telephone',
              key: 'billlading_shipper_tel',
              width: 170
            },
            {
              title: 'Consignee Name',
              key: 'billlading_consignee_name',
              render: common.tooltipRender(),
              width: 140
            },
            {
              title: 'Consignee Address',
              key: 'billlading_consignee_address',
              render: common.tooltipRender(),
              width: 150
            },
            {
              title: 'Consignee telephone',
              key: 'billlading_consignee_tel',
              width: 170
            },
            {
              title: 'Notify Name',
              key: 'billlading_notify_name',
              render: common.tooltipRender(),
              width: 130
            },
            {
              title: 'Notify Address',
              key: 'billlading_notify_address',
              render: common.tooltipRender(),
              width: 130
            },
            {
              title: 'Notify telephone',
              key: 'billlading_notify_tel',
              width: 140
            }
          ],
          ColumnsChecked: [
            'Service',
            'Book Date',
            'Fee',
            'Shipper',
            'Declare Number',
            'Files',
            'Vessel',
            'Voyage',
            'Goods',
            'Containers',
            'Loading Port',
            'Discharge Port',
            'Delivery Place',
            'Stuffing Place',
            'Stuffing Date',
            'Stuffing requirement',
            'CSO',
            'Shipper Name',
            'Shipper Address',
            'Shipper telephone',
            'Consignee Name',
            'Consignee Address',
            'Consignee telephone',
            'Notify Name',
            'Notify Address',
            'Notify telephone'
          ],
          data: [],
          height: common.getTableHeight(),
          limit: 10,
          offset: 0,
          total: 0,
          search_data: {
            date: [
              moment()
                .subtract(30, 'days')
                .format('YYYY-MM-DD'),
              moment().format('YYYY-MM-DD')
            ],
            customer: {
              options: [],
              value: '',
              loading: false
            },
            vessel: {
              options: [],
              value: '',
              loading: false
            },
            billlading_state: '',
            search_text: ''
          }
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
              width: 150
            },
            {
              title: 'Name',
              key: 'name',
              render: common.tooltipRender(),
              width: 100
            },
            {
              title: 'Download',
              slot: 'url',
              width: 100
            },
            {
              title: 'Remark',
              key: 'remark',
              render: common.tooltipRender(),
              width: 100
            }
          ]
        },
        goodsTable: {
          columns: [
            {
              title: 'Vol.',
              slot: 'billlading_goods_container_number',
              width: 100
            },
            {
              title: 'Size',
              slot: 'billlading_goods_container_size',
              width: 120
            },
            {
              title: 'Type',
              slot: 'billlading_goods_container_type',
              width: 120
            },
            {
              title: 'Goods Type',
              slot: 'billlading_goods_type',
              width: 120
            },
            {
              title: 'Description',
              slot: 'billlading_goods_description',
              width: 120
            },
            {
              title: 'Package No',
              slot: 'billlading_goods_package_number',
              width: 120
            },
            {
              title: 'Package Unit',
              slot: 'billlading_goods_package_unit',
              width: 120
            },
            {
              title: 'Volume',
              slot: 'billlading_goods_gross_volume',
              width: 120
            },
            {
              title: 'Volume Unit',
              slot: 'billlading_goods_gross_volume_unit',
              width: 120
            },
            {
              title: 'Weight',
              slot: 'billlading_goods_gross_weight',
              width: 120
            },
            {
              title: 'Weight Unit',
              slot: 'billlading_goods_gross_unit',
              width: 120
            },
            {
              title: 'Net Weight',
              slot: 'billlading_goods_net_weight',
              width: 120
            },
            {
              title: 'Net Unit',
              slot: 'billlading_goods_net_unit',
              width: 120
            },
            {
              title: 'Action',
              slot: 'action',
              width: 130
            }
          ],
          data: []
        },
        containerTable: {
          columns: [
            {
              title: 'Container No.',
              slot: 'container_no',
              width: 100
            },
            {
              title: 'Size',
              slot: 'container_size',
              width: 120
            },
            {
              title: 'Type',
              slot: 'container_type',
              width: 120
            },
            {
              title: 'Goods Type',
              slot: 'container_goods_type',
              width: 120
            },
            {
              title: 'Description',
              slot: 'container_goods_description',
              width: 120
            },
            {
              title: 'Seal No.',
              slot: 'container_seal_no1',
              width: 120
            },
            {
              title: 'Freight Indicator',
              slot: 'container_freight_indicator',
              width: 150
            },
            {
              title: 'Package No',
              slot: 'container_package_no',
              width: 120
            },
            {
              title: 'Package Unit',
              slot: 'container_package_unit',
              width: 120
            },
            {
              title: 'Volume',
              slot: 'container_volume',
              width: 120
            },
            {
              title: 'Volume Unit',
              slot: 'container_volume_unit',
              width: 120
            },
            {
              title: 'Weight',
              slot: 'container_weight',
              width: 100
            },
            {
              title: 'Weight Unit',
              slot: 'container_weight_unit',
              width: 120
            },
            {
              title: 'Min Temperature',
              slot: 'container_minmum_temperature',
              width: 150
            },
            {
              title: 'Max Temperature',
              slot: 'container_maxmum_temperature',
              width: 150
            },
            {
              title: 'Refer Plug',
              slot: 'container_refer_plug',
              width: 120
            }
          ],
          data: []
        },
        poptipGoodsTable: {
          columns: [
            {
              title: 'Vol.',
              key: 'billlading_goods_container_number',
              width: 100
            },
            {
              title: 'Size',
              key: 'billlading_goods_container_size',
              render: common.selectRender(this, 'ContainerSizeINFO'),
              width: 100
            },
            {
              title: 'Type',
              key: 'billlading_goods_container_type',
              render: common.selectRender(this, 'ContainerTypeINFO'),
              width: 100
            },
            {
              title: 'Goods Type',
              key: 'billlading_goods_type',
              width: 120
            },
            {
              title: 'Description',
              key: 'billlading_goods_description',
              render: common.tooltipRender(),
              width: 120
            },
            {
              title: 'Package No',
              key: 'billlading_goods_package_number',
              width: 120
            },
            {
              title: 'Package Unit',
              key: 'billlading_goods_package_unit',
              render: common.selectRender(this, 'PackageUnitINFO'),
              width: 130
            },
            {
              title: 'Volume',
              key: 'billlading_goods_gross_volume',
              width: 100
            },
            {
              title: 'Volume Unit',
              key: 'billlading_goods_gross_volume_unit',
              render: common.selectRender(this, 'VolumeUnitINFO'),
              width: 120
            },
            {
              title: 'Gross Weight',
              key: 'billlading_goods_gross_weight',
              width: 130
            },
            {
              title: 'Gross Unit',
              key: 'billlading_goods_gross_unit',
              render: common.selectRender(this, 'WeightUnitINFO'),
              width: 100
            },
            {
              title: 'Net Weight',
              key: 'billlading_goods_net_weight',
              width: 120
            },
            {
              title: 'Net Unit',
              key: 'billlading_goods_net_unit',
              render: common.selectRender(this, 'WeightUnitINFO'),
              width: 100
            }
          ]
        },
        poptipContainerTable: {
          columns: [
            {
              title: 'Container No.',
              key: 'container_no',
              width: 140
            },
            {
              title: 'Size',
              key: 'container_size',
              render: common.selectRender(this, 'ContainerSizeINFO'),
              width: 100
            },
            {
              title: 'Type',
              key: 'container_type',
              render: common.selectRender(this, 'ContainerTypeINFO'),
              width: 100
            },
            {
              title: 'Goods Type',
              key: 'container_goods_type',
              width: 120
            },
            {
              title: 'Description.',
              key: 'billlading_goods_description',
              width: 120
            },
            {
              title: 'Seal No.',
              key: 'container_seal_no1',
              width: 100
            },
            {
              title: 'Freight Indicator',
              key: 'container_freight_indicator',
              width: 150
            },
            {
              title: 'Package No',
              key: 'container_package_no',
              width: 120
            },
            {
              title: 'Package Unit',
              key: 'container_package_unit',
              render: common.selectRender(this, 'PackageUnitINFO'),
              width: 120
            },
            {
              title: 'Volume',
              key: 'container_volume',
              width: 100
            },
            {
              title: 'Volume Unit',
              key: 'container_volume_unit',
              render: common.selectRender(this, 'VolumeUnitINFO'),
              width: 120
            },
            {
              title: 'Weight',
              key: 'container_weight',
              width: 100
            },
            {
              title: 'Weight Unit',
              key: 'container_weight_unit',
              render: common.selectRender(this, 'WeightUnitINFO'),
              width: 120
            },
            {
              title: 'Min Temperature',
              key: 'container_minmum_temperature',
              width: 150
            },
            {
              title: 'Max Temperature',
              key: 'container_maxmum_temperature',
              width: 150
            },
            {
              title: 'Refer Plug',
              key: 'container_refer_plug',
              render: common.selectRender(this, 'YNINFO'),
              width: 100
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
          billlading_forwarder_name: [{ required: true, trigger: 'change', message: 'Choose Status' }],
          billlading_freight_currency: [{ required: true, trigger: 'change', message: 'Choose Status' }]
        },
        ruleConfirmBookingModal: {
          billlading_vessel_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose vessel' }],
          billlading_voyage_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose voyage' }],
          billlading_no: [{ required: true, trigger: 'change', message: 'Enter BL NO.' }],
          billlading_freight_currency: [{ required: true, trigger: 'change', message: 'Choose Currency' }],
          billlading_freight_charge: [{ required: true, trigger: 'change', message: 'Enter Freight Charge' }],
          billlading_cso: [{ required: true, trigger: 'change', message: 'Enter CSO' }]
        },
        rulePickUpEmptyConfirmModal: {
          container_manager_id: [{ required: true, type: 'number', trigger: 'change', message: 'Choose Continer Manager' }]
        },
        ruleRevertDeclareNumberModal: {
          billlading_declare_number: [{ required: true, trigger: 'change', message: 'Enter Declare Number' }]
        },
        ruleGenerateInvoiceModal: {
          billlading_invoice_freight: [{ required: true, trigger: 'change', message: 'Enter FREIGHT' }],
          billlading_invoice_blanding: [{ required: true, trigger: 'change', message: 'Enter B/LANDING' }],
          billlading_invoice_tasac: [{ required: true, trigger: 'change', message: 'Enter TASAC' }],
          billlading_invoice_ammendment: [{ required: true, trigger: 'change', message: 'Enter AMMENDMENT FEE' }],
          billlading_invoice_isp: [{ required: true, trigger: 'change', message: 'Enter ISP' }],
          billlading_invoice_surchage: [{ required: true, trigger: 'change', message: 'Enter SURCHAGE' }]
        }
      },
      pagePara: {},
      VoyageINFO: [],
      oldPara: {},
      workPara: {},
      action: '',
      files: [],
      a: true,
      headers: common.uploadHeaders()
    }
  },
  computed: {
    ...mapState('access', {
      userInfo: state => state.userInfo
    })
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
    searchData: function(e) {
      this.table.bookingTable.search_data.date = JSON.parse(JSON.stringify(e))
    },
    searchCustomer: async function(query) {
      if (query !== '') {
        this.table.bookingTable.search_data.customer.loading = true
        let response = await this.$http.post(apiUrl + 'searchCustomer', {
          search_text: query
        })
        this.table.bookingTable.search_data.customer.options = JSON.parse(JSON.stringify(response.data.info.customerINFO))
        this.table.bookingTable.search_data.customer.loading = false
      } else {
        this.table.bookingTable.search_data.customer.options = []
      }
    },
    searchVessel: async function(query) {
      if (query !== '') {
        this.table.bookingTable.search_data.vessel.loading = true
        let response = await this.$http.post(apiUrl + 'searchVessel', {
          search_text: query
        })
        this.table.bookingTable.search_data.vessel.options = JSON.parse(JSON.stringify(response.data.info.VesselINFO))
        this.table.bookingTable.search_data.vessel.loading = false
      } else {
        this.table.bookingTable.search_data.vessel.options = []
      }
    },
    downBooking: function() {
      this.$refs.bookingTable.exportCsv({
        filename: 'Booking List'
      })
    },
    changeTableColumns: function() {
      this.table.bookingTable.columns = JSON.parse(JSON.stringify(this.table.bookingTable.fixColumns))
      for (let c of this.table.bookingTable.fullColumns) {
        if (this.table.bookingTable.ColumnsChecked.indexOf(c.title) >= 0) {
          this.table.bookingTable.columns.push(c)
        }
      }
    },
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
        billlading_goods_gross_unit: 'KG'
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

        let searchPara = {
          start_date: this.table.bookingTable.search_data.date[0],
          end_date: this.table.bookingTable.search_data.date[1],
          offset: this.table.bookingTable.offset,
          limit: this.table.bookingTable.limit
        }

        if (this.table.bookingTable.search_data.billlading_state) {
          searchPara.billlading_state = this.table.bookingTable.search_data.billlading_state
        }

        if (this.table.bookingTable.search_data.customer.value) {
          searchPara.customer = this.table.bookingTable.search_data.customer.value
        }

        if (this.table.bookingTable.search_data.vessel.value) {
          searchPara.vessel = this.table.bookingTable.search_data.vessel.value
        }

        if (this.table.bookingTable.search_data.search_text) {
          searchPara.search_text = this.table.bookingTable.search_data.search_text
        }

        let response = await this.$http.post(apiUrl + 'search', searchPara)
        let data = response.data.info
        this.table.bookingTable.total = data.total
        this.table.bookingTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    modifyBookingModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      if (actrow.billlading_goods.length > 0) {
        this.table.goodsTable.data = JSON.parse(JSON.stringify(actrow.billlading_goods))
      } else {
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
      }

      this.table.containerTable.data = JSON.parse(JSON.stringify(actrow.billlading_containers))
      this.VoyageINFO = JSON.parse(JSON.stringify(actrow.VoyageINFO))
      this.action = 'modify'
      this.$refs.formBooking.resetFields()
      this.modal.bookingModal = true
    },
    DownloadBooking: async function(row) {
      try {
        let response = await this.$http.request({
          url: apiUrl + 'downloadBooking',
          method: 'post',
          data: { billlading_id: row.billlading_id },
          responseType: 'blob'
        })

        let blob = response.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = e => {
          let a = document.createElement('a')
          a.download = 'Booking list for ' + row.billlading_no + '.docx'
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    submitBooking: function() {
      this.$refs.formBooking.validate(async valid => {
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
    confirmBookingModal: function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.workPara.billlading_freight_charge = '0.00'
      this.VoyageINFO = JSON.parse(JSON.stringify(actrow.VoyageINFO))
      this.modal.confirmBookingModal = true
    },
    confirmBookingAct: function() {
      this.$refs.formConfirmBooking.validate(async valid => {
        if (valid) {
          try {
            this.workPara.billlading_goods = JSON.parse(JSON.stringify(this.table.goodsTable.data))
            await this.$http.post(apiUrl + 'confirmBooking', this.workPara)
            this.$Message.success('confirm success')
            this.getBookingData()
            this.modal.confirmBookingModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    pickUpEmptyConfirmModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$refs.formPickUpEmptyConfirm.resetFields()
      this.modal.pickUpEmptyConfirmModal = true
    },
    pickUpEmptyConfirm: function() {
      this.$refs.formPickUpEmptyConfirm.validate(async valid => {
        if (valid) {
          try {
            await this.$http.post(apiUrl + 'confirmPickUp', this.workPara)
            this.$Message.success('confirm success')
            this.getBookingData()
            this.modal.pickUpEmptyConfirmModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    submitCustoms: function(row) {
      this.$commonact.confirm('Submit Loading List to Customs?', async () => {
        try {
          await this.$http.post(apiUrl + 'submitCustoms', { billlading_id: row.billlading_id })
          this.$Message.success('submit success')
          this.getBookingData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    rejectLoadingModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$refs.formRejectLoading.resetFields()
      this.modal.rejectLoadingModal = true
    },
    rejectLoading: function() {
      this.$refs.formRejectLoading.validate(async valid => {
        if (valid) {
          try {
            await this.$http.post(apiUrl + 'rejectLoading', this.workPara)
            this.$Message.success('reject success')
            this.getBookingData()
            this.modal.rejectLoadingModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    feedbackDeclareNumberModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$refs.formRevertDeclareNumber.resetFields()
      this.modal.feedbackDeclareNumberModal = true
    },
    feedbackDeclareNumber: function() {
      this.$refs.formRevertDeclareNumber.validate(async valid => {
        if (valid) {
          await this.$http.post(apiUrl + 'feedbackDeclareNumber', this.workPara)
          this.$Message.success('Feedback Declare Number')
          this.getBookingData()
          this.modal.feedbackDeclareNumberModal = false
        }
      })
    },
    loadingPermissionModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.files = []
      this.$refs.upload.clearFiles()
      this.modal.loadingPermissionModal = true
    },
    loadingPermission: async function() {
      try {
        if (this.files.length < 1) {
          return this.$Message.error('Please upload loading permission')
        }
        this.workPara.permission_files = this.files
        await this.$http.post(apiUrl + 'loadingPermission', this.workPara)
        this.$Message.success('submit success')
        this.getBookingData()
        this.modal.loadingPermissionModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    sendCDS: async function(row) {
      this.$commonact.confirm('Send CDS?', async () => {
        try {
          await this.$http.post(apiUrl + 'sendCDS', { billlading_id: row.billlading_id })
          this.$Message.success('send CDS success')
          this.getBookingData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    feedbackBLDraftModal: function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.files = []
      this.$refs.blupload.clearFiles()
      this.modal.feedbackBLDraftModal = true
    },
    feedbackBLDraft: async function() {
      try {
        if (this.files.length < 1) {
          return this.$Message.error('Please upload Billlading Draft')
        }
        this.workPara.bl_files = this.files
        await this.$http.post(apiUrl + 'feedbackBLDraft', this.workPara)
        this.$Message.success('submit success')
        this.getBookingData()
        this.modal.feedbackBLDraftModal = false
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    generateInvoiceModal: async function(row) {
      this.workPara = JSON.parse(JSON.stringify(row))
      this.$refs.generateInvoice.resetFields()
      this.modal.generateInvoiceModal = true
    },
    generateInvoice: async function() {
      this.$refs.generateInvoice.validate(async valid => {
        try {
          if (valid) {
            await this.$http.post(apiUrl + 'generateInvoice', this.workPara)
            this.$Message.success('submit success')
            this.getBookingData()
            this.modal.generateInvoiceModal = false
          }
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files = this.$refs.upload.fileList
    },
    handleBLSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files = this.$refs.blupload.fileList
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
    }
  }
}
</script>
<style scoped>
/deep/ .ivu-table-cell {
  padding-left: 2px;
  padding-right: 2px;
}

.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.check-item {
  width: 150px;
  justify-content: flex-start;
}
</style>