<template>
  <div>
    <section class="content-header">
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> System Configuration</a></li>
        <li class="active">Port Config</li>
      </ol>
    </section>
    <section class="content">
      <div class="col-lg-12">
        <div class="box box-info">
          <div class="box-body">
            <div class="margin form-inline">
              <div class="form-group">
                <input class="form-control" id="search_text" placeholder="search port name, port name cn, number" style="width: 200px;">
              </div>
              <div class="form-group">
                <button class="btn btn-info" v-on:click="search"><i class="fa fa-search"></i></button>
              </div>
              <div class="form-group  pull-right">
                <button id="addM" class="btn btn-info" v-on:click="addM">
                  <i class="glyphicon glyphicon-plus"></i> Add Port
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
            <h4 class="modal-title">Add Port</h4>
          </div>
          <form @submit.prevent="addOp" id="formA">
            <div class="modal-body">
              <div class="form-group">
                <label><span class="table-required">*</span>Port Name</label>
                <input class="form-control" v-model="rowData.portinfo_name" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>Port CN Name</label>
                <input class="form-control" v-model="rowData.portinfo_name_cn" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>Port Code</label>
                <input type="emain" class="form-control" v-model="rowData.portinfo_code" data-parsley-required="true" maxlength="20" data-parsley-maxlength="20">
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>Port Country</label>
                <select class="form-control select2" id="portinfo_country" data-parsley-required="true"></select>
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
const apiUrl = '/api/zhongtan/configuration/PortConfig/'

export default {
  data: function() {
    return {
      pagePara: {},
      rowData: {},
      oldRow: {}
    }
  },
  name: 'PortConfig',
  mounted: function() {
    let _self = this
    let $table = $('#table')

    function initTable() {
      window.tableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          common.rowDeleteWithApi(
            _self,
            'delete port',
            apiUrl + 'delete',
            $table,
            row,
            'portinfo_id',
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
            'portinfo_country',
            'Port Country',
            _self.pagePara.PortCountryINFO
          ),
          common.BTRowFormatEditable('portinfo_name', 'Port Name'),
          common.BTRowFormatEditable('portinfo_name_cn', 'CN Port Name'),
          common.BTRowFormatEditable('portinfo_code', 'Port Code'),
          common.actFormatter('act', common.deleteFormatter, tableEvents)
        ],
        idField: 'portinfo_id',
        uniqueId: 'portinfo_id',
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
          common.rowModifyWithT(
            _self,
            apiUrl + 'modify',
            row,
            'portinfo_id',
            $table
          )
        }
      })
      common.changeTableClass($table)
    }

    function initPage() {
      _self.$http.post(apiUrl + 'init', {}).then(
        response => {
          let retData = response.data.info
          _self.pagePara = $.extend(true, {}, retData)
          common.initSelect2($('#portinfo_country'), retData.PortCountryINFO)
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
      _self.rowData = {}
      $('#portinfo_country')
        .val(null)
        .trigger('change')
      $('#AddModal').modal('show')
    },
    addOp: function(event) {
      let _self = this
      if (
        $('#formA')
          .parsley()
          .isValid()
      ) {
        _self.rowData.portinfo_country = common.getSelect2Val(
          'portinfo_country'
        )
        _self.$http.post(apiUrl + 'add', _self.rowData).then(
          response => {
            let retData = response.data.info
            $('#table').bootstrapTable('insertRow', {
              index: 0,
              row: retData
            })
            $('#table').bootstrapTable('resetView')
            _self.rowData = {}
            $('#usergroup_id')
              .val(null)
              .trigger('change')
            $('#formA')
              .parsley()
              .reset()
            common.dealSuccessCommon('增加成功')
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
