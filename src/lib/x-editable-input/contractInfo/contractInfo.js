/**
packInfo editable input.
Internally value stored as {city: "Moscow", street: "Lenina", building: "15"}

@class contractInfo
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

  let contractInfo = function(options) {
    this.init('contractInfo', options, contractInfo.defaults)
  }

  // inherit from Abstract input
  $.fn.editableutils.inherit(contractInfo, $.fn.editabletypes.abstractinput)

  $.extend(contractInfo.prototype, {
    /**
    Renders input from tpl

    @method render()
    **/
    render: function() {
      this.$input = this.$tpl.find('input')
    },

    /**
    Default method to show value in element. Can be overwritten by display option.

    @method value2html(value, element)
    **/
    value2html: function(value, element) {
      var html =
        $('<div>')
          .text(value.name)
          .html() +
        '<br/>' +
        $('<div>')
          .text(value.address)
          .html() +
        '<br/>' +
        $('<div>')
          .text(value.telephone)
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
      this.$input.filter('[name="name"]').val(value.name)
      this.$input.filter('[name="address"]').val(value.address)
      this.$input.filter('[name="telephone"]').val(value.telephone)
    },
    /**
     Returns value of input.

     @method input2value()
    **/
    input2value: function() {
      return {
        name: this.$input.filter('[name="name"]').val(),
        address: this.$input.filter('[name="address"]').val(),
        telephone: this.$input.filter('[name="telephone"]').val()
      }
    },

    /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
    activate: function() {
      this.$input.filter('[name="name"]').focus()
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

  contractInfo.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
    tpl: `<div>
    <div>
        <label class="col-sm-4 control-label">Name:</label>
        <div class="col-sm-8">
            <input class="form-control type="text" name="name">
        </div>
    </div>
    <div>
        <label class="col-sm-4 control-label">Address:</label>
        <div class="col-sm-8">
            <input class="form-control type="text" name="address">
        </div>
    </div>
    <div>
        <label class="col-sm-4 control-label">Telephone:</label>
        <div class="col-sm-8">
            <input class="form-control type="text" name="telephone">
        </div>
    </div>
</div>`,
    inputclass: ''
  })

  $.fn.editabletypes.contractInfo = contractInfo
})(window.jQuery)
