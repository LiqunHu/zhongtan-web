<template>
  <div>
    <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">Web Configuration</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      Sai Schedule
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addScheduleModal">New</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="scheduleTable" :columns="table.scheduleTable.rows" :data="table.scheduleTable.data">
        <template slot-scope="{ row, index }" slot="files">
          <Dropdown style="margin-left: 20px" placement="bottom-end">
            <a href="javascript:void(0)">
              <Icon type="ios-folder-open" size="30"/>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem v-for="f in row.files" v-bind:key="f.url">
                <a :href="f.url" target="_blank">{{f.name}}</a>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>

        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyScheduleModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteSchedule(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.scheduleTable.total" :page-size="table.scheduleTable.limit" @on-change="getScheduleData"/>
    </panel>
    <Modal v-model="modal.scheduleModal" title="Port">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleScheduleModal" ref="formSchedule">
        <FormItem label="Desc" prop="sail_schedule_upload_desc">
          <Input placeholder="Desc" v-model="workPara.sail_schedule_upload_desc"/>
        </FormItem>
        <FormItem label="Files" prop="files">
          <div v-for="f in files" v-bind:key="f.name" class="upload-list">
            <Icon type="ios-document" size="60"/>
          </div>
          <Upload
            ref="upload"
            :default-file-list="defaultList"
            :headers="headers"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['xls','xlsx']"
            :max-size="4096"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            type="drag"
            action="/api/zhongtan/web/SailSchedule/upload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="md-add" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.scheduleModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitSchedule">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
const common = require('@/lib/common')
import PageOptions from '../../../config/PageOptions.vue'
const apiUrl = '/api/zhongtan/web/SailSchedule/'

export default {
  name: 'SailSchedule',
  data: function() {
    return {
      modal: { scheduleModal: false },
      table: {
        scheduleTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Publish Date',
              key: 'publish_date'
            },
            {
              title: 'Desc',
              key: 'sail_schedule_upload_desc'
            },
            {
              title: 'Files',
              slot: 'files'
            },
            {
              title: 'Action',
              slot: 'action'
            }
          ],
          data: [],
          limit: 10,
          offset: 0,
          total: 0,
          search_text: ''
        }
      },
      formRule: {
        ruleScheduleModal: {
          sail_schedule_upload_desc: [{ required: true, trigger: 'change', message: 'Enter description' }]
        }
      },
      defaultList: [],
      files: [],
      headers: common.uploadHeaders(),
      workPara: {},
      action: ''
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getScheduleData(1)
  },
  methods: {
    getScheduleData: async function(index) {
      try {
        if (index) {
          this.table.scheduleTable.offset = (index - 1) * this.table.scheduleTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.scheduleTable.search_text,
          offset: this.table.scheduleTable.offset,
          limit: this.table.scheduleTable.limit
        })
        let data = response.data.info
        this.table.scheduleTable.total = data.total
        this.table.scheduleTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addScheduleModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.files = []
      this.$refs.upload.clearFiles()
      this.$refs.formSchedule.resetFields()
      this.modal.scheduleModal = true
    },
    modifyScheduleModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.defaultList = actrow.files
      this.files = this.$refs.upload.fileList
      this.$refs.formSchedule.resetFields()
      this.modal.scheduleModal = true
    },
    submitSchedule: function() {
      this.$refs.formSchedule.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              this.workPara.files = []
              for (let f of this.files) {
                this.workPara.files.push({
                  url: f.url,
                  name: f.name
                })
              }
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getScheduleData()
            this.modal.scheduleModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteSchedule: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { sail_schedule_upload_id: row.sail_schedule_upload_id })
          this.$Message.success('delete success')
          this.getScheduleData()
        } catch (error) {
          this.$commonact.fault(error)
        }
      })
    },
    // 绑定@imgAdd event
    $imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      let formdata = new FormData()
      formdata.append('file', $file)
      this.$http.post(apiUrl + 'mdupload', formdata).then(response => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        // $vm.$img2Url 详情见本页末尾
        this.$refs.web_article_body.$img2Url(pos, response.data.info.uploadurl)
      })
    },
    $imgDel(pos) {},
    handleSuccess(res, file, fileList) {
      file.url = res.info.url
      file.name = res.info.name
      this.files = this.$refs.upload.fileList
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select xls or xlsx.'
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 4M.'
      })
    }
  }
}
</script>
<style scoped>
.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
</style>