!function () {
    angular.module('eCity')
    .service('importService', ['$http', 'baseUri', '$upload', 'ParsedReceipt', '$q', '$filter',
        function ($http, baseUri, $upload, ParsedReceipt, $q, $filter) {
            this.getProviderConfigurations = function () {
                return $http.get(baseUri + 'api/Receipts/GetReceiptConfigurations');
            };

            this.getConfiguration = function (id) {
                return $http.get(baseUri + 'api/Parsers/GetConfigParams/' + id);
            };

            this.getAllConfigurations = function () {
                return $http.get(baseUri + 'api/Parsers/GetConfigurations');
            }

            this.deleteConfiguration = function (id) {
                return $http.get(baseUri + 'api/Parsers/DeleteConfiguration/' + id);
            }

            this.saveConfiguration = function (configuration) {
                return $http.post(baseUri + 'api/Parsers/PostConfiguration', configuration);
            }

            this.getPaymentConfigurationIDs = function () {
                return $http.get(baseUri + 'api/Payments/GetPaymentConfigurations');
            }

            this.getEncodings = function () {
                return $http.get(baseUri + 'api/Parsers/GetEncodings');
            }

            this.preview = function (configurationID, files, filenames) {
                return $upload.upload({
                    url: baseUri + 'api/Parsers/PreviewConfiguration4',
                    method: 'POST',
                    data: { 'configuration': configurationID },
                    file: files,
                    fileName: filenames
                });
            };

            this.match = function (configurationID, files, filenames, startDateDiff, grossDiff, unissuedReneals) {
                return $upload.upload({
                    url: baseUri + 'api/Receipts/Match',
                    method: 'POST',
                    data: {
                        'configuration': configurationID,
                        'startDateDifference': startDateDiff,
                        'grossPremiumDifference': grossDiff,
                        'unissuedReneals': unissuedReneals
                    },
                    file: files,
                    fileName: filenames
                }).then(function (response) {
                    return response.data.map(function (r) {
                        //return angular.extend(new ParsedReceipt(), r);
                        return new ParsedReceipt(r);
                    });
                });
            };

            this.matchPolicyPayments = function (configurationID, files, filenames) {
                return $upload.upload({
                    url: baseUri + 'api/Payments/MatchPolicyPayments',
                    method: 'POST',
                    data: {
                        'configuration': configurationID,
                    },
                    file: files,
                    fileName: filenames
                });
            };

            this.updateReceipts = function (receipts, sendEmails) {
                var recCounter = 0;

                angular.forEach(receipts, function (rec) {
                    if (!rec.getMatchedReceiptID())
                        rec.ReceiptID = -++recCounter;
                });

                return $http.post(baseUri + 'api/Receipts/UpdateReceipts', { 'Receipts': receipts, 'SendEmails': sendEmails }).then(function (response) {
                    var results = response.data;

                    for (var i = 0; i < response.data.length; i++)
                    {
                        var recArray = $filter('filter')(receipts, { 'ReceiptID': results[i].ID });
                        if (!recArray.length)
                        {
                            console.log('Cannot find receipt with ID ' + results[i].ID);
                            continue;
                        }

                        var rec = recArray[0];

                        if (rec.ReceiptID < 0)
                            rec.ReceiptID = null;

                        if (results[i].Error)
                            rec.ErrorDescription = results[i].Error;
                        else
                            rec.success(results[i].ReceiptID, results[i].Description);
                    }
                });
            };
        }]);
}();