!function () {
    angular.module('eCity')
    .controller('HelpPhonesController', ['$scope', 'policyService', 'providerService', function ($scope, policyService, providerService) {
        //$scope.isFullscreen = false;

        //$scope.fullscreen = function () {
        //    $scope.isFullscreen = !$scope.isFullscreen;
        //};

        $scope.providers = [];
        $scope.phones = [];
        $scope.provider = -1;

        policyService.getProviders().success(function (data) {
            $scope.providers = data;
        });
        providerService.getHelpPhones().success(function (data) {
            $scope.phones = data;
        });

        $scope.removeSpaces = function(s)
        {
            return s.replace(/ /g, '');
        }
    }]);
}();