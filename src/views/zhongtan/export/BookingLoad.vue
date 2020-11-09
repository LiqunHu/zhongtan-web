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
              <DatePicker type="daterange" :value="search_data.date_range" placeholder="Vessel Date" style="width: 200px" @on-change="searchRangeAct"></DatePicker>
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.vessel_name" placeholder="Vessel Name" style="width: 200px" />
            </div>
            <div class="form-group m-r-2">
              <input type="text" class="form-control" v-model="search_data.masterbi_bl" placeholder="B/L No" style="width: 200px" />
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="searchDataAct">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <div class="form-group m-r-3">
              <button type="button" class="btn btn-info" @click="bookingLoadModalAct">Load</button>
            </div>
          </div>
        </div>
      </template>
      <Row>
        <Col span="6">
          <div style="border: 1px solid #dcdee2;">
            <Scroll :height="vesselHeight">
              <Row v-for="item in vesselData" v-bind:key="item.export_vessel_id">
                <Col>
                  <div :class="{vessel_selected: item.active}" @click="vesselSelectedAct(item)">
                    <Card>
                      <p slot="title">
                        {{item.export_vessel_name}}({{item.export_vessel_code}})-{{item.export_vessel_voyage}}
                      </p>
                      <a href="#" slot="extra" @click.stop="editVesselAct(item)" title="Edit">
                          <i class="fa fa-edit"></i>
                      </a>
                      <a href="#" slot="extra" @click.stop="deleteVesselAct(item)" title="Remove" style="color: red; margin-left: 5px;">
                          <i class="fa fa-times"></i>
                      </a>
                      <Row>
                          <Col span="12">
                          <p>ETD: {{item.export_vessel_etd}}</p>
                          </Col>
                          <Col span="12">
                            B/C: {{item.bl_count}}/{{item.container_count}}
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
          <Tabs :animated="true" @on-click="changeTabAct">
              <TabPane label="MasterBl">
                  <Table stripe size="small" ref="masterbiTable" :columns="blTable.columns" :data="blTable.data" :height="blTable.height">
                  </Table>
                  <Page class="m-t-10" :total="blTable.total" :page-size="blTable.limit" @on-change="searchBlAct" />
              </TabPane>
              <TabPane label="Containers">
                <Table stripe size="small" ref="containerTable" :columns="containerTable.columns" :data="containerTable.data" :height="containerTable.height">
                  </Table>
                  <Page class="m-t-10" :total="containerTable.total" :page-size="containerTable.limit" @on-change="searchContainerAct" />
              </TabPane>
          </Tabs>
          </Col>
      </Row>
    </panel>
    <Modal v-model="modal.bookingModal" title="Booking">
      <Form :model="workPara" :label-width="100">
        <FormItem label="Files">
          <div v-for="f in files.fileList" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60" />
          </div>
          <Upload
            ref="upload"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['pdf', 'PDF']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/import/ImportWork/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.bookingModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="bookingData">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
// import PageOptions from '../../../config/PageOptions.vue'
const moment = require('moment')
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/export/BookingLoad/'

export default {
  name: 'BookingLoadControl',
  data: function() {
    return {
      modal: { bookingModal: false},
      headers: common.uploadHeaders(),
      vesselHeight: common.getTableHeight(),
      search_data: {
        date_range: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        etd_start_date: '',
        etd_end_date: '',
        vessel_name: '',
        masterbi_bl: '',
        export_vessel_id: ''
      },
      workPara: {},
      vesselData: [],
      blTable: {
        columns: [
          {
            title: '#M B/L No',
            key: 'export_masterbi_bl',
            width: 220
          },
          {
            title: 'CSO/AGREEMENT NUMBER',
            key: 'export_masterbi_cso_number',
            width: 220
          },
          {
            title: 'SHIPPER',
            key: 'export_masterbi_shipper_company',
            width: 220
          },
          {
            title: 'FORWARDER',
            key: 'export_masterbi_forwarder_company',
            width: 220
          },
          {
            title: 'CONSIGNEE',
            key: 'export_masterbi_consignee_company',
            width: 220
          },
          {
            title: 'PORT OF LOAD',
            key: 'export_masterbi_port_of_load',
            width: 220
          },
          {
            title: 'PORT OF DISCHARGE',
            key: 'export_masterbi_port_of_discharge',
            width: 220
          },
          {
            title: 'TRAFFIC MODE',
            key: 'export_masterbi_traffic_mode',
            width: 220
          },
          {
            title: 'CONTAINER QTY',
            key: 'export_masterbi_container_quantity',
            width: 220
          },
          {
            title: 'CONTAINER WEIGHT',
            key: 'export_masterbi_container_weight',
            width: 220
          },
          {
            title: 'CARGO NATURE',
            key: 'export_masterbi_cargo_nature',
            width: 220
          },
          {
            title: 'CARGO DESCRIPTIONS',
            key: 'export_masterbi_cargo_descriptions',
            width: 220
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 10,
        offset: 0,
        total: 0
      },
      containerTable: {
        columns: [
          {
            title: '#M B/L No',
            key: 'export_container_bl',
            width: 220
          },
          {
            title: 'Container No',
            slot: 'export_container_no',
            width: 150
          },
          {
            title: 'SOC/COC',
            key: 'export_container_soc_type',
            width: 220
          },
          {
            title: 'SIZE/TYPE',
            key: 'export_container_size_type',
            width: 220
          },
          {
            title: 'CARGO WEIGHT',
            key: 'export_container_cargo_weight',
            width: 220
          }
        ],
        height: common.getTableHeight() - 90,
        data: [],
        unchanged:[],
        limit: 10,
        offset: 0,
        total: 0
      },
      containerData: [],
      currentTab: 0,
      action: '',
      files: {
        fileList: []
      }
    }
  },
  mounted: function() {
    this.searchDataAct()
  },
  methods: {
    searchDataAct: async function() {
      try {
        let searchPara = {
            ...this.search_data
        }
        let response = await this.$http.post(apiUrl + 'searchVessel', searchPara)
        this.$nextTick(function() {
          this.vesselData = response.data.info
          if(this.vesselData) {
            for(let i = 0; i < this.vesselData.length; i++) {
              if(i === 0) {
                this.vesselData[i].active = true
                this.search_data.export_vessel_id = this.vesselData[i].export_vessel_id
              } else {
                this.vesselData[i].active = false
              }
            }
          }
          this.searchBlAct()
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchBlAct: async function() {
      try {
        let searchPara = {
            ...this.search_data,
            limit: 10,
            offset: 0
        }
        let response = await this.$http.post(apiUrl + 'searchBl', searchPara)
        this.$nextTick(function() {
          let data = response.data.info
          this.blTable.total = data.total
          this.blTable.data = JSON.parse(JSON.stringify(data.rows))
          this.blTable.unchanged = JSON.parse(JSON.stringify(data.rows))
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchContainerAct: async function() {
      try {
        let searchPara = {
            ...this.search_data,
            limit: 10,
            offset: 0
        }
        let response = await this.$http.post(apiUrl + 'searchContainer', searchPara)
        this.$nextTick(function() {
          let data = response.data.info
          this.containerTable.total = data.total
          this.containerTable.data = JSON.parse(JSON.stringify(data.rows))
          this.containerTable.unchanged = JSON.parse(JSON.stringify(data.rows))
        })
      } catch (error) {
          this.$commonact.fault(error)
      }
    },
    searchRangeAct: function(e) {
      this.search_data.date_range = JSON.parse(JSON.stringify(e))
      this.search_data.etd_start_date = this.search_data.date_range[0]
      this.search_data.etd_end_date = this.search_data.date_range[1]
    },
    vesselSelectedAct: function(item) {
      this.$nextTick(function() {
        if(this.vesselData) {
          for(let v of this.vesselData) {
            if(v.export_vessel_id === item.export_vessel_id) {
              v.active = true
              this.search_data.export_vessel_id = v.export_vessel_id
              this.searchTableAct()
            } else {
              v.active = false
            }
          }
          this.$forceUpdate()
        }
      })
    },
    editVesselAct: function(item) {
      // try {
      //   this.$nextTick(function() {
      //     this.resetVesselForm()
      //     this.$refs['vesselForm'].resetFields()
      //     this.vesselForm = JSON.parse(JSON.stringify(item))
      //     this.checkPassword = ''
      //     this.modal.checkPasswordModal = true
      //     this.checkPasswordType = 'doVesselEdit'
      //   })
      // } catch (error) {
      //     this.$commonact.fault(error)
      // }
    },
    deleteVesselAct: function(item) {
    },
    changeTabAct: function(name) {
      if (this.currentTab != name) {
          this.currentTab = name
      }
      this.searchTableAct()
    },
    searchTableAct: function() {
      if(this.currentTab === 0) {
        this.searchBlAct()
      } else {
        this.searchContainerAct()
      }
    },
    bookingLoadModalAct: async function() {
      this.workPara = {}
      this.action = 'add'
      this.modal.bookingModal = true
    },
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files.fileList = JSON.parse(JSON.stringify(this.$refs.upload.fileList))
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
    bookingData: async function() {
      try {
        if (this.files.fileList.length < 1) {
          return this.$Message.error('Please upload pdf file')
        }
        this.workPara.upload_files = this.files.fileList
        await this.$http.post(apiUrl + 'uploadBooking', this.workPara)
        this.$Message.success('submit success')
        this.modal.bookingModal = false
        this.searchTableAct()
      } catch (error) {
        this.$commonact.fault(error)
      }
    }
  }
}
</script>
<style scoped>
.total {
  padding-top: 20px;
  font-size: 12px;
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

.vessel_selected {
  border:rgb(84, 173, 247) solid 1px;
}
</style>