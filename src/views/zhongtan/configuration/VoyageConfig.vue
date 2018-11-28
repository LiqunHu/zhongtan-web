<template>
  <div>
    <section class="content-header">
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> System Configuration</a></li>
        <li class="active">Vessel Config</li>
      </ol>
    </section>
    <section class="content">
      <div class="col-lg-12">
        <div class="box box-info">
          <div class="box-body">
            <div class="margin form-inline">
              <div class="form-group">
                <input class="form-control" id="search_text" placeholder="search vessel name, vessel operator, vessel code" style="width: 200px;">
              </div>
              <div class="form-group">
                <button class="btn btn-info" v-on:click="search"><i class="fa fa-search"></i></button>
              </div>
              <div class="form-group  pull-right">
                <button id="addM" class="btn btn-info" v-on:click="addM">
                  <i class="glyphicon glyphicon-plus"></i> Add Voyage
                </button>
              </div>
            </div>
            <table id="table"></table>
          </div>
        </div>
      </div>
    </section>
    <div class="modal fade" id="AddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">Add Voyage</h4>
          </div>
          <form @submit.prevent="addOp" id="formA">
            <div class="modal-body">
              <div class="form-group">
                <label><span class="table-required">*</span>Vessel Name</label>
                <select class="form-control select2" id="vessel_id" data-parsley-required="true"></select>
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>Voyage Number</label>
                <input class="form-control" v-model="rowData.voyage_number" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>ETA Date</label>
                <input class="form-control" id="voyage_eta_date" data-parsley-required="true">
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
const apiUrl = '/api/zhongtan/configuration/VoyageConfig/'

export default {
  data: function() {
    return {
      pagePara: {},
      rowData: {},
      oldRow: {}
    }
  },
  name: 'VoyageConfig',
  mounted: function() {
    let _self = this
    let $table = $('#table')

    function initTable() {
      window.tableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          common.rowDeleteWithApi(
            _self,
            'delete Voyage',
            apiUrl + 'delete',
            $table,
            row,
            'voyage_id',
            function() {}
          )
        }
      }

      function queryParams(params) {
        params.search_text = $('#search_text').val()
        return JSON.stringify(params)
      }
      $table.bootstrapTable({
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
          common.BTRowFormatEdSelect2(
            'vessel_id',
            'Vessel Name',
            _self.pagePara.VesselINFO
          ),
          common.BTRowFormatEditable('voyage_number', 'Voyage Number'),
          common.BTRowFormatEditableDatePicker('voyage_eta_date', 'ETA DATE'),
          common.actFormatter('act', common.deleteFormatter, tableEvents)
        ],
        idField: 'vessel_id',
        uniqueId: 'vessel_id',
        striped: true,
        clickToSelect: true,
        pagination: true,
        pageSize: 10,
        pageList: [10, 15, 25, 50, 100],
        locale: 'zh-CN',
        onEditableShown: function(field, row, $el, editable) {
          _self.oldRow = $.extend(true, {}, row)
        },
        onEditableSave: function(field, row, oldValue, $el) {
          common.rowModifyWithT(_self, apiUrl + 'modify', row, 'voyage_id', $table)
        }
      })
      common.changeTableClass($table)
    }

    function initPage() {
      _self.$http.post(apiUrl + 'init', {}).then(
        response => {
          let retData = response.data.info
          _self.pagePara = $.extend(true, {}, retData)
          common.initSelect2($('#vessel_id'), retData.VesselINFO)
          common.initDatepicker($('#voyage_eta_date'))
          initTable()
          $('#formA').parsley()
          console.log('init success')
        },
        response => {
          console.log('init error')
          common.dealErrorCommon(_self, response)
        }
      )
    }

    $(function() {
      initPage()
    })
  },
  methods: {
    search: function(event) {
      $('#table').bootstrapTable('refresh')
    },
    addM: function(event) {
      let _self = this
      $('#vessel_id')
        .val(null)
        .trigger('change')
      _self.rowData = {}
      $('#AddModal').modal('show')
    },
    addOp: function(event) {
      let _self = this
      if (
        $('#formA')
          .parsley()
          .isValid()
      ) {
        _self.rowData.vessel_id = common.getSelect2Val('vessel_id')
        _self.rowData.voyage_eta_date = $('#voyage_eta_date').val()
        _self.$http.post(apiUrl + 'add', _self.rowData).then(
          response => {
            let retData = response.data.info
            $('#table').bootstrapTable('insertRow', {
              index: 0,
              row: retData
            })
            $('#table').bootstrapTable('resetView')
            _self.rowData = {}
            $('#formA')
              .parsley()
              .reset()
            common.dealSuccessCommon('Add Success')
          },
          response => {
            common.dealErrorCommon(_self, response)
          }
        )
      }
    }
  }
}
</script>
<style scoped>
</style>
