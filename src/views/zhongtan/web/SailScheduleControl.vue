<template>
  <div>
    <section class="content-header">
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Web Control</a></li>
        <li class="active">Sai Schedule</li>
      </ol>
    </section>
    <section class="content">
      <div class="col-lg-12">
        <div class="box box-info">
          <div class="box-body">
            <div class="margin form-inline">
              <div class="form-group">
                <button id="addM" class="btn btn-info" v-on:click="addM">
                  <i class="glyphicon glyphicon-plus"></i> New
                </button>
              </div>
            </div>
            <table id="table"></table>
          </div>
        </div>
      </div>
    </section>
    <div class="modal fade" id="AddModal">
      <div class="modal-dialog modal-dialog-width">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h4 class="modal-title">New</h4>
          </div>
          <form @submit.prevent="addOp" id="formA">
            <div class="modal-body">
              <h4>Desc</h4>
              <div class="form-group">
                <input class="form-control" v-model="rowData.sail_schedule_upload_desc" data-parsley-required="true" maxlength="100" data-parsley-maxlength="100">
              </div>
              <h4>Files</h4>
              <div class="row">
                <a v-for="f in files" v-bind:key="f.name" class="btn bg-navy btn-app">
                  <i class="fa fa-file .btn-flat"></i> {{f.name}}
                </a>
                <span class="fileupload-button">
                  <a class="btn btn-app">
                    <i class="fa fa-plus"></i> Add
                  </a>
                  <input class="fileupload" type="file" id="fileupload">
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
const apiUrl = '/api/zhongtan/web/SailScheduleControl/'

export default {
  data: function() {
    return {
      rowData: {},
      files: []
    }
  },
  name: 'SailScheduleControl',
  mounted: function() {
    let _self = this
    let $table = $('#table')

    function initTable() {
      window.tableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          common.rowDeleteWithApi(
            _self,
            'Delete',
            apiUrl + 'delete',
            $table,
            row,
            'sail_schedule_upload_id',
            function() {}
          )
        }
      }

      function queryParams(params) {
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
          common.BTRowFormat('publish_date', 'Publish Date'),
          common.BTRowFormat('sail_schedule_upload_desc', 'Desc'),
          common.BTRowFormatWithFormatter('files', 'Files', common.filesFormatter),
          common.actFormatter('act', common.deleteFormatter, tableEvents)
        ],
        idField: 'sail_schedule_upload_id',
        uniqueId: 'sail_schedule_upload_id',
        striped: true,
        clickToSelect: true,
        pagination: true,
        pageSize: 10,
        pageList: [10, 15, 25, 50, 100]
      })
      common.changeTableClass($table)
    }

    initTable()
    common.fileUpload(
      _self,
      $('#fileupload'),
      apiUrl + 'upload',
      function(fileInfo) {
        _self.files.push(fileInfo)
        $('#fileupload').val('')
      },
      response => {
        common.dealErrorCommon(_self, response)
      }
    )
  },
  methods: {
    addM: function(event) {
      let _self = this
      _self.rowData = {}
      _self.files = []
      $('#AddModal').modal('show')
    },
    addOp: function(event) {
      let _self = this
      if (
        $('#formA')
          .parsley()
          .isValid()
      ) {
        _self.rowData.files = _self.files
        _self.$http.post(apiUrl + 'add', _self.rowData).then(
          response => {
            $('#table').bootstrapTable('refresh')
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
.modal-dialog-width {
  width: 850px;
}
</style>
