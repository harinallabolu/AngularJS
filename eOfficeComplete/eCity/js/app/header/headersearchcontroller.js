!function () {
    angular.module('eCity')
        .controller('HeaderSearchController', ['$scope', 'entityService', '$location', '$rootScope', '$filter',
            function ($scope, entityService, $location, $rootScope, $filter) {
                $scope.entities = [];
                $scope.search = 'entities';

                $scope.loadingEntities = true;
                entityService.getAllEntities().then(function (data) {
                    $scope.entities = data;
                }).finally(function () {
                    $scope.loadingEntities = false;

                    if ($scope.search === 'entities')
                        $scope.placeholder = 'Search entities...';
                });

                $scope.display = function (value) {
                    if (!value)
                        return;

                    if ($scope.search == 'entities')
                        return value.searchName();
                    else if ($scope.search === 'policies') {
                        return value.Holder + ', ' + value.Reference;
                    }
                }

                $scope.getResults = function (viewValue) {
                    if ($scope.search == 'entities')
                        return $filter('filter')($scope.entities, viewValue);
                    else if ($scope.search === 'policies' && viewValue.length > 2) {
                        return entityService.searchEntitiesByPolicy(viewValue).then(function (response) {
                            return $filter('limitTo')(response.data, 15);
                        });
                    }

                    return [];
                };

                $scope.gotoViewPolicy = function ($item, $model, $label) {
                    var entity = $model;

                    if ($scope.search == 'entities') {

                    } else if ($scope.search == 'policies') {
                        //alert($model.Holder + ', ' + $model.Reference);
                        var entities = $filter('filter')($scope.entities, { 'EntityID': $model.EntityID });

                        if (!entities.length)
                            return;

                        entity = entities[0];
                    }

                    if ($location.path().match('/app/policies/viewpolicy'))
                        $rootScope.$broadcast('entityselect', entity);
                    else
                        $location.path('/app/policies/viewpolicy/' + entity.EntityID);
                };

                $scope.$on('entityAdded', function () {
                    entityService.getAllEntities().then(function (data) {
                        $scope.entities = data;
                    });
                });

            }]);
}();