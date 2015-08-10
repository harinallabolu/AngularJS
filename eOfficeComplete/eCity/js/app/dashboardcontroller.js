!function () {
    angular.module('eCity')

    .controller('DashboardController', ['$scope', 'providerService', 'box', 'user', function ($scope, providerService, box, user) {
        $scope.isAdmin = user.isAdmin;
        $scope.processing = false;

        if (DEBUG)
            window.s = $scope;

        //$scope.syncGeneraliManufacturers = function () {
        //    syncManufacturers(providerService.syncGeneraliManufacturers);
        //};

        //$scope.syncEthnikiManufacturers = function () {
        //    syncManufacturers(providerService.syncEthnikiManufacturers);
        //}

        $scope.syncMotorUsages = function (provider) {
            sync(provider, providerService.syncMotorUsages, successSyncMotorUsages);

            function successSyncMotorUsages(response) {
                var usagesReceived = response.data.UsagesReceived;
                var usagesAdded = response.data.UsagesAdded;

                var message = "The synchronization was successful. " + usagesReceived + ' motor usages were received and ' + usagesAdded + ' were added.';
                box.success(message);
            }
        }

        function sync(provider, serviceFn, successFn)
        {
            if ($scope.processing)
                return busy();

            $scope.processing = true;
            serviceFn(provider).then(successFn, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.');
            }).finally(function () {
                $scope.processing = false;
            });
        }


        $scope.syncManufacturers = function (provider) {
            if ($scope.processing)
                return busy();

            $scope.processing = true;
            providerService.syncManufacturers(provider).then(function (response) {
                var manufacturersReceived = response.data.ManufacturersReceived;
                var manufacturersAdded = response.data.ManufacturersAdded;
                var description = response.data.Description;

                var message = "The synchronization was successful. " + manufacturersReceived + ' motor manufacturers were received and ' + manufacturersAdded + ' were added.';
                box.success(message);

                if (description)
                    box.attention(description);

            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.');
            }).finally(function () {
                $scope.processing = false;
            });
        }

        $scope.syncGeneraliMotorModels = function () {
            syncMotorModels(providerService.syncMotorModels, 'Generali');
        };

        $scope.syncEthnikiMotorModels = function () {
            syncMotorModels(providerService.syncMotorModels, 'Ethniki');
        };

        $scope.syncEthnikiProviderMotorModels = function () {
            syncMotorModels(providerService.syncProviderMotorModels, 'Ethniki');
        };

        $scope.syncGeneraliProviderMotorModels = function () {
            syncMotorModels(providerService.syncProviderMotorModels, 'Generali');
        };

        function syncMotorModels (servicefn, provider) {
            if ($scope.processing)
                return busy();

            $scope.processing = true;

            servicefn(provider).then(function (response) {
                var modelsReceived = response.data.ModelsReceived;
                var modelsProccessed = response.data.ModelsProccessed;

                var message = "The synchronization was successful. " + modelsReceived + ' motor models were received and ' + modelsProccessed + ' were added.';
                box.success(message);

            }, function (response) {
                box.error(response.data.Message || 'There was an error processing your request.');
            }).finally(function () {
                $scope.processing = false;
            });
        };

        function busy() {
            box.info('A task is currently executing. Please wait for it to complete.');
        }
    }]);
}();
