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
                  <input class="form-control" id="searchDate" placeholder="Application Date">
                </div>
              </div>
            </div>
            <table id="table"></table>
          </div>
        </div>
      </div>
    </section>
    <div class="modal fade" id="bookingConfirmModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">booking Confirm</h4>
          </div>
          <form @submit.prevent="BookingConfirmAct" id="formBookingConfirm">
            <div class="modal-body">
              <div class="form-group">
                <label>Freight Currency</label>
                <select class="form-control select2" id="billloading_freight_currency" data-parsley-required="true" disabled></select>
              </div>
              <div class="form-group">
                <label>
                  <span class="table-required">*</span>Freight Charge
                </label>
                <input class="form-control" v-model="workRow.billloading_freight_charge" data-parsley-required="true" data-parsley-type="number">
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
    <div class="modal fade" id="putboxConfirmModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">putbox Confirm</h4>
          </div>
          <form @submit.prevent="PutboxConfirmAct" id="formPutboxConfirm">
            <div class="modal-body">
              <div class="form-group">
                <label>Continer Manager</label>
                <select class="form-control select2" id="container_manager_id" data-parsley-required="true"></select>
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
    <div class="modal fade" id="rejectloadingModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">Reject Loading List</h4>
          </div>
          <form @submit.prevent="rejectloadingAct" id="formRejectloading">
            <div class="modal-body">
              <div class="form-group">
                <label>
                  <span class="table-required">*</span>Reject reason
                </label>
                <textarea class="form-control" v-model="workRow.reject_reason" data-parsley-required="true" maxlength="500" data-parsley-maxlength="500"></textarea>
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
    <div class="modal fade" id="declarationModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">Declaration</h4>
          </div>
          <form @submit.prevent="declarationAct" id="formDeclaration">
            <div class="modal-body">
              <h4>Declare Number</h4>
              <div class="form-group">
                <input class="form-control" v-model="workRow.billloading_declare_number" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <h4>Loading Permission</h4>
              <div class="row">
                <a v-for="f in files" v-bind:key="f.name" class="btn bg-navy btn-app">
                  <i class="fa fa-file .btn-flat"></i>
                  {{f.name}}
                </a>
                <span class="fileupload-button">
                  <a class="btn btn-app">
                    <i class="fa fa-plus"></i> Add
                  </a>
                  <input class="fileupload" type="file" id="permissionupload">
                </span>
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
  </div>
</template>
<script>
const common = require('@/lib/common')
const moment = require('moment')
const apiUrl = '/api/zhongtan/export/BookingWork/'

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
  name: 'BookingWork',
  mounted: function() {
    let _self = this

    window.tableEvents = {
      'click .cancelb': function(e, value, row, index) {
        common.rowDeleteWithApi(_self, 'Cancle?', apiUrl + 'cancel', $('#table'), row, 'billloading_id', function() {})
      },
      'click .booking': function(e, value, row, index) {
        _self.workRow = row
        $('#billloading_freight_currency')
          .val(row.billloading_freight_currency)
          .trigger('change')
        _self.workRow.billloading_freight_charge = '0.00'
        $('#bookingConfirmModal').modal('show')
      },
      'click .putbox-confirm': function(e, value, row, index) {
        _self.workRow = row
        $('#container_manager_id')
          .val(null)
          .trigger('change')
        $('#putboxConfirmModal').modal('show')
      },
      'click .reject-loading': function(e, value, row, index) {
        _self.workRow = row
        $('#rejectloadingModal').modal('show')
      },
      'click .declaration': function(e, value, row, index) {
        _self.workRow = row
        _self.files = []
        $('#declarationModal').modal('show')
      }
    }

    function actFormatter(value, row) {
      let retrunString = []
      if (row.billloading_state === 'PBK') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 booking">Booking</button><br/>')
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 cancelb">Cancel</button>')
      } else if (row.billloading_state === 'PA') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 putbox-confirm">Confirm</button>')
      } else if (row.billloading_state === 'SL') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 declaration">declaration</button>')
        retrunString.push('<button type="button" class="btn btn-warning btn-xs m-r-5 reject-loading">Reject</button>')
      }
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

    function BTRowFormatShiplineInfo(rowid, rowname) {
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
          type: 'shiplineInfo',
          emptytext: '-',
          source: {
            VesselINFO: _self.pagePara.VesselINFO,
            _self: _self,
            apiUrl: apiUrl
          }
        }
      }
    }

    function containersFormatter(value, row) {
      let returnStr = []
      for (let c of value) {
        returnStr.push('br/')
        returnStr.push('<div>' + c.billloading_container_number + ' * ' + c.billloading_container_size + c.billloading_container_type + '</div>')
      }
      returnStr.shift()
      return returnStr.join('')
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

    function BTRowFormatPortInfo(rowid, rowname) {
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
          type: 'portInfo',
          emptytext: '-',
          source: {
            PortINFO: _self.pagePara.PortINFO
          }
        }
      }
    }

    function BTRowFormatStuffingInfo(rowid, rowname) {
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
          type: 'stuffingInfo',
          emptytext: '-'
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
          common.BTRowFormatWithFormatter('billloading_containers', 'Container', containersFormatter),
          BTRowFormatShiplineInfo('shipline', 'Ship Info', BTRowFormatShiplineInfo),
          BTRowFormatContractInfo('billloading_consignee', 'Consignee Info'),
          BTRowFormatContractInfo('billloading_notify', 'Notify Info'),
          BTRowFormatPortInfo('portinfo', 'Port Info'),
          common.BTRowFormatEditable('billloading_delivery_place', 'Delivery Place'),
          BTRowFormatStuffingInfo('stuffing', 'Stuffing Info'),
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
        common.initSelect2($('#billloading_freight_currency'), retData.PayCurrencyINFO)
        $('#formBookingConfirm').parsley()

        common.initSelect2($('#container_manager_id'), retData.ContainerManagerINFO)
        $('#formPutboxConfirm').parsley()

        $('#formRejectloading').parsley()

        common.fileUpload(
          _self,
          $('#permissionupload'),
          apiUrl + 'upload',
          function(fileInfo) {
            _self.files.push(fileInfo)
            $('#permissionupload').val('')
          },
          response => {
            common.dealErrorCommon(_self, response)
          }
        )
        $('#formDeclaration').parsley()
        console.log('init success')
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    }

    initPage()
  },
  methods: {
    BookingConfirmAct: async function() {
      let _self = this
      try {
        if (
          $('#formBookingConfirm')
            .parsley()
            .isValid()
        ) {
          await _self.$http.post(apiUrl + 'bookingConfirm', _self.workRow)
          $('#table').bootstrapTable('refresh')
          $('#bookingConfirmModal').modal('hide')
        }
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    },
    PutboxConfirmAct: async function() {
      let _self = this
      try {
        if (
          $('#formPutboxConfirm')
            .parsley()
            .isValid()
        ) {
          _self.workRow.container_manager_id = common.getSelect2Val('container_manager_id')
          await _self.$http.post(apiUrl + 'putboxConfirm', _self.workRow)
          $('#table').bootstrapTable('refresh')
          $('#putboxConfirmModal').modal('hide')
        }
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    },
    rejectloadingAct: async function() {
      let _self = this
      try {
        if (
          $('#formRejectloading')
            .parsley()
            .isValid()
        ) {
          await _self.$http.post(apiUrl + 'rejectLoading', _self.workRow)
          $('#table').bootstrapTable('refresh')
          $('#rejectloadingModal').modal('hide')
        }
      } catch (error) {
        common.dealErrorCommon(_self, error)
      }
    },
    declarationAct: async function(event) {
      let _self = this
      try {
        if (
          $('#formDeclaration')
            .parsley()
            .isValid()
        ) {
          if (_self.files.length <= 0) {
            return common.dealWarningCommon('Please upload loading permission')
          }

          _self.workRow.permission_files = _self.files
          await _self.$http.post(apiUrl + 'declaration', _self.workRow)
          $('#table').bootstrapTable('refresh')
          common.dealSuccessCommon('declaration success')
          $('#declarationModal').modal('hide')
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
