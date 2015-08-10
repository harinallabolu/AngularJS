!function () {
    var app = angular.module('eCity')

    .controller('NewEntityController', ['$scope', 'entityService', 'user', 'filterFilter', 'Entity', 'Address', '$timeout', 'box', function ($scope, entityService, user, filterFilter, Entity, Address, $timeout, box) {
        $scope.entity = angular.extend(new Entity(), {
            Contacts: [],
            Addresses: [],
            Relations: [],
            BasicInfo: {
                "EntityType": 1,
                "Birthname": 358,
                "Nationality": 2
            }
        });

        if (DEBUG)
            window.s = $scope;

        $scope.relationGroups = [];
        $scope.birthnames = [];
        $scope.doys = [];
        $scope.contactUses = [];
        $scope.contactTypes = [];
        $scope.producers = [];
        $scope.relations = [];
        $scope.entityCreated = false;
        $scope.validators = [step1Validate, step2Validate, validateContacts, validateAddresses];

        function step1Validate() {
            var valid = true;

            valid = validateElem('relation') && valid;
            valid = validateElem('companytype') && valid;
            valid = validateElem('dob') && valid;
            valid = validateElem('doy') && valid;
            valid = validateElem('afm') && valid;
            valid = validateElem('producer') && valid;

            return valid;
        }

        function step2Validate() {
            var valid = true;

            valid = validateElem('firstname') && valid;
            valid = validateElem('lastname') && valid;
            valid = validateElem('middlename') && valid;
            valid = validateElem('birthname') && valid;
            valid = validateElem('gender') && valid;
            valid = validateElem('company') && valid;

            angular.forEach($scope.entity.Relations, function (rel) {
                valid = validateElem(rel.inputName) && valid;
            });

            return valid;
        }

        function validateElem(name) {
            var elem = $scope.entityform[name];
            if (elem.$valid)
                return true;

            elem.$pristine = false;
            elem.firstTimer = false;
            elem.$dirty = true;

            return false;
        }

        if (user.isProducerOnly) {
            $scope.relationTypeChanged = function () {
                if ($scope.entity.RelationType === 11 || $scope.entity.RelationType === 47)
                    $scope.entity.BasicInfo.Producer = user.entityId;
                else
                    $scope.entity.BasicInfo.Producer = null;
            };
        } else {
            $scope.relationTypeChanged = function () {
            };
        }

        $scope.currentContact = {
            Value: null,
            IsDefault: true,
            Use: "0"
        };

        $scope.age = function () {
            if ($scope.entity.BasicInfo.DOB) {
                //var dateParts = $scope.entity.DOB.split("/");
                //var d = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);

                var today = new Date();

                //var diff = new Date(today.getTime() - d.getTime());
                var diff = new Date(today.getTime() - $scope.entity.BasicInfo.DOB.getTime());
                return diff.getUTCFullYear() - 1970;
            }
        }

        function uniqueIdsGen() {
            var i = 0;

            return function () {
                return i++;
            };
        }

        var uniqueIds = uniqueIdsGen();

        $scope.newRelation = function () {
            var r = angular.copy($scope.currentRelation);
            r.IsParent = true;
            r.inputName = 'entityrelationship' + uniqueIds();
            //$scope.relations.push(angular.copy($scope.relations[currentRelation]));
            $scope.entity.Relations.push(r);
            $scope.currentRelation = null;
        };

        $scope.swapRelation = function (rel) {
            rel.IsParent = !rel.IsParent;
        };

        entityService.getAllEntities().then(function (data) {
            $scope.entities = data;
        });
        entityService.getRelationTypes().success(function (data) {
            $scope.relationGroups = data;
        });
        entityService.getRelations().success(function (data) {
            $scope.relations = data;
        });
        entityService.getBirthnames().success(function (data) {
            $scope.birthnames = data;
        });
        entityService.getDoys().success(function (data) {
            $scope.doys = data;
        });
        entityService.getNationalities().success(function (data) {
            $scope.nationalities = data;
        });
        entityService.getContactUses().success(function (data) {
            $scope.contactUses = data;
        });
        entityService.getContactTypes().success(function (data) {
            $scope.contactTypes = data;
        });
        if (user.isProducerOnly === false)
            entityService.getProducers().success(function (data) {
                $scope.producers = data;
            });

        $scope.isPhone = function () {
            return $scope.currentContact.Type === "HomePhone" ||
                    $scope.currentContact.Type === "WorkPhone" ||
                    $scope.currentContact.Type === "Mobile";
        };

        $scope.isVariousContact = function () {
            return $scope.currentContact.Type && $scope.isPhone() === false && $scope.currentContact.Type !== 'Email';
        };

        $scope.isProducerInfoRequired = function () {
            return $scope.entity.isCustomer() && user.isProducerOnly === false;
        };

        $scope.onSelectReference = function ($item, $model, $label) {
            $scope.entity.BasicInfo.Reference = $model.EntityID;
        }

        $scope.entityFormatInput = function ($model) {
            if (!$model)
                return;

            return $model.searchName();
        };

        $scope.addressStep = false;
        $scope.$watch('activeStep', function (newValue) {
            $timeout(function () {
                $scope.addressStep = newValue === 4;
            }, 100);
        });

        //$scope.checkIfExists = function () {
        //    var afm = entity.TaxID;
        //    if (afm.)

        //};

        //$scope.showTaxInfo = function () {
        //    var isProspectiveCustomer = $scope.entity.RelationType == "47";

        //    if (($scope.entity.EntityType === 'Individual' && isOver18($scope.entity.DOB) === false) || isProspectiveCustomer === true)
        //        return false;

        //    return true;

        //    function isOver18(date) {
        //        var currentDate = new Date();
        //        currentDate.setFullYear(currentDate.getFullYear() - 18);

        //        return date >= currentDate;
        //    }
        //}

        $scope.saveContact = function () {
            if ($scope.entityform['email'] && $scope.entityform['email'].$invalid) {
                box.error('The email is invalid');
                return;
            }
            else if ($scope.editContact) {
                if (!$scope.editContact.Value) {
                    box.error('The email is invalid');
                    return;
                }
                // If it reaches this the edit was successfull
            }
            else if (!$scope.currentContact.Type || !$scope.currentContact.Value)
                return;

            else
                // New contact
                $scope.entity.Contacts.push($scope.currentContact);


            //if ($scope.currentContact.IsDefault === true && hasDefaultContact($scope.currentContact.Type, $scope.currentContact.Use))
            //    $scope.currentContact.IsDefault = false;

            //if ($scope.editContact)
            //{
            //    if (!$scope.editContact.Value)
            //    {
            //        alert('Either enter a valid value for the contact or delete it.')
            //    }
            //}
            //else


            $scope.currentContact = {
                Value: null,
                IsDefault: true,
                Use: "0"
            };
            $scope.editContact = null;
        }

        //$scope.remove = function (array, index) {
        //    array.splice(index, 1);
        //};

        function validateContacts() {
            var hasPrimary = false;
            var useGroupsDefaults = {};

            $scope.contactsError = null;
            angular.forEach($scope.entity.Contacts, function (contact) {
                if (contact.Type === "Email" || contact.Type === "Mobile")
                    hasPrimary = true;

                useGroupsDefaults[contact.Use + ' ' + contact.Type] = useGroupsDefaults[contact.Use + ' ' + contact.Type] || 0;
                if (contact.IsDefault)
                    useGroupsDefaults[contact.Use + ' ' + contact.Type] += 1;
            });

            for (var u in useGroupsDefaults)
                if (useGroupsDefaults[u] !== 1) {
                    var arr = u.split(' ');

                    $scope.contactsError = 'Group "' + $scope.getContactUseByID(arr[0]) + '" must have exactly one main ' + arr[1] + ' contact.';
                    return false;
                }

            if (!hasPrimary)
                $scope.contactsError = 'A main email or a main mobile is required.';

            return hasPrimary;
        };


        $scope.removeContact = function () {
            $scope.entity.Contacts.splice($scope.editContact, 1);
            $scope.editContact = null;
            $scope.currentContact = {
                Value: null,
                IsDefault: true,
                Use: "0"
            };
        };

        $scope.getContactUseByID = function (id) {
            return filterFilter($scope.contactUses, { 'ID': id })[0].Description;
        };

        $scope.removeContact2 = function (index) {
            $scope.entity.Contacts.splice(index, 1);
        };

        $scope.editContact2 = function (index) {
            $scope.currentContact = $scope.entity.Contacts[index];
            $scope.editContact = $scope.entity.Contacts[index]
        };

        $scope.entityTypeChanged = function () {
            $scope.entity.BasicInfo.Firstname = null;
            $scope.entity.BasicInfo.Lastname = null;
        }

        //$scope.$watchCollection('[entity.BasicInfo.EntityType, entity.BasicInfo.Firstname, entity.BasicInfo.Lastname]', function (newValues, oldValues) {
        //    //$scope.address.Doorbell = $scope.entity.getFullname();
        //});

        $scope.entityRelationSelected = function ($item, $model, $label, $index) {
            $scope.entity.Relations[$index].EntityID = $item.EntityID;
        };

        $scope.copyLegal = function () {
            $scope.entity.BasicInfo.Firstname = $scope.entity.BasicInfo.Lastname;
        };

        function validateAddresses() {
            var hasMailing = false;
            var hasBilling = false;
            var hasCollection = false;

            angular.forEach($scope.entity.Addresses, function (address) {
                hasMailing = hasMailing || address.IsMailing;
                hasBilling = hasBilling || address.IsBilling;
                hasCollection = hasCollection || address.IsCollection;
            });

            if (hasMailing && hasBilling && hasCollection)
                return true;

            box.error("Please add at least one address and make sure you have specified a Billing, a Mailing and a Collection address.");
            return false;
        }

        $scope.submitEntity = function () {
            $scope.submitting = true;

            entityService.createEntity($scope.entity).then(function () {
                $scope.entityCreated = true;
                box.success("The entity was created successfully!!!<br/>Press the Policy button if you want to create a new policy.<p class='text-align-right'><a href='#app/policies/newpolicy' class='btn btn-primary btn-sm'>Policy</a></p>");
            }, function (data) {
                box.error("There was an error processing your request. " + (data.Message || ''));
            }).finally(function () {
                $scope.submitting = false;
            });
        };

        $scope.$watch('editContact', function (newVal) {
            if (newVal)
                $scope.currentContact = newVal;
        });

        function hasDefaultContact(type, use) {
            return $scope.entity.Contacts.some(function (element, index, array) {
                return element.Type === type && element.IsDefault === true && element.Use === use;
            });
        }

        $scope.isTaxInfoRequired = function () {
            if ($scope.entity.RelationType === 47)
                return false;

            if ($scope.entity.isCompany()) {
                return $scope.entity.BasicInfo.CompanyType !== 'International';
            }

            if ($scope.entity.isIndividual()) {
                if ($scope.entity.BasicInfo.DOB) {
                    //var dateParts = $scope.entity.DOB.split("/");
                    return isOver18($scope.entity.BasicInfo.DOB);
                }
            }

            return true;

            function isOver18(date) {
                var today = new Date();
                var _18yearsAgo = today.setFullYear(today.getFullYear() - 18);

                return date <= _18yearsAgo;
            }
        };

        $scope.isDobRequired = function () {
            return $scope.entity.isIndividual() && ($scope.entity.RelationType === 11 || $scope.entity.RelationType === 47);
        }
    }]);

    function validateAfmSyntax(afm) {
        if (new RegExp(/^[0-9]{9}$/).test(afm) == false)
            return false;

        var a = afm.split('').map(function (item) {
            return parseInt(item);
        });

        var s = 256 * a[0] + 128 * a[1] + 64 * a[2] + 32 * a[3] + 16 * a[4] + 8 * a[5] + 4 * a[6] + 2 * a[7];
        var y = s % 11;

        if (y == a[8])
            return true;

        if (y == 10 && a[8] == 0)
            return true;

        return false;
    }


    app.directive('afm', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                var condition = attrs.afm;

                modelCtrl.$parsers.unshift(function (viewValue) {

                    if (condition)
                    {
                        var check = scope.$eval(condition);
                        if (!check)
                        {
                            modelCtrl.$setValidity('afm', true);
                            return viewValue;
                        }
                    }


                    if (typeof viewValue !== "string") {
                        modelCtrl.$setValidity('afm', true);
                        return viewValue;
                    }

                    if (viewValue.length === 0) {
                        modelCtrl.$setValidity('afm', true);
                        return viewValue;
                    }

                    modelCtrl.$setValidity('afm', validateAfmSyntax(viewValue));
                    return viewValue;
                });
            }
        };
    });

    app.directive('afmExists', ['entityService', function (entityService) {
        return {
            require: '?ngModel',
            link: function (scope, elm, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                modelCtrl.$parsers.unshift(function (viewValue) {

                    if (!viewValue) {
                        modelCtrl.$setValidity('afmExists', true);
                        return viewValue;
                    }

                    if (viewValue.length !== 9) {
                        modelCtrl.$setValidity('afmExists', true);
                        return viewValue;
                    }

                    modelCtrl.$setValidity('afmExists', false);
                    entityService.taxIdExists(viewValue).success(function (data) {
                        modelCtrl.$setValidity('afmExists', data === 'false');
                    }).error(function (data) {
                        modelCtrl.$setValidity('afmExists', true);
                    });

                    return viewValue;
                });
            }
        };
    }]);

    // Cobisi Validation
    app.directive('validEmail', ['entityService', function (entityService) {
        return {
            require: '?ngModel',
            priority: -1000,
            link: function (scope, element, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                function firstBlurOnly() {
                    scope.$apply(function () {
                        if (modelCtrl.$error.email) {
                            modelCtrl.$setValidity('validEmail', true);
                            return;
                        }
                        if (!modelCtrl.$viewValue) {
                            modelCtrl.$setValidity('validEmail', true);
                            return;
                        }

                        modelCtrl.$setValidity('validEmail', false);
                        // This makes this directive nonreusable.
                        scope.currentContact.validating = true;
                        entityService.emailVerify(modelCtrl.$viewValue).success(function (data) {
                            //if (data === '"ServerTemporaryUnavailable"') {
                            //    console.log('Email "' + modelCtrl.$viewValue + '" returned ServerTemporaryUnavailable error.');
                            //    modelCtrl.$setValidity('validEmail', true);
                            //    return;
                            //}

                            //modelCtrl.$setValidity('validEmail', data === '"Success"');
                            //scope.currentContact.cobisi = data;
                            var msg = JSON.parse(data);
                            if (msg === 'Success') {
                                modelCtrl.$setValidity('validEmail', true);
                                scope.currentContact.cobisi = "";
                                //scope.currentContact.cobisi = data;
                            }
                            else {
                                modelCtrl.$setValidity('validEmail', true);
                                scope.currentContact.cobisi = msg;
                            }
                        }).error(function (data) {
                            modelCtrl.$setValidity('validEmail', true);
                        }).finally(function () {
                            scope.currentContact.validating = false;
                        });
                    });
                }

                $(element).on('blur', firstBlurOnly);

                //element.removeAttr("valid-email");
                //$compile(element)(scope);
                //ng-pattern="/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/"
                //modelCtrl.$parsers.push(function (viewValue222) {
                //    if (modelCtrl.$error.email)
                //    {
                //        modelCtrl.$setValidity('validEmail', true);
                //        return viewValue222;
                //    }
                //    if (!viewValue222) {
                //        modelCtrl.$setValidity('validEmail', true);
                //        return viewValue222;
                //    }

                //    modelCtrl.$setValidity('validEmail', false);

                //    //if (viewValue === "a@b.gr")
                //    //    modelCtrl.$setValidity('validEmail', true);


                //    //if (viewValue.length !== 9) {
                //    //    modelCtrl.$setValidity('afmExists', true);
                //    //    return viewValue;
                //    //}

                //    //modelCtrl.$setValidity('afmExists', false);
                //    entityService.emailVerify(viewValue222).success(function (data) {
                //        alert(data);
                //        modelCtrl.$setValidity('validEmail', false);
                //    }).error(function (data) {
                //        modelCtrl.$setValidity('validEmail', true);
                //    });

                //    return viewValue222;
                //});
            }
        };
    }]);

    app.directive('lessThanToday', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                modelCtrl.$parsers.unshift(function (viewValue) {

                    if (!viewValue) {
                        modelCtrl.$setValidity('lessthantoday', true);
                        return;
                    }

                    var dateParts = viewValue.split("/");
                    var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
                    if (isNaN(date)) {
                        modelCtrl.$setValidity('lessthantoday', false);
                        return viewValue;
                    }

                    date.convertLocalDateToUTC();
                    var today = new Date();
                    if (date > today || date < today.setFullYear(today.getFullYear() - 90)) {
                        modelCtrl.$setValidity('lessthantoday', false);
                        return viewValue;
                    }

                    modelCtrl.$setValidity('lessthantoday', true);
                    return viewValue;
                });
            }
        };
    });

    app.directive('myPhoneContact', function () {
        return {
            restrict: 'E',
            scope: true,
            replace: true,
            templateUrl: 'phonecontact.html',
            link: function link(scope, element, attrs) {
                $(element).find('input').mask('+309999999999');

            }
        };
    });

}();