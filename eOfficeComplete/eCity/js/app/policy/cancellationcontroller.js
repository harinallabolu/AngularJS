!function () {
    angular.module('eCity')

    .controller('CancellationController', ['$scope', '$modalInstance', 'policy', 'policyService', '$filter', 'box',
        function ($scope, $modalInstance, policy, policyService, $filter, box) {
            $scope.policy = policy;
            $scope.cancellation = {
                'PolicyID': policy.PolicyID
            };
            $scope.cancellationReasonTypes = [];

            //$scope.renewalNumber = 5;

            if (DEBUG)
            {
                window.s = $scope;
            }
            
            policyService.getCancellationReasonTypes().success(function (data) {
                $scope.cancellationReasonTypes = data;
            });

            var tmp = $filter('filter')($scope.policy.receipts, function (r) {
                return r.TypeID === 1 || r.TypeID === 2 || r.TypeID === 4;
            });

            var last = $filter('orderBy')(tmp, ['-StartDate', '-ReceiptID']);
            if (last.length) {
                var lastReceipt = last[0];
                $scope.cancellation.StartDate = lastReceipt.StartDate;
            }

            $scope.save = function (cancellationform) {

                angular.forEach(cancellationform, function (elem) {
                    if (!elem.$invalid)
                        return;

                    elem.firstTimer = false;
                    elem.$pristine = false;
                    elem.$dirty = true;
                });

                if (cancellationform.$invalid)
                    return;

                $scope.saving = true;
                policyService.cancelPolicy($scope.cancellation).success(function (data) {
                    box.success('Policy ' + $scope.policy.PolicyID + ' has been cancelled successfully!!!');
                    $scope.policy.receipts.push(data);
                    $modalInstance.close();
                }).error(function (data) {
                    box.error(data.Message || "There was an error processing your request. ");
                }).finally(function () {
                    $scope.saving = false;
                });
            };

            
        }]);
}();
