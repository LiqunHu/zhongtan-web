<template>
  <!-- begin sidebar nav -->
  <ul class="nav" v-if="userInfo.menulist">
    <li class="nav-header">Navigation</li>
    <template v-for="menu in userInfo.menulist">
      <sidebar-nav-list ref="sidebarNavList" v-bind:menu="menu" v-bind:key="menu.menu_name" v-bind:status="menu.status" v-on:collapse-other="handleCollapseOther(menu)"></sidebar-nav-list>
    </template>
    <!-- begin sidebar minify button -->
    <li>
      <a href="javascript:;" class="sidebar-minify-btn" v-on:click="handleSidebarMinify()">
        <i class="fa fa-angle-double-left"></i>
      </a>
    </li>
    <!-- end sidebar minify button -->
  </ul>
  <!-- end sidebar nav -->
</template>

<script>
import { mapState } from 'vuex'
import SidebarNavList from './SidebarNavList.vue'
import PageOptions from '../../config/PageOptions.vue'

export default {
  name: 'SidebarNav',
  components: {
    SidebarNavList
  },
  computed: {
    ...mapState('access', {
      userInfo: state => state.userInfo
    })
  },
  data() {
    return {
      pageOptions: PageOptions
    }
  },
  methods: {
    handleCollapseOther: function(menu) {
      for (let i = 0; i < this.userInfo.menulist.length; i++) {
        this.$refs.sidebarNavList[i].collapse(menu)
      }
    },
    handleSidebarMinify: function() {
      this.pageOptions.pageSidebarMinified = !this.pageOptions.pageSidebarMinified
    }
  }
}
</script>
