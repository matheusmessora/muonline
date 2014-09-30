$(function () {

    // initialize PANDOX SYSTEM
    PANDOX.SYSTEM.init();
    PANDOX.FORM.init();
    PANDOX.UTIL.init();
    PANDOX.LOGIN.init();
    PANDOX.USER.init();
    PANDOX.SHOP.init();


    // GetNews
    $.getJSON("/resources/js/news.json", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/views/news.html", json, {
                isFile: true
            });
        });



    // Highlither
    $("li").removeClass("active");
    var pathname = location.pathname;
    if (pathname === "/") {
        $("#logo").addClass('active');
    } else {
        pathname.replace("#", "");

        if(PANDOX.UTIL.contains(pathname, "conta")){
            $("#menu-avatar").addClass("active");
        }
        if(PANDOX.UTIL.contains(pathname, "guia")){
            $("#menu-guia").addClass("active");
        }
        if(PANDOX.UTIL.contains(pathname, "shop")){
            $("#menu-shop").addClass("active");
        }

        console.log(pathname);
        $("a[href='" + pathname + "']").parent().addClass('active');
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
        if (PANDOX.UTIL.isBlank(loginInput)) {
            hasError = true;
            PANDOX.FORM.markErrorOnField("login");
        } else if (loginExist(loginInput)) {
            console.log("exists", loginInput);
            hasError = true;
            PANDOX.FORM.markErrorOnField("login");
        }


        var passwordValue = $("#i-password").val();
        var passConfirm = $("#i-passwordconfirm").val();
        if (PANDOX.UTIL.isBlank(passwordValue) || PANDOX.UTIL.isBlank(passConfirm) || !PANDOX.UTIL.hasMinimum(passwordValue, 5) || (passwordValue != passConfirm)) {
            hasError = true;
            PANDOX.FORM.markErrorOnField("password");
            PANDOX.FORM.markErrorOnField("passwordconfirm");
        }


        var email = $("#i-email").val();
        if (PANDOX.UTIL.isBlank(email)) {
            hasError = true;
            PANDOX.FORM.markErrorOnField("email");
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
                    PANDOX.FORM.markErrorOnField(erro.field, erro.message);
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

function markSuccessOnField(field) {
    $("#g-" + field).addClass("has-success has-feedback");
    $("#ig-" + field).addClass("glyphicon-ok");
}



function loginExist(login) {
    return false;
}
