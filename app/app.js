$(function () {


    // GetNews
    $.getJSON("/app/js/news.js", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/app/views/news.html", json, {
                isFile: true
            });
        });



    // Highlither
    $("li").removeClass("active");
    if (location.pathname === "/") {
        $("#logo").addClass('active');
    } else {
        $("a[href='" + location.pathname + "']").parent().addClass('active');
    }



    // FORM
    var inputs = ["login", "password", "passwordconfirm", "email"];
    $.each(inputs, function (i, input) {
        $("#i-" + input).focus(function () {
            clearInput(input);
        });

    });


    $("#criarConta").submit(function (event) {
        event.preventDefault();
        $("#loading").show();
        $("#btn-submit").hide();

        $.each(inputs, function (i, input) {
            clearInput("login");
        });

        var hasError = false;
        clearInput("login");
        clearInput("pass");
        clearInput("passconfirm");

        var loginInput = $("#i-login").val();
        if (isBlank(loginInput)) {
            hasError = true;
            markErrorOnField("login");
        } else if (loginExist(loginInput)) {
            console.log("exists", loginInput);
            hasError = true;
            markErrorOnField("login");
        }


        var passwordValue = $("#i-password").val();
        var passConfirm = $("#i-passwordconfirm").val();
        if (isBlank(passwordValue) || isBlank(passConfirm) || !hasMinimum(passwordValue, 5) || (passwordValue != passConfirm)) {
            hasError = true;
            markErrorOnField("password");
            markErrorOnField("passwordconfirm");
        }


        var email = $("#i-email").val();
        if (isBlank(email)) {
            hasError = true;
            markErrorOnField("email");
        }

        if (hasError) {
            $("#loading").hide();
            $("#btn-submit").show();
        } else {

            var json = {
                login: loginInput,
                password: passwordValue,
                name: "matheus",
                email: "a@a.com"
            };

            var request = $.ajax({
                url: "/api/account",
                type: "POST",
                data: JSON.stringify(json),
                contentType: "application/json"
            });

            request.done(function (data, textStatus, jqXHR) {

                console.log(data);

                $("#account-template").hide().loadTemplate("/conta/sucesso.html", data).fadeIn(1500);
            });

            request.fail(function (promise) {
                var result = promise.responseJSON;

                $.each(result, function (i, erro) {
                    markErrorOnField(erro.field, erro.message);
                });

                $("#loading").hide();
                $("#btn-submit").show();
            });
        }

        return false;
    });
});


function clearInput(field) {
    $("#g-" + field).removeClass("has-success has-feedback has-error");
    $("#ig-" + field).removeClass("glyphicon-ok glyphicon-remove");
    $("#h-" + field).show();
    $("#e-" + field).html('');
    $("#e-" + field).hide();
}

function hasMinimum(value, size) {
    return value.length >= size;
}

function markErrorOnField(field, msg) {
    $("#g-" + field).addClass("has-error has-feedback");
    $("#ig-" + field).addClass("glyphicon-remove");

    $("#h-" + field).hide();
    $("#e-" + field).show();
    $("#e-" + field).html(msg);
}

function markSuccessOnField(field) {
    $("#g-" + field).addClass("has-success has-feedback");
    $("#ig-" + field).addClass("glyphicon-ok");
}



function loginExist(login) {
    return false;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}
