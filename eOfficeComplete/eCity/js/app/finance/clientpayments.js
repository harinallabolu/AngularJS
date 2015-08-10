!function () {
    function Payment(policyID) {
        this.PolicyID = policyID;
        this.PaymentType = 1;
    }

    //Payment.prototype.isCheck = function () {
    //    return this.PaymentType === 2;
    //}

    Payment.prototype.isAccountTransfer = function () {
        return this.PaymentType === 7;
    }

    Payment.prototype.hasAmount = function () {
        return this.Amount > 0;
    }

    angular.module('eCity')
    .controller('ClientPaymentsController', ['$scope', 'policyService', 'box', '$routeParams', '$modal', '$filter', 'financeService', function ($scope, policyService, box, $routeParams, $modal, $filter, financeService) {
        if (DEBUG)
            window.s = $scope;

        //entityService.getEntityInfo($routeParams.entityId).then(function (entityExtended) {
        //    $scope.entity = entityExtended;
        //});
        $scope.predicate = null;
        $scope.reverse = false;
        var relativePolicies = null;

        loadPolicies();

        function loadPolicies() {
            $scope.loadingPolicies = true;
            policyService.getPolicies($routeParams.entityId).then(function (policies) {
                $scope.policies = policies;

                $scope.runningTotalsSum = 0;
                angular.forEach($scope.policies, function (p) {
                    p.Payment = new Payment(p.PolicyID);

                    $scope.runningTotalsSum += p.RunningTotal || 0;
                });

                //if(policies.length)
                //    $scope.holdername = ' of ' + policies[0].HolderFullname;

            }).finally(function (data) {
                $scope.loadingPolicies = false;
            });
        };

        policyService.getPaymentTypes().then(function (response) {
            $scope.paymentTypes = response.data;
        });

        $scope.updateTotal = function () {
            $scope.paymentsTotal = 0;

            angular.forEach($scope.filteredPolicies, function (p) {
                $scope.paymentsTotal += p.Payment.Amount || 0;
            });
        }

        $scope.clear = function () {
            angular.forEach($scope.policies, function (p) {
                p.Payment.Amount = null;
            });

            $scope.paymentsTotal = 0;
        }

        $scope.payFullAmount = function () {
            angular.forEach($scope.filteredPolicies, function (p) {
                if (p.RunningTotal)
                    p.Payment.Amount = p.RunningTotal;
            });

            $scope.updateTotal();
        }

        $scope.pay = function () {
            if ($scope.paying)
                return;

            var policiesToPay = $filter('filter')($scope.filteredPolicies, hasPayment);
            if (policiesToPay.length === 0) {
                box.info('Please add some payments first');
                return;
            }

            var requiredAmountFromTransfers = 0;
            angular.forEach(policiesToPay, function (p) {
                if (p.Payment.isAccountTransfer())
                    requiredAmountFromTransfers += p.Payment.Amount;
            });

            if (requiredAmountFromTransfers > 0) {
                var amountFromTransfers = 0;
                angular.forEach(relativePolicies, function (p) {
                    if (p.transferFrom)
                        amountFromTransfers += p.RunningTotal;
                });

                if (amountFromTransfers < requiredAmountFromTransfers) {
                    openTransferModal();
                    return;
                }
            }

            $scope.paying = true;
            financeService.payPolicies(policiesToPay, $filter('filter')(relativePolicies, { 'transferFrom': true })).then(function (response) {
                loadPolicies();
                box.success('The payments have been submitted successfully!');
            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.')
            }).finally(function () {
                $scope.paying = false;
            });

            //$scope.paying = true;
            //providerService.massPay(payments).then(function (response) {
            //    $scope.updatePolicies();
            //    box.success('The payments have been submitted successfully!');
            //}, function (response) {
            //    box.error(response.data.Message || 'There was an error processing your request.')
            //}).finally(function () {
            //    $scope.paying = false;
            //});


            function hasPayment(policy) {
                return policy.Payment.hasAmount();
            }

            //function makeAccountTransfers() {
            //    return $scope.policies.some(function (p) {
            //        return p.Payment.isAccountTransfer();
            //    });
            //}

            function openTransferModal() {
                $modal.open({
                    templateUrl: 'views/app/finance/paymenttransfer.html',
                    controller: 'PaymentTransferController',
                    size: 'lg',
                    resolve: {
                        'amountRequired': function () {
                            return requiredAmountFromTransfers;
                        },
                        'policies': ['financeService', '$q', function (financeService, $q) {
                            var deferred = $q.defer();

                            if (relativePolicies)
                                deferred.resolve(angular.copy(relativePolicies));
                            else {
                                financeService.getRelativePayments($routeParams.entityId).then(function (response) {
                                    relativePolicies = response.data;
                                    deferred.resolve(angular.copy(relativePolicies));
                                }, function () {
                                    box.error('Error getting relative policies.');
                                    deferred.reject();
                                });
                            }

                            return deferred.promise;
                        }]
                    }
                }).result.then(function (policies) {
                    relativePolicies = policies;
                    box.info('Click pay again to go on with the payments.');
                });
            }
        }

        $scope.setFullAmount = function () {
            angular.forEach($scope.filteredPolicies, function (p) {
                if (p.RunningTotal)
                    p.PaymentAmount = p.RunningTotal;
            });
        }

        $scope.order = function (prop) {
            if ($scope.predicate == prop)
                $scope.reverse = !$scope.reverse;

            $scope.predicate = prop;
        }
    }])

    .controller('PaymentTransferController', ['$scope', 'amountRequired', 'policies', 'box', function ($scope, amountRequired, policies, box) {
        $scope.policies = policies;
        $scope.amountRequired = amountRequired;

        $scope.save = function () {
            if ($scope.totalSelectedAmount() < amountRequired) {
                box.info('Please add some more policies, the total amount is less than required.');
                return;
            }

            $scope.$close($scope.policies);
        }

        $scope.totalSelectedAmount = function () {
            var amount = 0;
            angular.forEach($scope.policies, function (p) {
                if (p.transferFrom)
                    amount += p.RunningTotal;
            });

            return amount;
        }
    }]);
}();