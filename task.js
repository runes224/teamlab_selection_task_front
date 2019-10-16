var myTable;
$(document).ready(function () {
    // デフォルトの設定を変更
    $.extend($.fn.dataTable.defaults, {
        language: {
            url: "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
        }
    });
    // Datatableの設定
    myTable = $("#task-table").DataTable({
        // データソースの設定
        columns: [
            {data : "id", width: "20"},
            {data: "title", width: "20"},
            {data: "body", width: "20"},
            {data: "created_at", width: "20"},
            {data: "updated_at", width: "20"},
            {
                data: "id",
                width: "10",
                orderable: false,
                render: function (data) {
                    return '<a class="popup btn btn-info" data-id=' + data + ' href="#">&#x270f;</a>'
                }
            }
        ],
        // [WebAPI 取得（一覧）に対応]
        ajax: {
            url: 'http://3.132.116.53/tasks',
            dataType: "json"
        }
    });

    // 新規登録、編集ボタン クリック時の動作
    $(document).on('click', 'a.popup', function (e) {
        var form = $('#dataform');
        form[0].reset();
        $('#myModal').modal('show');

        // 呼び出しボタンのhrefパラメータを保存
        var id = $(this).attr('data-id');
        $("#id").val(id);

        // data-id の 有無で新規登録か更新かを判定
        // 新規登録時
        if (id == "") {
            $("#delete").addClass("invisible");
            $("#modal-title").html("新規")
            $('#displayId').html("新規");
            // 更新時
        } else {
            $("#delete").removeClass("invisible");
            $("#modal-title").html("更新")
            $('#displayId').html(id);

            console.log("ajaxで参照処理");
            $.ajax({
                url: 'http://3.132.116.53/tasks/' + id,
                type: 'GET',
            })
                .done(function (data) {
                    $('input[name="title"]').val(data.title);
                    $('input[name="detail"]').val(data.detail);
                    $('input[name="finished"]').prop('checked', data.finished);
                })
        }
    })


    // 保存ボタンクリック自の動作
    $("button#save").on('click', function (e) {

        id = $("#id").val();
        var parseJson = function (data) {
            var returnJson = {};
            for (idx = 0; idx < data.length; idx++) {
                returnJson[data[idx].name] = data[idx].value
            }
            return returnJson;
        }

        data = $('#dataform').serializeArray();  // ①form to json
            console.log(data);
        formdata = JSON.stringify(parseJson(data)); // ②json to 欲しい形
            console.log(formdata);

        if ($("#id").val() == "") {
            console.log("ajaxで登録処理");
            console.log(formdata);
            console.log(formdata["id"]);
            delete formdata.id;
            console.log(formdata);
            $.ajax({
                url: 'http://3.132.116.53/tasks',
                type: 'post',
                data: formdata,
                dataType: 'json',
            })
            $("#myModal").modal('hide');
            myTable.ajax.reload();
        } else {
            console.log("ajaxで更新処理");
            // [WebAPI 更新に対応]
            // $.ajax({
            //     url: 'data/' + id,
            //     type: 'update',
            //     data: formdata,
            // })
            $("#myModal").modal('hide');
            myTable.ajax.reload(null, false);
        }

        // 削除ボタンクリック時の動作
        $("button#delete").on('click', function (e) {
            // AJAX処理
            id = $("#id").val();
            console.log("ajaxで削除処理");
            $.ajax({
                url: 'http://3.132.116.53/tasks/' + id,
                type: 'delete',
            })
            $("#myModal").modal('hide');
            myTable.ajax.reload(null, false);
        })

    })
});
