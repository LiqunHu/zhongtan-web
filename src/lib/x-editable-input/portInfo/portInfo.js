/**
packInfo editable input.
Internally value stored as {city: "Moscow", street: "Lenina", building: "15"}

@class portInfo
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

  let portInfo = function(options) {
    this.init('portInfo', options, portInfo.defaults)
  }

  // inherit from Abstract input
  $.fn.editableutils.inherit(portInfo, $.fn.editabletypes.abstractinput)

  $.extend(portInfo.prototype, {
    /**
    Renders input from tpl

    @method render()
    **/
    render: function() {
      this.$loading = this.$tpl.find('select[id="loading"]')
      this.$discharge = this.$tpl.find('select[id="discharge"]')

      this.$loading.select2({
        tags: false,
        width: '200px',
        data: this.options.source.PortINFO
      })
      this.$discharge.select2({
        tags: false,
        width: '200px',
        data: this.options.source.PortINFO
      })
    },

    /**
    Default method to show value in element. Can be overwritten by display option.

    @method value2html(value, element)
    **/
    value2html: function(value, element) {
      let PortINFO = this.options.source.PortINFO
      function getPortName(id) {
        for (let p of PortINFO) {
          if (p.id == id) {
            return p.text
          }
        }
        return ''
      }
      var html =
        $('<div>')
          .text('Loading: ' + getPortName(value.loading))
          .html() +
        '<br/>' +
        $('<div>')
          .text('Discharge: ' + getPortName(value.discharge))
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
      _this.$loading.val(value.loading).trigger('change')
      _this.$discharge.val(value.discharge).trigger('change')
    },
    /**
     Returns value of input.

     @method input2value()
    **/
    input2value: function() {
      return {
        loading: this.$loading.val(),
        discharge: this.$discharge.val()
      }
    },

    /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
    activate: function() {
      this.$loading.focus()
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

  portInfo.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
    tpl: `<div class="row" style="display: grid;">
    <div class="editable-form">
        <label class="col-sm-3 control-label">Loading Port</label>
        <div class="col-sm-8">
        <select class="form-control select2" id="loading"></select>
        </div>
    </div>
    <div class="editable-form">
        <label class="col-sm-3 control-label">Discharge Port</label>
        <div class="col-sm-8">
        <select class="form-control select2" id="discharge"></select>
        </div>
    </div>
</div>`,
    inputclass: ''
  })

  $.fn.editabletypes.portInfo = portInfo
})(window.jQuery)
