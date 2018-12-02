<template>
  <div>
    <section class="content-header">
      <ol class="breadcrumb">
        <li>
          <a href="#">
            <i class="fa fa-dashboard"></i>Export
          </a>
        </li>
        <li class="active">Booking</li>
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
                    <i class="glyphicon glyphicon-save"></i>Booking
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
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">
              <i class="fa fa-pencil-square-o big-blue"></i>Booking
            </h4>
          </div>
          <form @submit.prevent="bookingOp" id="formBook">
            <div class="modal-body">
              <div class="row row-bordered">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Vessel</label>
                    <select class="form-control select2" id="billloading_vessel_id"></select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Voyage</label>
                    <select class="form-control select2" id="billloading_voyage_id"></select>
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
                    <h5>
                      <b>CHINESE-TANZANIAN JOINT SHIPPING COMPANY.</b>
                    </h5>31, KISUTU ROAD
                    <br>P. O. Box – 696, Dar Es Salaam, Tanzania.
                    <br>Tel: +255 (22) 2113389
                    <br>Fax: +255 (22) 2113388
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
                        <select class="form-control select2" id="billloading_loading_port_id"></select>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="col-sm-4 control-label">Port of Discharg</label>
                      <div class="col-sm-8">
                        <select class="form-control select2" id="billloading_discharge_port_id"></select>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="col-sm-4 control-label">Place of Deliver</label>
                      <div class="col-sm-8">
                        <input v-model="workRow.billloading_delivery_place" class="form-control" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 form-horizontal">
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
                  <h4 class="text-middle">
                    <b>Cargo Description</b>
                  </h4>
                  <div class="margin form-inline">
                    <div class="form-group">
                      <button type="button" class="btn btn-block btn-primary" @click="AddCargo">Add</button>
                    </div>
                  </div>
                  <table id="goodstable"></table>
                </div>
                <div class="row row-udline">
                  <div class="col-md-6 form-horizontal">
                    <h4 class="text-middle">
                      <b>Stuffing & Equipment</b>
                    </h4>
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
                    <h4 class="text-middle">
                      <b>Payment</b>
                    </h4>
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
                        <select class="form-control select2" multiple id="billloading_freight_currency"></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-info">
                <i class="fa fa-fw fa-plus"></i>Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal fade" id="submitloadingModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">Submit Loading List</h4>
          </div>
          <form @submit.prevent="submitloadingOp" id="formSubmitloading">
            <div class="modal-body">
              <h4>Loading List</h4>
              <div class="row">
                <a v-for="f in files" v-bind:key="f.name" class="btn bg-navy btn-app">
                  <i class="fa fa-file .btn-flat"></i> {{f.name}}
                </a>
                <span class="fileupload-button">
                  <a class="btn btn-app">
                    <i class="fa fa-plus"></i> Add
                  </a>
                  <input class="fileupload" type="file" id="loadinglistupload">
                </span>
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
const apiUrl = '/api/zhongtan/export/Booking/'

export default {
  data: function() {
    return {
      pagePara: '',
      stDate: moment()
        .subtract(10, 'days')
        .format('YYYY-MM-DD'),
      edDate: moment().format('YYYY-MM-DD'),
      workRow: {},
      oldRow: {},
      files: []
    }
  },
  name: 'Booking',
  mounted: function() {
    let _self = this

    window.tableEvents = {
      'click .cancelb': function(e, value, row, index) {
        common.rowDeleteWithApi(_self, 'Cancle?', apiUrl + 'cancel', $('#table'), row, 'billloading_id', function() {})
      },
      'click .putbox': function(e, value, row, index) {
        common.dealConfrimCommon('Putbox Apply?', async function() {
          await _self.$http.post(apiUrl + 'putboxApply', row)
          $('#table').bootstrapTable('refresh')
        })
      },
      'click .submitloading': function(e, value, row, index) {
        _self.workRow = row
        _self.files = []
        $('#submitloadingModal').modal('show')
      },
      'click .instruction': function(e, value, row, index) {
        common.dealConfrimCommon('Shipping Instruction Been Sended?', async function() {
          await _self.$http.post(apiUrl + 'confirmInstruction', row)
          $('#table').bootstrapTable('refresh')
        })
      }
    }

    function actFormatter(value, row) {
      let retrunString = ['<div class="btn-group">']
      if (row.billloading_state === 'PBK') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 cancelb">Cancel</button>')
      } else if (row.billloading_state === 'BK') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 putbox">Putbox</button>')
      } else if (row.billloading_state === 'PC' || row.billloading_state === 'RL') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 submitloading">SUBMIT Loading</button>')
      } else if (row.billloading_state === 'DE') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 instruction">Confirm Instruction</button>')
      } 
      retrunString.push('</div>')
      return retrunString.join('')
    }

    function queryParams(params) {
      params.start_date = _self.stDate
      params.end_date = _self.edDate
      return JSON.stringify(params)
    }

    function statusFormatter(value, row) {
      for (let i = 0; i < _self.pagePara['BLSTATUSINFO'].length; i++) {
        if (_self.pagePara['BLSTATUSINFO'][i].id === value) {
          return '<span class="label ' + _self.pagePara['BLSTATUSINFO'][i].style + '">' + _self.pagePara['BLSTATUSINFO'][i].text + '</span>'
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
            return JSON.stringify(value).replace(/"/g, '&quot;')
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
          common.actFormatter('act', actFormatter, tableEvents),
          common.BTRowFormat('billloading_no', 'S/O'),
          common.BTRowFormatWithFormatter('billloading_state', 'Status', statusFormatter),
          common.BTRowFormatEdSelect2('billloading_vessel_id', 'Vessel', _self.pagePara.VesselINFO),
          common.BTRowFormatEditable('billloading_voyage_id', 'voyage'),
          BTRowFormatContractInfo('billloading_consignee', 'Consignee Info'),
          BTRowFormatContractInfo('billloading_notify', 'Notify Info'),
          common.BTRowFormatEdSelect2('billloading_loading_port_id', 'Loading Port', _self.pagePara.PortINFO),
          common.BTRowFormatEdSelect2('billloading_discharge_port_id', 'Discharge Port', _self.pagePara.PortINFO),
          common.BTRowFormatEditable('billloading_delivery_place', 'Delivery Place'),
          common.BTRowFormatEditable('billloading_stuffing_place', 'Stuffing Place'),
          common.BTRowFormatEditableDatePicker('billloading_stuffing_date', 'Stuffing Date'),
          common.BTRowFormatEditablePop('billloading_stuffing_requirement', 'Stuffing requirement'),
          common.BTRowFormatWithFormatter('loading_files', 'Loading list', common.filesFormatter),
          common.BTRowFormat('billloading_declare_number', 'Feclare Number'),
          common.BTRowFormatWithFormatter('permission_files', 'Permission', common.filesFormatter)
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
          common.rowModifyWithT(_self, apiUrl + 'modify', row, 'billloading_id', $('#table'))
        },
        onPostBody: function() {
          $('[data-name="billloading_voyage_id"]').each(function() {
            let actrow = $('#table').bootstrapTable('getRowByUniqueId', this.getAttribute('data-pk'))
            $(this).editable({
              type: 'select2',
              source: actrow.VoyageINFO
            })
          })
        }
      })

      common.changeTableClass($('#table'))
    }

    async function initPage() {
      try {
        let response = await _self.$http.post(apiUrl + 'init', {})
        let retData = response.data.info
        _self.pagePara = JSON.parse(JSON.stringify(retData))
        common.initSelect2($('#billloading_vessel_id'), retData.VesselINFO)
        $('#billloading_vessel_id').on('change', async function(evt) {
          $('#billloading_voyage_id').html('')
          let rsp = await _self.$http.post(apiUrl + 'searchVoyage', { vessel_id: common.getSelect2Val('billloading_vessel_id') })
          let retD = rsp.data.info
          common.initSelect2($('#billloading_voyage_id'), retD.VoyageINFO)
        })
        common.initSelect2($('#billloading_loading_port_id'), retData.PortINFO)
        common.initSelect2($('#billloading_discharge_port_id'), retData.PortINFO)
        $('#searchDate').daterangepicker(
          {
            timePicker: false,
            startDate: _self.stDate,
            endDate: _self.edDate,
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
        common.initSelect2($('#billloading_freight_currency'), retData.PayCurrencyINFO)
        $('#formBook').parsley()

        common.fileUpload(
          _self,
          $('#loadinglistupload'),
          apiUrl + 'upload',
          function(fileInfo) {
            _self.files.push(fileInfo)
            $('#loadinglistupload').val('')
          },
          response => {
            common.dealErrorCommon(_self, response)
          }
        )
        $('#formSubmitloading').parsley()

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
      $('#billloading_vessel_id')
        .val(null)
        .trigger('change')
      $('#billloading_voyage_id')
        .val(null)
        .trigger('change')
      $('#billloading_loading_port_id')
        .val(null)
        .trigger('change')
      $('#billloading_discharge_port_id')
        .val(null)
        .trigger('change')
      $('#billloading_freight_currency')
        .val(null)
        .trigger('change')
      $('#goodstable').bootstrapTable('destroy')
      window.goodsTableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          $('#goodstable').bootstrapTable('removeByUniqueId', index + 1)
        }
      }
      function deleteFormatter(value, row, index) {
        if (index !== 0) {
          return ['<a class="tableDelete" title="删除">', '<i class="glyphicon glyphicon-remove"></i>', '</a>'].join('')
        } else {
          return ''
        }
      }

      $('#goodstable').bootstrapTable({
        columns: [
          common.BTRowFormatWithIndex('No'),
          common.BTRowFormatEnumber('billloading_container_number', 'Vol.'),
          common.BTRowFormatEdSelect2('billloading_container_type', 'Type', _self.pagePara.ContainerTypeINFO),
          common.BTRowFormatEdSelect2('billloading_container_size', 'Size', _self.pagePara.ContainerSizeINFO),
          common.BTRowFormatEditable('billloading_container_goods_description', 'Description'),
          common.BTRowFormatEnumber('billloading_container_package_number', 'Package No'),
          common.BTRowFormatEdSelect2('billloading_container_package_unit', 'Package Unit', _self.pagePara.PackageUnitINFO),
          common.BTRowFormatEnumber('billloading_container_gross_volume', 'Volume'),
          common.BTRowFormatEdSelect2('billloading_container_gross_volume_unit', 'Volume Unit', _self.pagePara.VolumeUnitINFO),
          common.BTRowFormatEnumber('billloading_container_gross_weight', 'Weight'),
          common.BTRowFormatEdSelect2('billloading_container_gross_unit', 'Weight Unit', _self.pagePara.WeightUnitINFO),
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
          $('#formBook')
            .parsley()
            .isValid()
        ) {
          _self.workRow.billloading_vessel_id = common.getSelect2Val('billloading_vessel_id')
          _self.workRow.billloading_voyage_id = common.getSelect2Val('billloading_voyage_id')
          _self.workRow.billloading_containers = $('#goodstable').bootstrapTable('getData')
          _self.workRow.billloading_loading_port_id = common.getSelect2Val('billloading_loading_port_id')
          _self.workRow.billloading_discharge_port_id = common.getSelect2Val('billloading_discharge_port_id')
          _self.workRow.billloading_stuffing_date = $('#stuffDate').val()
          _self.workRow.billloading_pay_date = $('#payat').val()
          _self.workRow.billloading_freight_currency = common.getSelect2Val('billloading_freight_currency')
          await _self.$http.post(apiUrl + 'booking', _self.workRow)
          $('#table').bootstrapTable('refresh')
          common.dealSuccessCommon('增加成功')
          $('#bookingModal').modal('hide')
          console.log('add success')
        }
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    },
    submitloadingOp: async function(event) {
      let _self = this
      try {
        if (
          $('#formSubmitloading')
            .parsley()
            .isValid()
        ) {
          if (_self.files.length <= 0) {
            return common.dealWarningCommon('Please upload loading list')
          }

          _self.workRow.loading_files = _self.files
          await _self.$http.post(apiUrl + 'submitloading', _self.workRow)
          $('#table').bootstrapTable('refresh')
          common.dealSuccessCommon('submit loading success')
          $('#submitloadingModal').modal('hide')
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
