!function () {
    angular.module('eCity')

    .controller('MotorController', ['$scope', 'providerService', '$modal', 'box', '$filter', 'entityService', 'policyService', '$q', function ($scope, providerService, $modal, box, $filter, entityService, policyService, $q) {
        $scope.insurable = {
            //'ManufactureYear': 2014,
            'ClaimsNo': 0
        };
        //$scope.groupamaInsurable = {
        //};

        if (DEBUG) {
            $scope.insurable = {
                //'MotorModelID': 1207,
                //'MotorCode': "35603",
                //'PlateNo': 'IBZ1213',
                //'ManufactureYear': 2010,
                //'Manufacturer': 23,
                'MarketValue': 16650,
                //'ClaimsNo': 0,
                'Gender': 1,
                'Afm': '044725101',
                'DriverBirthDate': new Date(1983, 11, 24),
                'DriverMaritalStatus': "1",
                //'DriverPostalCode': '50001',
                'PurchasedDate': new Date(2011, 10, 20),
                //'Cubism': 1400,
                'PaymentType': 1,
                //'LicenceFirstIssueDate': new Date(2010, 10, 20)
            };
        }
        $scope.showErrors = false;
        $scope.affinities = [];
        $scope.motormodels = [];
        $scope.manufacturers = [];

        $scope.objectType = {
            'ObjectTypeID': 1,
            'Description': 'Car',
            'Slob': 94
        };

        //$scope.generaliPacks = [];
        //$scope.groupamaPackages = [];
        $scope.generali = {
            'name': 'Generali',
            'packages': [],
            'tariffy': generaliTariffy
        };

        $scope.groupama = {
            'name': 'Groupama',
            'packages': [],
            'tariffy': groupamaTariffy
        };

        $scope.ethniki = {
            'name': 'Ethniki',
            'packages': [],
            'tariffy': groupamaTariffy
        };

        if (DEBUG)
            window.s = $scope;

        providerService.getGeneraliManufacturers().then(function (response) {
            Array.prototype.push.apply($scope.manufacturers, response.data);
        });

        providerService.getMotorPaymentTypes().then(function (response) {
            $scope.paymentTypes = response.data;
        });

        entityService.getAllEntities().then(function (data) {
            $scope.entities = data;
        });

        $scope.driverSelected = function ($item, $model, $label) {
            entityService.getEntityInfo($scope.driver.EntityID).then(function (entityExtended) {
                $scope.driver = angular.extend($scope.driver, entityExtended);

                $scope.insurable.OwnerBirthDate = $scope.driver.BasicInfo.DOB;
                $scope.insurable.Afm = $scope.driver.BasicInfo.TaxID;
                $scope.insurable.Gender = $scope.driver.BasicInfo.Gender;
            });
        }

        providerService.getGroupamaAffinities().then(function (response) {
            Array.prototype.push.apply($scope.affinities, response.data);
        });

        // Get car's fields
        policyService.getObjectTypeFields(1).then(function (response) {
            $scope.insurableFields = {};
            $scope.insurableFieldsArray = [];

            angular.forEach(response.data, function (f) {
                if (!f.Info.Required)
                    return;

                if (f.Info.ControlToUse === 'ComboBoxEdit') {
                    f.getText = f.getValue = function (value) {
                        return value;
                    }
                }

                if (f.Info.FieldID === 1)
                    f.Name = 'PlateNo';
                else if (f.Info.FieldID === 2)
                    f.Name = 'DriverPostalCode';
                else if (f.Info.FieldID === 3) {
                    f.Name = 'usage';
                    f.Info.DefaultValue = 'Ε.Ι.Χ';
                    f.Info.Readonly = true;
                }
                else if (f.Info.FieldID === 4)
                    f.Name = 'Seats';
                else if (f.Info.FieldID === 5)
                    f.Name = 'LicenceFirstIssueDate';
                else if (f.Info.FieldID === 6)
                    f.Name = 'TaxHp';
                else if (f.Info.FieldID === 7)
                    f.Name = 'Cubism';
                else if (f.Info.FieldID === 8)
                    f.Name = 'ClaimsNo';
                else if (f.Info.FieldID === 9)
                    f.Name = 'BonusMalus';
                else if (f.Info.FieldID === 13) {
                    f.Name = 'ManufacturerID';
                    f.getValue = function (value) {
                        return value.ID;
                    };
                    f.getText = function (value) {
                        return value.Description;
                    };

                    f.Values = $scope.manufacturers;
                }
                else if (f.Info.FieldID === 14) {
                    f.Name = 'MotorModelID';
                    f.Info.ControlToUse = 'ComboBoxEdit';
                    f.getValue = function (value) {
                        return value.MotorModelID;
                    };
                    f.getText = function (m) {
                        return m.Name + ' ' + m.Type2 + ' ' + m.ChassisType;
                    };

                    f.Values = $scope.motormodels;
                }

                $scope.insurableFields[f.Name] = f;
                $scope.insurableFieldsArray.push(f);
            });

            $scope.insurableFields['BonusMalus'].Info.DefaultValue = 0;

            if(DEBUG)
            {
                $scope.insurableFields['ManufacturerID'].Info.DefaultValue = 23;
                $scope.insurableFields['MotorModelID'].Info.DefaultValue = "3627";//1207;
                //$scope.insurableFields['MotorCode'].Info.DefaultValue = "35603";
                $scope.insurableFields['PlateNo'].Info.DefaultValue = 'IBZ1213';
                //$scope.insurableFields['MarketValue'].Info.DefaultValue = 16650;
                $scope.insurableFields['ClaimsNo'].Info.DefaultValue = 0;
                $scope.insurableFields['DriverPostalCode'].Info.DefaultValue = '50001';
                //$scope.insurableFields['PurchasedDate'].Info.DefaultValue = new Date(2011, 10, 20);
                $scope.insurableFields['Cubism'].Info.DefaultValue = 1400;
                $scope.insurableFields['Seats'].Info.DefaultValue = 4;
                $scope.insurableFields['LicenceFirstIssueDate'].Info.DefaultValue = new Date(2010, 10, 20);
                //$scope.insurableFields['BonusMalus'].Info.DefaultValue = 0;
                //$scope.insurable = {
                //    'MotorModelID': 1207,
                //    'MotorCode': "35603",
                //    'PlateNo': 'IBZ1213',
                //    'ManufactureYear': 2010,
                //    'Manufacturer': 23,
                //    'MarketValue': 16650,
                //    'ClaimsNo': 0,
                //    'Gender': 1,
                //    //'Afm': '044725101',
                //    'DriverBirthDate': new Date(1983, 11, 24),
                //    'DriverMaritalStatus': "1",
                //    'DriverPostalCode': '50001',
                //    'PurchasedDate': new Date(2011, 10, 20),
                //    'Cubism': 1400,

                //    'LicenceFirstIssueDate': new Date(2012, 10, 20)
                //};
            }
        });

        $scope.$watch('insurableFields', function (newValue, oldValue) {
            if (!newValue)
                return;

            //if ($scope.insurableFields.MotorModelID)
            //    console.log($scope.insurableFields.MotorModelID.Info.DefaultValue);

            // Convert the fields to motor insurable
            for (var prop in $scope.insurableFields)
                $scope.insurable[prop] = $scope.insurableFields[prop].Info.DefaultValue;

        }, true);

        $scope.$watchCollection('[insurable.ManufacturerID, insurable.LicenceFirstIssueDate]', function (newValues, oldValues) {
            // Update models only if both have values
            if (!$scope.insurable.ManufacturerID || !$scope.insurable.LicenceFirstIssueDate)
                return [];

            var name = $filter('filter')($scope.insurableFields['ManufacturerID'].Values, { 'ID': Number($scope.insurable.ManufacturerID) }, true);
            if (name.length)
                $scope.insurable.Manufacturer = name[0].Description;

            //if (isNaN(new Date($scope.insurable.ManufactureYear, 0, 1)))
            //    return [];

            providerService.getMotorModels($scope.insurable.ManufacturerID, $scope.insurable.LicenceFirstIssueDate).then(function (response) {
                //$scope.motormodels = $scope.insurableFields['MotorModelID'].Values = response.data;
                $scope.motormodels.length = 0;
                Array.prototype.push.apply($scope.motormodels, response.data);
            });

            return [];
        });

        $scope.$watchCollection('[insurable.PlateNo, insurable.PurchasedDate]', function (newValues, oldValues) {
            // Update models only if both have values
            if (!newValues[0] || !newValues[1])
                return;

            if (newValues[0].length !== 7 && newValues[0].length !== 8)
                return;

            providerService.getNoOfClaims(newValues[0], newValues[1]).then(function (response) {
                $scope.insurable.ClaimsNo = Number(response.data);
            });
        });

        $scope.$watch('insurable.LicenceFirstIssueDate', function (newValue) {
            if (!newValue || $scope.insurable.PurchasedDate)
                return;

            $scope.insurable.PurchasedDate = newValue;
        });

        $scope.$watch('insurable.MotorModelID', function (newValue, oldValue) {
            if (!$scope.insurable.MotorModelID || !$scope.insurableFields) {
                try {
                    $scope.insurableFields['Cubism'].Info.DefaultValue = null;
                    $scope.insurableFields['TaxHp'].Info.DefaultValue = null;
                }
                catch (err) { }
                return;
            }

            var id = Number($scope.insurable.MotorModelID);

            var motormodel = $filter('filter')($scope.motormodels, { 'MotorModelID': id });
            if (motormodel.length) {
                $scope.insurableFields['Cubism'].Info.DefaultValue = motormodel[0].EngineCc;
                $scope.insurableFields['TaxHp'].Info.DefaultValue = motormodel[0].TaxHp.toString();
            }
            else {
                $scope.insurableFields['Cubism'].Info.DefaultValue = null;
                $scope.insurableFields['TaxHp'].Info.DefaultValue = null;
            }
        });

        $scope.$watch('insurable.OwnerBirthDate', function (newValue) {
            if (!newValue)
                return;

            if (!$scope.insurable.DriverBirthDate)
                $scope.insurable.DriverBirthDate = newValue;

            if (!$scope.insurable.DrivingLicenceIssueDate)
            {
                var copiedDate = new Date(newValue.getTime());
                copiedDate.setFullYear(copiedDate.getFullYear() + 18);
                $scope.insurable.DrivingLicenceIssueDate = copiedDate;
            }
        });

        $scope.tariffyAll = function () {
            //$scope.generali.tariffy($scope.generali.packages);
            //$scope.groupama.tariffy($scope.groupama.packages);
            $scope.ethniki.tariffy($scope.groupama.packages);
        }

        function groupamaTariffy(packages) {
            if (($scope.insurableFieldsHaveErrors || $scope.driverform.$invalid) && !DEBUG) {
                $scope.showErrors = true;
                return;
            }

            tariffy(this, packages);
        }

        function tariffy(provider, packages) {
            provider.tariffying = true;
            return providerService.tariffy(provider.name, $scope.insurable, packages).then(function (response) {
                var quotations = response.data.Quotations;
                angular.forEach(quotations, function (q) {
                    var pack = $filter('filter')(packages, { 'Code': q.PackageCode }, true);
                    if (pack.length)
                        angular.extend(pack[0], q);
                });

                box.success('The tariffication of ' + provider.name + ' was successful!!!');
                return response;
            }, function (response) {
                var message = response.data.Message;
                if (message)
                    message = provider.name + ': ' + message.replace(/##/g, ' ');

                box.error(message || 'There was an error contacting ' + provider.name);
                return $q.reject(response);
            }).finally(function () {
                provider.tariffying = false;
                provider.tariffied = true;
            });
        }

        function generaliTariffy(packages) {
            if (($scope.insurableFieldsHaveErrors || $scope.driverform.$invalid) && !DEBUG) {
                $scope.showErrors = true;
                return;
            }

            var p = tariffy(this, packages).then(function (response) {
                if (response.data.Message)
                    box.attention(response.data.Message);
            });
        }
    }])

    .controller('MotorPackageInfoController', ['$scope', 'pack', function ($scope, pack) {
        $scope.pack = pack;
        $scope.selected = true;

        if (DEBUG)
            window.s2 = $scope;
    }])

    .directive('providerPacks', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/app/policies/motor/providerpacks.html',
            scope: {
                'provider': '=',
                'providerImage': '@'
            },
            controller: ['$scope', 'providerService', '$filter', '$modal', 'box', function ($scope, providerService, $filter, $modal, box) {
                if (DEBUG) {
                    window.s2 = window.s2 || {};
                    window.s2[$scope.provider.name] = $scope;
                }

                $scope.loadingPackages = true;
                providerService.getPackages($scope.provider.name).then(function (response) {
                    $scope.provider.packages = response.data;
                }, function (response) {
                    box.error('There was an error contacting ' + $scope.provider.name + '\'s server');
                }).finally(function () {
                    $scope.loadingPackages = false;
                });

                $scope.selectedCoversNum = function (pack) {
                    return $filter('filter')(pack.Covers, { 'selected': true }).length;
                }

                $scope.viewPackageInfo = function (index) {
                    var savedPack = angular.copy($scope.provider.packages[index]);

                    var t = $modal.open({
                        templateUrl: 'views/app/policies/motor/packageinfo.html',
                        controller: 'MotorPackageInfoController',
                        size: 'md',
                        resolve: {
                            'pack': function () {
                                return $scope.provider.packages[index];
                            }
                        }
                    }).result.then(function () {
                        $scope.provider.tariffy([$scope.provider.packages[index]]);
                        //$scope.provider.tariffy();
                    }, function () {
                        $scope.provider.packages[index] = savedPack;
                    });
                }

                $scope.packageHasError = function () {
                    return function (item) {
                        return item.Errors && item.Errors.length;
                    };
                }

                $scope.packagesHaveErrors = function () {
                    var errors = 0;
                    for (var i = 0; i < $scope.provider.packages.length; i++)
                        if ($scope.packageHasError()($scope.provider.packages[i]))
                            errors++;

                    return errors;
                }

                $scope.activePackage = null;
                $scope.selectPackage = function (p) {
                    $scope.activePackage = p;
                }
            }]
        };
    }]);
}();
