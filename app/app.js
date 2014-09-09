$(function () {

    // initialize PANDOX SYSTEM
    PANDOX.SYSTEM.init();
    PANDOX.FORM.init();
    PANDOX.UTIL.init();
    PANDOX.LOGIN.init();


    // GetNews
    $.getJSON("/app/js/news.js", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/app/views/news.html", json, {
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

var PANDOX = PANDOX || {};

/*=====================================================================================================
 * Pandox SYSTEM Module
 *======================================================================================================*/
PANDOX.SYSTEM = function () {

    var init = function () {
        isLogged();
    };

    var isLogged = function () {

        var token = $.cookie("X-WOMU-Auth");

        if (!PANDOX.UTIL.isBlank(token)) {
            // LOGADO
            var request = $.get("/api/me", function (account) {

                    if (account) {
                        $("#menu-avatar").show();
                        $("#menu-login").hide();
                    } else {
                        $("#menu-avatar").hide();
                        $("#menu-login").show();
                    }
                })
                .fail(function () {
                    $("#menu-avatar").hide();
                    $("#menu-login").show();
                })
        };
    };



    var createAuthCookie = function (token) {
        console.log("creating cookie", token);
        $.cookie("X-WOMU-Auth", token, {
            path: "/"
        });
    };

    return {
        init: init,
        createAuthCookie: createAuthCookie
    }

}();


/*=====================================================================================================
 * Pandox LOGIN Module
 *======================================================================================================*/
PANDOX.LOGIN = function () {

    var init = function () {
        console.log("PANDOX.LOGIN.init()");

        $("#loginForm").submit(function (event) {
            event.preventDefault();
            validateForm();
        })
    };

    var validateForm = function () {

        console.log("validateForm");

        var hasError = false;

        var loginInput = $("#i-login").val();
        if (PANDOX.UTIL.isBlank(loginInput)) {
            PANDOX.FORM.markErrorOnField("login", "Login é obrigatório");
            hasError = true;
        }

        var passwordInput = $("#i-password").val();
        if (PANDOX.UTIL.isBlank(passwordInput)) {
            PANDOX.FORM.markErrorOnField("password", "Senha é obrigatório");
            hasError = true;
        }

        if (!hasError) {
            var json = {
                login: loginInput,
                password: passwordInput
            };

            var request = $.ajax({
                url: "/api/login",
                type: "POST",
                data: JSON.stringify(json),
                contentType: "application/json"
            });


            request.done(function (data, textStatus, jqXHR) {

                console.log("data", data);
                PANDOX.SYSTEM.createAuthCookie(data.token);


                window.location.assign("/conta")
            });

            request.fail(function (promise) {
                console.log(promise);
                var result = promise.responseJSON;

                $.each(result, function (i, erro) {
                    PANDOX.FORM.markErrorOnField(erro.field, erro.message);
                });

                $("#loading").hide();
                $("#btn-submit").show();
            });

        }

    };

    return {
        init: init,
        validateForm: validateForm
    };

}();



/*=====================================================================================================
 * Pandox FORM Module
 *======================================================================================================*/
PANDOX.FORM = function () {

    var init = function () {};

    var markErrorOnField = function (field, msg) {
        $("#g-" + field).addClass("has-error has-feedback");
        $("#ig-" + field).addClass("glyphicon-remove");

        $("#h-" + field).hide();
        $("#e-" + field).show();
        $("#e-" + field).html(msg);
    }

    return {

        init: init,
        markErrorOnField: markErrorOnField
    };
}();



/*=====================================================================================================
 * Pandox UTIL Module
 *======================================================================================================*/
PANDOX.UTIL = function () {

    var init = function () {};

    var hasMinimum = function (value, size) {
        return value.length >= size;
    };

    var isBlank = function (text) {
        return (!text || /^\s*$/.test(text));
    };

    var contains = function (string, search){
        return string.indexOf(search) != -1;
    }

    return {
        init: init,
        hasMinimum: hasMinimum,
        isBlank: isBlank,
        contains: contains
    }

}();


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
