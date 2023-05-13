var Users = (function () {

  var init = function () {
    handleRecords();
    handleSubmit();
    handleResetTree();
  };

  var handleResetTree = function(){
    $('#reset-btn').on('click', function () { 
      $("#users-tree").jstree(true).settings.core.data.url = "/users";
      $("#users-tree").jstree(true).refresh(false, true);
     })
  };

  var handleRecords = function () {
    $("#users-tree")
      .jstree({
        core: {
          data: {
            url: function (node) {
              return "/users";
            },
            data: function (node) {
              return {
                parent: node.id,
              };
            },
          },
        },
      })
      .on("activate_node.jstree", function (e, data) {
        $(".edit-node, .delete-node").remove();
        if (data.node.id.includes("user-")){
          id = data.node.id.replace("user-", "");
          $("#" + data.node.a_attr.id)
            .closest(".jstree-node")
            .append(
              ' <a href="#" onclick="Users.edit(this);return false;" data-id="' +
                id +
                '" class="btn btn-sm btn-primary edit-node" title="edit"><i class="fa-solid fa-pencil"></i></a> ' +
                ' <a href="#" onclick="Users.delete(this);return false;" data-id="' +
                id +
                '" class="btn btn-sm btn-danger delete-node" title="delete"><i class="fa-solid fa-trash"></i></a> '
            );
          }
      });
  };
  var handleSubmit = function () {
    $("#addEditUsersForm").validate({
      rules: {
        username: {
          required: true,
        },
        email: {
          required: true,
          email: true
        },
        mobile: {
          required: true,
        },
        dob: {
          required: true,
        },
        salary: {
          required: true,
        },
        department: {
          required: true,
        },
      },
      messages: {},
      //messages: lang.messages,
      highlight: function (element) {
        // hightlight error inputs
        $(element).addClass("is-invalid");
      },
      unhighlight: function (element) {
        $(element)
          .closest(".form-group")
          .find(".invalid-feedback")
          .html("")
          .hide();
        $(element).removeClass("is-invalid");
      },
      errorPlacement: function (error, element) {
        $(element)
          .closest(".form-group")
          .find(".invalid-feedback")
          .html($(error).html())
          .show();
      },
    });
    $("#addEditUsers .submit-form").click(function () {
      if ($("#addEditUsersForm").validate().form()) {
        $("#addEditUsers .submit-form").prop("disabled", true);
        $("#addEditUsers .submit-form").html(
          '<i class="fas fa-circle-notch fa-spin"></i>'
        );
        setTimeout(function () {
          $("#addEditUsersForm").submit();
        }, 1000);
      }
      return false;
    });
    $("#addEditUsersForm input").keypress(function (e) {
      if (e.which == 13) {
        if ($("#addEditUsersForm").validate().form()) {
          $("#addEditUsers .submit-form").prop("disabled", true);
          $("#addEditUsers .submit-form").html(
            '<i class="fas fa-circle-notch fa-spin"></i>'
          );
          setTimeout(function () {
            $("#addEditUsersForm").submit();
          }, 1000);
        }
        return false;
      }
    });

    $("#addEditUsersForm").submit(function () {
      var id = $("#id").val();
      var csrftoken = $("[name=csrfmiddlewaretoken]").val();
      var method = "POST";
      var action = "/users/";
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
          $("#addEditUsers .submit-form").prop("disabled", false);
          $("#addEditUsers .submit-form").html("save");

          if (data.type == "success") {
            Base.toast(data.message);
            $("#users-tree").jstree(true).refresh(false, true);
            
            if (id != 0) {
              $("#addEditUsers").modal("hide");
              $("#users-tree").bind("refresh.jstree", function (event, data) {
                $(this).jstree("open_all");
              });    
            } else {
              Users.empty();
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
          $("#addEditUsers .submit-form").prop("disabled", false);
          $("#addEditUsers .submit-form").html("save");
          Base.ajax_error_message(xhr);
        },
      });

      return false;
    });
  };

  return {
    init: function () {
      init();
    },
    edit: function (t) {
      var id = $(t).attr("data-id");
      Base.editForm({
        element: t,
        data: { id: id },
        url: "/users/",
        success: function (data) {
          Users.empty();
          Base.setModalTitle("#addEditUsers", "Edit User");
          fields = ['id','code', 'username', 'email', 'mobile', 'dob', 'salary', 'department']
          fields.forEach((field) => {
            $("#" + field).val(data.data[field]);
          });
          $("#addEditUsers").modal("show");
        },
      });
    },
    delete: function (t) {
      if (confirm("Are you sure you want to delete this ?")) {
        var id = $(t).attr("data-id");
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        Base.deleteForm({
          element: t,
          url: "/users/",
          data: {
            id: id,
            _method: "DELETE",
            csrfmiddlewaretoken: csrftoken,
          },
          success: function (data) {
            Base.toast(data.message);
            $("#users-tree").jstree(true).refresh(false, true);
            $("#users-tree").bind("refresh.jstree", function (event, data) {
              $(this).jstree("open_all");
            });   
          },
        });
      } else {
        return false;
      }
    },
    add: function () {
      Users.empty();
      Base.setModalTitle("#addEditUsers", "Add User");
      $("#addEditUsers").modal("show");
    },
    search: function () {
      console.log('here')
      var search_btn = "#search-btn";
      $(search_btn).html('<i class="fa fa-spin fa-spinner"></i>');
      var qs = {}
      if ($("#search-code").val()) qs["code"] = $("#search-code").val();
      if ($("#search-name").val()) qs["username"] = $("#search-name").val();
      $("#users-tree").jstree(true).settings.core.data.url = "/users?" +  jQuery.param(qs);
      $("#users-tree").jstree(true).refresh(false,true);
      $(search_btn).html('Search');
      return false;
    },
    empty: function () {
      $("#id").val(0);
      $("#department").find("option").eq(0).prop("selected", true);
      $(".invalid-feedback").html("");
      Base.emptyForm();
    },
  };
})();
$(document).ready(function () {
  Users.init();
});

