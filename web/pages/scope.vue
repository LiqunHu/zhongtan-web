<template>
  <!-- begin #page-container -->
  <div>
    <common-header></common-header>
    <div class="container">
      <article class="page">
        <header class="border-left entry-header">
          <h1 class="entry-title">Business Scope</h1>
          <div class="blog-meta metabox">
            <span class="entry-elem">
              <i class="fa fa-calendar"></i>
              2018-11-16 </span>
            <span class="separator">|</span>
            <span class="entry-elem">
              <i class="fa fa-comment"></i>
              SINOTASHIP </span>
          </div>
        </header><!-- .entry-header -->

        <div class="entry-content">
          <blockquote>SINOTASHIP owns ocean going bulk carriers with professional operating & management team, engaged in bulk & dry cargo transport, routes covering the far east and south east Asia to Africa, Red Sea, Persian Gulf, and other areas of the globe. The company will give full play to half a century of professional experience, continuously strengthen cooperation with clients and charters, provide sea transport services and door-to-door logistics solutions with the highest quality</blockquote>
          <blockquote>As the exclusive agent of China COSCO SHIPPING Corporation Limited (who ranks no.1 in the world in terms of total fleet size and DWT capacity) and its subordinate enterprises in Tanzania, relying on China COSCO SHIPPING’s brand advantage, large-scale, quick-response, global logistics network (which consists of more than 1000 branches all over the world), with foothold in Tanzania and East Africa, SINOTASHIP provides below services to global clients:<br />
            <ol>
              <li>Containerized Cargo Transportation Service.</li>
              <li>Transportation Services of Bulk&General Cargo、Car&Vehicle、Timber&Log、Oversized&Overweight Cargo.</li>
              <li>Shipping Agency Service.</li>
              <li>Freight Forwarding & Customs Clearance.</li>
              <li>Depot & Warehousing Services.</li>
              <li>One-Stop Logistics Solutions.</li>
            </ol>
          </blockquote>
          <ul>
            <li>
              <h4>Containerized Cargo Transportation Service.</h4><br />
              <blockquote>We SINOTASHIP, as agent of COSCO SHIPPING LINES CO.,LTD., provide containerized cargo transportation services to/from East Africa countries(including inland countries such as Ethiopia, Sudan, Uganda, Rwanda, Congo, Burundi, Zambia, Malawi and etc.).We have variable containers such as GP, FL, OT, Reefer for your cargo. By direct call or transshipment, we connect East Africa with Far East, South & West Asia, Middle East, Mediterranean Sea, Europe, Oceania, North & West Africa and etc. to realize your dreams of transporting cargoes between East Africa and the rest of the world.</blockquote>
            </li>
            <li>
              <h4>Transportation Services of Bulk&General Cargo、Car&Vehicle、Timber&Log、Oversized&Overweight Cargo.</h4><br />
              <blockquote>SINOTASHIP not only owns bulk vessels and professional management team, as agent of COSCO SHIPPING BULK CO.,LTD.and COSCO SHIPPING SPECIALIZED CARRIERS CO.,LTD.,we can also provide transportation services of general & bulk cargo、car & vehicle、timber&log and awkward cargo to/from East Africa to our global clients. Our professional services as well as reasonable prices are your best choices.</blockquote>
            </li>
            <li>
              <h4>Shipping Agency Service.</h4><br />
              <blockquote>We provide professional and diversified agency services for all vessels calling Tanzania and East Africa. Our long-term close relationship with local government administrations such as Port Authorities, Customs, and Maritime Safety Administrations ensure that we are able to provide more satisfactory services to you. </blockquote>
            </li>
            <li>
              <h4>Freight Forwarding & Customs Clearance.</h4><br />
              <blockquote>We provide services such as booking, customs clearance & quarantine, land transportation, issuing B/L, exchanging D/O and etc. We are engaged in safer and more prompt cargo transportation.</blockquote>
            </li>
            <li>
              <h4>Depot & Warehousing Services.</h4><br />
              <blockquote>We own depot and warehouse and provide depot and warehousing services including cargo receiving & releasing, storage, packaging, boxing & unboxing, LCL and etc.</blockquote>
            </li>
            <li>
              <h4>One-Stop Logistics Solutions.</h4><br />
              <blockquote>With the background of China COSCO SHIPPING’s professional vibrant talent team, powerful capacity on variable transportations including container, bulk & general cargo, energy, specialized cargo and comprehensive logistics, global business network, as well as SINOTASHIP’s 50-years deep plough in East Africa, we can provide one-stop & door-to-door logistics solutions to your cargoes to and from East Africa region. A commitment to us, a worry-free journey to you!</blockquote>
            </li>
          </ul>
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
  head() {
    return {
      title: 'SINOTASHIP Scope'
    }
  },
  components: {
    CommonHeader,
    PageFooter
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