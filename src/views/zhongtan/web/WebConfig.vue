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
      Messages
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
      <template slot="beforeBody">
        <div class="panel-toolbar">
          <div class="form-inline">
            <div class="input-group m-r-10">
              <input type="text" placeholder="search port name, port name cn, number" v-model="table.messageTable.search_text" class="form-control">
              <div class="input-group-append">
                <button type="button" class="btn btn-info" @click="getMessageData(1)">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group m-r-10">
              <button type="button" class="btn btn-info" @click="addMessageModal">New</button>
            </div>
          </div>
        </div>
      </template>
      <Table stripe ref="messageTable" :columns="table.messageTable.rows" :data="table.messageTable.data">
        <template slot-scope="{ row, index }" slot="action">
          <a href="#" class="btn btn-info btn-icon btn-sm" @click="modifyMessageModal(row)">
            <i class="fa fa-edit"></i>
          </a>
          <a href="#" class="btn btn-danger btn-icon btn-sm" @click="deleteMessage(row)">
            <i class="fa fa-times"></i>
          </a>
        </template>
      </Table>
      <Page class="m-t-10" :total="table.messageTable.total" :page-size="table.messageTable.limit" @on-change="getMessageData"/>
    </panel>
    <Modal v-model="modal.messageModal" title="Port" width="1000">
      <Form :model="workPara" :label-width="120" :rules="formRule.ruleMessageModal" ref="formMessage">
        <FormItem label="Title" prop="web_article_title">
          <Input placeholder="Title" v-model="workPara.web_article_title"/>
        </FormItem>
        <FormItem label="Author" prop="web_article_author">
          <Input placeholder="Author" v-model="workPara.web_article_author"/>
        </FormItem>
        <FormItem label="Content" prop="web_article_body">
          <mavon-editor ref="web_article_body" v-model="workPara.web_article_body" @imgAdd="$imgAdd" @imgDel="$imgDel"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.messageModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="submitMessage">Submit</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import PageOptions from '../../../config/PageOptions.vue'
const common = require('@/lib/common')
const apiUrl = '/api/zhongtan/web/WebConfig/'

export default {
  name: 'WebControl',
  data: function() {
    return {
      modal: { messageModal: false },
      table: {
        messageTable: {
          rows: [
            {
              type: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Title',
              key: 'web_article_title'
            },
            {
              title: 'Author',
              key: 'web_article_author'
            },
            {
              title: 'Content',
              key: 'web_article_body',
              render: common.tooltipRender()
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
        ruleMessageModal: {
          port_name: [{ required: true, trigger: 'change', message: 'Enter port name' }],
          port_name_cn: [{ required: true, trigger: 'change', message: 'Enter port name cn' }],
          port_code: [{ required: true, trigger: 'change', message: 'Enter port code' }],
          port_country: [{ required: true, trigger: 'change', message: 'Choose port country' }]
        }
      },
      pagePara: {},
      oldPara: {},
      workPara: {},
      action: ''
    }
  },
  created() {
    PageOptions.pageEmpty = false
  },
  mounted: function() {
    this.getMessageData(1)
  },
  methods: {
    getMessageData: async function(index) {
      try {
        if (index) {
          this.table.messageTable.offset = (index - 1) * this.table.messageTable.limit
        }

        let response = await this.$http.post(apiUrl + 'search', {
          search_text: this.table.messageTable.search_text,
          offset: this.table.messageTable.offset,
          limit: this.table.messageTable.limit
        })
        let data = response.data.info
        this.table.messageTable.total = data.total
        this.table.messageTable.data = JSON.parse(JSON.stringify(data.rows))
      } catch (error) {
        this.$commonact.fault(error)
      }
    },
    addMessageModal: async function() {
      this.workPara = {}
      this.action = 'add'
      this.$refs.formMessage.resetFields()
      this.modal.messageModal = true
    },
    modifyMessageModal: async function(row) {
      let actrow = JSON.parse(JSON.stringify(row))
      delete actrow._index
      delete actrow._rowKey
      this.oldPara = JSON.parse(JSON.stringify(actrow))
      this.workPara = JSON.parse(JSON.stringify(actrow))
      this.action = 'modify'
      this.$refs.formMessage.resetFields()
      this.modal.messageModal = true
    },
    submitMessage: function() {
      this.$refs.formMessage.validate(async valid => {
        if (valid) {
          try {
            if (this.action === 'add') {
              await this.$http.post(apiUrl + 'add', this.workPara)
              this.$Message.success('add port success')
            } else if (this.action === 'modify') {
              await this.$http.post(apiUrl + 'modify', { old: this.oldPara, new: this.workPara })
              this.$Message.success('modify port success')
            }
            this.getMessageData()
            this.modal.messageModal = false
          } catch (error) {
            this.$commonact.fault(error)
          }
        }
      })
    },
    deleteMessage: function(row) {
      this.$commonact.confirm('delete confirmed?', async () => {
        try {
          await this.$http.post(apiUrl + 'delete', { port_id: row.port_id })
          this.$Message.success('delete success')
          this.getMessageData()
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
    $imgDel(pos) {}
  }
}
</script>