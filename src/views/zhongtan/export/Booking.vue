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
                                    <button id="apply" class="btn btn-block btn-primary">
                                        <i class="glyphicon glyphicon-save"></i> Booking
                                    </button>
                                </div>
                                <div class="form-group">
                                    <button id="cancel" class="btn btn-danger" disabled>
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
        <!-- <div class="modal" id="applyModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" v-on:click="clear"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="rowEditModalLabel"><i class="fa fa-pencil-square-o big-blue"></i>Booking</h4>
                    </div>
                    <form @submit.prevent="addOp" id="formA">
                        <div class="modal-body">
                            <div class="form-group">
                                <label><span class="table-required">*</span>用户名</label>
                                <input class="form-control" v-model="rowData.user_username" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                            </div>
                            <div class="form-group">
                                <label><span class="table-required">*</span>姓名</label>
                                <input class="form-control" v-model="rowData.user_name" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
                            </div>
                            <div class="form-group">
                                <label>邮箱</label>
                                <input type="emain" class="form-control" v-model="rowData.user_email" data-parsley-type="email">
                            </div>
                            <div class="form-group">
                                <label>手机</label>
                                <input class="form-control" v-model="rowData.user_phone" data-parsley-phone="true">
                            </div>
                            <div class="form-group">
                                <label><span class="table-required">*</span>用户组</label>
                                <select class="form-control select2" id="usergroup_id" data-parsley-required="true"></select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary btn-info"><i class="fa fa-fw fa-plus"></i>确认</button>
                        </div>
                    </form>
                </div>
            </div>
        </div> -->
    </div>
</template>
<script>
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/expory/Booking?method='

export default {
  data: function() {
    return {
      pagePara: '',
      searchDate: ''
    }
  },
  name: 'Booking',
  mounted: function() {
    let _self = this

    function initTable() {
      $('#table').bootstrapTable({
        height: common.getTableHeight(),
        columns: [
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

    function initPage() {
      initTable()
    }

    initPage()
  },
  methods: {}
}
</script>
<style>
</style>
