!function () {
    angular.module('eCity')

    .controller('ViewObjectsController', ['$scope', 'policy', 'policyService', '$modal', '$filter', 'box', 'user', function ($scope, policy, policyService, $modal, $filter, box, user) {
        $scope.user = user;
        $scope.policy = policy;
        $scope.objects = [];
        $scope.currentOnly = true;

        if (DEBUG)
            window.s2 = $scope;

        policyService.getObjects(policy.PolicyID).then(function (response) {
            $scope.objects = response.data;
        });

        $scope.wantsToDelete = function () {
            return $scope.objects.some(function (o) {
                return o.delete;
            });
        }

        $scope.connectObject = function () {
            $modal.open({
                templateUrl: '/views/app/policies/objects/selectobjectmodal.html',
                controller: 'SelectObjectController',
                size: 'md',
                resolve: {
                    'policy': function () {
                        return $scope.policy;
                    },
                    'currentObjects': function () {
                        return $scope.objects;
                    }
                }
            }).result.then(function (newObjects) {
                $scope.objects.concat(newObjects);
            });
        }

        $scope.delete = function (type) {
            var forDelete = $filter('filter')($scope.objects, { 'delete': true, 'Current': true });

            if (!forDelete.length)
                return

            if (forDelete.length === $scope.objects.length) {
                box.attention('A policy must have at least one object at all times.')
                return;
            }

            if (type != 'Erase')
                for (var i = 0; i < forDelete.length; i++) {
                    if (!forDelete[i].endDate)
                    {
                        box.info('Please fill the object\'s end dates.');
                        return;
                    }
                }

            $scope.deleting = true;
            policyService.deleteObjects(type, $scope.policy.PolicyID, $.map(forDelete, (function (o) {
                return {
                    'ID': o.ObjectID,
                    'Description': o.endDate
                }

            }))).then(function (response) {
                box.success('The objects have been deleted successfully!');
                var attentionMsg = response.data ? angular.fromJson(response.data) : null;

                if (attentionMsg)
                    box.attention(attentionMsg);

                if (type === 'Erase') {
                    angular.forEach(forDelete, function (o) {
                        var index = $scope.objects.indexOf(o);
                        if (index > -1)
                            $scope.objects.removeIndex(index);
                    });
                }
                else {
                    angular.forEach(forDelete, function (o) {
                        o.Current = false;
                        o.delete = null;
                    });
                }
               
            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.');
            }).finally(function () {
                $scope.deleting = false;
            });
        }

        //$scope.add = function () {
        //    if ($scope.object) {
        //        if ($filter('filter')($scope.objects, { 'ID': $scope.object.ID }).length) {
        //            box.info("The object has already been added.");
        //            return;
        //        }

        //        $scope.objects.push($scope.object);
        //        return;
        //    }

        //    if ($scope.objectType.ObjectTypeID === 31 && $scope.objectType.Description === 'Person') {
        //        $modal.open({
        //            templateUrl: '/views/app/policies/objects/entityobjectmodal.html',
        //            controller: 'searchEntityController',
        //            size: 'md'
        //        });

        //        return;
        //    }

        //    $modal.open({
        //        templateUrl: 'newobjectmodal2.html',
        //        controller: ['$scope', 'objectType', 'policyId', function ($scope, objectType, policyId) {
        //            $scope.objectType = objectType;
        //            $scope.policyId = policyId;
        //        }],
        //        size: 'lg',
        //        resolve: {
        //            'objectType': function () {
        //                return $scope.objectType;
        //            },
        //            'policyId': function () {
        //                return $scope.policy.PolicyID;
        //            }
        //        }
        //    }).result.then(function () {

        //    });
        //}
    }])
    //.filter('showCurrentOnly', function() {
    //    return function(items, enable) {
    //        if (enable)
    //            return $filter('filter')(items, function (p) {
    //                return p.StatusID !== 4;
    //            });

    //        return items;
    //    };
    //})
    .filter('showCurrentOnly', ['$filter', function ($filter) {
        return function (items, enable) {
            if (enable) {
                return $filter('filter')(items, function (o) {
                    return !!o.Current;
                });
            }

            return items;
        }
    }])
    .controller('SelectObjectController', ['$scope', 'policy', 'currentObjects', 'policyService', '$modal', '$filter', 'box', function ($scope, policy, currentObjects, policyService, $modal, $filter, box) {
        $scope.policy = policy;
        $scope.newObjects = [];

        if (DEBUG)
            window.s3 = $scope;

        policyService.getObjectTypes().success(function (data) {
            $scope.objectTypes = $filter('filter')(data, { 'SlobID': policy.SlobID });
            if ($scope.objectTypes.length == 1)
                $scope.objectType = $scope.objectTypes[0];
        });

        $scope.isObjectType = function (id) {
            return $scope.objType.ObjectTypeID === id;
        };

        $scope.selectObjectType = function (objectType) {
            return $scope.objectType = objectType;
        };

        $scope.getObject = function (val) {
            if (!$scope.objectType)
                return [];

            return policyService.getObject(val, $scope.objectType.ObjectTypeID).then(function (response) {
                return $filter('limitTo')(response.data, 10);
            });
        };

        $scope.save = function () {
            if (!$scope.newObjects.length)
            {
                box.info('Please add some objects first');
                return;
            }

            policyService.addObjectsToPolicy($scope.policy.PolicyID, $scope.newObjects).then(function (response) {
                box.success('The objects have been added to the policy successfully.');
                $scope.$close(response.data);
            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.');
            });
        }

        $scope.addObject = function (objectform) {
            if ($scope.object) {
                if ($filter('filter')($scope.newObjects, { 'ObjectID': $scope.object.ID }).length) {
                    box.info("The object has already been added.");
                    return;
                }

                if ($filter('filter')(currentObjects, { 'ObjectID': $scope.object.ID, 'Current': true }).length) {
                    box.info("The policy already contains this object.");
                    return;
                }

                if (objectform.$invalid)
                    return;

                var amount = 0;
                if ($scope.objectType.ObjectTypeID !== 31)
                    amount = $scope.objectAmount;

                $scope.newObjects.push({
                    'ObjectID': $scope.object.ID,
                    'Description': $scope.object.Description,
                    'ObjStartDate': $scope.objectStartDate,
                    'ObjectAmount': amount
                });

                $scope.objectStartDate = null;
                $scope.objectAmount = null;
                $scope.object = null;

                return;
            }

            if (!$scope.objectType)
                return;

            if ($scope.objectType.ObjectTypeID === 31 && $scope.objectType.Description === 'Person') {
                $modal.open({
                    templateUrl: '/views/app/policies/objects/entityobjectmodal.html',
                    controller: 'searchEntityController',
                    size: 'md'
                });

                return;
            }

            // The SLOB is not person
            $modal.open({
                templateUrl: 'newobjectmodal2.html',
                controller: ['$scope', 'objectType', 'policyId', function ($scope, objectType, policyId) {
                    $scope.objectType = objectType;
                    $scope.policyId = policyId;
                }],
                size: 'lg',
                resolve: {
                    'objectType': function () {
                        return $scope.objectType;
                    },
                    'policyId': function () {
                        return $scope.policy.PolicyID;
                    }
                }
            }).result.then(function () {

            });
        }
    }]);
}();