!function () {
    window.queryString = function () {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }();

}();

function login() {
    if (!btoa || !sessionStorage)
    {
        window.alert('Please update your browser.');
        return false;
    }

    var username = $("#username").val();
    var password = $("#password").val();
    var authToken = btoa(username + ":" + md5(password));
 
    $.ajax({
        type: "GET",
        url: ECity.service.baseUri + "api/Account/Login",
        contentType: 'application/json; charset=UTF-8',
        headers: {
            //'Authorization-Token': ECity.service.accessToken,
            'Authorization': 'Basic ' + authToken
        }
    }).done(function (data) {
        data.authToken = authToken;
        sessionStorage.setItem("eCityUser", JSON.stringify(data));

        var url = queryString['returl'] || "index.html";
        window.location.href = url;
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert('Error while contacting server, please try again');
    });

    return false;
}