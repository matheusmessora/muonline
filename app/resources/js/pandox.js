var PANDOX = PANDOX || {};

/*=====================================================================================================
 * Pandox SYSTEM Module
 *======================================================================================================*/
PANDOX.SYSTEM = function () {

    var init = function () {
        processAuth();
        //        analytics();
    };

    var forceAuthentication = function (callback) {
        console.log("OPA");
        if (!isAuthenticated()) {
            var href = window.location.href;
            window.location.href = "/login?redir=" + href;
        } else {
            callback();
        };


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

    var isAuthenticated = function () {
        var token = $.cookie("X-WOMU-Auth");



        if (!PANDOX.UTIL.isBlank(token)) {
            return true;
        };
        return false;

    };


    var processAuth = function () {

        if (isAuthenticated()) {

            var cache = localStorage.getItem("X-WOMU-account");
            if (cache !== null) {
                loadAccount(JSON.parse(cache));
            }

            var cacheHeroes = localStorage.getItem("X-WOMU-heroes");
            if (cacheHeroes !== null) {
                PANDOX.USER.renderHeroes(JSON.parse(cacheHeroes));
            } else {
                PANDOX.USER.loadApiHeroes(JSON.parse(cache));
            }



            // LOGADO
            var request = $.get("/api/me", function (account) {

                    if (account) {
                        localStorage.setItem("X-WOMU-account", JSON.stringify(account));
                        PANDOX.USER.loadApiHeroes(account);
                        PANDOX.USER.loadCredits(account);
                    } else {
                        clearCookie();
                    }
                })
                .fail(function () {
                    clearCookie();
                })
        } else {

            clearCookie();
        }
    };


    var loadAccount = function (account) {
        $(".account-login").html(account.login);
        $("#menu-avatar").show();
        $("#menu-login").hide();
        $("#credits").show();
        $(".account-credits").html($.number(account.credits, 0, ',', '.'));

    };


    var clearCookie = function () {
        $("#menu-avatar").hide();
        $("#menu-login").show();
        $(".account-login").html("");

        $.removeCookie("X-WOMU-Auth");
        localStorage.removeItem("X-WOMU-account");
        localStorage.removeItem("X-WOMU-heroes");

    };

    var createAuthCookie = function (token) {
        $.cookie("X-WOMU-Auth", token, {
            path: "/"
        });

        // LOGADO
        var request = $.get("/api/me", function (account) {

                if (account) {
                    console.log("tem conta", account);
                    localStorage.setItem("X-WOMU-account", JSON.stringify(account));
                    window.location.assign("/conta");


                    var redir = PANDOX.UTIL.getUrlParam("redir");
                    console.log("redir", redir);
                    if (redir) {
                        window.location.replace(redir);
                    };


                } else {
                    clearCookie();
                }
            })
            .fail(function () {
                clearCookie();
            })


    };

    return {
        init: init,
        createAuthCookie: createAuthCookie,
        clearCookie: clearCookie,
        forceAuthentication: forceAuthentication,
        loadAccount: loadAccount
    }

}();


/*=====================================================================================================
 * Pandox LOGIN Module
 *======================================================================================================*/
PANDOX.LOGIN = function () {

    var init = function () {
        console.log("PANDOX.LOGIN.init()");
        bindLogout();


        $("#loginForm").submit(function (event) {
            event.preventDefault();
            validateForm();
        })
    };

    var bindLogout = function () {
        $(".logout").click(function (event) {
            PANDOX.SYSTEM.clearCookie();
        });

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
                PANDOX.SYSTEM.createAuthCookie(data.token);

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
 * Pandox USER Module
 *======================================================================================================*/
PANDOX.USER = function () {

    var init = function () {


    };

    var loadApiHeroes = function (account) {

        $.get("/api/me/hero").done(function (heroes) {
            console.log("HEROEES", heroes);
            localStorage.setItem("X-WOMU-heroes", JSON.stringify(heroes));
            renderHeroes(heroes);
        });
    };

    var renderHeroes = function (heroes) {
        $("#heroes").html("");
        $.each(heroes, function (i, hero) {
            $("#heroes").append(
                $('<li class="list-group-item">').append('<a href="#">' + hero.heroType + ' ' + hero.name + '<span class="text-danger"> ' + hero.reset + ' </span></a>'));

        });
    };


    var getAccount = function () {
        $("#heroes").html("");
        $.each(heroes, function (i, hero) {
            $("#heroes").append(
                $('<li class="list-group-item">').append('<a href="#">' + hero.heroType + ' ' + hero.name + '<span class="text-danger"> ' + hero.reset + ' </span></a>'));

        });
    };

    return {
        init: init,
        loadApiHeroes: loadApiHeroes,
        renderHeroes: renderHeroes
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
        return (!text || / ^ \s * $ /.test(text));
    };

    var contains = function (string, search) {
        return string.indexOf(search) != -1;
    };

    function getUrlParam(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    };

    return {
        init: init,
        hasMinimum: hasMinimum,
        isBlank: isBlank,
        contains: contains,
        getUrlParam: getUrlParam

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
        bindConfirmationBtn();
        loadRevision();
    };

    var loadRevision = function () {

        var url = window.location.href;
        var getURL = url.split("?")[0];

        if (getURL.indexOf("/shop/checkout") > -1) {
            // Show WORKING
            //            function working(){
            //                $("#shop-working").html('Trabalhando...');
            //            };
            //
            //            working();
            function onAuthenticated() {
                var cache = localStorage.getItem("X-WOMU-account");
                cache = {
                    login: "teste2",
                    password: null,
                    name: "matheus",
                    credits: 5000,
                    email: "teste@teste.com",
                    roles: []
                };
                if (cache !== null) {
                    console.log(cache);
                    //                    account = JSON.parse(cache);
                    account = cache;
                    PANDOX.SYSTEM.loadAccount(account);
                    $(".shop-rev-acc-login").html(account.login);
                    $(".shop-rev-acc-email").html(account.email);


                    var id = PANDOX.UTIL.getUrlParam('id');
                    $.get("/shop/includes/vip/" + id + ".json", function (item) {
                        var value = item.value
                        var credits = account.credits;
                        var creditsRemaining = credits - value;


                        creditsRemaining = $.number(creditsRemaining, 0, ',', '.');
                        credits = $.number(credits, 0, ',', '.');
                        value = $.number(value, 0, ',', '.');

                        $(".shop-rev-item-desc").html(item.title);
                        $(".shop-rev-item-qtd").html(1);
                        $(".shop-rev-item-value").html(value);

                        $("#shop-working").hide();
                        $("#shop-revision").fadeIn();


                        $(".shop-rev-acc-credits").html(credits);




                        $(".shop-rev-credits-remaing").html(creditsRemaining);

                    })


                }
            };

            //            PANDOX.SYSTEM.forceAuthentication(onAuthenticated);
            onAuthenticated();



        }
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

    var getVIP = function () {
        // GetNews
        $.getJSON("/shop/includes/vip.json", {})
            .done(function (json) {
                $("#shop-cart").loadTemplate("/views/shop/cart.html", json, {
                    isFile: true,
                    complete: showShopCart
                });


            });
    };

    var showShopCart = function () {
        $("#shop-cart").fadeIn();
        bindBackBtn();
    }

    var bindBackBtn = function () {
        $(".shop-back").click(function (event) {
            event.preventDefault();

            var itemId = $(this).attr('x-item-id');
            console.log(itemId);

            $("#shop-display").fadeIn();

            $("#shop-cart").hide();

        })
    };


    var bindConfirmationBtn = function () {
        $("#shop-confirmation-btn").click(function (event) {
            event.preventDefault();

            $("#shop-confirmation-btn").hide();
            $("#loading").show();
            $("#shop-alert-success").fadeIn();

        })
    };

    var bindShopItem = function () {
        $(".shop-item").click(function (event) {

            var itemId = $(this).attr('x-item-id');
            console.log(itemId);

            $("#shop-display").hide();

            $("#shop-cart").fadeIn();


            $.getJSON("/shop/includes/" + itemId + ".json", {})
                .done(function (json) {
                    $("#shop-cart").loadTemplate("/views/shop/cart.html", json, {
                        isFile: true,
                        complete: showShopCart
                    });
                });

        })
    };


    return {
        init: init,
        getSwords: getSwords,
        getVIP: getVIP
    }



}();
