var Base = function () {


    return {
      //main function to initiate the theme
      init: function () {},
      toast: function (message) {
        toastr.options = {
          debug: false,
          positionClass: "toast-bottom-left",
          onclick: null,
          fadeIn: 300,
          fadeOut: 1000,
          timeOut: 5000,
          extendedTimeOut: 1000,
          showEasing: "swing",
          hideEasing: "linear",
          showMethod: "fadeIn",
          hideMethod: "fadeOut",
        };
        toastr.success(message, 'Message');
      },
      ajax_error_message: function (xhr) {
        var message;
        if (xhr.status == 403) {
          message = "The action you have requested is not allowed";
        } else {
          message = xhr.responseText;
          if (typeof xhr.responseJSON !== "undefined") {
            message = xhr.responseJSON.message;
          }
        }
        bootbox.dialog({
          message: message,
          title: "Error",
          buttons: {
            danger: {
              label: "Close",
              className: "red",
            },
          },
        });
      },
      emptyForm: function () {
        $(
          'input[type="text"],input[type="email"],input[type="date"],input[type="password"],input[type="number"],textarea'
        ).val("");
      },
      setModalTitle: function (id, title) {
        $(id + "Label").html(title);
      },
      editForm: function (args) {
        $.ajax({
          url: args.url,
          data: args.data,
          type: "GET",
          success: function (data) {
            args.success(data);
          },
          error: function (xhr, textStatus, errorThrown) {
            $(".loading").addClass("hide");
            Base.ajax_error_message(xhr);
          },
          dataType: "json",
        });
        return false;
      },
      clearFormErrors: function () {
        $(".has-error").removeClass("has-error");
        $(".help-block").html("");
      },
      Ajax: function (args) {
        $.ajax({
          url: config.site_url + args.url,
          data: args.data,
          success: function (data) {
            args.success(data);
          },
          error: function (xhr, textStatus, errorThrown) {
            bootbox.dialog({
              message: xhr.responseText,
              title: "Error",
              buttons: {
                danger: {
                  label: "close",
                  className: "red",
                },
              },
            });
          },
          dataType: "json",
          type: "post",
        });
        return false;
      },
      deleteForm: function (args) {
        $(args.element).html('<i class="fa fa-spin fa-spinner"></i>');
        $.ajax({
          url: args.url,
          data: args.data,
          success: function (data) {
            if (data.type == "success") {
              $(args.element).closest("tr").fadeOut("slow");
              args.success(data);
            } else {
              $(args.element).html('<i class="fa-solid fa-trash"></i>');
              bootbox.dialog({
                message: "<p>" + data.message + "</p>",
                title: "Warining message",
                buttons: {
                  danger: {
                    label: "Close",
                    className: "red",
                  },
                },
              });
            }
          },
          error: function (xhr, textStatus, errorThrown) {
            $(args.element).html('<i class="fa-solid fa-trash"></i>');
            $(".loading").addClass("hide");
            Base.ajax_error_message(xhr);
          },
          dataType: "json",
          type: "post",
        });
      },
    };

}();

jQuery(document).ready(function () {
    Base.init();
});

