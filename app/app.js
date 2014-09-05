$(function () {


    // GetNews
    $.getJSON("/app/js/news.js", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/app/views/news.html", json);
        });



    // Highlither
    $("li").removeClass("active");
    $("a[href='" + location.pathname + "']").parent().addClass('active');



    $("#criarConta").submit(function (event) {
        var hasError = false;
        clearInput("login");
        clearInput("pass");
        clearInput("passconfirm");

        var login = $("#i-login").val();
        if (isBlank(login)) {
            hasError = true;
            markErrorOnField("login");
        } else if (loginExist(login)) {
            console.log("exists", login);
            hasError = true;
            markErrorOnField("login");
        } else {
            markSuccessOnField("login");
        }


        var pass = $("#i-pass").val();
        var passConfirm = $("#i-passconfirm").val();
        if (isBlank(pass) || isBlank(passConfirm) || !hasMinimum(pass, 5) || (pass != passConfirm)) {
            hasError = true;
            markErrorOnField("pass");
            markErrorOnField("passconfirm");
        }


        var email = $("#i-email").val();
        if (isBlank(email)) {
            hasError = true;
            markErrorOnField("email");
        }

        if (hasError) {
            event.preventDefault();
            return false;
        }

    });
});

function clearInput(field) {
    $("#g-" + field).removeClass("has-success has-feedback has-error");
    $("#ig-" + field).removeClass("glyphicon-ok glyphicon-remove");
}

function hasMinimum(value, size) {
    return value.length >= size;
}

function markErrorOnField(field) {
    console.log(field);
    $("#g-" + field).addClass("has-error has-feedback");
    $("#ig-" + field).addClass("glyphicon-remove");
}

function markSuccessOnField(field) {
    console.log(field);
    $("#g-" + field).addClass("has-success has-feedback");
    $("#ig-" + field).addClass("glyphicon-ok");
}



function loginExist(login) {
    return false;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}
