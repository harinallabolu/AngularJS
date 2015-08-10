!function () {
    angular.module('eCity')

    .controller('ReceiptDetailsController', ['$scope', '$modalInstance', 'receipt', 'entityService', 'policyService', '$filter',
        function ($scope, $modalInstance, receipt, entityService, policyService, $filter) {
            if (DEBUG)
                window.s2 = $scope;

            $scope.receipt = receipt;
            $scope.receipt.detailsView = $scope.receipt.detailsView || {
                'policies': []
            };

            $scope.receiptTypes = [];
            $scope.entities = [];

            //$scope.receipt.detailsView.policies = [];
            $scope.view = 'default';

            $scope.insert = function () {
                $scope.match = null;
            };

            entityService.getAllEntities().then(function (data) {
                $scope.entities = data;
            });

            policyService.getReceiptTypes().then(function (data) {
                $scope.receiptTypes = angular.copy(data);
                $scope.receiptTypes.removeIndex(0);
            });

            $scope.selectEntity = function ($item, $model, $label) {
                $scope.entity = $model;
                $scope.view = 'details';

                policyService.getPolicies($scope.entity.EntityID).then(function (data) {
                    $scope.receipt.detailsView.policies = data;
                });
            };

            $scope.policySelected = function (policy) {
                receipt.setMatchedPolicy(policy.PolicyID);
                $scope.receipt.detailsView.activePolicy = policy;

                if (!policy.receipts) {
                    $scope.loadingReceipts = true;

                    policyService.getReceipts(policy.PolicyID).success(function (data) {
                        policy.receipts = data;
                    }).finally(function () {
                        $scope.loadingReceipts = false;
                    });
                }
            };

            $scope.setForInsert = function () {
                var policyID = receipt.getMatchedPolicyID();
                if (!policyID)
                    return;
                
                receipt.setMatchedPolicy(policyID);
                //$scope.receipt.detailsView.activePolicy = null;
            };

            $scope.receiptSelected = function (receipt) {
                $scope.receipt.setMatchedReceipt(receipt);
            };

            // If the user has selected a non-default match, just display the details tab initially
            var matchedPolicyID = $scope.receipt.getMatchedPolicyID();
            if (!matchedPolicyID)
                return;

            if (!isPolicyLoaded(matchedPolicyID))
                loadPolicy(matchedPolicyID);

            if (!hasDefaultMatch())
                $scope.view = 'details';

            function isPolicyLoaded(policyID)
            {
                return $filter('filter')($scope.receipt.detailsView.policies, { 'PolicyID': policyID }).length > 0;
            }

            function hasDefaultMatch()
            {
                var matchedReceiptID = $scope.receipt.getMatchedReceiptID();
                if (!matchedReceiptID)
                    return false;

                for (var i = 0; i < $scope.receipt.matchesCount(); i++)
                    if (matchedReceiptID === $scope.receipt.Matches[i].ReceiptID)
                        return true;

                return false;
            }

            function loadPolicy(policyID) {
                policyService.getPolicy(policyID).then(function (policy) {
                    $scope.receipt.detailsView.policies = [policy];
                    $scope.receipt.detailsView.activePolicy = policy;
                });
            }
        }]);
}();
