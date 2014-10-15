var PANDOX = PANDOX || {};

/*=====================================================================================================
 * Pandox SYSTEM Module
 *======================================================================================================*/
PANDOX.SYSTEM = function () {

    var init = function () {
        processAuth();
        loadServerInfo();

        $("#tt-status").tooltip();
    };

    var forceAuthentication = function (callback) {
        if (!isAuthenticated()) {
            var href = window.location.href;
            createRedirCookie(href);

        } else {
            callback();
        };


    };


    var isAuthenticated = function () {
        var token = $.cookie("X-WOMU-Auth");


        if (!PANDOX.UTIL.isBlank(token)) {
            return true;
        };
        return false;

    };

    var loadServerInfo = function () {
        var request = $.get("/api/server", function (server) {
                $(".qtd-account").html(server.qtdAccount);
                $(".qtd-chars").html(server.qtdChars);
                if (server.serverUp) {
                    $(".server-status").html("Online");
                    $(".server-status").addClass("text-success");
                } else {
                    $(".server-status").html("Em testes" + ' <i class="glyphicon glyphicon-question-sign colored">');
                    $(".server-status").addClass("text-info");
                }


            })
            .fail(function () {})
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
                        removeRedirCookie();
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
        $("#profile-name").html(account.name);

        renderEmailVerification(account);
    };

    var renderEmailVerification = function (account) {

        if (account.mailVerified === "0") {
            $("#profile-email").html('<span id="tt-email" data-toggle="tooltip" title="Seu e-mail ainda não foi verificado!">' + account.email + ' <i class="glyphicon glyphicon-exclamation-sign text-alert"></i></span>');
            $("#tt-email").tooltip();
        } else {
            $("#profile-email").html('<span>' + account.email + ' <i class="glyphicon glyphicon-ok text-success"></i></span>');
        }
    };


    var clearCookie = function () {
        $("#menu-avatar").hide();
        $("#menu-login").show();
        $(".account-login").html("");

        $.removeCookie("X-WOMU-Auth", {
            path: "/"
        });
        localStorage.removeItem("X-WOMU-account");
        localStorage.removeItem("X-WOMU-heroes");

    };

    var createRedirCookie = function (url, callback) {
        $.cookie("X-WOMU-Redir", url, {
            path: "/",
            expires: 1
        });
        window.location.replace("/login");
    };


    var removeRedirCookie = function (url) {
        $.removeCookie("X-WOMU-Redir", {
            path: "/"
        });
    };

    var createAuthCookie = function (token) {
        $.cookie("X-WOMU-Auth", token, {
            path: "/"
        });

        // LOGADO
        var request = $.get("/api/me", function (account) {

                if (account) {
                    localStorage.setItem("X-WOMU-account", JSON.stringify(account));
                    window.location.assign("/conta");


                    var redir = $.cookie("X-WOMU-Redir");

                    if (!PANDOX.UTIL.isBlank(redir)) {
                        removeRedirCookie();
                        window.location.replace(redir);
                    }
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
        loadAccount: loadAccount,
        createRedirCookie: createRedirCookie,
        removeRedirCookie: removeRedirCookie
    }

}();


/*=====================================================================================================
 * Pandox LOGIN Module
 *======================================================================================================*/
PANDOX.LOGIN = function () {

    var init = function () {
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
PANDOX.PROFILE = function () {

    var finished = function () {
        $("#profile-loading").hide();
        $("#profile-holder").fadeIn();
    };

    var init = function () {

        function onAuthenticated() {
            $.get("/api/profile").done(function (profile) {
                renderProfilePage(profile);

                $.get("/api/badge").done(function (badges) {
                    renderBadges(badges);

                    loadEnquete(finished);
                });
            });
        }

        PANDOX.SYSTEM.forceAuthentication(onAuthenticated);


    };

    var loadProfile = function () {
        var href = window.location.pathname;
        var profileID = href.substr(href.lastIndexOf('/') + 1);

        var url = "/api/profile/" + profileID;

        $.get(url).done(function (profile) {
            renderProfilePage(profile);

            $.get("/api/badge").done(function (badges) {
                renderBadges(badges);

                finished();
            });
        });
    };

    var renderBadges = function (badges) {
        $("#badges-quantity").html(badges.length);

        $.each(badges, function (i, badge) {
            $("#badge-" + badge.id + "-name").html(badge.name);
            $("#badge-" + badge.id + "-description").html(badge.description);
        });
    };

    var loadEnquete = function (callback) {

        function bindAnswerButton() {
            $("#enquete-submit").click(function (event) {
                event.preventDefault();

                $(this).hide();
                $("#loading").show();

                var id = $("#enquete-div").attr('data-enquete-id');

                var answer = $('input[name=enqueteOptions]:checked').val();

                var url = "/api/enquete/" + id + "/answer/" + answer;
                $.post(url, function () {
                    $("#enquete-holder").hide();
                    $("#enquete-alert-success").show();
                });
            })

        };

        $.get("/api/enquete?status=1&answerable=true").done(function (enquetes, textStatus, jqXHR) {
            if (jqXHR.status == "200") {
                $("#enquete-div").show();
                $("#enquete-question").html(enquetes[0].question);
                $("#enquete-answer-1").after(enquetes[0].answer1);
                $("#enquete-answer-2").after(enquetes[0].answer2);
                $("#enquete-answer-3").after(enquetes[0].answer3);
                $("#enquete-answer-4").after(enquetes[0].answer4);
                $("#enquete-div").attr('data-enquete-id', enquetes[0].id);

                bindAnswerButton();
                callback();
            } else {
                callback();
            }

        });


    };

    var renderProfilePage = function (profile) {
        $("#profile-signup-date").html(new Date(profile.signupDate).format("dd/mm/yyyy"));


        $("#profile-level").html(profile.level);
        $("#profile-level-info").addClass("lvl_" + profile.level);
        $("#profile-exp-info").html(profile.exp + "/100");
        $("#profile-badges-quantity").html(profile.qtdBadges);

        var publicURL = window.location.origin + "/perfil/" + profile.login;
        $("#profile-public-url").html(publicURL);
        $("#profile-public-url").attr('src', publicURL);
        bindShareButton();

        $("#profile-login").html(profile.login);

        if (profile.qtdBadges > 0) {
            $.each(profile.badges, function (i, badge) {
                var img = "#badge-" + badge.badgeId + "-img";
                $(img).attr("src", '/resources/img/badges/' + badge.badgeId + '-on.png?v=22');
                //                $(img).fadeOut(500, function () {
                //
                //                    $(img).show();
                //                });
            });

        }
    };

    var bindShareButton = function(){
        $("#facebook-share-url").click(function (event) {
            event.preventDefault();

            var url =  $("#profile-public-url").attr('src');

            window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(url));

        })

    };


    return {
        init: init,
        loadProfile: loadProfile
    };

}();

/*=====================================================================================================
 * Pandox USER Module
 *======================================================================================================*/
PANDOX.USER = function () {

    var init = function () {


    };

    var confirmEmail = function () {
        var token = PANDOX.UTIL.getUrlParam("token");
        if (!PANDOX.UTIL.isBlank(token)) {
            var request = $.ajax({
                url: "/api/email/confirmation?token=" + token,
                type: "PUT",
                contentType: "application/json"
            });

            request.done(function (data, textStatus, jqXHR) {

                $("#emailConfirmed").show();
                $("#processing").hide();

            });

            request.fail(function (promise) {

                $("#emailErrror").show();
                $("#processing").hide();
            });
        } else {
            $("#emailErrror").show();
            $("#processing").hide();
        }
    };

    var loadApiHeroes = function (account) {
        $.get("/api/me/hero").done(function (heroes) {
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
        renderHeroes: renderHeroes,
        confirmEmail: confirmEmail
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

    var hasMaximum = function (value, size) {
        return !value.length >= size;
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
        hasMaximum: hasMaximum,
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
                //                cache = {
                //                    login: "teste2",
                //                    password: null,
                //                    name: "matheus",
                //                    credits: 5000,
                //                    email: "teste@teste.com",
                //                    roles: []
                //                };
                if (cache !== null) {
                    account = JSON.parse(cache);
                    //                    account = cache;
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

                        if (creditsRemaining > 0) {
                            $(".shop-rev-credits-remaing").addClass('text-success');
                            $(".shop-rev-credits-remaing-title").addClass('text-success');
                        } else {
                            $(".shop-rev-credits-remaing").addClass('text-danger');
                            $(".shop-rev-credits-remaing-title").addClass('text-danger');
                            $("#checkout-revision").hide();
                            $("#shop-alert-error").show();


                        }



                    })


                }
            };

            PANDOX.SYSTEM.forceAuthentication(onAuthenticated);
            //            onAuthenticated();



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
