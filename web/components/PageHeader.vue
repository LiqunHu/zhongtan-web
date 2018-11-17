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
						<span class="text-theme">COSCO</span> SHIPPING
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
		<div id="home" class="home home-bg" style="height: 400px;">
			<!-- begin content-bg -->
			<!-- <div class="content-bg" >
            <img src="/header-bg.jpg" alt="Home" />
        </div> -->
			<!-- end content-bg -->
			<!-- begin container -->
			<div class="overlay">
				<div class="home-content" style="margin-top: -70px;">
					<h1>SINOTASHIP</h1>
					<h3>PROFESSIONAL</h3>
					<p>
						WE TAKE CARE OF YOUR GOODS<br />
						DELIVER WORD WILD.
					</p>
				</div>
			</div>
			<!-- end container -->
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
  /* background-size: 100% 100%;
  -moz-background-size: 100% 100%; */
}

.home-bg .overlay {
  background: rgba(0, 0, 0, 0.6);
  height: 100%;
  padding: 100px 0;
  position: relative;
  width: 100%;
}
</style>