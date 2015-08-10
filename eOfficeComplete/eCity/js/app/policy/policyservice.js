!function () {
    var app = angular.module('eCity');

    app.service('policyService', ['$http', 'baseUri', 'Policy', '$q', function ($http, baseUri, Policy, $q) {
        this.getPolicies = function (holderID) {

            return $http.get(baseUri + 'api/Policies/GetPolicies/' + holderID).then(function (response) {
                return response.data.map(function (p) {
                    return new Policy(p);
                });
            });
        };

        this.getOutstandingPolicies = function (provider, dueDate)
        {
            return $http.post(baseUri + 'api/Policies/GetOutstandingPolicies', {
                "Provider": provider,
                "DueDate": dueDate
            }).then(function (response) {
                return response.data.map(function (p) {
                    return new Policy(p);
                });
            });
        }

        this.getObjects = function (policyID) {
            return $http.get(baseUri + 'api/Policies/GetObjects/' + policyID);
        }

        this.getPaymentTypes = function () {
            return $http.get(baseUri + 'api/Policies/GetPaymentTypes');
        }

        this.getPolicy = function (policyID) {

            return $http.get(baseUri + 'api/Policies/GetPolicy/' + policyID).then(function (response) {
                var policy = new Policy(response.data.Policy);
                policy.receipts = response.data.Receipts;

                return policy;
            });
        };

        var receiptTypes = null;
        this.getReceiptTypes = function () {
            if (receiptTypes) {
                var deferred = $q.defer();
                deferred.resolve(receiptTypes);
                return deferred.promise;
            }

            return $http.get(baseUri + 'api/Receipts/GetReceiptTypes').then(function (response) {
                receiptTypes = response.data;
                return receiptTypes;
            });
        };
        this.getCompanies = function () {
            return $http.get(baseUri + 'api/Policies/GetCompanies');
        };
        this.getProducers = function () {
            return $http.get(baseUri + 'api/Entity/GetProducers');
        };
        this.getGroups = function () {
            return $http.get(baseUri + 'api/Policies/GetGroups');
        };
        this.getCancellationReasonTypes = function () {
            return $http.get(baseUri + 'api/Policies/GetCancellationReasonTypes');
        };
        var providers = null;
        this.getProviders = function () {
            var promise = null;

            if (!providers)
            {
                promise = $http.get(baseUri + 'api/Providers/GetProviders');
                promise.success(function (data) {
                    providers = data;
                });
            }

            var obj = {
                success: function (fn) {
                    if (providers)
                        return fn(providers);

                    return promise.success(fn);
                },
                error: function (fn) {
                    if (providers)
                    {
                        // This should never happen
                        return;
                    }

                    return promise.error(fn)
                }
            };

            return obj;
        };
        this.getCollectionTypes = function () {
            return $http.get(baseUri + 'api/Policies/GetCollectionTypes');
        };
        this.getObjectTypes = function () {
            return $http.get(baseUri + 'api/Policies/GetObjectTypes');
        };
        this.getObjectTypeFields = function (objectTypeId) {
            return $http.get(baseUri + 'api/Policies/GetObjectTypeFields/' + objectTypeId);
        };
        this.getReceipts = function (policyID) {
            return $http.get(baseUri + 'api/Receipts/GetViewReceipts/' + policyID);
        };
        this.issueReceipt = function (receipt) {
            return $http.post(baseUri + 'api/Receipts/IssueReceipt', {
                'Receipt': receipt,
                'Objects': receipt.objects
            });
        };
        this.renewPolicy = function (policyID, renewalNumber, receipt) {
            return $http.post(baseUri + 'api/Policies/Renewal', {
                'PolicyID': policyID,
                'Number': renewalNumber,
                'Receipt': receipt
            });
        };
        this.createEndorsement = function (endorsement) {
            return $http.post(baseUri + 'api/Policies/CreateEndorsement', endorsement);
        };
        this.cancelPolicy = function (cancellation) {
            return $http.post(baseUri + 'api/Policies/Cancel', cancellation);
        };
        var slobs = {};
        this.getSlobAndCovers = function (policyID, slobID) {
            var arg = {
                'PolicyID': policyID,
                'SlobID': slobID
            };
            return $http.post(baseUri + 'api/Policies/GetSlobAndCovers', arg).then(function (response) {
                slobs[arg.SlobID] = response.data.Slob;

                return response;
            });
        };
        this.getSlobByID = function (id)  {
            if (slobs[id]) {
                var deferred = $q.defer();
                deferred.resolve(slobs[id]);
                return deferred.promise;
            }

            return $http.get(baseUri + 'api/Policies/GetSlobById/' + id).then(function (response) {
                var slob = response.data;
                slobs[id] = slob;

                return slob;
            });
        }
        this.postObject = function (obj) {
            return $http.post(baseUri + 'api/Policies/PostObject', obj);
        };
        //this.postMotorObject = function (insurable) {
        //    return $http.post(baseUri + 'api/Policies/PostMotorObject', insurable);
        //};
        this.deleteObjects = function (type, policyID, objects)
        {
            return $http.post(baseUri + 'api/Policies/DeleteObjects',
            {
                'Type': type,
                'PolicyID': policyID,
                'Objects': objects
            });
        }
        this.addObjectsToPolicy = function (policyID, objects) {
            return $http.post(baseUri + 'api/Policies/AddObjectsToPolicy',
            {
                'PolicyID': policyID,
                'Objects': objects
            });
        }
        this.postEntityObject = function (entityID) {
            return $http.post(baseUri + 'api/Policies/PostEntityObject', entityID);
        };
        this.postPolicy = function (policy) {
            if (DEBUG) {
                var policy = {
                    "ApplicationID": 3223, 'Holder': 644, //644,
                    "Group": 0, "Currency": "EUR", "Transfer": true, "Commission": true,
                    "SLOB": 155, "Finance": 692, "Frequency": 3, "EndDate": "03/07/2015", "InitialStartDate": '03/07/2012', "Company": 1,
                    "Producer": "20247", "Provider": "267", "PaymentMeans": 2, "AgreedPremium": 50, "StartDate": "03/07/2014",
                    "Frequency": 3, Objects: [{
                        'ObjectID': 100,
                        'ObjectAmount': 200,
                        'CoverID': 59,
                        'CoverAmount': 23.32,
                        'DeductibleID': 10
                    }],
                    //"Quote": 332,
                    "Signature": "data:image/png;base64,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"
                };
            }

            return $http.post(baseUri + 'api/Policies/CreatePolicy', policy);
        };
        var covers = {};
        this.getCovers = function (slobId, success) {
            if (covers.hasOwnProperty(slobId))
            {
                success(covers[slobId]);
                return;
            }

            $http.get(baseUri + 'api/Policies/GetCovers/' + slobId).success(function (data) {
                covers[slobId] = data;
                success(data);
            });
        };
        this.getPaymentFrequences = function () {
            return $http.get(baseUri + 'api/Policies/GetPaymentFrequences');
        };
        this.getSlobs = function () {
            return $http.get(baseUri + 'api/Policies/GetSlobs');
        };
        this.getObject = function (search, objectTypeID) {
            return $http.get(baseUri + 'api/Policies/GetObject', {
                params: {
                    'value': search,
                    'objectTypeID': objectTypeID
                }
            });
        };

        //$http.get(ECity.service.baseUri + 'api/Policies/GetObject', {
        //    params: {
        //        value: val
        //    }
        //})
    }]);
}();