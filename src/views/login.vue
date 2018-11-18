<template>
  <div>
    <!-- begin #header -->
    <div class="header navbar navbar-default navbar-fixed-top" style="position: relative;">
      <!-- begin container -->
      <div>
        <!-- begin navbar-header -->
        <div class="navbar-header">
          <a href="/" class="navbar-brand">
            <!-- <span class="brand-logo-ship"></span> -->
            <img src="/static/logo.png" class="brand-logo-ship">
            <span class="brand-text">
              <span class="text-theme">SINOTASHIP</span>
            </span>
          </a>
        </div>
        <!-- end navbar-header -->
        <!-- begin navbar-collapse -->
        <div class="collapse navbar-collapse" id="header-navbar">
          <ul class="nav navbar-nav navbar-right" style="margin-right: 0px;">
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
              <a href="/admin">Login</a>
            </li>
          </ul>
        </div>
        <!-- end navbar-collapse -->
      </div>
      <!-- end container -->
      <!-- begin #home -->
      <div id="home" class="home home-bg" style="height: 300px;">
      </div>
      <!-- end #home -->
    </div>
    <!-- end #header -->
    <div class="login-box">
      <div class="login-logo" style="color: #444;"><a href="/"><b>SINOTASHIP</b> Co.</a></div>
      <div class="login-box-body">
        <div>
          <div class="alert alert-danger" v-bind:class="{ 'hidden': isA }">{{ errorMessage }}</div>
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
              <button v-on:click="login" class="btn btn-primary btn-block btn-flat">Submit</button>
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
const common = require('@/lib/common')

export default {
  name: 'login',
  data: function() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isA: true
    }
  },
  mounted: function() {
    $('body').removeClass()
    // $('body').addClass('hold-transition')
    // $('body').addClass('login-page')
  },
  methods: {
    login: function(event) {
      let _self = this
      let encInfo = common.aesEncryptModeCFB(this.username, this.password)
      _self.$http
        .post('/api/auth', {
          username: this.username,
          identifyCode: encInfo[1],
          magicNo: encInfo[0],
          loginType: 'WEB'
        })
        .then(function(response) {
          let token = response.headers.authorization
          if (token) {
            let userinfo = response.data.info
            if (!userinfo.avatar) {
              userinfo.avatar = '/static/images/base/head.jpg'
            }
            common.clearStoreData()
            common.setStoreData('token', token)
            common.setStoreData('userinfo', userinfo)
            _self.$router.push({
              path: '/admin/common/system/home'
            })
          } else {
            _self.errorMessage = '系统错误'
            _self.isA = false
            common.clearStoreData()
          }
        })
        .catch(function(error) {
          _self.errorMessage = '用户名或者密码错误'
          _self.isA = false
          common.clearStoreData()
        })
    }
  }
}
</script>
<style scoped>
.navbar-fixed-top,
.navbar-fixed-bottom {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 1030;
}

.navbar-fixed-top {
  top: 0;
  border-width: 0 0 1px;
}

.navbar-default {
  background-color: #f8f8f8;
  border-color: #e7e7e7;
}

.header.navbar {
  border-bottom: none;
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}

.header.navbar.navbar-default {
  background: #fff;
}

.header .navbar-brand {
  padding: 25px 15px;
}

.text-theme,
a {
  color: #00acac;
}

.navbar-default .navbar-collapse,
.navbar-default .navbar-form {
  border-color: #e7e7e7;
}

.navbar-fixed-top .navbar-collapse,
.navbar-fixed-bottom .navbar-collapse {
  max-height: 340px;
}

.navbar-collapse.collapse {
  display: block !important;
  height: auto !important;
  padding-bottom: 0;
  overflow: visible !important;
}

.navbar-collapse {
  width: auto;
  border-top: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.navbar-collapse {
  padding-right: 15px;
  padding-left: 15px;
  overflow-x: visible;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid transparent;
  -webkit-box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.1);
  box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.1);
}

.collapse {
  display: none;
}

.navbar-right {
  float: right !important;
  margin-right: -15px;
}

.navbar-nav {
  float: left;
  margin: 0;
}

.nav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.navbar-nav > li {
  float: left;
}

.nav > li,
.nav > li > a {
  position: relative;
  display: block;
}

.header.navbar .navbar-nav > li > a {
  font-size: 12px;
  line-height: 20px;
  color: #2d353c;
  font-weight: 600;
  padding: 25px 15px;
}

.nav > li,
.nav > li > a {
  position: relative;
  display: block;
}

a {
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
  color: #337ab7;
  text-decoration: none;
  background-color: transparent;
}

.home {
  padding: 0 !important;
  color: #fff;
}

.home-bg {
  background-image: url(/static/header-main.jpg);
  background-repeat: no-repeat;
  /* background-position: 0px -100px; */
  background-size: cover;
  /* -moz-background-size: 100% 100%; */
}

.brand-logo-ship {
  float: left !important;
  width: 100%;
  max-width: 50px;
  height: auto;
  margin-top: -14px;
}

.login-box-body,
.register-box-body {
  background: #d2d6de;
}
</style>
