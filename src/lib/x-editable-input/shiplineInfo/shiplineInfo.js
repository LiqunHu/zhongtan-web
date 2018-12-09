/**
packInfo editable input.
Internally value stored as {city: "Moscow", street: "Lenina", building: "15"}

@class shiplineInfo
@extends abstractinput
@final
@example
<a href="#" id="address" data-type="shpackInfoipv" data-pk="1">awesome</a>
<script>
$(function(){
    $('#address').editable({
        url: '/post',
        title: 'Enter city, street and building #',
        value: {
            city: "Moscow",
            street: "Lenina",
            building: "15"
        }
    });
});
</script>
**/

;(function($) {
  'use strict'

  let shiplineInfo = function(options) {
    this.init('shiplineInfo', options, shiplineInfo.defaults)
  }

  // inherit from Abstract input
  $.fn.editableutils.inherit(shiplineInfo, $.fn.editabletypes.abstractinput)

  $.extend(shiplineInfo.prototype, {
    /**
    Renders input from tpl

    @method render()
    **/
    render: function() {
      console.log(33333333)
      this.$vessel = this.$tpl.find('select[id="vessel"]')
      this.$voyage = this.$tpl.find('select[id="voyage"]')

      this.$vessel.select2({
        tags: false,
        width: '200px',
        data: this.options.source.VesselINFO
      })
    },

    /**
    Default method to show value in element. Can be overwritten by display option.

    @method value2html(value, element)
    **/
    value2html: function(value, element) {
      var html =
        $('<div>')
          .text(value.vessel_name)
          .html() +
        '<br/>' +
        $('<div>')
          .text(value.voyage_number)
          .html()
      $(element).html(html)
    },

    /**
    Gets value from element's html

    @method html2value(html)
    **/
    html2value: function(html) {
      /*
        you may write parsing method to get value by element's html
        e.g. "Moscow, st. Lenina, bld. 15" => {city: "Moscow", street: "Lenina", building: "15"}
        but for complex structures it's not recommended.
        Better set value directly via javascript, e.g.
        editable({
            value: {
                city: "Moscow",
                street: "Lenina",
                building: "15"
            }
        });
      */
      return null
    },

    /**
     Converts value to string.
     It is used in internal comparing (not for sending to server).

     @method value2str(value)
    **/
    value2str: function(value) {
      var str = ''
      if (value) {
        for (var k in value) {
          str = str + k + ':' + value[k] + ';'
        }
      }
      return str
    },

    /*
     Converts string to value. Used for reading value from 'data-value' attribute.

     @method str2value(str)
    */
    str2value: function(str) {
      /*
      this is mainly for parsing value defined in data-value attribute.
      If you will always set value by javascript, no need to overwrite it
      */
      return str
    },

    /**
     Sets value of input.

     @method value2input(value)
     @param {mixed} value
    **/
    value2input: function(value) {
      let _this = this
      function initVoyageAndSetValue() {
        _this.$voyage.html('')
        _this.options.source._self.$http
          .post(_this.options.source.apiUrl + 'searchVoyage', {
            vessel_id: _this.$vessel.val()
          })
          .then(res => {
            _this.$voyage.select2({
              tags: false,
              width: '200px',
              data: res.data.info.VoyageINFO
            })
            _this.$voyage.val(value.voyage).trigger('change')
          })
      }
      function initVoyage() {
        _this.$voyage.html('')
        _this.options.source._self.$http
          .post(_this.options.source.apiUrl + 'searchVoyage', {
            vessel_id: _this.$vessel.val()
          })
          .then(res => {
            _this.$voyage.select2({
              tags: false,
              width: '200px',
              data: res.data.info.VoyageINFO
            })
          })
      }
      _this.$vessel.on('change', initVoyageAndSetValue)
      _this.$vessel.val(value.vessel).trigger('change')
      _this.$vessel.off('change')
      _this.$vessel.on('change', initVoyage)
    },
    /**
     Returns value of input.

     @method input2value()
    **/
    input2value: function() {
      return {
        vessel: this.$vessel.val(),
        voyage: this.$voyage.val()
      }
    },

    /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
    activate: function() {
      this.$vessel.focus()
    },

    /**
     Attaches handler to submit form in case of 'showbuttons=false' mode

     @method autosubmit()
    **/
    autosubmit: function() {
      this.$input.keydown(function(e) {
        if (e.which === 13) {
          $(this)
            .closest('form')
            .submit()
        }
      })
    }
  })

  shiplineInfo.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
    tpl: `<div>
    <div>
        <label class="col-sm-4 control-label">Vessel</label>
        <div class="col-sm-8">
        <select class="form-control select2" id="vessel"></select>
        </div>
    </div>
    <div>
        <label class="col-sm-4 control-label">Voyage</label>
        <div class="col-sm-8">
        <select class="form-control select2" id="voyage"></select>
        </div>
    </div>
</div>`,
    inputclass: ''
  })

  $.fn.editabletypes.shiplineInfo = shiplineInfo
})(window.jQuery)
