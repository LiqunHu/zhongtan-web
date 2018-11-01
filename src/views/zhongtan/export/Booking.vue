<template>
    <div>
        <section class="content-header">
            <ol class="breadcrumb">
                <li><a href="#"><i class="fa fa-dashboard"></i> Export</a></li>
                <li class="active"> Booking</li>
            </ol>
        </section>
        <section class="content">
            <div class="col-lg-12">
                <div class="box box-info">
                    <div class="box-body">
                        <div id="toolbar">
                            <div class="form-inline" role="form">
                                <div class="form-group">
                                    <button class="btn btn-block btn-primary" @click="BookingMod">
                                        <i class="glyphicon glyphicon-save"></i> Booking
                                    </button>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-danger" disabled>
                                        <i class="glyphicon glyphicon-remove"></i> Cancel
                                    </button>
                                </div>
                                <div class="form-group">
                                    <input v-model="searchDate" class="form-control" id="searchDate" placeholder="Application Date">
                                </div>
                            </div>
                        </div>
                        <table id="table"></table>
                    </div>
                </div>
            </div>
        </section>
        <div class="modal" id="bookingModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-book" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title"><i class="fa fa-pencil-square-o big-blue"></i>Booking</h4>
                    </div>
                    <form @submit.prevent="bookingOp" id="formA">
                        <div class="modal-body">
                            <div class="row row-bordered">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Vessel</label>
                                        <input v-model="workRow.billloading_vessel" class="form-control" placeholder="Enter Vessel">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Voyage</label>
                                        <input v-model="workRow.billloading_voyage" class="form-control" placeholder="Enter Voyage">
                                    </div>
                                </div>
                            </div>
                            <div class="row row-bordered">
                                <div class="row row-udline">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label>Shipper (Name & Address)</label>
                                            <input class="form-control" placeholder="Shipper name">
                                        </div>
                                        <div class="form-group">
                                            <input class="form-control" placeholder="Shipper Address">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <h5><b>CHINESE-TANZANIAN JOINT SHIPPING COMPANY. </b></h5>
                                        31, KISUTU ROAD<br />
                                        P. O. Box – 696, Dar Es Salaam, Tanzania.<br />
                                        Tel: +255 (22) 2113389<br />
                                        Fax: +255 (22) 2113388
                                    </div>
                                </div>
                                <div class="row row-udline">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label>Consignee (Name & Address)</label>
                                            <input v-model="workRow.billloading_consignee_name" class="form-control" placeholder="Consignee name">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_consignee_address" class="form-control" placeholder="Consignee Address">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_consignee_tel" class="form-control" placeholder="Consignee Tel.">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label>Notify Party (Name & Address)</label>
                                            <input v-model="workRow.billloading_notify_name" class="form-control" placeholder="Notify Party name">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_notify_address" class="form-control" placeholder="Notify Party Address">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_notify_tel" class="form-control" placeholder="Notify Party Tel.">
                                        </div>
                                    </div>
                                </div>
                                <div class="row row-udline">
                                    <div class="col-md-6 form-horizontal">
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Port of Loading</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_loading_port" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Port of Discharg</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_discharge_port" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Place of Deliver</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_delivery_place" class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6  form-horizontal">
                                        <label>No of B/L Required</label>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">Original</label>
                                            <div class="col-sm-10">
                                                <input v-model="workRow.billloading_original_num" type="number" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">Copies</label>
                                            <div class="col-sm-10">
                                                <input v-model="workRow.billloading_copys_num" type="number" class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row row-udline">
                                    <h4 class="text-middle"><b>Cargo Description</b></h4>
                                    <div class="margin form-inline">
                                        <div class="form-group">
                                            <button type="button" class="btn btn-block btn-primary" @click="AddCargo">Add</button>
                                        </div>
                                    </div>
                                    <table id="goodstable"></table>
                                </div>
                                <div class="row row-udline">
                                    <div class="col-md-6 form-horizontal">
                                        <h4 class="text-middle"><b>Stuffing & Equipment</b></h4>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Place</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_stuffing_place" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Expected date</label>
                                            <div class="col-sm-8">
                                                <input id="stuffDate" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Special requirement</label>
                                            <div class="col-sm-8">
                                                <textarea class="form-control" rows="3"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 form-horizontal">
                                        <h4 class="text-middle"><b>Payment</b></h4>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Forwarder</label>
                                            <div class="col-sm-8">
                                                <input class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Pay type</label>
                                            <div class="col-sm-8">
                                                <select class="form-control select2" multiple id="payType"></select>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Payable at</label>
                                            <div class="col-sm-8">
                                                <input class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Status</label>
                                            <div class="col-sm-8">
                                                <input class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary btn-info"><i class="fa fa-fw fa-plus"></i>确认</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/export/Booking?method='

export default {
  data: function() {
    return {
      pagePara: '',
      searchDate: '',
      workRow: {}
    }
  },
  name: 'Booking',
  mounted: function() {
    let _self = this

    function initTable() {
      $('#table').bootstrapTable({
        height: common.getTableHeight(),
        columns: [
          common.BTRowFormatWithIndex('No'),
          common.BTRowFormat('billloading_no', 'S/O'),
          common.BTRowFormat('vessel_name', 'Vessel')
        ],
        idField: 'billoading_id',
        uniqueId: 'billoading_id',
        toolbar: '#toolbar',
        search: true,
        showColumns: true,
        showExport: true,
        striped: true,
        pagination: true,
        pageSize: 25,
        pageList: [10, 15, 25, 50, 'All'],
        showFooter: false,
        clickToSelect: true
      })

      common.changeTableClass($('#table'))
    }

    async function initPage() {
      try {
        let response = await _self.$http.post(apiUrl + 'init', {})
        let retData = response.data.info
        _self.pagePara = JSON.parse(JSON.stringify(retData))

        $('#searchDate').daterangepicker(
          {
            timePicker: false,
            // dateLimit: { days: 30 },
            ranges: {
              '7 days': [
                moment()
                  .subtract(6, 'days')
                  .format('MM/DD/YYYY'),
                moment().format('MM/DD/YYYY')
              ],
              '14 days': [
                moment()
                  .subtract(13, 'days')
                  .format('MM/DD/YYYY'),
                moment().format('MM/DD/YYYY')
              ],
              '30 days': [
                moment()
                  .subtract(29, 'days')
                  .format('MM/DD/YYYY'),
                moment().format('MM/DD/YYYY')
              ],
              'to now': [
                moment('01/01/2017', 'MM/DD/YYYY'),
                moment().format('MM/DD/YYYY')
              ]
            }
          },
          function(start, end, label) {
            // 格式化日期显示框
          }
        )

        initTable()

        // model
        common.initSelect2($('#payType'), retData.PayTypeINFO)
        common.initDatepicker($('#stuffDate'))
        $('#formA').parsley()
        console.log('init success')
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    }

    initPage()
  },
  methods: {
    BookingMod: function(event) {
      let _self = this
      _self.workRow = {}
      $('#goodstable').bootstrapTable('destroy')
      window.goodsTableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          console.log(row)
          console.log(index)
          $('#goodstable').bootstrapTable('removeByUniqueId', index + 1)
        }
      }
      function deleteFormatter(value, row, index) {
        if (index !== 0) {
          return [
            '<a class="tableDelete" title="删除">',
            '<i class="glyphicon glyphicon-remove"></i>',
            '</a>'
          ].join('')
        } else {
          return ''
        }
      }

      $('#goodstable').bootstrapTable({
        columns: [
          common.BTRowFormatWithIndex('No'),
          common.BTRowFormatEnumber('billloading_container_number', 'Vol.'),
          common.BTRowFormatEdSelect2(
            'billloading_container_type',
            'Type',
            _self.pagePara.ContainerTypeINFO
          ),
          common.BTRowFormatEdSelect2(
            'billloading_container_size',
            'Size',
            _self.pagePara.ContainerSizeINFO
          ),
          common.BTRowFormatEditable(
            'billoading_container_goods_description',
            'Description'
          ),
          common.BTRowFormatEnumber(
            'billloading_container_package_number',
            'Package No'
          ),
          common.BTRowFormatEdSelect2(
            'billloading_container_package_unit',
            'Package Unit',
            _self.pagePara.PackageUnitINFO
          ),
          common.BTRowFormatEnumber(
            'billloading_container_gross_volume',
            'Volume'
          ),
          common.BTRowFormatEdSelect2(
            'billloading_container_gross_volume_unit',
            'Volume Unit',
            _self.pagePara.VolumeUnitINFO
          ),
          common.BTRowFormatEnumber(
            'billloading_container_gross_weight',
            'Weight'
          ),
          common.BTRowFormatEdSelect2(
            'billloading_container_gross_unit',
            'Weight Unit',
            _self.pagePara.WeightUnitINFO
          ),
          common.actFormatter('act', deleteFormatter, goodsTableEvents)
        ],
        idField: 'RowNumber',
        uniqueId: 'RowNumber',
        showFooter: false
      })
      $('#goodstable').bootstrapTable('append', {
        billloading_container_number: '',
        billloading_container_type: '',
        billloading_container_size: '',
        billoading_container_goods_description: '',
        billloading_container_package_number: '',
        billloading_container_package_unit: 'BAG',
        billloading_container_gross_volume: '',
        billloading_container_gross_volume_unit: 'M3',
        billloading_container_gross_weight: '',
        billloading_container_gross_unit: 'KG'
      })
      $('#bookingModal').modal('show')
    },
    AddCargo: function(event) {
      $('#goodstable').bootstrapTable('append', {
        billloading_container_number: '',
        billloading_container_type: '',
        billloading_container_size: '',
        billoading_container_goods_description: '',
        billloading_container_package_number: '',
        billloading_container_package_unit: 'BAG',
        billloading_container_gross_volume: '',
        billloading_container_gross_volume_unit: 'M3',
        billloading_container_gross_weight: '',
        billloading_container_gross_unit: 'KG'
      })
    },
    bookingOp: function(event) {}
  }
}
</script>
<style scoped>
.modal-book {
  width: 950px;
}

.row-bordered {
  border: 3px double #eee;
  margin: 3px;
}

.row-udline {
  padding-bottom: 9px;
  margin: 10px 0 20px;
  border-bottom: 1px solid #eee;
}

.text-middle {
  text-align: center;
}
</style>
