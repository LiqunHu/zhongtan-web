<template>
  <div>
     <!-- begin breadcrumb -->
    <ol class="breadcrumb pull-right">
      <li class="breadcrumb-item active">
        <a href="javascript:;">File</a>
      </li>
    </ol>
    <!-- end breadcrumb -->
    <!-- begin page-header -->
    <h1 class="page-header">
      File Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
        <Row>
            <Col span="16">
                <Breadcrumb>
                    <BreadcrumbItem v-for="item in breadcrumb" :key="item.file_id" to="#" @click.native="handleToFile(item)"> {{item.file_name}}</BreadcrumbItem>
                </Breadcrumb>
            </Col>
            <Col span="8">
                <div class="form-inline" style="float: right">
                    <div class="form-group m-r-10">
                        <input type="text" v-model="searchData.fileName"  placeholder="file name" class="form-control">
                        <div class="input-group-append">
                            <Button type="primary" @click="handleSearch()">
                            <i class="fa fa-search" style="margin-right: 7px;"></i></Button>
                        </div>
                    </div>
                    <div class="form-group m-r-10">
                        <Button type="primary" @click="uploadFileModal(workRow)">
                            <i class="fa fa-file-download" style="margin-right: 7px;"></i>Upload</Button>
                    </div>
                    <div class="form-group m-r-10">
                        <Button type="primary" @click="handleCreateFolder(workRow)">
                            <i class="fa fa-folder-plus" style="margin-right: 7px;"></i>New Folder</Button>
                    </div>
                </div>
            </Col>
        </Row>
        <Table border ref="fileTable" :columns="tables.fileColumns" :data="datas.fileData" style="margin-top:15px;">
            <template slot-scope="{ row, index }" slot="file_name">
                <i class="fa fa-folder-open" style="margin-right: 7px;" v-if="row.file_type === '0'"></i>
                <i class="fa fa-file-excel" style="margin-right: 7px;" v-else-if="row.file_type === '1' && row.file_ext && (row.file_ext === '.xlsx' || row.file_ext === '.xls')"></i>
                <i class="fa fa-file-word" style="margin-right: 7px;" v-else-if="row.file_type === '1' && row.file_ext && (row.file_ext === '.doc' || row.file_ext === '.docx')"></i>
                <i class="fa fa-file-pdf" style="margin-right: 7px;" v-else-if="row.file_type === '1' && row.file_ext && (row.file_ext === '.pdf')"></i>
                <i class="fa fa-file" style="margin-right: 7px;" v-else></i>
                <!-- <Icon v-if="row.file_type === '0'" type="ios-folder-outline" /> -->
                <!-- <Icon v-if="row.file_type === '1'" type="ios-document-outline" /> -->
                <Button type="text" v-if="row.file_type === '0'" @click="handleLoadFiles(row)">{{row.file_name}}</Button>
                <span v-else>{{row.file_name}}</span>
                <span v-if="row.file_belong === userInfo.user_id">
                    <Button type="success" size="small" v-if="row.file_auth === '1'" @click="handleChangeAuth(row)">PUBLIC</Button>
                    <Button type="primary" size="small" v-else @click="handleChangeAuth(row)">PRIVATE</Button>
                </span>
                <span v-else>
                    <Tag color="success" v-if="row.file_auth === '1'">PUBLIC</Tag>
                    <Tag color="primary" v-else>PRIVATE</Tag>
                </span>
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <i class="fa fa-download" style="margin-left: 7px; cursor: pointer;" @click="handleDownload(row)" v-if="row.file_type === '1'"></i>
                <i class="fa fa-upload" style="margin-left: 7px; cursor: pointer;" @click="uploadFileModal(row)" v-if="row.file_type === '0' && row.file_belong === userInfo.user_id"></i>
                <i class="fa fa-folder-plus" style="margin-left: 7px; cursor: pointer;" @click="handleCreateFolder(row)" v-if="row.file_type === '0' && row.file_belong === userInfo.user_id"></i>
            </template>
        </Table>
    </panel>
    <Modal v-model="modal.uploadModal" title="Upload File">
      <Form :label-width="100">
        <FormItem label="Files">
            <Upload
                ref="uploadFile"
                :headers="headers"
                :show-upload-list="false"
                :on-success="handleSuccess"
                action="/api/zhongtan/file/ObsFile/uploadFile"
            >
            <Button icon="ios-cloud-upload-outline">Upload files</Button>
            </Upload>
        </FormItem>
        <FormItem>
          <div v-for="f in uploadFileList" v-bind:key="f.name" class="upload-list">
            <i class="fa fa-file-excel" style="margin-right: 7px;" v-if="f.ext && (f.ext === '.xlsx' || f.ext === '.xls')"></i>
            <i class="fa fa-file-word" style="margin-right: 7px;" v-else-if="f.ext && (f.ext === '.doc' || f.ext === '.docx')"></i>
            <i class="fa fa-file-pdf" style="margin-right: 7px;" v-else-if="f.ext && (f.ext === '.pdf')"></i>
            <i class="fa fa-file" style="margin-right: 7px;" v-else></i>
            {{ f.name }}
            <i class="fa fa-trash-alt" style="color: red; margin-left: 7px;" @click="handelDeleteFile(f)"></i>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal.uploadModal=false">Cancel</Button>
        <Button type="primary" size="large" @click="handleSaveFiles">Submit</Button>
      </div>
    </Modal>
    <Modal v-model="modal.createFolderModal" title="Create Folder">
        <Form :label-width="160" :model="createFolderForm" :rules="createFolderRules" >
            <FormItem label="Folder Name" prop="folder_name">
                <Input placeholder="Folder Name" v-model="createFolderForm.folder_name" clearable></Input>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button type="text" size="large" @click="modal.createFolderModal=false">Cancel</Button>
            <Button type="primary" size="large" @click="handleSaveFolder">Submit</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
const apiUrl = '/api/zhongtan/file/ObsFile/'
const common = require('@/lib/common')
import { mapState } from 'vuex'

export default {
    name: 'FileControl',
    computed: {
        ...mapState('access', {
        userInfo: state => state.userInfo
        })
    },
    data() {
        return {
            headers: common.uploadHeaders(),
            modal: {uploadModal: false, createFolderModal: false},
            searchData: {
                fileName: ''
            },
            uploadFileList: [],
            breadcrumb: [],
            tables: {
                fileColumns:[
                    {
                        title: 'Name',
                        slot: 'file_name',
                    },
                    {
                        title: 'Action',
                        slot: 'action',
                        width: '200px',
                    },
                    {
                        title: 'Size',
                        key: 'file_size_value',
                        width: '200px',
                    },
                    {
                        title: 'Create At',
                        key: 'created_at',
                        width: '200px',
                    },
                    {
                        title: 'Create By',
                        key: 'user_name',
                        width: '200px',
                    },
                ],
            },
            datas: {
                fileData:[]
            },
            createFolderForm: {
                file_root_id: '',
                folder_name: '`'
            },
            workRow: '',
            createFolderRules: {
                folder_name: [{
                    required: true,
                    message: 'The folder name cannot be empty',
                    trigger: 'blur'
                }]
            },
        }
    },
    mounted: async function() {
        await this.handleLoadFiles()
    },
    methods: {
        handleSearch: async function() {
            if(this.searchData.fileName) {
                this.workRow = ''
                let param = {
                    ... this.searchData
                }
                if(this.breadcrumb && this.breadcrumb.length > 1) {
                    param.file_root_id = this.breadcrumb[this.breadcrumb.length - 1].data.file_id
                }
                let response = await this.$http.post(apiUrl + 'search', param)
                let data = response.data.info
                if(data && data.rows) {
                    this.datas.fileData = JSON.parse(JSON.stringify(data.rows))
                }
            } else {
                if(this.breadcrumb && this.breadcrumb.length > 0) {
                    this.handleToFile(this.breadcrumb[this.breadcrumb.length - 1])
                } else {
                    this.handleLoadFiles()
                }
            }
        },
        handleLoadFiles: async function(row) {
            if(row) {
                this.workRow = JSON.parse(JSON.stringify(row))
                let response = await this.$http.post(apiUrl + 'search', {file_root_id: row.file_id})
                let data = response.data.info
                if(data && data.rows) {
                    this.datas.fileData = JSON.parse(JSON.stringify(data.rows))
                    this.breadcrumb.push({
                        file_name: row.file_name,
                        file_id: row.file_id,
                        data: JSON.parse(JSON.stringify(row))
                    })
                }
            } else {
                this.workRow = ''
                let response = await this.$http.post(apiUrl + 'search', {})
                let data = response.data.info
                if(data && data.rows) {
                    this.datas.fileData = JSON.parse(JSON.stringify(data.rows))
                    this.breadcrumb.push({
                        file_name: 'My Files',
                        file_id: 0,
                        data: {}
                    })
                }
            }
        },
        handleToFile: async function(item) {
            let breadcrumb = []
            for(let i = 0; i < this.breadcrumb.length; i++) {
                if(this.breadcrumb[i].file_id === item.file_id) {
                    break
                } else {
                    breadcrumb.push(JSON.parse(JSON.stringify(this.breadcrumb[i])))
                }
            }
            this.breadcrumb = breadcrumb
            if(item.file_id === 0) {
                this.handleLoadFiles()
            } else {
                this.handleLoadFiles(item.data)
            }
        },
        uploadFileModal: async function(row) {
            if(row) {
                if(row.file_belong === this.userInfo.user_id) {
                    this.workRow = JSON.parse(JSON.stringify(row))
                } else {
                    this.$Message.error('Files cannot be uploaded from folders that are not your own')
                    return
                }
            } else {
                this.workRow = ''
            }
            this.uploadFileList = []
            this.$nextTick(function() {
                this.$refs.uploadFile.clearFiles()
            })
            this.modal.uploadModal = true
        },
        handleSuccess: async function(res, file, fileList) {
            if(res && res.info) {
                this.uploadFileList.push(res.info)
            }
        },
        handelDeleteFile: async function(f) {
            let index = this.uploadFileList.indexOf(f)
            if(index >= 0) {
                this.uploadFileList.splice(index, 1)
            }
        },
        handleSaveFiles: async function() {
            if(this.uploadFileList && this.uploadFileList.length > 0) {
                try {
                    let response = await this.$http.post(apiUrl + 'saveFiles', {files: this.uploadFileList, row: this.workRow})
                    if(response.data.info && response.data.info.length > 0) {
                        this.$Message.success('submit fail')
                    } else {
                        this.$Message.success('submit success')
                        this.modal.uploadModal = false
                        this.handleSearch()
                    }
                } catch (error) {
                    this.$commonact.fault(error)
                }
            } else {
                return this.$Message.error('Please upload file')
            }
        },
        handleDownload: async function(row) {
            try {
                let response = await this.$http.request({
                    url: apiUrl + 'downloadFile',
                    method: 'post',
                    data: row,
                    responseType: 'blob'
                })
                let blob = response.data
                let reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onload = e => {
                    let a = document.createElement('a')
                    a.download = row.file_name
                    a.href = e.target.result
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                }
                this.$Message.success('download success')
            } catch (error) {
                this.$commonact.fault(error)
            }
        },
        handleCreateFolder: async function(row) {
            if(row) {
                if(row.file_belong === this.userInfo.user_id) {
                    this.workRow = JSON.parse(JSON.stringify(row))
                    this.createFolderForm.file_root_id = row.file_id
                    this.createFolderForm.folder_name = ''
                } else {
                    this.$Message.error('Cannot create a new folder that is not your own')
                    return
                }
            } else {
                this.workRow = ''
                this.createFolderForm.file_root_id = ''
                this.createFolderForm.folder_name = ''
            }
            this.modal.createFolderModal = true
        },
        handleSaveFolder: async function() {
            try {
                await this.$http.post(apiUrl + 'createFolder', this.createFolderForm)
                this.$Message.success('create folder success')
                this.modal.createFolderModal = false
                this.handleSearch()
            } catch (error) {
                this.$commonact.fault(error)
            }
        },
        handleChangeAuth :async function(row) {
            try {
                console.log('handleChangeAuth', row)
                await this.$http.post(apiUrl + 'changeAuth', row)
                this.$Message.success('change auth success')
                if(this.breadcrumb && this.breadcrumb.length > 0) {
                    this.handleToFile(this.breadcrumb[this.breadcrumb.length - 1])
                } else {
                    this.handleLoadFiles()
                }
            } catch (error) {
                console.log('error', error)
                this.$commonact.fault(error)
            }
        }
    }
}
</script>

<style>

</style>