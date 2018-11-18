<template>
    <!-- begin #page-container -->
    <div>
        <common-header></common-header>
        <div class="container">
            <article class="page">
                <header class="border-left entry-header">
                    <h1 class="entry-title">中国-坦桑尼亚联合海运公司<br />
                        Chinese-Tanzanian Joint Shipping Company</h1>
                    <div class="blog-meta metabox">
                        <span class="entry-elem">
                            <i class="fa fa-calendar"></i>
                            2018-11-16 </span>
                        <span class="separator">|</span>
                    </div>
                </header><!-- .entry-header -->

                <div class="entry-content">
                    <blockquote>中国-坦桑尼亚联合海运公司（简称中坦公司），是在中国已故前总理周恩来和坦桑尼亚首任总统尼雷尔的亲自关心下，于1967年在坦桑尼亚成立。中坦公司是中国政府在坦最早投资企业，是中坦投资合作的起点。中、坦两国政府本着“友好合作、平等互利”的原则，各占公司50%股份。<br />
                        Chinese-Tanzanian Joint Shipping Company (SINOTASHIP) was established in Tanzania in 1967 under the personal care of the late Chinese Premier Zhou Enlai and Tanzanian founding President Mwalimu K. Nyerere. SINOTASHIP is the earliest enterprise invested by Chinese government in Tanzania, and is the beginning for the investment cooperation between China and Tanzania. Based on the principle of “friendly cooperation, equality and mutual benefit”, each government holds 50% of the Company’s share.</blockquote>
                    <blockquote>中坦公司成立50多年来，不仅取得了显著的经济效益，而且在中坦两国的政治、外交和经济交往中，发挥重要作用，为增进中坦两国人民友谊做出了积极贡献。曾被赞誉为“两国政府成功合作的典范”、“两国人民友谊的标志”。<br />
                        Since its establishment more than 50 years ago, SINOTASHIP has not only achieved remarkable economic benefits, but also played an important role in the political, diplomatic and economic exchanges between China and Tanzania, and has made positive contributions to enhancing friendship between the two nations. It has been praised as "a model of successful cooperation between the two governments" and "a sign of friendship between the two nations."</blockquote>
                    <blockquote>作为船队规模及综合运力排名世界第一的中国远洋海运集团在坦桑尼亚唯一指定代理，中坦公司依托中国远洋海运集团的品牌优势、集团旗下众多专业化运输船队及其遍布全球的代理机构和网络优势，中坦公司为进出口客户提供集装箱、散杂货、重大件货物海上运输，以及陆路运输和堆场、仓储、报关等门到门全程供应链服务。<br />
                        As the exclusive agent of China COSCO SHIPPING Group(who ranks No.1 in the world in terms of total fleet capacity) in Tanzania, relying on the brand advantage of COSCO SHIPPING and the Group’s vast fleets, as well as its global network, SINOTASHIP provides full supply chain services including container, bulk and specialized cargo sea transportation, integrated logistics such as hinterland transportation, warehousing, and customs clearance for all import and export customers. </blockquote>
                    <blockquote><b>中坦公司，将东非和世界更紧密相连。<br />
                            SINOTASHIP, a grand bridge between East Africa and the rest of the world.</b></blockquote>
                    <blockquote><b>中坦公司，您在东非最可信赖的物流服务商。<br />SINOTASHIP, your most reliable logistics service provider in East Africa.</b></blockquote>
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
  head() {
    return {
      title: 'About SINOTASHIP'
    }
  },
  mounted() {}
}
</script>
<style scoped>
.page {
  font-family: 'Open Sans', sans-serif;
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
.entry-header h1,
.entry-header h2 {
  margin-top: 0;
  margin-bottom: 15px;
}

.page-content,
.entry-content,
.entry-summary {
  margin: 1.5em 0 0;
}

blockquote,
q {
  quotes: '' '';
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