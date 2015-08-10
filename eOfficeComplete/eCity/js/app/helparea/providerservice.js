!function () {
    angular.module('eCity')
    .service('providerService', ['$http', 'baseUri', function ($http, baseUri) {
        this.getHelpPhones = function () {
            return $http.get(baseUri + 'api/Providers/GetHelpPhones');
        };

        this.getProviders = function () {
            return $http.get(baseUri + 'api/Providers/GetProviders');
        };

        this.massPay = function (policies) {
            var payments = [];

            angular.forEach(policies, function (policy) {
                payments.push({
                    'PolicyID': policy.PolicyID,
                    'Amount': policy.PaymentAmount
                });
            });

            return $http.post(baseUri + 'api/Policies/MassPay', {
                'Payments': payments
            });
        };

        this.syncManufacturers = function (provider) {
            return $http.post(baseUri + 'api/Providers/SyncManufacturers', {
                'Provider': provider
            });
        };

        this.syncMotorUsages = function (provider) {
            return $http.post(baseUri + 'api/Providers/SyncMotorUsages', JSON.stringify(provider));
        };

        this.getGeneraliManufacturers = function () {
            return $http.get(baseUri + 'api/Providers/GetGeneraliManufacturers');
        };

        this.syncMotorModels = function (provider) {
            return $http.post(baseUri + 'api/Providers/SyncMotorModels', {
                'Provider': provider
            });
        };

        this.syncProviderMotorModels = function (provider) {
            return $http.post(baseUri + 'api/Providers/SyncProviderMotorModels', {
                'Provider': provider
            });
        };

        this.getMotorModels = function (manufacturerID, date) {
            return $http.post(baseUri + 'api/Providers/GetMotorModels', {
                'Manufacturer': manufacturerID,
                'Year': date.getFullYear()
            });
        };

        this.getNoOfClaims = function (plate, purchasedDate) {
            return $http.post(baseUri + 'api/Providers/GetNoOfClaims', { 
                'Plate': plate,
                'PurchasedDate': purchasedDate
            });
        };

        function convertPacksToArg(packages)
        {
            return $.map(packages, function (p) {
                var covers = [];

                angular.forEach(p.Covers, function (cover) {
                    if (cover.selected) {
                        var c = {
                            Code: cover.Code,
                            SumInsured: cover.SumInsured,
                            Exemption: cover.Exemption
                        };

                        covers.push(c);
                    }
                });

                return {
                    'Code': p.Code,
                    'Covers': covers
                };
            });
        }

        this.getGroupamaAffinities = function () {
            return $http.get(baseUri + 'api/Providers/GetGroupamaAffinities');
        };

        this.tariffy = function (provider, insurable, packages) {
            var packsToSent = convertPacksToArg(packages);
            return $http.post(baseUri + 'api/Providers/Tariffy', { 'Provider': provider, 'Insurable': insurable, 'Packages': packsToSent });
        };
      
        this.getPackages = function (provider) {
            return $http.post(baseUri + 'api/Providers/GetPackagesInfo', { 'Provider': provider }).then(function (response) {
                angular.forEach(response.data, function (pack) {
                    angular.forEach(pack.Covers, function (cover) {
                        cover.selected = cover.Mandatory;

                        if (cover.Capitals.length > 0)
                            cover.SumInsured = cover.Capitals[0].ID;

                        if (cover.Exemptions.length > 0) {
                            cover.Exemption = {
                                Type: cover.Exemptions[0].Type,
                                Value: cover.Exemptions[0].Code
                            }
                        }
                    });
                });

                return response;
            });
        };

        this.getMotorPaymentTypes = function () {
            return $http.get(baseUri + 'api/Providers/GetMotorPaymentTypes');
        };
    }]);
}();