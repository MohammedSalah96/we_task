var Departments = function () {
    var departmentsGrid;
    var init = function () {
        handleRecords();
        handleSubmit();
    };

    var handleRecords = function () {
        departmentsGrid = AjaxDatatableViewUtils.initialize_table(
          $("#data-table"),
          config.datatable_url,
          {
            processing: false,
            autoWidth: true,
            scrollX: false,
          }
        );
    }
    var handleSubmit = function () {

        $('#addEditDepartmentsForm').validate({
            rules: {
                name: {
                    required: true
                }
            },
            messages:{
               
            },
            //messages: lang.messages,
            highlight: function (element) { // hightlight error inputs
                $(element).addClass("is-invalid");
            },
            unhighlight: function (element) {
                $(element).closest('.form-group').find('.invalid-feedback').html('').hide();
                $(element).removeClass("is-invalid");
            },
            errorPlacement: function (error, element) {
                $(element).closest('.form-group').find('.invalid-feedback').html($(error).html()).show();
            }
        });
        $('#addEditDepartments .submit-form').click(function () {
            if ($('#addEditDepartmentsForm').validate().form()) {
                $('#addEditDepartments .submit-form').prop('disabled', true);
                $('#addEditDepartments .submit-form').html('<i class="fas fa-circle-notch fa-spin"></i>');
                setTimeout(function () {
                    $('#addEditDepartmentsForm').submit();
                }, 1000);

            }
            return false;
        });
        $('#addEditDepartmentsForm input').keypress(function (e) {
            if (e.which == 13) {
                if ($('#addEditDepartmentsForm').validate().form()) {
                    $('#addEditDepartments .submit-form').prop('disabled', true);
                    $('#addEditDepartments .submit-form').html('<i class="fas fa-circle-notch fa-spin"></i>');
                    setTimeout(function () {
                        $('#addEditDepartmentsForm').submit();
                    }, 1000);

                }
                return false;
            }
        });

        $('#addEditDepartmentsForm').submit(function () {
            var id = $('#id').val();
            var csrftoken = $("[name=csrfmiddlewaretoken]").val();
            var method = 'POST'
            var action = "/departments/";
            var formData = $(this).serialize();
            if (id != 0) {
              formData += "&_method=PATCH";
            }
            $.ajax({
              method: method,
              url: action,
              headers: {
                "X-CSRFToken": csrftoken,
              },
              data: formData,
              dataType: "json",
              success: function (data) {
                $("#addEditDepartments .submit-form").prop("disabled", false);
                $("#addEditDepartments .submit-form").html("save");

                if (data.type == "success") {
                  Base.toast(data.message);
                  AjaxDatatableViewUtils.redraw_table($("#data-table"));
                  if (id != 0) {
                    $("#addEditDepartments").modal("hide");
                  } else {
                    Departments.empty();
                  }
                } else {
                  if (typeof data.errors === "object") {
                    for (i in data.errors) {
                      var message = data.errors[i][0];
                      $('[name="' + i + '"]')
                        .closest(".form-group")
                        .find(".invalid-feedback")
                        .html(message)
                        .show();
                      $('[name="' + i + '"]').addClass("is-invalid");
                    }
                  }
                }
              },
              error: function (xhr, textStatus, errorThrown) {
                $("#addEditDepartments .submit-form").prop("disabled", false);
                $("#addEditDepartments .submit-form").html("save");
                Base.ajax_error_message(xhr);
              },
            });

            return false;

        })
    }



    return{
        init: function () {
            init();
        },
        edit: function (t) {
            var id = $(t).attr("data-id");
            Base.editForm({
              element: t,
              data: { id: id },
              url: "/departments/",
              success: function (data) {
                Departments.empty();
                Base.setModalTitle("#addEditDepartments", "Edit Department");
                $("#id").val(data.data["id"]);
                $("#name").val(data.data["name"]);
                $("#code").val(data.data["code"]);
                $("#addEditDepartments").modal("show");
              },
            });

        },
        delete: function (t) {
            if(confirm('Are you sure you want to delete this ?')){
                var id = $(t).attr("data-id");
                var csrftoken = $("[name=csrfmiddlewaretoken]").val();
                Base.deleteForm({
                  element: t,
                  url: "/departments/",
                  data: {
                    id: id,
                    _method: "DELETE",
                    csrfmiddlewaretoken: csrftoken,
                  },
                  success: function (data) {
                    AjaxDatatableViewUtils.redraw_table($("#data-table"));
                    Base.toast(data.message);
                  },
                });
            }else{
                return false;
            }  
            
        },
        add: function () {
            Departments.empty();
            Base.setModalTitle("#addEditDepartments", "Add Department");
            $('#addEditDepartments').modal('show');
        },
        empty: function () {
            $('#id').val(0);
            $('.invalid-feedback').html('');
            Base.emptyForm();
        },
    };
}();
$(document).ready(function () {
    Departments.init();
});