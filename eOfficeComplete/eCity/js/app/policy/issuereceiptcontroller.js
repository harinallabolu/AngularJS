!function () {
    angular.module('eCity')

    .controller('issueReceiptCtrl', ['$scope', '$modalInstance', 'policyService', 'policy', '$filter', '$modal', 'box',
        function ($scope, $modalInstance, policyService, policy, $filter, $modal, box) {
            $scope.policy = policy;
            $scope.policy.selectedReceipt.objects = [];

            var netToGrossMultiplier = $scope.policy.slob.NetToGrossMultiplier || 1;

            if (DEBUG)
            {
                $scope.policy.slob.NeedsMembershipNumber = true;
                window.s = $scope;
            }
            
            $scope.netChanged = function () {
                var newGross = Math.round($scope.policy.selectedReceipt.NetPremium * netToGrossMultiplier * 100) / 100;

                if ($scope.policy.selectedReceipt.GrossPremium) {
                    $modal.open({
                        templateUrl: 'updateGrossFromNetModal.html',
                        controller: 'UpdateGrossFromNetCtrl',
                        size: 'sm',
                        resolve: {
                            grossPremium: function () {
                                return newGross;
                            }
                        }
                    }).result.then(function () {
                        $scope.policy.selectedReceipt.GrossPremium = newGross;
                    });
                }
                else
                    $scope.policy.selectedReceipt.GrossPremium = newGross;
            }

            $scope.grossChanged = function () {
                var newNet = Math.round(($scope.policy.selectedReceipt.GrossPremium * 100) / netToGrossMultiplier) / 100;

                if ($scope.policy.selectedReceipt.NetPremium) {
                    $modal.open({
                        templateUrl: 'updateNetFromGrossModal.html',
                        controller: 'UpdateNetFromGrossCtrl',
                        size: 'sm',
                        resolve: {
                            netPremium: function () {
                                return newNet;
                            }
                        }
                    }).result.then(function () {
                        $scope.policy.selectedReceipt.NetPremium = newNet;
                    });
                }
                else
                    $scope.policy.selectedReceipt.NetPremium = newNet;
            }

            var t = $filter('filter')($scope.policy.covers, { 'ReceiptID': $scope.policy.selectedReceipt.ReceiptID });
            $scope.policy.selectedReceipt.objects = t.groupBy('ObjectID', function (item) {
                return item;
            });

            $scope.save = function (issuereceiptform) {

                angular.forEach(issuereceiptform, function (elem) {
                    if (!elem.$invalid)
                        return;

                    elem.firstTimer = false;
                    elem.$pristine = false;
                    elem.$dirty = true;
                });

                if (issuereceiptform.$invalid)
                    return;

                $scope.saving = true;
                policyService.issueReceipt($scope.policy.selectedReceipt).success(function (data) {
                    box.success('Receipt ' + $scope.policy.selectedReceipt.ReceiptID + ' has been issued successfully!!!');
                    $modalInstance.close();
                }).error(function (data) {
                    box.error("There was an error processing your request. " + (data.Message || ''));
                }).finally(function () {
                    $scope.saving = false;
                });
            };
        }]);
}();
