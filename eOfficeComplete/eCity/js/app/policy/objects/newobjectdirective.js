!function () {
    angular.module('eCity')

    .directive('newObject', function () {
        return {
            restrict: 'E',
            scope: {
                objectType: '=',
                successFn: '&'
            },

            templateUrl: 'views/app/policies/objects/newobject.html',
            controller: ['$scope', 'policyService', 'box', function ($scope, policyService, box) {
                //$scope.fields = fields.data;
                $scope.submitting = false;

                if (DEBUG)
                    window.s4 = $scope;

                policyService.getObjectTypeFields($scope.objectType.ObjectTypeID).then(function (response) {
                    $scope.fields = response.data;
                });

                $scope.save = function (objectform) {
                    if (objectform.$invalid) {
                        for (var field in objectform) {

                            if (field[0] != '$' && objectform[field].$pristine) {
                                //objectform[feild].$pristine = false;
                                //objectform[feild].$dirty = false;
                                //objectform[feild].firstTimer = false;
                                objectform[field].$setViewValue(objectform[field].$modelValue);
                                if (objectform[field].firstTimer)
                                    objectform[field].firstTimer = false;
                            }
                        }

                        return;
                    }

                    $scope.submitting = true;

                    var values = [];
                    $.each($scope.fields, function (i, el) {
                        if (el.Info.DefaultValue)
                            values.push({ 'FieldID': el.Info.FieldID, 'Value': el.Info.DefaultValue });
                    });

                    policyService.postObject({ 'ObjectTypeID': $scope.objectType.ObjectTypeID, 'Fields': values }).success(function () {
                        $scope.successFn();
                    }).error(function (data) {
                        box.error("There was an error processing your request. " + (data.Message || ''));
                    }).finally(function () {
                        $scope.submitting = false;
                    });

                    //policyService.createEntity(s).success(function () {
                    //    console.log("saving object complete");
                    //    $scope.isDataSent = false;
                    //}).error(function () {
                    //    $scope.isDataSent = false;
                    //});


                };

                //$scope.cancel = function () {
                //    $modalInstance.dismiss('cancel');
                //};
            }]
        }
    });
}();
