<template>
  <div>
    <section class="content-header">
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Web Control</a></li>
        <li class="active">Messages</li>
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
            <h4 class="modal-title">New Message</h4>
          </div>
          <form @submit.prevent="addOp" id="formA">
            <div class="modal-body">
              <div class="form-group">
                <label><span class="table-required">*</span>Title</label>
                <input class="form-control" v-model="rowData.web_article_title" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <div class="form-group">
                <label><span class="table-required">*</span>Author</label>
                <input class="form-control" v-model="rowData.web_article_author" data-parsley-required="true" maxlength="50" data-parsley-maxlength="50">
              </div>
              <div class="form-group">
                <label>Content</label>
                <mavon-editor ref=md v-model="rowData.web_article_body" @imgAdd="$imgAdd" @imgDel="$imgDel" />
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
const apiUrl = '/api/zhongtan/web/WebControl/'

export default {
  data: function() {
    return {
      imgurl: '',
      rowData: {},
      articleImgs: []
    }
  },
  name: 'WebControl',
  mounted: function() {
    let _self = this
    let $table = $('#table')

    function initTable() {
      window.tableEvents = {
        'click .tableDelete': function(e, value, row, index) {
          common.rowDeleteWithApi(_self, 'DeleteArticle', apiUrl + 'delete', $table, row, 'web_article_id', function() {})
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
          common.BTRowFormatEditable('web_article_title', 'Title'),
          common.BTRowFormatEditable('web_article_author', 'Author'),
          common.BTRowFormatEditable('web_article_body', 'Content'),
          common.actFormatter('act', common.deleteFormatter, tableEvents)
        ],
        idField: 'web_article_id',
        uniqueId: 'web_article_id',
        striped: true,
        clickToSelect: true,
        pagination: true,
        pageSize: 10,
        pageList: [10, 15, 25, 50, 100],
        onEditableShown: function(field, row, $el, editable) {
          _self.oldRow = $.extend(true, {}, row)
        },
        onEditableSave: function(field, row, oldValue, $el) {
          console.log(33333)
          common.rowModifyWithT(_self, apiUrl + 'modify', row, 'web_article_id', $table)
        },
        onPostBody: function() {
          $('[data-name="web_article_body"]').each(function() {
            $(this).editable({
              type: 'mavonEdit',
              placement: 'auto'
            })
          })
        }
      })
      common.changeTableClass($table)
    }

    initTable()

    $('.imageupload').change(function() {
      let maxsize = 2 * 1024 * 1024 // 2M
      let files = this.files
      let fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let filename = files[i].name
          let nameSplit = filename.split('.')
          let postfix = nameSplit[nameSplit.length - 1]
          let fileTypeFlag = '0'
          for (let idx = 0; idx < fileTypes.length; idx++) {
            if (fileTypes[idx] === postfix) {
              fileTypeFlag = '1'
            }
          }
          if (fileTypeFlag === '0') {
            alert('图片文件必须是jpg、jpeg、png、gif、bmp')
            return
          }
          if (files[i].size > maxsize) {
            alert('最大只允许上传2M的文件')
            return
          }
          let formData = new FormData()
          formData.append('file', files[i])

          _self.$http.post(apiUrl + 'mdupload', formData).then(
            response => {
              _self.rowData.article_img = response.data.info.uploadurl
              _self.imgurl = response.data.info.uploadurl
            },
            response => {
              // error callback
              exports.dealErrorCommon(obj, response)
            }
          )
        }
      }
    })
    // initPage()
  },
  methods: {
    addM: function(event) {
      let _self = this
      _self.rowData = {}
      _self.articleImgs = []
      $('#AddModal').modal('show')
    },
    addOp: function(event) {
      let _self = this
      if (
        $('#formA')
          .parsley()
          .isValid()
      ) {
        _self.rowData.article_type = 3
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
    },
    // 绑定@imgAdd event
    $imgAdd(pos, $file) {
      let _self = this
      // 第一步.将图片上传到服务器.
      let formdata = new FormData()
      formdata.append('file', $file)
      _self.$http.post(apiUrl + 'mdupload', formdata).then(response => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        // $vm.$img2Url 详情见本页末尾
        _self.$refs.md.$img2Url(pos, response.data.info.uploadurl)
        _self.articleImgs.push(response.data.info.uploadurl)
      })
    },
    $imgDel(pos) {}
  }
}
</script>
<style scoped>
.modal-dialog-width {
  width: 850px;
}

.avatar-view {
  display: block;
  height: 50px;
  width: 50px;
  border: 3px solid #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  overflow: hidden;
}

.avatar-view img {
  width: 100%;
}
</style>
