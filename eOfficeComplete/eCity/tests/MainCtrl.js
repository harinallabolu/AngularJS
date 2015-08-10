var myModule = angular.module('MyApp', []);
myModule.controller('MainCtrl', ['$scope',
 function ($scope) {
     // I'm a lonely controller :( 
 }
]);

angular.module('eCity2', ['ui.select2', 'angularFileUpload', 'google-maps'])
.controller('BankAccountsController', function ($scope, policyService, bankService) {
    $scope.hello = "afsdfds";
    $scope.company = -1;

    policyService.a = 1;
})
    .factory('Policy', function () {
        function Policy() {
            this.name = "Amazing policy";
        }

        return Policy;
    })
.service('policyService', function (Policy) {
    this.c = 125;
    this.b = "fasdfsd";
    this.a = 1;

    this.policy = new Policy();
})
