var PANDOX = PANDOX || {};

/*=====================================================================================================
 * Pandox SYSTEM Module
 *======================================================================================================*/
PANDOX.SYSTEM = function () {

    var init = function () {
        isLogged();
        analytics();
    };

    var analytics = function () {

        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-47755345-2', 'auto');
        ga('send', 'pageview');
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
        } else {
            $("#menu-avatar").hide();
            $("#menu-login").show();
        }
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
                console.log("promise:", promise);
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

    var contains = function (string, search) {
        return string.indexOf(search) != -1;
    };

    return {
        init: init,
        hasMinimum: hasMinimum,
        isBlank: isBlank,
        contains: contains
    }

}();


/*=====================================================================================================
 * Pandox SHOPPING Module
 *======================================================================================================*/
PANDOX.SHOP = function () {

    var init = function () {
        console.log("PANDOX.SHOP.init()");
        $("#shop-cart").hide();
        bindShopItem();
        bindBackBtn();
    };

    var getSwords = function () {
        // LOGADO
        $.get("/shop/includes/sword.json", function (swords) {
            $.each(swords, function (i, sword) {

            });

        })
            .fail(function () {
                $("#menu-avatar").hide();
                $("#menu-login").show();
            })
    };

    var bindBackBtn = function () {
        $("#shop-back").click(function (event) {
            event.preventDefault();

            var itemId = $(this).attr('x-item-id');
            console.log(itemId);

            $("#shop-display").fadeIn();

            $("#shop-cart").hide();

        })
    }

    var bindShopItem = function () {
        $(".shop-item").click(function (event) {
            event.preventDefault();

            var itemId = $(this).attr('x-item-id');
            console.log(itemId);

            $("#shop-display").hide();

            $("#shop-cart").fadeIn();

            //            $.getJSON("/shop/includes/sword.js", {})
            //                .done(function (json) {
            //                    $("#template-container").loadTemplate("/app/views/shop.html", json, {
            //                        isFile: true
            //                    });
            //                });

        })
    }


    return {
        init: init,
        getSwords: getSwords
    }



}();
