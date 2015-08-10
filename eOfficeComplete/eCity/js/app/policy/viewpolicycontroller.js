!function () {
    angular.module('eCity')

    // TODO: create a directive for entity search
    .controller('ViewPoliciesController', ['$scope', '$filter', 'entityService', 'policyService', '$modal', 'user', '$routeParams', 'financeService', '$location', 'box', 'claimService',
        function ($scope, $filter, entityService, policyService, $modal, user, $routeParams, financeService, $location, box, claimService) {
            //$scope.entities = [];
            $scope.entityViews = [];
            $scope.selectedReceipt = null;
            $scope.user = user;
            $scope.params = $routeParams;

            //$scope.totalItems = 64;
            //$scope.currentPage = 4;
            $scope.itemsPerPage = 4;

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function (e) {
                e.filteredLogs = e.logs.slice((e.logsCurrentPage - 1) * $scope.itemsPerPage, e.logsCurrentPage * $scope.itemsPerPage);
            };

            $scope.maxSize = 5;
            //$scope.bigTotalItems = 175;
            //$scope.bigCurrentPage = 1;


            if (DEBUG)
                window.s = $scope;

            $scope.openEntityInfo = function (entity) {
                $modal.open({
                    templateUrl: 'views/app/entities/entityinfo.html',
                    controller: 'EntityInfoController',
                    size: 'lg',
                    resolve: {
                        'entity': function () {
                            return entity;
                        }
                    }
                }).result.then(function (entity) {
                    if (!entity)
                        return;

                    $scope.selectEntity(entity);
                });
            };

            $scope.renewal = function (policy) {
                if (!policy) {
                    box.info('Please select a policy first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/renewal.html',
                    controller: 'RenewalController',
                    size: 'md',
                    resolve: {
                        'policy': function () {
                            return policy;
                        },
                        'slob': function () {
                            return policyService.getSlobByID(policy.SlobID);
                        }
                    }
                });
            };

            $scope.cancellation = function (policy) {
                if (!policy) {
                    box.info('Please select a policy first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/cancellation.html',
                    controller: 'CancellationController',
                    size: 'md',
                    resolve: {
                        'policy': function () {
                            return policy;
                        }
                    }
                });
            };

            $scope.endorsement = function (policy) {
                if (!policy) {
                    box.info('Please select a policy first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/endorsement.html',
                    controller: 'EndorsementController',
                    size: 'md',
                    resolve: {
                        'policy': function () {
                            return policy;
                        }
                    }
                });
            };

            $scope.issueReceipt = function (policy) {
                if (!policy || !policy.selectedReceipt) {
                    box.info('Please select an (unissued) receipt first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/issuereceipt.html',
                    controller: 'issueReceiptCtrl',
                    size: 'md',
                    resolve: {
                        policy: ['policyService', '$q', function (policyService, $q) {

                            function smallBox() {
                                box.attention('Sorry but you dont have the priviledges to update this receipt.');
                            }

                            var deferred = $q.defer();

                            if (policy.selectedReceipt.IssuedDate && !user.isAdmin) {
                                smallBox();
                                deferred.reject('User does not have the priviledges to update this receipt');
                            } else {
                                policyService.getSlobAndCovers(policy.PolicyID, policy.SlobID).then(function (response) {
                                    policy.covers = response.data.Covers;
                                    policy.slob = response.data.Slob;

                                    if (policy.slob.IssuefromDataFiles && !user.isAdmin) {
                                        smallBox();
                                        deferred.reject('User does not have the priviledges to issue this receipt.');
                                        return;
                                    }

                                    deferred.resolve(policy);
                                }, function (data) {
                                    deferred.reject(data);
                                });
                            }

                            return deferred.promise;
                        }]
                    }
                });
            };

            $scope.viewObjects = function (policy)
            {
                if (!policy) {
                    box.info('Please select a policy first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/objects/policyobjects.html',
                    controller: 'ViewObjectsController',
                    size: 'md',
                    resolve: {
                        'policy': function () {
                            return policy;
                        }
                    }
                });
            }

            $scope.newClaim = function (policyID) {
                if (!policyID) {
                    box.info('Please select a policy first');
                    return;
                }

                $location.path('/app/policies/editclaim/' + policyID);
            }

            $scope.editClaim = function (policyID, claimID) {
                if (!policyID || !claimID) {
                    box.info('Please select a claim first');
                    return;
                }

                $location.path('/app/policies/editclaim/' + policyID + '/' + claimID);
            };


            $scope.selectReceipt = function (policy, receipt) {
                policy.selectedReceipt = receipt;
            };

            $scope.selectPolicy = function (entity, policy) {
                entity.viewPolicy = policy;

                if (!policy.receipts) {
                    entity.viewPolicy.loadingReceipts = true;

                    policyService.getReceipts(policy.PolicyID).then(function (response) {
                        policy.receipts = response.data;
                    }).finally(function () {
                        entity.viewPolicy.loadingReceipts = false;
                    });
                }

                if (!policy.claims) {
                    entity.viewPolicy.loadingClaims = true;
                    claimService.getClaimsByPolicy(policy.PolicyID).then(function (response) {
                        policy.claims = response.data;

                    }).finally(function () {
                        entity.viewPolicy.loadingClaims = false;
                    });
                }
            };

            $scope.selectEntity = function (entity) {
                //var fullname = entityFullmame(entity);

                //$scope.activeEntity = $scope.entityViews.length;
                //var index = $scope.entityViews.indexOf(entity);
                //if (index > -1) {
                //    $scope.entityViews[index].active = true;
                //    return;
                //}
                var index = -1;
                for (var i = 0; i < $scope.entityViews.length; i++)
                    if ($scope.entityViews[i].EntityID === entity.EntityID) {
                        index = i;
                        break;
                    }
                if (index > -1) {
                    $scope.entityViews[index].active = true;
                    return;
                }

                //var entity = angular.copy(entity);
                entity.active = true;
                entity.contacts = [];
                entity.loadingPolicies = true;
                // Active policies are the ones with status != 4
                entity.showLapsed = false;
                entity.policiesRunningTotal = 0;

                policyService.getPolicies(entity.EntityID).then(function (data) {
                    data = $filter('orderBy')(data, 'LOB');
                    entity.lobs = data.groupBy('LOB', function (p) {
                        return p.LOB;
                    });
                    entity.policies = data;

                    angular.forEach(entity.policies, function (p) {
                        if (p.StatusID === 3 || p.StatusID === 4)
                            return;

                        entity.policiesRunningTotal += p.RunningTotal;
                    });
                }).finally(function (data) {
                    entity.loadingPolicies = false;
                });

                entity.loadingLogs = true;
                entityService.getLogActions(entity.EntityID).success(function (data) {
                    entity.logs = data;
                    entity.logsCurrentPage = 1;
                    entity.filteredLogs = entity.logs.slice(0, $scope.itemsPerPage);

                }).finally(function (data) {
                    entity.loadingLogs = false;
                });

                financeService.getCharges(entity.EntityID).success(function (data) {
                    entity.charges = data;
                });

                entity.loadingContacts = true;
                entityService.getEntityInfo(entity.EntityID).then(function (entityExtended) {
                    entity = angular.extend(entity, entityExtended);
                }).finally(function (data) {
                    entity.loadingContacts = false;
                });

                $scope.entityViews.push(entity);
            };

            entityService.getAllEntities().then(function (data) {
                var entities = data;

                if ($scope.params['entityId']) {
                    var entity = $filter('filter')(entities, { 'EntityID': Number($scope.params['entityId']) }, true);
                    if (entity.length)
                        $scope.selectEntity(entity[0]);
                } else if (DEBUG) {
                    var entity = $filter('filter')(entities, { 'EntityID': 17576 }, true);
                    if (entity.length)
                        $scope.selectEntity(entity[0]);
                }
            });

            $scope.$on('entityselect', function (event, entity) {
                $scope.selectEntity(entity);
            });

            $scope.viewReceipt = function (receipt) {
                if (!receipt)
                {
                    box.info('Please select a receipt first');
                    return;
                }

                $modal.open({
                    templateUrl: 'views/app/policies/receipt.html',
                    controller: 'ReceiptController',
                    size: 'lg',
                    resolve: {
                        'receipt': function () {
                            return receipt;
                        }
                    }
                });
            }
        }])


    .filter('cancelledpoliciesfilter', ['$filter', function ($filter) {
        return function (items, enable) {
            if (enable) {
                return $filter('filter')(items, function (p) {
                    return p.StatusID !== 4;
                });
            }

            return items;
        };
    }])

    .controller('EntityInfoController', ['$scope', '$modalInstance', 'entity', 'entityService', '$rootScope', '$filter', '$modal',
        function ($scope, $modalInstance, entity, entityService, $rootScope, $filter, $modal) {
            $scope.entity = entity;

            var entities = [];
            entityService.getAllEntities().then(function (data) {
                entities = data;
            });

            entityService.getEntityAdditionalInfo(entity.EntityID).success(function (data) {
                $scope.entity.PoliciesParticipatingAsObject = data.Policies;
                $scope.entity.References = data.References;
            });

            $scope.gotoViewPolicy = function (holderID) {
                var results = $filter('filter')(entities, { 'EntityID': holderID });

                if (!results.length)
                    return;

                //$rootScope.$broadcast('entityselect', results[0]);
                $modalInstance.close(results[0]);
            };

            //$scope.openEntityTab = function (holderID) {
            //    var results = $filter('filter')(entities, { 'EntityID': holderID });

            //    if (!results.length)
            //        return;

            //    $rootScope.$broadcast('entityselect', results[0]);
            //};

            $scope.editAddresses = function () {
                var savedAddresses = angular.copy($scope.entity.Addresses);

                $modal.open({
                    templateUrl: 'editaddressmodal.html',
                    controller: 'EditAddressModalController',
                    size: 'lg',
                    resolve: {
                        'addresses': function () {
                            return $scope.entity.Addresses;
                        },
                        'doorbell': function () {
                            return $scope.entity.getFullname();
                        },
                        'entityID': function () {
                            return $scope.entity.EntityID;
                        }
                    }
                }).result.then(function (addresses) {
                    $scope.entity.Addresses = addresses;
                }, function () {
                    $scope.entity.Addresses = savedAddresses;
                });
            };

            $scope.save = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])

     .controller('EditAddressModalController', ['$scope', '$modalInstance', 'addresses', 'doorbell', 'Address', 'entityID', 'entityService', '$filter', 'box',
        function ($scope, $modalInstance, addresses, doorbell, Address, entityID, entityService, $filter, box) {
            $scope.addresses = addresses;
            $scope.doorbell = doorbell;

            //$scope.mapRender = true;

            $scope.save = function () {

                if (!Address.validateGroup($scope.addresses)) {
                    box.error("Please add or modify at least one address and make sure you have specified a Billing, a Mailing and a Collection address.");
                    return;
                }

                var dirtyAddresses = $filter('filter')($scope.addresses, function (address) { return address.isDirty(); });
                if (!dirtyAddresses.length) {
                    box.info('No addresses were modified.');
                    $modalInstance.close($scope.addresses);
                    return;
                }

                entityService.saveAddresses(entityID, dirtyAddresses).then(function (response) {
                    box.success('The addresses have been saved successfully!!!');
                    var newAddresses = $filter('filter')($scope.addresses, function (a) { return a.save(); });

                    var msg = null;
                    if (response === 'SuccessWithNoData') {
                        msg = 'The addresses have been saved but due to an internal error you need to refresh the browser to see the results.';
                        newAddresses = [];
                    } else if (response === 'SuccessWithoutLogs') {
                        msg = 'The addresses have been saved but logs of the changes haven\'t been made due to an error.';
                    }

                    if (msg)
                        box.attention(msg);

                    $modalInstance.close(newAddresses);
                }, function (response) {
                    box.error("There was an error processing your request. " + (response.data.Message || ''));
                    $modalInstance.dismiss('failure');
                });
            }

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])
    .directive('actionNotes', ['$compile', '$modal', function ($compile, $modal) {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var notes = scope.$eval(attrs.actionNotes);
                var time = scope.$eval(attrs.actionTime);

                element.removeAttr('action-notes');

                if (!notes)
                    return;

                if (notes.length < 50) {
                    element.attr('popover', notes);
                    element.attr('popover-trigger', 'mouseenter');
                    element.attr('popover-title', 'Time sent: ' + time.toLocaleString());
                }
                else {
                    element.on('click', function () {
                        $modal.open({
                            template: '<h3>Time sent: ' + time.toLocaleString() + '</h3><div class="padding-10">' + notes + '</div>',
                            size: 'lg',
                        });
                    });
                }

                $compile(element)(scope);
            }
        };
    }])
    .controller('ReceiptController', ['$scope', 'receipt', 'financeService', 'user', function ($scope, receipt, financeService, user) {
        $scope.receipt = receipt;

        if (DEBUG)
            window.s2 = $scope;

        $scope.loadingInfo = true;
        financeService.getReceiptDetails($scope.receipt.ReceiptID).then(function (response) {
            $scope.payments = response.data.Payments;
            $scope.commissions = response.data.Commissions;

            $scope.totalAmount = 0;
            angular.forEach($scope.payments, function (p) {
                $scope.totalAmount += p.Amount || 0;
            });

            $scope.totalCommissionAmount = 0;
            angular.forEach($scope.commissions, function (p) {
                $scope.totalCommissionAmount += p.Amount || 0;
            });
        }).finally(function () {
            $scope.loadingInfo = false;
        });

        $scope.showCommissions = function () {
            return user.isAdmin || user.isProducer || user.isFinance;
        }
    }]);
}();
