!function () {
    angular.module('eCity')
    .controller('providerPaymentsCtrl', ['$scope', 'providerService', 'policyService', 'box', '$filter', 'importService', '$modal', function ($scope, providerService, policyService, box, $filter, importService, $modal) {
        $scope.paying = false;

        // Set the due date to the last day of the previous month
        var dueDate = new Date();
        dueDate.setDate(1);
        dueDate.setHours(-1);
        $scope.dueDate = dueDate;
        $scope.predicate = null;
        $scope.reverse = false;
        $scope.paymentConfigurations = [];
        var configuration = null;
        $scope.fileInfoCollapse = true;

        if (DEBUG) {
            window.s = $scope;
        }

        providerService.getProviders().then(function (response) {
            $scope.providers = response.data;

            if (DEBUG) {
                $scope.provider = "7683";
                $scope.openConfig();
            }
        });

        importService.getPaymentConfigurationIDs().then(function (response) {
            $scope.paymentConfigurations = response.data;
        });

        $scope.configurationUpdated = function () {
            if (!$scope.getConfiguration())
                $scope.fileInfoCollapse = true;
        }

        $scope.getConfiguration = function () {
            var configuration = $filter('filter')($scope.paymentConfigurations, { 'ID': Number($scope.provider) }, true);

            if (configuration.length == 1)
                return configuration[0].Description;

            return null;
        };

        $scope.order = function (prop) {
            if ($scope.predicate == prop)
                $scope.reverse = !$scope.reverse;

            $scope.predicate = prop;
        }

        $scope.openConfig = function () {
            $scope.fileInfoCollapse = !$scope.fileInfoCollapse;

            if ($scope.fileInfoCollapse)
                return;

            var configurationID = $scope.getConfiguration();
            if (!configurationID)
                return;

            importService.getConfiguration(configurationID).then(function (response) {
                configuration = response.data;
            });
        }

        $scope.onFileSelect = function ($file) {
            if ($file.length == 1)
            {
                $scope.filename = $file[0].name;
                $scope.paymentsFile = $file[0];
            }
            else 
            {
                $scope.filename = null;
                $scope.paymentsFile = null;
            }
        }

        $scope.match = function () {
            if (!$scope.paymentsFile || !configuration)
                return;

            var mappingID = configuration.FileMappings[0].ID;

            $scope.loadingMatches = true;
            importService.matchPolicyPayments(configuration.ID, [$scope.paymentsFile], [mappingID]).progress(function (evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                var payments = data;

                angular.forEach(payments, function (p) {
                    if (p.Error)
                    {
                        console.log(p.Error);
                        return;
                    }

                    if (p.Policies.length != 1)
                    {
                        if (p.Policies.length > 1)
                            console.log('Record matched ' + p.Policies.length + ' policies. It will be ignored.');

                        return;
                    }

                    if (p.Policies[0].Description === 0)
                        return;

                    var matches = $filter('filter')($scope.policies, { 'PolicyID': p.Policies[0].ID }, true);
                    if (!matches.length)
                        return;

                    matches[0].PaymentAmount = p.Args.Amount;
                    matches[0].MatchedPaymentDate = p.Args.Date;
                });


            })
            .error(function (data, status, headers, config) {

            }).finally(function () {
                $scope.loadingMatches = false;
            });
        }

        $scope.preview = function () {
            if (!$scope.paymentsFile || !configuration)
                return;
            
            var mappingID = configuration.FileMappings[0].ID;

            $modal.open({
                templateUrl: 'views/app/finance/paymentspreview.html',
                controller: 'PaymentsPreviewController',
                size: 'lg',
                resolve: {
                    'configurationID': function () {
                        return configuration.ID;
                    },
                    'files': function () {
                        return [$scope.paymentsFile];
                    },
                    'filenames': function () {
                        return [mappingID];
                    }
                }
            });
        }

        $scope.updatePolicies = function() {
            if (!$scope.provider)
            {
                box.info('Please select a provider configuration');
                return;
            }

            $scope.policies = [];
            $scope.loadingPolicies = true;
            $scope.showLapsed = false;
            $scope.policyfilter = null;

            policyService.getOutstandingPolicies($scope.provider, $scope.dueDate).then(function (policies) {
                $scope.policies = policies;

                $scope.runningTotalsSum = 0;
                angular.forEach($scope.policies, function (p) {

                    $scope.runningTotalsSum += p.RunningTotal || 0;
                });

            }).finally(function () {
                $scope.loadingPolicies = false;
            });

        }

        $scope.updateTotal = function () {
            $scope.paymentsTotal = 0;

            angular.forEach($scope.filteredPolicies, function (p) {
                $scope.paymentsTotal += p.PaymentAmount || 0;
            });
        }

        $scope.clear = function () {
            angular.forEach($scope.policies, function (p) {
                p.PaymentAmount = null;
            });

            $scope.paymentsTotal = 0;
        }

        $scope.payFullAmount = function () {
            angular.forEach($scope.filteredPolicies, function (p) {
                if (p.RunningTotal)
                    p.PaymentAmount = p.RunningTotal;
            });

            $scope.updateTotal();
        }

        $scope.pay = function () {
            if ($scope.paying)
                return;

            if (!$scope.provider) {
                box.info('Please select a provider');
                return;
            }

            if (!$scope.dueDate) {
                box.info('Please select a Due Date');
                return;
            }

            var payments = $filter('filter')($scope.filteredPolicies, hasPayment);
            if (payments.length === 0) {
                box.info('Please add some payments first');
                return;
            }

            $scope.paying = true;
            providerService.massPay(payments).then(function (response) {
                $scope.updatePolicies();
                box.success('The payments have been submitted successfully!');
            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.')
            }).finally(function () {
                $scope.paying = false;
            });

            function hasPayment(policy) {
                return policy.PaymentAmount > 0;
            }
        }
    }])
    .controller('PaymentsPreviewController', ['$scope', 'importService', 'configurationID', 'files', 'filenames', function ($scope, importService, configurationID, files, filenames) {
        importService.preview(configurationID, files, filenames).progress(function (evt) {
            //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
            if (!data.length)
                return;

            $scope.columns = data[0].Fields.map(function (field) {
                return field.Name;
            });

            $scope.rows = data.map(function (row) {
                return row.Fields.map(function (field) {
                    if (field.Value instanceof Date)
                        field.Value = field.Value.toLocaleDateString();

                    return field;
                });
            });
        })
        .error(function (data, status, headers, config) {

        }).finally(function () {
            //providerView.loadingPreview = false;
        });

    }])
    .filter('notcancelledpoliciesfilter', ['$filter', function ($filter) {
        return function (items, enable) {
            if (enable) {
                return $filter('filter')(items, function (p) {
                    return p.StatusID !== 3 && p.StatusID !== 4;
                });
            }

            return items;
        };
    }])
}();