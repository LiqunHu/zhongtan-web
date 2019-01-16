<template>
  <div style="height:100%; background-color: #fff;">
    <!-- begin #header -->
    <div class="lheader lnavbar lnavbar-default lnavbar-fixed-top" style="position: relative;">
      <!-- begin container -->
      <div>
        <!-- begin navbar-header -->
        <div class="lnavbar-header">
          <a href="/" class="lnavbar-brand">
            <!-- <span class="brand-logo-ship"></span> -->
            <img src="/static/logo.png" class="brand-logo-ship">
            <span class="brand-text">
              <span class="text-theme">SINOTASHIP</span>
            </span>
          </a>
        </div>
        <!-- end navbar-header -->
        <!-- begin navbar-collapse -->
        <div class="lcollapse lnavbar-collapse" id="header-navbar">
          <ul class="lnav lnavbar-nav lnavbar-right" style="margin-right: 0px;">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/schedule">Sail Schedule</a>
            </li>
            <li>
              <a href="/messages">Messages</a>
            </li>
            <li>
              <a href="/scope">Scope</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contract</a>
            </li>
            <li>
              <a href="/admin/">Login</a>
            </li>
          </ul>
        </div>
        <!-- end navbar-collapse -->
      </div>
      <!-- end container -->
      <!-- begin #home -->
      <div id="home" class="lhome lhome-bg" style="height: 300px;"></div>
      <!-- end #home -->
    </div>
    <!-- end #header -->
    <div class="login-box">
      <div class="login-logo" style="color: #444;">
        <a href="/">
          <b>SINOTASHIP</b> Co.
        </a>
      </div>
      <div class="login-box-body">
        <div>
          <div class="alert alert-danger" v-show="isA">{{ errorMessage }}</div>
          <div class="form-group has-feedback">
            <input v-model="username" type="text" class="form-control" placeholder="username">
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback">
            <input v-model="password" type="password" class="form-control" placeholder="password">
            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
          </div>
          <div class="row">
            <div class="col-xs-4">
              <button v-on:click="checkForm" class="btn btn-primary btn-block btn-flat">Submit</button>
            </div>
            <!-- /.col -->
          </div>
        </div>

        <div class="social-auth-links text-center">
          <p></p>
        </div>
        <!-- /.social-auth-links -->
      </div>
      <!-- /.login-box-body -->
    </div>
    <!-- /.login-box -->
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import PageOptions from '../config/PageOptions.vue'
const common = require('@/lib/common')

export default {
  name: 'login',
  data: function() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isA: false
    }
  },
  created() {
    PageOptions.pageEmpty = true
  },
  beforeRouteLeave(to, from, next) {
    PageOptions.pageEmpty = false
    next()
  },
  methods: {
    ...mapActions('access', ['login', 'logout']),
    checkForm: function(e) {
      e.preventDefault()
      let _self = this
      let encInfo = common.aesEncryptModeCFB(this.username, this.password)
      _self.$http
        .post('/api/auth/signin', {
          username: this.username,
          identify_code: encInfo[1],
          magic_no: encInfo[0],
          login_type: 'WEB'
        })
        .then(function(response) {
          let userinfo = response.data.info
          if (userinfo.Authorization) {
            if (!userinfo.avatar) {
              userinfo.avatar = '/static/images/base/head.jpg'
            }
            // common.clearStoreData()
            // common.setStoreData('token', token)
            // common.setStoreData('userinfo', userinfo)
            _self.login({ userInfo: userinfo }).then(() => {
              _self.$router.push({ path: '/admin/dashboard/home' })
            })
          } else {
            _self.errorMessage = '系统错误'
            _self.isA = true
            _self.logout()
          }
        })
        .catch(function() {
          _self.errorMessage = '用户名或者密码错误'
          _self.isA = true
          _self.logout()
        })
    }
  }
}
</script>
<style scoped>
.lnavbar {
  position: relative;
  min-height: 50px;
  margin-bottom: 20px;
  border: 1px solid transparent;
}

.lnavbar-default {
  background-color: #f8f8f8;
  border-color: #e7e7e7;
}

.lnavbar-fixed-top {
  top: 0;
  border-width: 0 0 1px;
}

.lheader.navbar.lnavbar-default {
  background: #fff;
}

.lheader.lnavbar {
  border-bottom: none;
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}

.lheader.lnavbar.lnavbar-default {
  background: #fff;
}

.lnavbar-header {
  float: left;
}

.lheader .lnavbar-brand {
  padding: 25px 15px;
}

.lnavbar-default .lnavbar-brand {
  color: #777;
}

.lnavbar-brand {
  float: left;
  height: 50px;
  padding: 15px;
  font-size: 18px;
  line-height: 20px;
}

.brand-logo-ship {
  float: left !important;
  width: 100%;
  max-width: 50px;
  height: auto;
  margin-top: -14px;
}

.lnavbar-brand > img {
  display: block;
}

.lnavbar-collapse {
  width: auto;
  border-top: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.lnavbar-collapse {
  padding-right: 15px;
  padding-left: 15px;
  overflow-x: visible;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid transparent;
  -webkit-box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.1);
  box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.1);
}

.lnavbar-collapse.lcollapse {
  display: flow-root !important;
  height: auto !important;
  padding-bottom: 0;
  overflow: visible !important;
}

.lnavbar-fixed-bottom .lnavbar-collapse,
.lnavbar-fixed-top .lnavbar-collapse,
.lnavbar-static-top .lnavbar-collapse {
  padding-right: 15px;
  padding-left: 15px;
}

.lnavbar-fixed-top .lnavbar-collapse {
  max-height: 340px;
}

.lnavbar-default .lnavbar-collapse {
  border-color: #e7e7e7;
}

.lnavbar-right {
  float: right !important;
  margin-right: -15px;
}

.lnavbar-nav {
  float: left;
  margin: 0;
}

.lnav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.btn-group-vertical > .btn-group:after,
.btn-group-vertical > .btn-group:before,
.btn-toolbar:after,
.btn-toolbar:before,
.clearfix:after,
.clearfix:before,
.container-fluid:after,
.container-fluid:before,
.container:after,
.container:before,
.dl-horizontal dd:after,
.dl-horizontal dd:before,
.form-horizontal .form-group:after,
.form-horizontal .form-group:before,
.modal-footer:after,
.modal-footer:before,
.modal-header:after,
.modal-header:before,
.lnav:after,
.lnav:before,
.lnavbar-collapse:after,
.lnavbar-collapse:before,
.lnavbar-header:after,
.lnavbar-header:before,
.lnavbar:after,
.lnavbar:before,
.pager:after,
.pager:before,
.panel-body:after,
.panel-body:before,
.row:after,
.row:before {
  display: table;
  content: ' ';
}

.lnav > li,
.lnav > li > a {
  position: relative;
  display: block;
}

.lnavbar-nav > li {
  float: left;
}

.lheader.lnavbar .lnavbar-nav > li > a {
  font-size: 12px;
  line-height: 20px;
  color: #2d353c;
  font-weight: 600;
  padding: 25px 15px;
}

.lhome {
  padding: 0 !important;
  color: #fff;
}

.lhome-bg {
  background-image: url(/static/header-main.jpg);
  background-repeat: no-repeat;
  /* background-position: 0px -100px; */
  background-size: cover;
  /* -moz-background-size: 100% 100%; */
}
.login-box {
  width: 360px;
  margin: 7% auto;
}

.login-logo {
  font-size: 35px;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 300;
}

.login-box-body {
  background: #d2d6de;
  padding: 20px;
  border-top: 0;
  color: #666;
}

a {
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
  color: #337ab7;
  text-decoration: none;
  background-color: transparent;
}
</style>
