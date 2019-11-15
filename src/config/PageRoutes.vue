<script>
const routes = [
  { path: '*', component: resolve => require(['@/components/error404'], resolve) },
  { path: '/admin', component: resolve => require(['@/views/login'], resolve) },
  { path: '/error', component: resolve => require(['@/components/error'], resolve) },
  { path: '/error404', component: resolve => require(['@/components/error404'], resolve) },
  { path: '/admin/dashboard/home', component: resolve => require(['@/views/home'], resolve) },
  { path: '/admin/common/system/SystemApiControl', component: resolve => require(['@/views/common/system/SystemApiControl'], resolve) },
  { path: '/admin/common/system/GroupControl', component: resolve => require(['@/views/common/system/GroupControl'], resolve) },
  { path: '/admin/common/system/OperatorControl', component: resolve => require(['@/views/common/system/OperatorControl'], resolve) },
  { path: '/admin/common/system/UserProfile', component: resolve => require(['@/views/common/system/UserProfile'], resolve) },
  { path: '/admin/test', component: resolve => require(['@/views/Test'], resolve) },
  { path: '/admin/zhongtan/configuration/PortConfig', component: resolve => require(['@/views/zhongtan/configuration/PortConfig'], resolve) },
  { path: '/admin/zhongtan/configuration/VesselConfig', component: resolve => require(['@/views/zhongtan/configuration/VesselConfig'], resolve) },
  { path: '/admin/zhongtan/configuration/VoyageConfig', component: resolve => require(['@/views/zhongtan/configuration/VoyageConfig'], resolve) },
  { path: '/admin/zhongtan/configuration/ContainerManagerConfig', component: resolve => require(['@/views/zhongtan/configuration/ContainerManagerConfig'], resolve) },
  { path: '/admin/zhongtan/configuration/Customer', component: resolve => require(['@/views/zhongtan/configuration/Customer'], resolve) },
  { path: '/admin/zhongtan/configuration/Employee', component: resolve => require(['@/views/zhongtan/configuration/Employee'], resolve) },
  { path: '/admin/zhongtan/configuration/BillladingNoConfig', component: resolve => require(['@/views/zhongtan/configuration/BillladingNoConfig'], resolve) },
  { path: '/admin/zhongtan/export/Booking', component: resolve => require(['@/views/zhongtan/export/Booking'], resolve) },
  { path: '/admin/zhongtan/export/BookingWork', component: resolve => require(['@/views/zhongtan/export/BookingWork'], resolve) },
  { path: '/admin/zhongtan/import/ImportWork', component: resolve => require(['@/views/zhongtan/import/ImportWork'], resolve) },
  { path: '/admin/zhongtan/export/Receipt', component: resolve => require(['@/views/zhongtan/export/Receipt'], resolve) },
  { path: '/admin/zhongtan/invoice/Invoice', component: resolve => require(['@/views/zhongtan/invoice/Invoice'], resolve) },
  { path: '/admin/zhongtan/web/SailSchedule', component: resolve => require(['@/views/zhongtan/web/SailSchedule'], resolve) },
  { path: '/admin/zhongtan/web/WebConfig', component: resolve => require(['@/views/zhongtan/web/WebConfig'], resolve) }
]

export default routes
</script>
