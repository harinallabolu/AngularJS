!function () {
    angular.module('eCity')

    .controller('RenewalController', ['$scope', '$modalInstance', '$filter', 'policy', 'policyService', 'slob', '$modal', 'box',
        function ($scope, $modalInstance, $filter, policy, policyService, slob, $modal, box) {
            $scope.policy = policy;
            $scope.issue = false;
            $scope.receipt = {};
            $scope.renewalNumberValues = [];
            var netToGrossMultiplier = slob.NetToGrossMultiplier || 1;

            if (DEBUG)
            {
                window.s = $scope;
                $scope.issue = true;
            }

            var tmp = $filter('filter')($scope.policy.receipts, function (r) {
                return r.TypeID === 1 || r.TypeID === 2 || r.TypeID === 4;
            });

            var last = $filter('orderBy')(tmp, ['-StartDate', '-ReceiptID']);
            if (last.length)
            {
                var lastReceipt = last[0];
                $scope.receipt = {
                    'IssuedDate': lastReceipt.EndDate,
                    'PolicyReference': policy.PolicyReference
                };
            }

            $scope.netChanged = function () {
                var newGross = Math.round($scope.receipt.NetPremium * netToGrossMultiplier * 100) / 100;

                if ($scope.receipt.GrossPremium) {
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
                        $scope.receipt.GrossPremium = newGross;
                    });
                }
                else
                    $scope.receipt.GrossPremium = newGross;
            }

            $scope.grossChanged = function () {
                var newNet = Math.round(($scope.receipt.GrossPremium * 100) / netToGrossMultiplier) / 100;

                if ($scope.receipt.NetPremium) {
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
                        $scope.receipt.NetPremium = newNet;
                    });
                }
                else
                    $scope.receipt.NetPremium = newNet;
            }

            policyService.getPaymentFrequences().success(function (data) {
                var freq = $filter('filter')(data, { 'PolicyPaymentFreqID': $scope.policy.FrequencyID });

                if (!freq.length)
                    return;

                var months = freq[0].Months;

                if (months === 0)
                {
                    box.info("Policy " + $scope.policy.PolicyID + ' is not renewable.');
                    $modalInstance.close();
                }
                else if (months >= 12)
                    $scope.renewalNumberValues = [1];
                else
                {
                    var maxNum = Math.floor(12 / months);
                    $scope.renewalNumberValues = Array.apply(null, Array(maxNum)).map(function (_, i) { return i + 1; });
                }

                if ($scope.renewalNumberValues.length === 1)
                    $scope.renewalNumber = $scope.renewalNumberValues[0];
            });
            
            $scope.save = function (renewalform) {

                angular.forEach(renewalform, function (elem) {
                    if (!elem.$invalid)
                        return;

                    elem.firstTimer = false;
                    elem.$pristine = false;
                    elem.$dirty = true;
                });

                if (renewalform.$invalid)
                    return;

                $scope.saving = true;
                policyService.renewPolicy($scope.policy.PolicyID, $scope.renewalNumber, $scope.issue ? $scope.receipt : {}).success(function (data) {
                    box.success('Policy ' + $scope.policy.PolicyID + ' has been renewed successfully!!!');
                    $modalInstance.close();
                }).error(function (data) {
                    box.error("There was an error processing your request. " + (data.Message || ''));
                }).finally(function () {
                    $scope.saving = false;
                });
            };

            //var t = $filter('filter')($scope.policy.covers, { 'ReceiptID': $scope.policy.selectedReceipt.ReceiptID });
            ////data = $filter('filter')(data, function (p) {
            ////    return p.StatusID !== 3 && p.StatusID !== 4;
            ////});

            //var unique = {};
            //angular.forEach(t, function (c, i) {
            //    if (unique[c.ObjectID] === 1)
            //        return;

            //    unique[c.ObjectID] = 1;
            //    $scope.policy.selectedReceipt.objects.push(c);
            //});

            //$scope.save = function (issuereceiptform) {

            //    angular.forEach(issuereceiptform, function (elem) {
            //        if (!elem.$invalid)
            //            return;

            //        elem.firstTimer = false;
            //        elem.$pristine = false;
            //        elem.$dirty = true;
            //    });

            //    if (issuereceiptform.$invalid)
            //        return;

            //    policyService.issueReceipt($scope.policy.selectedReceipt).success(function (data) {
            //        $.smallBox({
            //            title: "Success!!!",
            //            content: 'Receipt ' + $scope.policy.selectedReceipt.ReceiptID + ' has been issued successfully!!!',
            //            color: "#739E73",
            //            //timeout: 10000,
            //            icon: "fa fa-check",
            //        });

            //        $modalInstance.close();
            //    }).error(function (data) {
            //        $.smallBox({
            //            title: "Error",
            //            content: "There was an error processing your request. " + (data.Message || ''),
            //            color: "#C46A69",
            //            //timeout: 6000,
            //            icon: "fa fa-warning shake animated"
            //        });
            //    });;
            //};
        }])
        .controller('UpdateGrossFromNetCtrl', ['$scope', '$modalInstance', 'grossPremium', function ($scope, $modalInstance, grossPremium) {
            $scope.grossPremium = grossPremium;

            $scope.ok = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
        .controller('UpdateNetFromGrossCtrl', ['$scope', '$modalInstance', 'netPremium', function ($scope, $modalInstance, netPremium) {
            $scope.netPremium = netPremium;

            $scope.ok = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
}();
