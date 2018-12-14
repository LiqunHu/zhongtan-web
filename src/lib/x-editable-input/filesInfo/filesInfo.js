/**
packInfo editable input.
Internally value stored as {city: "Moscow", street: "Lenina", building: "15"}

@class filesInfo
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
const common = require('@/lib/common')

;(function($) {
  'use strict'

  let filesInfo = function(options) {
    this.init('filesInfo', options, filesInfo.defaults)
  }

  function strFormat(str) {
    if (str.length > 10) {
      return str.substring(0, 7) + '...'
    } else {
      return str
    }
  }

  // inherit from Abstract input
  $.fn.editableutils.inherit(filesInfo, $.fn.editabletypes.abstractinput)

  $.extend(filesInfo.prototype, {
    /**
    Renders input from tpl

    @method render()
    **/
    render: function() {
      this.$table = this.$tpl.find('table')

      this.$table.bootstrapTable({
        columns: [
          common.BTRowFormat('date', 'Create Date'),
          common.BTRowFormat('name', 'File Name'),
          
        ]
      })
    },

    /**
    Default method to show value in element. Can be overwritten by display option.

    @method value2html(value, element)
    **/
    value2html: function(value, element) {
      var html =
        $('<div>')
          .text(value.date)
          .html() +
        '<br/>' +
        $('<div>')
          .text(strFormat(value.place))
          .html() +
        '<br/>' +
        $('<div>')
          .text(strFormat(value.requirement))
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
      this.$date.val(value.date)
      this.$place.val(value.place)
      this.$requirement.val(value.requirement)
    },
    /**
     Returns value of input.

     @method input2value()
    **/
    input2value: function() {
      return {
        date: this.$date.val(),
        place: this.$place.val(),
        requirement: this.$requirement.val()
      }
    },

    /**
        Activates input: sets focus on the first field.

        @method activate()
       **/
    activate: function() {
      this.$input.filter('[name="place"]').focus()
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

  filesInfo.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
    tpl: `<div><table></table></div>`,
    inputclass: ''
  })

  $.fn.editabletypes.filesInfo = filesInfo
})(window.jQuery)
