!function () {
    var providerViewModelInstances = 0;

    function providerViewModel() {
        this.id = providerViewModelInstances++;

        this.files = [];
        this.filenames = [];

        this.startDateDiff = 40;
        this.grossPremiumDiff = 40;
        this.unissuedReneals = false;
        this.processAll = false;
        //this.fileform = 'fileform' + this.id;

        this.customerCol = true;
        this.receiptCol = true;
        this.policyCol = true;
        this.typeCol = true;
        this.netCol = true;
        this.grossCol = true;
        this.issuedDateCol = true;
        this.startDateCol = true;
        this.endDateCol = true;
        this.installmentsCol = false;
        this.commissionCol = false;
        this.diasCol = true;
    }

    angular.module('eCity')
    .controller('ReceiptImportController', ['$scope', 'importService', '$modal', 'user', '$q', 'box',
        function ($scope, importService, $modal, user, $q, box) {
            if (DEBUG)
                window.s = $scope;

            $scope.providers = [];
            $scope.providerViews = [];
            $scope.user = user;

            $scope.globalOptions = {
                'sendEmails': true
            };

            importService.getProviderConfigurations().success(function (data) {
                $scope.providers = data;
            });

            $scope.processAll = function (providerView) {
                angular.forEach(providerView.receipts, function (r) {
                    r.process = providerView.processAll;
                });
            };

            $scope.save = function (providerView) {
                if (providerView.saving || providerView.serverError)
                    return;

                var okSelected = 0;
                var msg = null;

                var receipts = [];
                for (var i = 0; i < providerView.filteredReceipts.length; i++) {
                    if (!providerView.filteredReceipts[i].process)
                        continue;

                    if (providerView.filteredReceipts[i].hasIdenticalMatch()) {
                        okSelected++;
                        continue;
                    }
                    else if (!providerView.filteredReceipts[i].validate()) {
                        box.attention('Please correct the receipt ' + (providerView.filteredReceipts[i].ReceiptReference || '') + '. ' + providerView.receipts[i].validationError);
                        return;
                    }

                    receipts.push(providerView.filteredReceipts[i])
                }

                if (!receipts.length) {
                    msg = '';
                    if (okSelected > 0)
                        msg = ' Receipts marked with the <i class="glyphicon glyphicon-ok txt-color-greenOkSign"></i> sign are ignored.';

                    box.info('Please select some receipts first. ' + msg);
                    return;
                }

                if (okSelected > 0)
                    box.info('An update has been sent. ' + okSelected.toString() + ' receipt(s) marked with the <i class="glyphicon glyphicon-ok txt-color-greenOkSign"></i> sign have been ignored.');

                providerView.saving = true;
                importService.updateReceipts(receipts, $scope.globalOptions.sendEmails).then(function (data) {
                    box.success("The system was updated successfully!");
                }, function (response) {
                    var msg = "There was an error processing your request. " + (response.data.Message || '');
                    if (response.status === 500)
                    {
                        if (!DEBUG)
                            providerView.serverError = true;

                        msg += ' Please try to refresh.';
                    }

                    box.error(msg);
                }).finally(function () {
                    providerView.saving = false;
                });
            };

            $scope.providerChanged = function () {
                if (!$scope.provider)
                    return;

                var view = new providerViewModel();
                view.active = true;

                $scope.providerViews.push(view);

                importService.getConfiguration($scope.provider).success(function (data) {
                    view.configuration = data;
                }).finally(function () {
                    $scope.provider = null;
                });
            };

            $scope.onFileSelect = function (view, $file, mapping, $index) {
                mapping.file2 = $file[0].name;
                view.files[$index] = $file[0];
                view.filenames[$index] = mapping.ID.toString();
                view.receipts = null;
                view.columns = null;
                view.rows = null;
            };

            $scope.matchTabClicked = function (providerView, fileform) {
                providerView.activeTab = 'match';

                if (fileform.$invalid) {
                    //$scope.activeTab = 'parameters';
                    return;
                }

                if (!providerView.receipts)
                    loadMatches(providerView);
            };

            $scope.match = function (providerView, fileform) {
                if (fileform.$invalid) {
                    providerView.activeTab = 'parameters';
                    return;
                }

                providerView.activeTab = 'match';
                loadMatches(providerView);
            }

            $scope.details = function (receipt) {
                $modal.open({
                    templateUrl: 'views/app/backoffice/receiptdetails.html',
                    controller: 'ReceiptDetailsController',
                    //size: 'lg',
                    windowClass: 'my-modal-dialog',
                    resolve: {
                        'receipt': function () {
                            return receipt;
                        }
                    }
                });
            };

            $scope.setRenewals = function (providerView)
            {
                if (!providerView.receipts)
                    return;

                angular.forEach(providerView.receipts, function (r) {
                    if (r.action === 'Insert')
                        r.TypeID = 2;
                });
            }

            function loadMatches(providerView) {
                providerView.loadingMatches = true;

                providerView.receipts = null;
                providerView.processAll = false;

                importService.match(providerView.configuration.ID, providerView.files, providerView.filenames, providerView.startDateDiff, providerView.grossPremiumDiff,
                                providerView.unissuedReneals).then(function (data, status, headers, config) {
                    providerView.totalNet = 0;
                    providerView.totalGross = 0;
                    providerView.totalCommission = 0;

                    providerView.receipts = data.map(function (r) {
                        providerView.totalNet += r.NetPremium || 0;
                        providerView.totalGross += r.GrossPremium || 0;
                        providerView.totalCommission += r.Commission || 0;

                        r.process = false;
                        return r;
                    });


                }, function (data, status, headers, config) {

                }, function (evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).finally(function () {
                    providerView.loadingMatches = false;
                });
            }

            $scope.previewTabClicked = function (providerView, fileform) {
                providerView.activeTab = 'preview';

                if (fileform.$invalid) {
                    //$scope.activeTab = 'parameters';
                    return;
                }

                if (!providerView.columns)
                    loadPreview(providerView);
            };

            $scope.preview = function (providerView, fileform) {
                if (fileform.$invalid) {
                    providerView.activeTab = 'parameters';
                    return;
                }

                providerView.activeTab = 'preview';
                loadPreview(providerView);
            };

            function loadPreview(providerView) {
                providerView.loadingPreview = true;

                importService.preview(providerView.configuration.ID, providerView.files, providerView.filenames).progress(function (evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    if (!data.length)
                        return;

                    providerView.columns = data[0].Fields.map(function (field) {
                        return field.Name;
                    });

                    providerView.rows = data.map(function (row) {
                        return row.Fields.map(function (field) {
                            if (field.Value instanceof Date)
                                field.Value = field.Value.toLocaleDateString();

                            return field;
                        });
                    });
                })
                .error(function (data, status, headers, config) {

                }).finally(function () {
                    providerView.loadingPreview = false;
                });
            }
        }])

    .directive('activeTab', [function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                var f = attr['activeTab'];

                scope.$watch(f, function (newvalue) {
                    if (newvalue)
                        $(element).tab('show');
                });
            }
        };
    }]);
}();