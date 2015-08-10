!function () {
    angular.module('eCity')

    .controller('ConfigurationsController', ['$scope', 'importService', 'box', '$modal', function ($scope, importService, box, $modal) {
        $scope.configurations = [];

        $scope.fieldnames = {
            'Receipts': ['Policy Number', 'Receipt Reference ID', 'Receipt Type', 'Receipt Issued Date', 'Receipt Start Date',
                         'Receipt End Date', 'Receipt Net Premium', 'Receipt Gross Premium', 'Receipt Commission', 'Installments', 'DiasCode',
                         'Firstname', 'Lastname', 'Vat Number', 'Fullname', 'Customer Code'],
            'BankTransactions': ['Date', 'Description', 'Reference', 'Amount', 'AmountType'],
            'Payments': ['Policy Number', 'Receipt Reference ID', 'Date', 'Amount']
        };

        if (DEBUG)
            window.s = $scope;

        importService.getAllConfigurations().then(function (response) {
            $scope.configurations = response.data;
        });

        importService.getEncodings().then(function (response) {
            $scope.encodings = response.data;
        });

        $scope.configTypeChanged = function () {
            angular.forEach($scope.configuration.FileMappings, function (m) {
                angular.forEach(m.Fields, function (f) {
                    f.Name = null;
                });
            });
        }

        $scope.delete = function () {
            if (!$scope.configuration)
                return;

            if ($scope.configuration.ID) {
                var modalInstance = $modal.open({
                    templateUrl: 'deleteConfiguration.html',
                    controller: ['$scope', 'name', function($scope, name) {
                        $scope.name = name;
                    }],
                    size: 'sm',
                    resolve: {
                        name: function () {
                            return $scope.configuration.Name;
                        }
                    }
                }).result.then(function () {
                    importService.deleteConfiguration($scope.configuration.ID).then(function (response) {
                        box.success('Configuration with ID ' + $scope.configuration.ID + ' was deleted successfully!');

                        var index = $scope.configurations.indexOf($scope.configuration);
                        if (index > -1)
                            $scope.configurations.removeIndex(index);

                        $scope.new();
                    }, function (response) {
                        box.error(response.data.Message || "There was an error processing your request.");
                    });
                });
            }
            else
                $scope.new();
        }

        $scope.requiresDelimiter = function (fileMapping)
        {
            //for(var i = 0; i < $scope.configuration.FileMappings.length; i++)
            //    for(var j = 0; j < $scope.configuration.FileMappings[i].Fields.length; i++)
            //        if (angular.isDefined($scope.configuration.FileMappings[i].Fields[j].ColNum))
            //            return true;
                for(var i = 0; i < fileMapping.Fields.length; i++)
                    if (isDefined(fileMapping.Fields[i].ColNum))
                        return true;
        }

        function isDefined(value)
        {
            return value != undefined && value != null && value !== "";
        }

        $scope.posLengthRequired = function(field)
        {
            return !isDefined(field.ColNum) || isDefined(field.Position) || isDefined(field.Length);
        }

        $scope.colNumRequired = function (field) {
            return !isDefined(field.Position) && !isDefined(field.Length);
        }

        $scope.save = function () {
            if ($scope.configurationform.$invalid)
            {
                $scope.showErrors = true;
                return;
            }

            //var hasGroup = false;
            //angular.forEach($scope.configuration.FileMappings, function (m) {
            //    angular.forEach(m.Fields, function (f) {
            //        if(m.)
            //    });
            //});

            if (!$scope.configuration)
                return;

            importService.saveConfiguration($scope.configuration).then(function (response) {
                box.success('Configuration was saved successfully!');

                var newConfig = response.data;
                var index = $scope.configurations.indexOf($scope.configuration);
                if (index > -1)
                    $scope.configurations[index] = newConfig;
                else
                    $scope.configurations.push(newConfig);

                //$scope.new();
            }, function (response) {
                box.error(response.data.Message || "There was an error processing your request.");
            });
        }

        $scope.new = function () {
            // FIXME: ...
            $("#configuration").select2("val", "");
            $scope.showErrors = false;
            $scope.configurationform.$setPristine();

            $scope.configuration = new Configuration();
        }

        $scope.addField = function (fileMapping) {
            fileMapping.Fields.push(new Field());
        }

        $scope.removeField = function(fields, index)
        {
            if (fields.length <= 1)
            {
                box.info("Each file must contain at least one field.");
                return;
            }

            fields.removeIndex(index);
        }

        $scope.removeFile = function (index) {
            if ($scope.configuration.FileMappings.length <= 1) {
                box.info("Each configuration must contain at least one file.");
                return;
            }

            $scope.configuration.FileMappings.removeIndex(index);
        }

        $scope.addFile = function () {
            $scope.configuration.FileMappings.push(new FileMapping());
        }

        function Configuration() {
            this.FileMappings = [new FileMapping()];
        }

        function FileMapping() {
            //this.Delimiter = ';';
            this.Fields = [new Field()];
        }

        function Field() {

        }
   }]);
}();