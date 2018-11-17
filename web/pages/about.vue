<template>
  <!-- begin #page-container -->
    <div>
        <common-header></common-header>
        <div class="container">
          <article class="page">
            <header class="border-left entry-header">
              <h1 class="entry-title">Chinese-Tanzanian Joint Shipping Company</h1>
              <div class="blog-meta metabox">
                <span class="entry-elem">
                  <i class="fa fa-calendar"></i>
                2018-11-16							</span>
                <span class="separator">|</span>
              </div>
            </header><!-- .entry-header -->

            <div class="entry-content">
              <blockquote>Chinese-Tanzanian Joint Shipping Company (SINOTASHIP) was established in Tanzania in 1967 under the personal care of the late Chinese Premier Zhou Enlai and Tanzanian founding President Mwalimu K.  Nyerere. SINOTASHIP is the earliest enterprise invested by Chinese government in Tanzania, and is the beginning for the investment cooperation between China and Tanzania. Based on the principle of “friendly cooperation, equality and mutual benefit”, each government holds 50% of the Company’s share.</blockquote>
              <blockquote>Since its establishment more than 50 years ago, SINOTASHIP has not only achieved remarkable economic benefits, but also played an important role in the political, diplomatic and economic exchanges between China and Tanzania, and has made positive contributions to enhancing friendship between the two nations. It has been praised as "a model of successful cooperation between the two governments" and "a sign of friendship between the two nations."</blockquote>
              <blockquote>As the exclusive agent of China COSCO SHIPPING Group(who ranks No.1 in the world in terms of total fleet capacity) in Tanzania, relying on the brand advantage of COSCO SHIPPING and the Group’s vast fleets, as well as its global network, SINOTASHIP provides full supply chain services including container, bulk and specialized cargo sea transportation, integrated logistics such as hinterland transportation, warehousing, and customs clearance for all import and export customers. </blockquote>
              <blockquote><b>SINOTASHIP, a grand bridge between East Africa and the rest of the world.</b></blockquote>
              <blockquote><b>SINOTASHIP, your most reliable logistics service provider in East Africa.</b></blockquote>
             </div><!-- .entry-content -->

            <footer class="entry-footer"></footer><!-- .entry-footer -->
          </article>
        </div>
        <page-footer></page-footer>
    </div>
    <!-- end #page-container -->
</template>

<script>
import CommonHeader from '~/components/CommonHeader.vue'
import PageFooter from '~/components/PageFooter.vue'

export default {
  components: {
    CommonHeader,
    PageFooter
  },
  head () {
    return {
      title: 'About SINOTASHIP',
    }
  },
  mounted() {
  },
}
</script>
<style scoped>
.page {
  font-family: "Open Sans", sans-serif;
  line-height: 25px;
  -ms-word-wrap: break-word;
  word-wrap: break-word;
  color: #775f5e;
}
.hentry {
    margin: 0 0 1.5em;
}
.border-left {
    padding-left: 24px;
    -webkit-box-shadow: inset 4px 0 0 0 rgba(50, 50, 50, 0.1);
    box-shadow: inset 4px 0 0 0 rgba(50, 50, 50, 0.1);
}
.entry-header h1, .entry-header h2 {
    margin-top: 0;
    margin-bottom: 15px;
}

.page-content, .entry-content, .entry-summary {
    margin: 1.5em 0 0;
}

blockquote, q {
    quotes: "" "";
}
blockquote {
    margin: 0 1.5em;
}
blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
}
p {
  font-size: 17px;
}

.blog-meta {
    background: none !important;
}

.metabox {
    color: #000;
    clear: both;
    background-color: rgb(221, 223, 225);
    padding: 10px 0px 10px 0px;
    font-size: 15px;
    font-family: 'Poppins';
}

.metabox i {
    color: #14cab4;
    padding: 4px;
}

.metabox .separator {
    color: #14cab4;
}

.metabox .entry-elem {
    padding: 0 0 0 20px;
    margin: 0 13px 0 0;
}
.blog-meta .entry-elem {
    padding-left: 0px !important;
}
</style>