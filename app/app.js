$(function () {


    // GetNews
    $.getJSON("/app/js/news.js", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/app/views/news.html", json);
        });



    // Highlither
    $("li").removeClass("active");
    $("a[href='" + location.pathname + "']").parent().addClass('active');
});
