<template>
  <!-- begin #page-container -->
  <div>
    <common-header></common-header>
    <div id="contact" class="content bg-silver-lighter" data-scrollview="true">
      <!-- begin container -->
      <div class="container">
        <h2 class="content-title">Contact Us</h2>
        <!-- begin row -->
        <div class="row">
          <!-- begin col-6 -->
          <div class="col-md-6 fadeInLeft contentAnimated finishAnimated" data-animation="true" data-animation-type="fadeInLeft">
            <h3>Contact Information</h3>
            <p>
              <strong>Chinese - Tanzanian Joint Shipping Company (SINOTASHIP)</strong>
              <br>31 Kisutu Street, P.O.Box 696, Dar es Salaam, Tanzania
              <br>For any cargo & container tracking and vessel schedule, please log on
              <br>
              <a herf="http://www.coscon.com">http://www.coscon.com</a>
              <br>
              <br>We are endeavoring to provide satisfactory services to all our customers.
              If any advice or complaints, you are welcome to send email to
              <br>
              <a href="mailto:admin@sinotaship.com">admin@sinotaship.com</a>
              <br>
              <br>We appreciate your opinions.
            </p>
            <p>
              <span class="phone">+255 22 211 3389</span>
              <br>
              <a href="mailto:export@sinotaship.com">export@sinotaship.com</a>
              <br>
              <a href="mailto:operations@sinotaship.com">operations@sinotaship.com</a>
            </p>
          </div>
          <!-- end col-6 -->
          <!-- begin col-6 -->
          <div class="col-md-6 form-col fadeInRight contentAnimated finishAnimated" data-animation="true" data-animation-type="fadeInRight">
            <form class="form-horizontal">
              <div class="form-group">
                <label class="control-label col-md-3">
                  Name
                  <span class="text-theme">*</span>
                </label>
                <div class="col-md-9">
                  <input type="text" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3">
                  Email
                  <span class="text-theme">*</span>
                </label>
                <div class="col-md-9">
                  <input type="text" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3">
                  Message
                  <span class="text-theme">*</span>
                </label>
                <div class="col-md-9">
                  <textarea class="form-control" rows="10"></textarea>
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3"></label>
                <div class="col-md-9 text-left">
                  <button type="submit" class="btn btn-theme btn-block">Submit</button>
                </div>
              </div>
            </form>
          </div>
          <!-- end col-6 -->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
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
      title: 'SINOTASHIP CONTACT'
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
</style>