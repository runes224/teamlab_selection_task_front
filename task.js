var myTable;
$(document).ready(function () {
    // デフォルトの設定を変更
    $.extend($.fn.dataTable.defaults, {
        language: {
            url: "https://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
        }
    });
    // Datatableの設定
    myTable = $("#task-table").DataTable({
        // データソースの設定
        columns: [
            {data: "id", width: "20"},
            {data: "title", width: "20"},
            {data: "body", width: "20"},
            {data: "created_at", width: "20"},
            {data: "updated_at", width: "20"},
            {
                data: "id",
                width: "10",
                // 編集ボタンの行をソートさせないようにする
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
            // 削除ボタンを表示しない
            $("#delete").addClass("invisible");
            $("#modal-title").html("新規")
            // 更新時
        } else {
            // 削除ボタンを表示
            $("#delete").removeClass("invisible");
            $("#modal-title").html("更新")

            console.log("ajaxで参照処理");

            // 押下したタスクIDの詳細情報を取得
            $.ajax({
                url: '//3.132.116.53/tasks/' + id,
                type: 'GET',
            })
                .done(function (data) {
                    $('input[name="title"]').val(data["data"]["title"]);
                    $('input[name="body"]').val(data["data"]["body"]);
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

        // フォームデータを配列にする
        data = $('#dataform').serializeArray();
        // 配列の値を操作して、JSON文字列へと変換する
        formdata = parseJson(data);
        if ($("#id").val() == "") {
            console.log("ajaxで登録処理");
            // ID要素を削除
            delete formdata.id;
            // javascriptオブジェクトをJSON文字列へと変換
            formdataNew = JSON.stringify(formdata);
            $.ajax({
                url: '//3.132.116.53/tasks/',
                type: 'post',
                data: formdataNew,
                error: function(e) {
                    console.log(e);
                },
                dataType: "json",
                contentType: "application/json",
                success: function(jsonResponse) {
                    // テーブル更新
                    myTable.ajax.reload();
                    $("#myModal").modal('hide');
                },
            });
        } else {
            console.log("ajaxで更新処理");
            // [WebAPI 更新に対応]
            formdataNew = JSON.stringify(formdata);
            $.ajax({
                url: '//3.132.116.53/tasks/' + id,
                type: 'put',
                data: formdataNew,
                error: function(e) {
                    console.log(e);
                },
                // レスポンスをJSONとしてパースする
                dataType: "json",
                // リクエストの Content-Type
                contentType: "application/json",
                success: function(jsonResponse) {
                    // テーブル更新
                    myTable.ajax.reload();
                    $("#myModal").modal('hide');
                },
            });

        }
    })

    // 削除ボタンクリック時の動作
    $("button#delete").on('click', function (e) {
        // AJAX処理
        id = $("#id").val();
        console.log("ajaxで削除処理");
        $.ajax({
            url: '//3.132.116.53/tasks/' + id,
            type: 'delete',
            success: function(jsonResponse) {
                // テーブル更新
                myTable.ajax.reload();
                $("#myModal").modal('hide');
            },
        });
    })
});
