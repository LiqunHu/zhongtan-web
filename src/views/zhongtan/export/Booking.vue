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
                                    <input class="form-control" id="searchDate" placeholder="Application Date">
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
                                        <input v-model="workRow.billloading_vessel" class="form-control" placeholder="Enter Vessel" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Voyage</label>
                                        <input v-model="workRow.billloading_voyage" class="form-control" placeholder="Enter Voyage" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
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
                                            <input v-model="workRow.billloading_consignee_name" class="form-control" placeholder="Consignee name" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_consignee_address" class="form-control" placeholder="Consignee Address" data-parsley-required="true" maxlength="100" data-parsley-maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_consignee_tel" class="form-control" placeholder="Consignee Tel.">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label>Notify Party (Name & Address)</label>
                                            <input v-model="workRow.billloading_notify_name" class="form-control" placeholder="Notify Party name" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                        </div>
                                        <div class="form-group">
                                            <input v-model="workRow.billloading_notify_address" class="form-control" placeholder="Notify Party Address" data-parsley-required="true" maxlength="100" data-parsley-maxlength="100">
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
                                                <input v-model="workRow.billloading_loading_port" class="form-control" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Port of Discharg</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_discharge_port" class="form-control" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Place of Deliver</label>
                                            <div class="col-sm-8">
                                                <input v-model="workRow.billloading_delivery_place" class="form-control" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6  form-horizontal">
                                        <label>No of B/L Required</label>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">Original</label>
                                            <div class="col-sm-10">
                                                <input v-model="workRow.billloading_original_num" type="number" class="form-control" data-parsley-required="true">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">Copies</label>
                                            <div class="col-sm-10">
                                                <input v-model="workRow.billloading_copys_num" type="number" class="form-control" data-parsley-required="true">
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
                                                <input v-model="workRow.billloading_stuffing_place" class="form-control" data-parsley-required="true">
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
                                                <textarea v-model="workRow.billloading_stuffing_requirement" class="form-control" rows="3"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 form-horizontal">
                                        <h4 class="text-middle"><b>Payment</b></h4>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Pay type</label>
                                            <div class="col-sm-8">
                                                <select class="form-control select2" multiple id="payType"></select>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Payable at</label>
                                            <div class="col-sm-8">
                                                <input id="payat" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-4 control-label">Status</label>
                                            <div class="col-sm-8">
                                                <select class="form-control select2" multiple id="payStatus"></select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary btn-info"><i class="fa fa-fw fa-plus"></i>Submit</button>
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
      stDate: moment().format('YYYY-MM-DD'),
      edDate: moment().format('YYYY-MM-DD'),
      workRow: {},
      oldRow: {}
    }
  },
  name: 'Booking',
  mounted: function() {
    let _self = this

    function queryParams(params) {
      params.start_date = _self.stDate
      params.end_date = _self.edDate
      return JSON.stringify(params)
    }

    function statusFormatter(value, row) {
      for (let i = 0; i < _self.pagePara['BLSTATUSINFO'].length; i++) {
        if (_self.pagePara['BLSTATUSINFO'][i].id === value) {
          return (
            '<span class="label ' +
            _self.pagePara['BLSTATUSINFO'][i].style +
            '">' +
            _self.pagePara['BLSTATUSINFO'][i].text +
            '</span>'
          )
        }
      }
      return ''
    }

    function BTRowFormatContractInfo(rowid, rowname) {
      return {
        field: rowid,
        title: rowname,
        formatter: function(value, row, index) {
          if (typeof value === 'object') {
            return JSON.stringify(value).replace(/"/g, "&quot;")
          } else {
            return value
          }
        },
        class: 'text-nowrap',
        align: 'center',
        valign: 'middle',
        editable: {
          type: 'contractInfo',
          emptytext: '无'
        }
      }
    }

    function initTable() {
      $('#table').bootstrapTable({
        method: 'POST',
        url: apiUrl + 'search',
        queryParams: queryParams,
        sidePagination: 'server',
        ajaxOptions: common.bootstrapTableAjaxOtions,
        responseHandler: function(res) {
          return res.info
        },
        height: common.getTableHeight(),
        columns: [
          common.BTRowFormatWithIndex('No'),
          common.BTRowFormat('billloading_no', 'S/O'),
          common.BTRowFormatWithFormatter(
            'billloading_state',
            'Status',
            statusFormatter
          ),
          common.BTRowFormatEditable('billloading_vessel', 'Vessel'),
          common.BTRowFormatEditable('billloading_voyage', 'voyage'),
          BTRowFormatContractInfo('billloading_consignee', 'Consignee Info'),
          BTRowFormatContractInfo('billloading_notify', 'Notify Info'),
          common.BTRowFormatEditable(
            'billloading_loading_port',
            'Loading Poart'
          ),
          common.BTRowFormatEditable(
            'billloading_discharge_port',
            'Discharge Poart'
          ),
          common.BTRowFormatEditable(
            'billloading_delivery_place',
            'Delivery Place'
          ),
          common.BTRowFormatEditable(
            'billloading_stuffing_place',
            'Stuffing Place'
          ),
          common.BTRowFormatEditableDatePicker(
            'billloading_stuffing_date',
            'Stuffing Date'
          ),
          common.BTRowFormatEditablePop(
            'billloading_stuffing_requirement',
            'Stuffing requirement'
          )
        ],
        idField: 'billloading_id',
        uniqueId: 'billloading_id',
        toolbar: '#toolbar',
        showRefresh: true,
        showColumns: true,
        striped: true,
        pagination: true,
        pageSize: 25,
        pageList: [10, 15, 25, 50, 'All'],
        showFooter: false,
        clickToSelect: true,
        onEditableShown: function(field, row, $el, editable) {
          _self.oldRow = $.extend(true, {}, row)
        },
        onEditableSave: function(field, row, oldValue, $el) {
          common.rowModifyWithT(
            _self,
            apiUrl + 'modify',
            row,
            'billloading_id',
            $('#table')
          )
        }
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
            locale: {
              format: 'YYYY-MM-DD'
            }
          },
          function(start, end, label) {
            // 格式化日期显示框
            _self.stDate = start.format('YYYY-MM-DD')
            _self.edDate = end.format('YYYY-MM-DD')
            $('#table').bootstrapTable('refresh')
          }
        )

        initTable()

        // model
        common.initDatepicker($('#stuffDate'))
        common.initDatepicker($('#payat'))
        common.initSelect2($('#payType'), retData.PayTypeINFO)
        common.initSelect2($('#payStatus'), retData.PayStatusINFO)
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
            'billloading_container_goods_description',
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
        billloading_container_goods_description: '',
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
        billloading_container_goods_description: '',
        billloading_container_package_number: '',
        billloading_container_package_unit: 'BAG',
        billloading_container_gross_volume: '',
        billloading_container_gross_volume_unit: 'M3',
        billloading_container_gross_weight: '',
        billloading_container_gross_unit: 'KG'
      })
    },
    bookingOp: async function(event) {
      let _self = this
      try {
        if (
          $('#formA')
            .parsley()
            .isValid()
        ) {
          _self.workRow.billloading_containers = $(
            '#goodstable'
          ).bootstrapTable('getData')
          _self.workRow.billloading_stuffing_date = $('#stuffDate').val()
          _self.workRow.billloading_pay_date = $('#payat').val()
          _self.workRow.billloading_invoice_currency = common.getSelect2Val(
            'payStatus'
          )
          let response = await _self.$http.post(
            apiUrl + 'booking',
            _self.workRow
          )
          let retData = response.data.info
          $('#table').bootstrapTable('refresh')
          common.dealSuccessCommon('增加成功')
          $('#bookingModal').modal('hide')
          console.log('add success')
        }
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    }
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
