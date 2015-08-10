!function () {
    angular.module('eCity')

    .controller('BankAccountsController', ['$scope', 'policyService', 'bankService', function ($scope, policyService, bankService) {
        $scope.companies = [];
        $scope.accounts = [];
        $scope.company = -1;

        policyService.getCompanies().success(function (data) {
            angular.forEach(data, function (c) {
                $scope.companies.unshift({ 'ID': c.EntityID, 'Description': c.CompanyName });
            });
        });
        policyService.getProviders().success(function (data) {
            $scope.companies = $scope.companies.concat(data);
        });
        bankService.getAccounts().success(function (data) {
            $scope.accounts = data;
        });
    }]);
}();