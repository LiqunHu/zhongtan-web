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
      File Admin Control
      <small></small>
    </h1>
    <!-- end page-header -->
    <panel title="Panel title here">
        <Row>
            <Col span="20">
                <Breadcrumb>
                    <BreadcrumbItem v-for="item in breadcrumb" :key="item.file_id" to="#" @click.native="handleToFile(item)"> 
                        {{item.file_name}}
                    </BreadcrumbItem>
                </Breadcrumb>
            </Col>
            <Col span="4">
                <div class="form-inline" style="float: right">
                    <div class="form-group m-r-10">
                        <input type="text" v-model="searchData.fileName"  placeholder="file name" class="form-control">
                        <div class="input-group-append">
                            <Button type="primary" @click="handleSearch()">
                            <i class="fa fa-search" style="margin-right: 7px;"></i></Button>
                        </div>
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
                <Button type="text" v-if="row.file_type === '0'" @click="handleLoadFiles(row)">{{row.file_name}}</Button>
                <span v-else>{{row.file_name}}</span>
                <Tag color="success" v-if="row.file_auth === '1'">PUBLIC</Tag>
                <Tag color="primary" v-else>PRIVATE</Tag>
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <i class="fa fa-download" style="cursor: pointer;" @click="handleDownload(row)" v-if="row.file_type === '1'"></i>
            </template>
        </Table>
    </panel>
  </div>
</template>

<script>
const apiUrl = '/api/zhongtan/fileAdmin/ObsFile/'

export default {
    name: 'FileAdminControl',
    data() {
        return {
            searchData: {
                fileName: ''
            },
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
            workRow: '',
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
                let response = await this.$http.post(apiUrl + 'searchAdmin', param)
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
                let response = await this.$http.post(apiUrl + 'searchAdmin', {file_root_id: row.file_id})
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
                let response = await this.$http.post(apiUrl + 'searchAdmin', {})
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
        handleDownload: async function(row) {
            try {
                let response = await this.$http.request({
                    url: apiUrl + 'downloadFileAdmin',
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
    }
}
</script>

<style>

</style>