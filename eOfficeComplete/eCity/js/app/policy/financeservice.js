!function () {
    var app = angular.module('eCity')

    .service('financeService', ['$http', 'baseUri', function ($http, baseUri) {
        this.getCharges = function (entityID) {
            return $http.get(baseUri + 'api/Finance/GetCharges/' + entityID);
        };

        this.getRelativePayments = function (entityID) {
            return $http.get(baseUri + 'api/Payments/GetRelativePayments/' + entityID);
        }

        this.payPolicies = function (policies, transferFromPolicies) {
            var holderfullname = policies[0].HolderFullname;
            var holderID = policies[0].HolderID;

            return $http.post(baseUri + 'api/Policies/AddPayments', {
                'Payments': policies,
                'Transfers': transferFromPolicies,
                'PolicyHolderFullname': holderfullname,
                'PolicyHolderID': holderID,
                'PayDebts': false
            });
        };

        this.getReceiptDetails = function (receiptID) {
            return $http.get(baseUri + 'api/Receipts/GetReceiptDetails/' + receiptID);
        };
    }]);
}();