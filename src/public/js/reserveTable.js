const phoneNumber = $('#InputPhoneNumber');
const closeWebView = $('.closeWebView');
const formBody = $('.formBody');

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = function () {
    // the Messenger Extensions JS SDK is done loading
    MessengerExtensions.getContext('558842362242105',
        function success(thread_context) {
            // success
            $('#psid').val(thread_context.psid);
            handleClickButtonReserveTable();
        },
        function error(err) {
            // error
            console.log("Lỗi đặt bàn" + err + senderID);
            //get sender id from url- run fallback
            $('#psid').val(senderID);
            handleClickButtonReserveTable();
        }
    );
};

function validateInputFields() {
    const EMAIL_REG = /[a-zA-Z][a-zA-Z0-9_\.]{1,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}/g;

    let email = $("#InputEmaill");

    if (!email.val().match(EMAIL_REG)) {
        email.addClass("is-invalid");
        return true;
    } else {
        email.removeClass("is-invalid");
    }

    if (phoneNumber.val() === "") {
        phoneNumber.addClass("is-invalid");
        return true;
    } else {
        phoneNumber.removeClass("is-invalid");
    }

    return false;
}

function handleClickButtonReserveTable() {
    $("#btnReserveTable").on("click", function (e) {
        e.preventDefault();
        let check = validateInputFields(); //return true or false

        let data = {
            psid: $("#psid").val(),
            customerName: $("#InputName").val(),
            email: $("#InputEmaill").val(),
            phoneNumber: phoneNumber.val()
        };

        if (!check) {
            //close webview

            //send data to node.js server
            console.log(window.location.origin)
            $.ajax({
                url: `${window.location.origin}/reserve-table-ajax`,
                method: "POST",
                data: data,
                success: function (data) {
                    MessengerExtensions.requestCloseBrowser(function success() {
                        // webview closed
                    }, function error(err) {
                        // an error occurred
                        console.log(err)
                    });
                    closeWebView.removeClass('hide');
                    formBody.addClass('hide');
                    console.log(data);
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }
    });
}