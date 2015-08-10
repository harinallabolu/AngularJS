!function () {
    angular.module('eCity')

    .controller('EndorsementController', ['$scope', '$modalInstance', 'policy', 'policyService', '$filter', 'box',
        function ($scope, $modalInstance, policy, policyService, $filter, box) {
            $scope.policy = policy;
            $scope.endorsement = {
                'PolicyID': policy.PolicyID,
                'StartDate': new Date()
            }

            if (DEBUG)
                window.s = $scope;

            var tmp = $filter('filter')($scope.policy.receipts, function (r) {
                return r.TypeID === 1 || r.TypeID === 2 || r.TypeID === 4;
            });

            var last = $filter('orderBy')(tmp, ['-StartDate', '-ReceiptID']);
            if (last.length) {
                var lastReceipt = last[0];
                $scope.maxEndDate = new Date(lastReceipt.EndDate);
                $scope.endorsement.EndDate = $scope.maxEndDate;
            }

            $scope.save = function (endorsementform) {
                angular.forEach(endorsementform, function (elem) {
                    if (!elem.$invalid)
                        return;

                    elem.firstTimer = false;
                    elem.$pristine = false;
                    elem.$dirty = true;
                });

                if (endorsementform.$invalid)
                    return;

                $scope.saving = true;
                policyService.createEndorsement($scope.endorsement).success(function (data) {
                    box.success('An endorsement (' + data.ReceiptID + ') has been created for policy ' + $scope.policy.PolicyID + '!!!');
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
