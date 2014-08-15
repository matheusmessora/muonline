$(function () {

    // GetNEws
    $.getJSON("/app/js/news.js", {})
        .done(function (json) {
            $("#template-container").loadTemplate("/app/views/news.html", json);
        });
});
