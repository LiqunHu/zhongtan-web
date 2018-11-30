import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '*', component: resolve => require(['@/components/err404'], resolve) },
    { path: '/admin/', component: resolve => require(['@/views/login'], resolve) },
    { path: '/error404', component: resolve => require(['@/components/err404'], resolve) },
    { path: '/error', component: resolve => require(['@/components/errpage'], resolve) },
    {
      path: '/admin/common/system',
      component: resolve => require(['@/components/mainSystem'], resolve),
      children: [
        { path: 'home', component: resolve => require(['@/views/home'], resolve) },
        { path: 'error401', component: resolve => require(['@/components/err401'], resolve) },
        {
          path: 'SystemApiControl',
          component: resolve => require(['@/views/common/system/SystemApiControl'], resolve)
        },
        {
          path: 'DomainTemplateControl',
          component: resolve => require(['@/views/common/system/DomainTemplateControl'], resolve)
        },
        {
          path: 'DomainControl',
          component: resolve => require(['@/views/common/system/DomainControl'], resolve)
        },
        {
          path: 'DomainGroupControl',
          component: resolve => require(['@/views/common/system/DomainGroupControl'], resolve)
        },
        {
          path: 'DomainGroupApiControl',
          component: resolve => require(['@/views/common/system/DomainGroupApiControl'], resolve)
        },
        {
          path: 'OperatorControl',
          component: resolve => require(['@/views/common/system/OperatorControl'], resolve)
        },
        {
          path: 'UserSetting',
          component: resolve => require(['@/views/common/system/UserSetting'], resolve)
        }
        // { path: 'ResetPassword', component: resolve => require(['@/views/common/system/ResetPassword'], resolve) }
      ]
    },
    {
      path: '/admin/zhongtan/configuration',
      component: resolve => require(['@/components/mainSystem'], resolve),
      children: [
        {
          path: 'PortConfig',
          component: resolve => require(['@/views/zhongtan/configuration/PortConfig'], resolve)
        },
        {
          path: 'VesselConfig',
          component: resolve => require(['@/views/zhongtan/configuration/VesselConfig'], resolve)
        },
        {
          path: 'VoyageConfig',
          component: resolve => require(['@/views/zhongtan/configuration/VoyageConfig'], resolve)
        }
      ]
    },
    {
      path: '/admin/zhongtan/export',
      component: resolve => require(['@/components/mainSystem'], resolve),
      children: [
        {
          path: 'Booking',
          component: resolve => require(['@/views/zhongtan/export/Booking'], resolve)
        },
        {
          path: 'BookingWork',
          component: resolve => require(['@/views/zhongtan/export/BookingWork'], resolve)
        }
      ]
    },
    {
      path: '/admin/zhongtan/web',
      component: resolve => require(['@/components/mainSystem'], resolve),
      children: [
        {
          path: 'WebControl',
          component: resolve => require(['@/views/zhongtan/web/WebControl'], resolve)
        },
        {
          path: 'SailScheduleControl',
          component: resolve => require(['@/views/zhongtan/web/SailScheduleControl'], resolve)
        }
      ]
    }
  ]
})
