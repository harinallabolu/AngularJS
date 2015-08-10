!function () {
    var eCity = angular.module('eCity');

    // TODO: create a directive for entity search
    eCity.controller('NewPolicyController', ['$scope', 'filterFilter', '$modal', 'policyService', 'limitToFilter', 'entityService', 'box',
        function ($scope, filterFilter, $modal, policyService, limitToFilter, entityService, box) {
            //$scope.testdate = function () {
            //    policyService.postdate($scope.mydate).success(function (data) {
            //        var d = JSON.parse(data);
            //        console.log(d);
            //        $scope.mydate2 = new Date(d);
            //    });
            //}

            //$scope.mydate = null;
            //if (DEBUG)
            //    window.s = $scope;

            $scope.policy = {
                Group: 0,
                Currency: 'EUR',
                Transfer: false,
                Commission: false
                //Objects: []
            };
            $scope.companies = [];
            $scope.producers = [];
            $scope.providers = [];
            $scope.policyGroups = [];
            $scope.slobs = [];
            $scope.financeCodes = [];
            $scope.filteredFinanceCodes = [];
            $scope.meansOfPayment = [];
            $scope.paymentFrequences = [];
            $scope.covers = [];
            $scope.coverTypes = [];
            $scope.entities = [];
            $scope.objects = [];
            $scope.objectTypes = [];
            $scope.everythingObjType = {
                ObjectTypeID: 0,
                Description: 'No Object'
            };
            $scope.policyCreated = false;
            $scope.validators = [step1Validate, step2Validate];
            //$scope.validators = [null, step2Validate];
            $scope.objType = $scope.everythingObjType;
            $scope.today = new Date();

            entityService.getAllEntities().then(function (data) {
                $scope.entities = data;
            });
            policyService.getCompanies().success(function (data) {
                $scope.companies = data;
            });
            policyService.getProducers().success(function (data) {
                $scope.producers = data;
            });
            policyService.getGroups().success(function (data) {
                $scope.policyGroups = data;
            });
            policyService.getProviders().success(function (data) {
                $scope.providers = data;
            });
            policyService.getCollectionTypes().success(function (data) {
                $scope.meansOfPayment = data;
            });
            policyService.getPaymentFrequences().success(function (data) {
                $scope.paymentFrequences = data;
            });
            policyService.getObjectTypes().success(function (data) {
                $scope.objectTypes = data;
            });
            policyService.getSlobs().success(function (data) {
                $scope.slobs = data.groupBy('SlobID', function (slob) {
                    return {
                        SlobID: slob.SlobID,
                        Provider: slob.Provider,
                        SlobDescription: slob.SlobDescription
                    };
                });

                $scope.financeCodes = data;
            });

            function validatePolicyInfo() {
                if ($scope.policy.InitialStartDate > $scope.policy.StartDate)
                    return "The policy's initial start date cannot be greater than the start date.";
                if ($scope.policy.StartDate >= $scope.policy.EndDate)
                    return "The policy's start date cannot be greater than the end date.";
            }

            $scope.getObject = function (val) {
                return policyService.getObject(val, $scope.objType.ObjectTypeID)
                    .then(function (res) {
                        var objects = [];
                        res.data = limitToFilter(res.data, 10);
                        angular.forEach(res.data, function (item) {
                            objects.push(item);
                        });
                        return objects;
                    });
            };

            $scope.removeObject = function (index, event) {
                //            $event.preventDefault();
                event.stopPropagation();
                $scope.objects.splice(index, 1);
            }

            $scope.addObject = function () {
                //$scope.objType = { "ObjectTypeID": 31, "Description": "Person", "SlobID": 664 };
                //$scope.objType = {"ObjectTypeID":32,"Description":"Έργο","SlobID":314};
                //$scope.objType = { "ObjectTypeID": 1, "Description": "Car", "SlobID": 155 };

                if ($scope.object) {
                    //$scope.policy.Object.Covers = [];
                    //var c = { SlobID: 2332, Description: 'fsdf', TypeDescription: 'fsadf', CoverID: 2323 };
                    //$scope.policy.Object.Covers.push(c);

                    if (filterFilter($scope.objects, { 'ID': $scope.object.ID }).length) {
                        box.info("The object has already been added.");
                        return;
                    }

                    $scope.objects.push($scope.object);
                    return;
                }

                if ($scope.objType.ObjectTypeID === 0)
                    return;

                if ($scope.objType.ObjectTypeID === 31 && $scope.objType.Description === 'Person') {
                    entityModal();
                    return;
                }

                $modal.open({
                    templateUrl: 'newobjectmodal1.html',
                    controller: ['$scope', 'objectType', 'policyId', function ($scope, objectType, policyId) {
                        $scope.objectType = objectType;
                        $scope.policyId = policyId;
                    }],
                    size: 'lg',
                    resolve: {
                        'objectType': function () {
                            return $scope.objType;
                        },
                        'policyId': function () {
                            return null;
                        }
                    }
                }).result.then(function () {
                    box.success("The object has been created, you can now locate it using the Search field and add covers!!!");
                });
            };

            $scope.onSelect = function ($item, $model, $label) {

                //            console.log('ok');
            }

            $scope.formatInput = function ($model) {
                if (!$model)
                    return null;

                //angular.forEach($scope.Customer, function (Customer) {
                //    if ($model === Customer.id) {
                //        inputLabel = Customer.CustomerID + "-" + Customer.CustomerName;
                //    }
                //});
                return $model.Description.trim();
            }

            $scope.entityFormatInput = function ($model) {
                if (!$model)
                    return;

                return $model.searchName();
            };

            $scope.onSelectHolder = function ($item, $model, $label) {
                $scope.policy.Holder = $model.EntityID;
            }

            $scope.$watch('policy.Provider', function () {
                $scope.policy.SLOB = null;
            });

            $scope.$watch('policy.SLOB', function (newSlob) {
                $scope.policy.Finance = null;
                $scope.objects = [];
                $scope.objType = $scope.everythingObjType;
                $scope.object = null;
                $scope.covers = [];
                $scope.coverTypes = [];

                if (!newSlob)
                    return;

                policyService.getCovers(newSlob, function (data) {
                    $scope.coverTypes = data.groupBy('TypeDescription', function (cover) {
                        return cover.TypeDescription;
                    });
                    $scope.covers = data;
                });

                $scope.filteredFinanceCodes = filterFilter($scope.financeCodes, { SlobID: $scope.policy.SLOB });
                if ($scope.filteredFinanceCodes.length > 0)
                    $scope.policy.Finance = $scope.filteredFinanceCodes[0].LogID;

                selectFirstObjectType();
            });

            $scope.$watchCollection('[currentFrequency, policy.StartDate]', function (newValues, oldValues) {
                var currentFrequency = newValues[0];
                var startDate = newValues[1];

                $scope.policy.Frequency = currentFrequency ? currentFrequency.PolicyPaymentFreqID : null;

                if (currentFrequency && startDate)
                    updateEndDate(currentFrequency, startDate);
                else
                    $scope.policy.EndDate = null;
            });

            $scope.$watch('policy.StartDate', function (newValue, oldValue) {
                if (!newValue)
                    return;

                if ($scope.policy.InitialStartDate)
                    $scope.open();
                else
                    $scope.policy.InitialStartDate = newValue;
            });

            $scope.isNotRenewable = function () {
                return $scope.policy.Frequency !== 9;
            };

            function validateObjects() {
                var hasOneObject = false;
                var objectWithoutCovers = null;
                var objectWithoutAmount = null;

                angular.forEach($scope.objects, function (obj, objIndex) {
                    hasOneObject = true;
                    var hasCovers = false;
                    if (!obj.ObjectAmount && obj.ObjectAmount != 0) objectWithoutAmount = obj.Description;

                    angular.forEach(obj.Covers, function (cov, covIndex) {
                        hasCovers = true;
                        //$scope.policy.Objects.push({
                        //    'ObjectID': obj.ID,
                        //    'ObjectAmount': obj.ObjectAmount,
                        //    'CoverID': cov.CoverID,
                        //    'CoverAmount': cov.CoverAmount,
                        //    'DeductibleID': cov.Deductible
                        //})
                    });
                    if (!hasCovers)
                        objectWithoutCovers = obj.Description;
                });

                if (!hasOneObject)
                    return 'At least one object per policy is required.'
                if (objectWithoutCovers)
                    return 'Please add some covers to object ' + objectWithoutCovers + ' or remove it completely.';
                if (objectWithoutAmount)
                    return 'Please add an amount to ' + objectWithoutAmount + '.';
            };

            $scope.setCoverAmounts = function (obj) {
                angular.forEach(obj.Covers, function (c) {
                    if (c.Amounts.length === 0)
                        c.CoverAmount = obj.ObjectAmount;
                });
            }

            $scope.open = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'updateInitialStartDateModal.html',
                    controller: 'UpdateInitialStartDateCtrl',
                    size: 'sm',
                    resolve: {
                        startDate: function () {
                            return $scope.policy.StartDate;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    $scope.policy.InitialStartDate = $scope.policy.StartDate;
                });
            };

            $scope.removeCover = function (object, index) {
                object.Covers.splice(index, 1);
            };

            $scope.newPolicy = function () {

                $scope.submittingPolicy = true;

                $scope.policy.Objects = [];
                angular.forEach($scope.objects, function (obj, objIndex) {
                    angular.forEach(obj.Covers, function (cov, covIndex) {

                        $scope.policy.Objects.push({
                            'ObjectID': obj.ID,
                            'ObjectAmount': obj.ObjectAmount,
                            'CoverID': cov.CoverID,
                            'CoverAmount': cov.CoverAmount,
                            'DeductibleID': cov.Deductible
                        });
                    });
                });

                policyService.postPolicy($scope.policy).success(function (data) {
                    $scope.policyCreated = true;

                    box.success("The policy was created successfully!!!");

                    if (data.Description)
                        box.attention(data.Description);
                }).error(function (data) {
                    box.error("There was an error processing your request. " + (data.Message || ''));
                }).finally(function (data) {
                    $scope.submittingPolicy = false;
                });
            };

            $scope.selectObjectType = function (objectTypeID) {
                if (objectTypeID < 0)
                    $scope.objType = $scope.everythingObjType;
                else {
                    $scope.objType = filterFilter($scope.objectTypes, { SlobID: $scope.policy.SLOB, ObjectTypeID: objectTypeID })[0];
                }
                //$scope.objType = filterFilter($scope.objectTypes, { SlobID: $scope.policy.SLOB, ObjectTypeID: objectTypeID })[0];
            };

            function selectFirstObjectType() {
                var types = filterFilter($scope.objectTypes, { SlobID: $scope.policy.SLOB });
                if (types.length > 0)
                    $scope.objType = types[0];
            }

            $scope.isObjectType = function (id) {
                return $scope.objType.ObjectTypeID === id;
            };


            function updateEndDate(currentFrequency, start) {
                var months = currentFrequency.Months;

                if (months === 0) {
                    $scope.policy.EndDate = null;
                    return;
                }

                var years = Math.floor(months / 12);
                if (years === 0) years = 1;

                $scope.policy.EndDate = new Date(start.getTime());
                $scope.policy.EndDate.setFullYear(start.getFullYear() + years);
            }

            function entityModal() {
                var modalInstance = $modal.open({
                    templateUrl: '/views/app/policies/objects/entityobjectmodal.html',
                    controller: 'searchEntityController',
                    size: 'md'
                });
            }

            function step1Validate() {
                var valid = true;

                valid = validateElem('holder') && valid;
                valid = validateElem('applicationid') && valid;
                valid = validateElem('company') && valid;
                valid = validateElem('producer') && valid;
                valid = validateElem('provider') && valid;
                valid = validateElem('slob') && valid;
                valid = validateElem('finance') && valid;
                valid = validateElem('paymentmeans') && valid;
                valid = validateElem('frequency') && valid;
                valid = validateElem('startdate') && valid;
                valid = validateElem('initialstartdate') && valid;
                valid = validateElem('enddate') && valid;

                if (!valid)
                    return false;

                var error = validatePolicyInfo();
                if (error) {
                    valid = false;
                    box.error(error);
                }

                return valid;
            }

            function step2Validate() {
                var valid = true;

                if ($scope.policyform.$invalid) {
                    valid = false;

                    validateElem('agreedpremium');

                    angular.forEach($scope.objects, function (obj) {
                        validateElem('object' + obj.ID)
                    });
                }

                error = validateObjects();
                if (error) {
                    valid = false;
                    box.error(error);
                }

                return valid;
            }

            function validateElem(name) {
                var elem = $scope.policyform[name];
                if (elem.$valid)
                    return true;

                elem.$pristine = false;
                elem.firstTimer = false;
                elem.$dirty = true;

                return false;
            }
        }])

    .controller('searchEntityController', ['$scope', 'entityService', 'policyService', 'box', function ($scope, entityService, policyService, box) {
            entityService.getAllEntities().then(function (data) {
                $scope.entities = data;
            });

            $scope.entityFormatInput = function ($model) {
                if (!$model)
                    return;

                return $model.searchName();
            };

            $scope.onselect = function ($item, $model, $label) {
                $scope.person = $model;
            }

            $scope.addPersonObject = function (entityobjectform) {
                policyService.postEntityObject($scope.person.EntityID).success(function (data) {
                    box.success("The entity has been added as an object, you can now search for it in the Search field and add covers!!!");
                }).error(function (data, status, headers, config) {
                    box.error("There was an error processing your request. " + data.Message);
                });
            }
        }]);

    eCity.controller('UpdateInitialStartDateCtrl', ['$scope', '$modalInstance', 'startDate', function ($scope, $modalInstance, startDate) {
        $scope.startDate = startDate;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    eCity.directive('mydraggable', function () {
        return {
            restrict: 'A',
            scope: {
                cover: '='
            },
            link: function link(scope, element, attrs) {
                $(element).css('cursor', 'move');
                $(element).hover(
                    function () {
                        $(this).stop().css({ "background-color": "cadetblue" });
                    },
                    function () {
                        $(this).stop().css({ "background-color": "" });
                    });

                $(element).draggable({
                    zIndex: 999,
                    revert: true, // will cause the event to go back to its
                    revertDuration: 0 //  original position after the drag
                });

                element.data('coverObject', scope.cover);

                //console.log(JSON.stringify(scope.cover));
            }
        }
    });

    eCity.directive('mydroppable', function () {
        return {
            restrict: 'A',
            //transclude: true,
            //scope: {
            //    object: '='
            //},
            link: function link(scope, element, attrs) {
                $(element).droppable({
                    //                   activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover",
                    //                    accept: ":not(.ui-sortable-helper)",
                    drop: function (event, ui) {
                        var cover = ui.draggable.data('coverObject');

                        // we need to copy it, so that multiple events don't have a reference to the same object
                        var copiedCover = $.extend({}, cover);

                        //scope.object.Covers = scope.object.Covers || [];
                        //scope.object.Covers.push(cover);

                        var s = $(this).children('.panel-heading').scope();
                        s.$apply(function () {
                            s.isOpen = true;
                        });

                        scope.$apply(function () {
                            scope.obj.Covers = scope.obj.Covers || [];

                            ////if (scope.obj.Covers.indexOf(copiedCover) > -1)
                            ////    return;

                            for (var i = 0, len = scope.obj.Covers.length; i < len; i++)
                                if (scope.obj.Covers[i].CoverID === copiedCover.CoverID)
                                    return;

                            if (copiedCover.Amounts && copiedCover.Amounts.length > 0)
                                copiedCover.CoverAmount = copiedCover.Amounts[0];
                            else
                                copiedCover.CoverAmount = scope.obj.ObjectAmount;

                            if (copiedCover.Deductibles && copiedCover.Deductibles.length > 0)
                                copiedCover.Deductible = copiedCover.Deductibles[0].DeductibleID;
                            else
                                copiedCover.Deductible = 0;
                            scope.obj.Covers.push(copiedCover);
                        });

                        //$(this).find(".placeholder").remove();
                        //$("<li></li>").text(ui.draggable.text()).appendTo(this);
                        //$(this).find('tbody').append(' <tr><td>Rasdfdf</td><td>asdf 2</td><td>Rowfds 3</td> <td>Row 4</td> </tr>');
                    }
                })
            }
        }
    });


    eCity.directive('mycollapsible', function () {
        return {
            link: function link(scope, element, attrs) {
                $(element).addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
                $(element).find('li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
                //$('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
                $(element).find('span').on('click', function (e) {
                    var children = $(this).parent('li.parent_li').find(' > ul > li');
                    if (children.is(":visible")) {
                        children.hide('fast');
                        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
                    } else {
                        children.show('fast');
                        $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
                    }
                    e.stopPropagation();
                });


                //$('.tree li.parent_li > span').on('click', function (e) {
                //    var children = $(this).parent('li.parent_li').find(' > ul > li');
                //    if (children.is(":visible")) {
                //        children.hide('fast');
                //        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
                //    } else {
                //        children.show('fast');
                //        $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
                //    }
                //    e.stopPropagation();
                //});
            }
        }
    });

    eCity.directive('signaturePad', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {

                myLoadScript("js/plugin/signature_pad/signature_pad.min.js", function () {
                    var canvas = element[0];
                    var signaturePad = new SignaturePad(canvas);

                    clearButton = document.querySelector("[data-action=clear]");

                    // FIXME: unregister those events
                    window.onresize = resizeCanvas;
                    resizeCanvas();

                    clearButton.addEventListener("click", function (event) {
                        signaturePad.clear();
                        scope.$apply(function () {
                            scope.policy.Signature = null;
                        });
                    });

                    signaturePad.onEnd = function () {
                        scope.$apply(function () {
                            scope.policy.Signature = signaturePad.toDataURL();
                        });
                    };

                    function resizeCanvas() {
                        var ratio = window.devicePixelRatio || 1;
                        canvas.width = canvas.offsetWidth * ratio;
                        canvas.height = canvas.offsetHeight * ratio;
                        canvas.getContext("2d").scale(ratio, ratio);
                    }
                });
            }
        };
    });
}();