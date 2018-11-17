<template>
	<!-- begin #header -->
	<div id="header" class="header navbar navbar-default navbar-fixed-top" style="position: relative;">
		<!-- begin container -->
		<div>
			<!-- begin navbar-header -->
			<div class="navbar-header">
				<a href="/" class="navbar-brand">
					<span class="brand-logo-law"></span>
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
						<nuxt-link to="/">Home</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/messages">Messages</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/schedule">Sail Schedule</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/scope">Scope</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/about">About</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/contact">Contract</nuxt-link>
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
		<div id="home" class="home home-bg" style="height: 300px;">
		</div>
		<!-- end #home -->
	</div>
	<!-- end #header -->
</template>
<script>
export default {
  components: {}
}
</script>
<style scoped>
.home-bg {
  background-image: url(/static/header-main.jpg);
  background-repeat: no-repeat;
  /* background-position: 0px -100px; */
  background-size: cover;
  /* -moz-background-size: 100% 100%; */
}
</style>