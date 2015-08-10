!function () {
    angular.module('eCity')
        .controller('ClaimController', ['$scope', '$routeParams', 'policyService', 'claimService', '$filter', '$modal', 'box', '$location', 'user', function ($scope, $routeParams, policyService, claimService, $filter, $modal, box, $location, user) {
            $scope.user = user;
            $scope.policyID = $routeParams.policyId;
            $scope.claimID = $routeParams.claimId;
            $scope.policy = {};

            $scope.claim = {};
            $scope.invoices = [];
            $scope.notes = null;

            // True if we are editing an existing claim or false if we are creating a new one.
            $scope.editClaim = false;

            if (DEBUG)
                window.s = $scope;

            $scope.myclaimfiles = {};
            $scope.test = function () {

                var files = $scope.myclaimfiles.getall();

                claimService.test(files, ['hellowrold']).then(function (response) {


                });
            }

            if ($scope.claimID) {
                claimService.getClaim($scope.claimID).success(function (claim) {
                    $scope.claim = claim;
                    $scope.editClaim = true;
                });
            }

            policyService.getPolicy($scope.policyID).then(function (policy) {
                angular.extend($scope.policy, policy);

                if ($scope.claimID) {
                    claimService.getExistingClaimRequestInfo($scope.claimID, $scope.policy.SlobID).success(function (data) {
                            $scope.actions = data.Actions;
                            $scope.invoices = data.ClaimInvoices;

                            angular.forEach($scope.invoices, function (i) {
                                i.isPaid = i.PaidAmount !== null;
                            });
                    });
                };
            });

            claimService.getNewClaimRequestInfo($scope.policyID).success(function (data) {
                $scope.policy.objects = data.PolicyObjects;
                $scope.actionTypes = data.ActionTypes;
                $scope.bankAccounts = data.BankAccounts;
                $scope.invoiceTypes = data.ClaimInvoiceTypes;
            });

            $scope.deleteInvoice = function (invoiceIndex) {
                if (!selectedInvoice(invoiceIndex))
                    return;

                var invoice = $scope.invoices[invoiceIndex];
                var msg = 'Are you sure you want to delete the selected invoice?';
                if (invoice.InvoiceID)
                    msg = 'The selected invoice has been saved to the system. Are you sure you want to delete it?';

                $modal.open({
                    templateUrl: 'DeleteInvoiceModal.html',
                    controller: ['$scope', 'message', function ($scope, message) {
                        $scope.message = message;
                    }],
                    size: 'sm',
                    resolve: {
                        'message': function () {
                            return msg;
                        }
                    }
                }).result.then(function () {
                    if (!invoice.InvoiceID) {
                        $scope.invoices.removeIndex(invoiceIndex);
                        return;
                    }

                    invoice.Action = 'Delete';
                });
            };

            $scope.newAction = function () {
                $modal.open({
                    templateUrl: 'views/app/policies/claims/newaction.html',
                    controller: 'NewClaimActionController',
                    size: 'sm',
                    resolve: {
                        'actionTypes': function () {
                            return $scope.actionTypes;
                        }
                    }
                }).result.then(function (action) {
                    action.new = true;
                    if (action.type.EmailID)
                    {
                        //claimService.getEmailHtml(action.type.EmailID).then(function (response) {
                        //    action.notes = response.data;
                        //});
                        if (action.type.NeedsUserData)
                            action.notes = action.CustomText;
                    }
                    else
                    {
                        action.notes = action.CustomText;
                        //$scope.notes = action.CustomText;
                    }
                        
                    $scope.actions.push(action);
                });
            }

            $scope.getClaimActionType = function (claimActionTypeID) {
                if (claimActionTypeID == null || claimActionTypeID === undefined)
                    return;

                var actionType = $filter('filter')($scope.actionTypes, { 'ClaimActionTypeID': claimActionTypeID }, true);
                if (actionType.length)
                    return actionType[0].Description;
            }

            $scope.getInvoiceType = function (invoiceTypeID) {
                if (!invoiceTypeID)
                    return;

                var invoicesType = $filter('filter')($scope.invoiceTypes, { 'ClaimInvoiceTypeID': invoiceTypeID }, true);
                if (invoicesType.length)
                    return invoicesType[0].Description;
            };

            function selectedInvoice(invoiceIndex) {
                if (invoiceIndex == null || invoiceIndex === undefined) {
                    box.info('Please select an invoice first');
                    return false;
                }

                return true;
            };

            function editInvoiceModal(invoice, editType)
            {
                return $modal.open({
                    templateUrl: 'views/app/policies/claims/editinvoice.html',
                    controller: 'EditInvoiceController',
                    size: 'sm',
                    resolve: {
                        'invoice': function () {
                            return invoice;
                        },
                        'invoiceTypes': function () {
                            return $scope.invoiceTypes;
                        },
                         'editType': function () {
                             return editType;
                         }
                    }
                }).result;
            }

            $scope.newInvoice = function () {
                editInvoiceModal(null, 'new').then(function (invoice) {
                    invoice.dirty = true;
                    invoice.Action = 'New';
                    $scope.invoices.push(invoice);
                });
            };

            $scope.payInvoice = function (invoiceIndex) {
                //editInvoice(invoiceIndex, 'editPay', 'EditPay');
                $scope.payMode = $scope.invoices.some(function (i) {
                    return !i.isPaid;
                });

                if (!$scope.payMode)
                    box.info('All invoices are already paid!');
            }

            $scope.invoiceChanged = function (invoice) {
                invoice.dirty = true;
                invoice.Action = 'EditPay';
            }

            $scope.canPayInvoice = function(invoice) {
                return $scope.payMode && !invoice.isPaid;
            }

            $scope.editInvoice = function (invoiceIndex) {
                editInvoice(invoiceIndex, 'editAll', 'EditAll');
            }

            $scope.addInvoiceNotes = function (invoiceIndex) {
                editInvoice(invoiceIndex, 'editNotes', 'EditNotes');
            }

            function editInvoice(invoiceIndex, editType, invoiceAction)
            {
                if (!selectedInvoice(invoiceIndex))
                    return;

                editInvoiceModal(angular.copy($scope.invoices[invoiceIndex]), editType).then(function (invoice) {
                    invoice.dirty = true;
                    invoice.Action = invoiceAction;
                    $scope.invoices[invoiceIndex] = invoice;
                });
            }

            $scope.addActions = function () {
                var actions = $filter('filter')($scope.actions, { 'new': true });
                if (!actions.length)
                {
                    box.info('Please add some actions');
                    return;
                }

                claimService.addActions($scope.claim.ClaimID, actions).then(function (response) {
                    box.success("The claim actions were saved successfully!!!");
                    $location.path('/app/policies/editclaim/' + $scope.policyID + '/' + response.data.ClaimID);

                }, function (response) {
                    box.error("There was an error processing your request. " + (response.data.Message || ''));
                });
            }

            $scope.save = function () {
                if (!DEBUG)
                {
                    if ($scope.claimform.$invalid) {
                        $scope.claimform.object.firstTimer = false;
                        $scope.claimform.object.$dirty = true;
                        $scope.claimform.object.$pristine = false;

                        $scope.claimform.description.firstTimer = false;
                        $scope.claimform.description.$dirty = true;
                        $scope.claimform.description.$pristine = false;

                        return;
                    }


                    var activeInvoices = $filter('filter')($scope.invoices, function (i) {
                        if (i.Action !== 'Delete')
                            return true;

                        return false;
                    });

                    if (!activeInvoices.length) {
                        box.attention("Please add at least one invoice.");
                        return;
                    }
                }


                var oneUnpaidInvoice = false;
                var invoices = $filter('filter')($scope.invoices, function (i) {

                    if (i.Action === 'Delete')
                        return true;

                    oneUnpaidInvoice = oneUnpaidInvoice || (i.PaidAmount === null);

                    if(i.dirty)
                        return true;

                    return false;
                });

                if (!oneUnpaidInvoice && invoices.length) {
                    $modal.open({
                        templateUrl: 'CloseClaimModal.html',
                        controller: function () {
                        },
                        size: 'sm'
                    }).result.then(function () {
                        $scope.policy.InitialStartDate = $scope.policy.StartDate;
                        doSave(true);
                    }, function () {
                        doSave(false);
                    });
                }
                else
                    doSave(false);

                function doSave(close) {
                    $scope.saving = true;
                    claimService.save($scope.policyID, $scope.claim, invoices, close).then(function (response) {
                        box.success("The claim was saved successfully!!!");
                        if (response.data.Description)
                            box.attention(response.data.Description);

                        $location.path('/app/policies/editclaim/' + $scope.policyID + '/' + response.data.ClaimID);

                        angular.forEach($scope.invoices, function (i) {
                            // Set this to true because we may not have ID yet
                            i.isPaid = true;
                            i.Action = null;
                            i.dirty = false;
                        });

                        $scope.payMode = false;
                        if (close)
                            $scope.actions.push({
                                'ClaimActionTypeID': 15,
                                'Date': new Date()
                            });
                    }, function (response) {
                        box.error("There was an error processing your request. " + (response.data.Message || ''));
                    }).finally(function () {
                        $scope.saving = false;
                    });
                }
            }
        }])

    .controller('EditInvoiceController', ['$scope', 'invoice', 'invoiceTypes', 'editType', function ($scope, invoice, invoiceTypes, editType) {
        $scope.invoice = invoice || {
            'PaidAmount': null,
            'isPaid': true
        };
        $scope.invoiceTypes = invoiceTypes;
        $scope.today = new Date();
        $scope.editType = editType; // possible types: 'editAll', 'editPay', 'editNotes' and 'new'

        if (DEBUG)
            window.s2 = $scope;

        $scope.save = function (form) {
            if (form.$invalid) {
                //setDirty(form.invoicetype);
                //setDirty(form.invoicenumber);
                //setDirty(form.invoiceamount);
                //setDirty(form.invoicedate);
                //for (var prop in form)
                //{
                //    if (prop[0] != '$')
                //        setDirty(form[prop]);
                //}
                $scope.submitted = true;

                return;
            }

            $scope.$close($scope.invoice);

            //function setDirty(elem)
            //{
            //    elem.$pristine = false;
            //    elem.$dirty = true;
            //    elem.firstTimer = false;
            //}
        };
    }])
    .controller('NewClaimActionController', ['$scope', 'actionTypes', function ($scope, actionTypes) {
        $scope.actionTypes = actionTypes;
        $scope.action = {
            'Date': new Date()
        };

        if (DEBUG)
            window.s2 = $scope;

        $scope.save = function (form) {
            if (form.$invalid) {
                form.actiontype.$pristine = false;
                form.actiontype.$dirty = true;
                form.actiontype.firstTimer = false;

                if (form.customtext) {
                    form.customtext.$pristine = false;
                    form.customtext.$dirty = true;
                    form.customtext.firstTimer = false;
                }

                return;
            }

            $scope.$close($scope.action);
        };

        $scope.typeChanged = function () {
            $scope.action.ClaimActionTypeID = $scope.action.type.ClaimActionTypeID;
        }
    }]);
}();
