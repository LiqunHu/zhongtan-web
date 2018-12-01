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
                <label><span class="table-required">*</span>Freight Charge</label>
                <input class="form-control" v-model="workRow.billloading_freight_charge" data-parsley-required="true" data-parsley-type="number">
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-info"><i class="fa fa-fw fa-plus"></i>Submit</button>
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
          <form @submit.prevent="BookingConfirmAct" id="formBookingConfirm">
            <div class="modal-body">
              <div class="form-group">
                <label>Continer Yard</label>
                <select class="form-control select2" id="container_yard_id" data-parsley-required="true"></select>
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
      oldRow: {}
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
        $('#container_yard_id')
          .val(null)
          .trigger('change')
        $('#putboxConfirmModal').modal('show')
      }
    }

    function actFormatter(value, row) {
      let retrunString = ['<div class="btn-group">']
      if (row.billloading_state === 'PBK') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 booking">Booking</button>')
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 cancelb">Cancel</button>')
      } else if(row.billloading_state === 'PA') {
        retrunString.push('<button type="button" class="btn btn-primary btn-xs m-r-5 putbox-confirm">Confirm</button>')
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
          common.BTRowFormatEdSelect2('billloading_loading_port_id', 'Loading Poart', _self.pagePara.PortINFO),
          common.BTRowFormatEdSelect2('billloading_discharge_port_id', 'Discharge Poart', _self.pagePara.PortINFO),
          common.BTRowFormatEditable('billloading_delivery_place', 'Delivery Place'),
          common.BTRowFormatEditable('billloading_stuffing_place', 'Stuffing Place'),
          common.BTRowFormatEditableDatePicker('billloading_stuffing_date', 'Stuffing Date'),
          common.BTRowFormatEditablePop('billloading_stuffing_requirement', 'Stuffing requirement')
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

        common.initSelect2($('#container_yard_id'), retData.ContainerYardINFO)
        $('#putboxConfirmModal').parsley()
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
          $('#putboxConfirmModal')
            .parsley()
            .isValid()
        ) {
          _self.workRow.container_yard_id = common.getSelect2Val('container_yard_id')
          await _self.$http.post(apiUrl + 'putboxConfirm', _self.workRow)
          $('#table').bootstrapTable('refresh')
          $('#bookingConfirmModal').modal('hide')
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
