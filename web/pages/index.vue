<template>
    <!-- begin #page-container -->
    <div>
        <page-header></page-header>
        <!-- begin #about -->
        <div class="content">
            <!-- begin container -->
            <div class="container">
                <h2 class="content-title">About us</h2>
                <div class="content-desc">
                    <h3>Chinese-Tanzanian Joint Shipping Company</h3><br />
                    SINOTASHIP, a grand bridge between East Africa and the rest of the world.<br />
                    SINOTASHIP, your most reliable logistics service provider in East Africa.<br />
                    <p class="read-btn-container">
                        <nuxt-link to="/about">More<i class="fa fa-angle-double-right"></i></nuxt-link>
                    </p>
                </div>

                <!-- begin row -->
                <div class="row">
                    <!-- begin col-4 -->
                    <div class="col-md-4 col-sm-6">
                        <!-- begin about -->
                        <div class="about">
                            <h3>Scope</h3>
                            <p>
                                <ul>
                                    <li>Containerized Cargo Transportation Service.</li>
                                    <li>Transportation Services of Bulk&General Cargo、Car&Vehicle、Timber&Log、Oversized&Overweight Cargo.</li>
                                    <li>Shipping Agency Service.</li>
                                    <li>Freight Forwarding & Customs Clearance.</li>
                                    <li>Depot & Warehousing Services.</li>
                                    <li>One-Stop Logistics Solutions.</li>
                                </ul>
                            </p>
                            <p class="read-btn-container">
                                <nuxt-link to="/scope">More<i class="fa fa-angle-double-right"></i></nuxt-link>
                            </p>
                        </div>
                        <!-- end about -->
                    </div>
                    <!-- end col-4 -->
                    <!-- begin col-4 -->
                    <div class="col-md-4 col-sm-12">
                        <h3>Message</h3>
                        <ul class="sidebar-list">
                            <li v-for="m in data.message" :key="m.web_article_id">
                                <nuxt-link :to="'/messagedetail/'+m.web_article_id">{{m.web_article_title}}</nuxt-link>
                            </li>
                        </ul>
                        <p class="read-btn-container">
                            <nuxt-link to="/messages">More<i class="fa fa-angle-double-right"></i></nuxt-link>
                        </p>
                    </div>
                    <!-- end col-4 -->
                    <!-- begin col-4 -->
                    <div class="col-md-4 col-sm-6">
                        <h3>Sail Schedule</h3>
                        <div class="case-quote">
                            <ul class="sidebar-recent-post">
                                <li v-for="s in data.schedule" :key="s.sail_schedule_upload_id">
                                    <div class="info">
                                        <h4 class="title">{{s.sail_schedule_upload_desc}}
                                            <div class="btn-group pull-right">
                                                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                                    <span class="caret"></span>
                                                </button>
                                                <ul class="dropdown-menu">
                                                    <li v-for="f in s.files" :key="f.uploadfile_id"><a :href="f.uploadfile_url">{{f.uploadfile_name}}</a></li>
                                                </ul>
                                            </div>
                                        </h4>
                                        <div class="date">{{s.created_at}}</div>
                                    </div>
                                </li>
                            </ul>
                            <p class="read-btn-container">
                                <nuxt-link to="/schedule">More<i class="fa fa-angle-double-right"></i></nuxt-link>
                            </p>
                        </div>
                    </div>
                    <!-- end col-4 -->
                </div>
                <!-- end row -->
            </div>
            <!-- end container -->
        </div>
        <!-- end #about -->
        <page-footer></page-footer>
    </div>
    <!-- end #page-container -->
</template>
<script>
import request from '~/plugins/request'
import PageHeader from '~/components/PageHeader.vue'
import PageFooter from '~/components/PageFooter.vue'

const apiUrl = '/api/zhongtan/web/Web/'

export default {
  async asyncData({ params }) {
    let { data } = await request.post(apiUrl + 'getHomePageBoard', {})
    return { data: data.info.data }
  },
  head() {
    return {
      title: 'Chinese-Tanzanian Joint Shipping Company'
    }
  },
  components: {
    PageHeader,
    PageFooter
  },
  mounted() {}
}
</script>
<style scoped>
.read-btn-container {
  text-align: right;
  font-size: 12px;
}
.sidebar-list {
  list-style-type: none;
  padding: 0;
  font-size: 12px;
}
.sidebar-list > li > a {
  line-height: 20px;
  color: #333;
  border-bottom: 1px solid #ddd;
  display: block;
  padding: 10px 0;
}
.sidebar-recent-post {
  list-style-type: none;
  padding: 0;
}
.sidebar-recent-post > li {
  padding: 2px 0;
  border-bottom: 1px solid #ddd;
}
.sidebar-recent-post > li .title {
  margin: 0;
  font-size: 13px;
  text-transform: initial;
  letter-spacing: 0;
  line-height: 20px;
}
.sidebar-recent-post > li .date {
  font-size: 11px;
  color: #999;
}
.case-quote {
  position: relative;
  padding: 30px 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  background: #f0f3f4 !important;
}
</style>

