!function () {
    var app = angular.module('eCity');

    app.service('bankService', ['$http', 'baseUri', function ($http, baseUri) {
        this.getAccounts = function () {
            return $http.get(baseUri + 'api/Banks/GetAccounts');
        };
    }]);
}();