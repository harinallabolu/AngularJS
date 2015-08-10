!function () {
    window.DEBUG = 1;

    window.ECity = window.ECity || {};
    ECity.service = {
        "baseUri": "http://localhost:53000/"
        //"accessToken": "helloworld"
    };


    if (typeof angular != "undefined")
    {
        var app = angular.module('eCity');

        app.constant('baseUri', ECity.service.baseUri);
        //app.constant('accessToken', ECity.service.accessToken);

        delete ECity;
    }
}();