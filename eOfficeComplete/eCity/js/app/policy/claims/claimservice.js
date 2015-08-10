!function () {
    var app = angular.module('eCity');

    app.service('claimService', ['$http', 'baseUri', '$q', '$upload', function ($http, baseUri, $q, $upload) {


        this.test = function (files, filenames) {
            //if (DEBUG)
            //{
            //    policyID = 21299;
            //    claim = {
            //        'Description': 'afdafsdfsadfasdfasd',
            //        'ObjectID': 17202
            //    };
            //    invoices = [{
            //        'Reference': '243423423',
            //        TypeID: 12,
            //        Amount: 23,
            //        Date: new Date(2014, 0, 1)
            //    }];
            //    actions = [{
            //        ClaimActionTypeID: 0,
            //        Date: new Date(),
            //        CustomText: 'hello'
            //    }];
            //}
            var actions = {
                        ClaimActionTypeID: 0,
                        Date: new Date(),
                        CustomText: 'hello'
                    };

            return $upload.upload({
                url: baseUri + 'api/Claims/Upload',
                method: 'POST',
                data: {
                    'configuration': 1,
                    'startDateDifference': 2,
                    'grossPremiumDifference': 2,
                    'actions': actions
                },
                file: files,
                fileName: filenames
            }).then(function (response) {
          
            });
        };

        this.getExistingClaimRequestInfo = function (claimID, insuranceSlobID) {
            return $http.get(baseUri + 'api/Claims/GetExistingClaimInfo/' +  claimID);
        }

        this.getNewClaimRequestInfo = function (policyID) {
            return $http.get(baseUri + 'api/Claims/GetNewClaimInfo/' + policyID);
        }

        this.save = function (policyID, claim, invoices, close) {
            //if (DEBUG)
            //{
            //    policyID = 21299;
            //    claim = {
            //        'Description': 'afdafsdfsadfasdfasd',
            //        'ObjectID': 17202
            //    };
            //    invoices = [{
            //        'Reference': '243423423',
            //        TypeID: 12,
            //        Amount: 23,
            //        Date: new Date(2014, 0, 1)
            //    }];
            //    actions = [{
            //        ClaimActionTypeID: 0,
            //        Date: new Date(),
            //        CustomText: 'hello'
            //    }];
            //}

            return $http.post(baseUri + 'api/Claims/SaveClaim', {
                'PolicyID': policyID,
                'Claim': claim,
                'Invoices': invoices,
                'Close': close
            });
        }

        this.addActions = function (claimID, actions) {
            //if (DEBUG)
            //{
            //    policyID = 21299;
            //    claim = {
            //        'Description': 'afdafsdfsadfasdfasd',
            //        'ObjectID': 17202
            //    };
            //    invoices = [{
            //        'Reference': '243423423',
            //        TypeID: 12,
            //        Amount: 23,
            //        Date: new Date(2014, 0, 1)
            //    }];
            //    actions = [{
            //        ClaimActionTypeID: 0,
            //        Date: new Date(),
            //        CustomText: 'hello'
            //    }];
            //}

            return $http.post(baseUri + 'api/Claims/AddClaimActions', {
                'ClaimID': claimID,
                'Actions': actions
            });
        }

        this.getClaimsByPolicy = function (policyID) {
            return $http.get(baseUri + 'api/Claims/GetClaimsByPolicy/' + policyID).then(function (response) {
                var totalPaidAmount = 0;

                angular.forEach(response.data, function (c) {
                    totalPaidAmount += c.Payment || 0;

                    c.style = {};
                    if (c.BackColor)
                        c.style['background-color'] = c.BackColor;
                    if (c.ForeColor)
                        c.style['color'] = c.ForeColor;

                    return c;

                });

                response.data.totalPaidAmount = totalPaidAmount;
                return response;
            });
        };

        this.getClaim = function (claimID) {
            return $http.get(baseUri + 'api/Claims/GetClaim/' + claimID);
        };

        this.getEmailHtml = function (email) {
            return $http.post(baseUri + 'api/Claims/GetEmailHtml', {
                'EmailID': email
            });
        }
    }]);
}();