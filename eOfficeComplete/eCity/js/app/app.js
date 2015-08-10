!function () {
    var app = angular.module('eCity', ['ngRoute', 'ui.bootstrap', 'ui.select2', 'angularFileUpload', 'google-maps']);

    app.factory('sessionInjector', ['user', function (user) {
        var sessionInjector = {
            request: function (config) {
                //if (user.entityId) {
                //    config.headers['EntityID'] = user.entityId;
                //}
                if (user.authToken) {
                    config.headers['Authorization'] = 'Basic ' + user.authToken;
                }
                return config;
            }
        };
        return sessionInjector;
    }]);


    function convertDateStringsToDates(input) {
        var regexIso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(([+-]\d{2}:\d{2})|Z)?$/;

        // Ignore things that aren't objects.
        if (typeof input !== "object") return input;

        for (var key in input) {
            if (!input.hasOwnProperty(key)) continue;

            var value = input[key];
            var match;
            // Check for string properties which look like dates.
            if (typeof value === "string" && (match = value.match(regexIso8601))) {
                var milliseconds = Date.parse(match[0])
                if (!isNaN(milliseconds)) {
                    input[key] = new Date(milliseconds);
                }
            } else if (typeof value === "object") {
                // Recurse into object
                convertDateStringsToDates(value);
            }
        }
    }

    app.config(['$routeProvider', '$httpProvider', 'accessLevels', function ($routeProvider, $httpProvider, accessLevels) {
        //$httpProvider.defaults.headers.common["Authorization-Token"] = accessToken;
        $httpProvider.interceptors.push('sessionInjector');

        $httpProvider.defaults.transformResponse.push(function (responseData) {
            convertDateStringsToDates(responseData);
            return responseData;
        });

        $routeProvider
		.when('/dashboard', {
		    templateUrl: 'views/dashboard.html',
		    controller: 'DashboardController',
		    access: accessLevels.logged
		})
        .when('/app/administration/configurations', {
            templateUrl: 'views/app/administration/configurations.html',
            controller: 'ConfigurationsController',
            access: accessLevels.admin
        })
        .when('/app/policies/newpolicy', {
            templateUrl: 'views/app/policies/newpolicy.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        })
        .when('/app/policies/viewpolicy/:entityId', {
            templateUrl: 'views/app/policies/viewpolicy.html',
            controller: 'ViewPoliciesController',
            access: accessLevels.logged
        })
        .when('/app/policies/viewpolicy', {
            templateUrl: 'views/app/policies/viewpolicy.html',
            controller: 'ViewPoliciesController',
            access: accessLevels.logged
        })
        .when('/app/policies/motor', {
            templateUrl: 'views/app/policies/motor/motor.html',
            controller: 'MotorController',
            access: accessLevels.logged
        })
        .when('/app/entities/new', {
            templateUrl: 'views/app/entities/newentity.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        })
        .when('/app/helparea/bankaccounts', {
            templateUrl: 'views/app/helparea/bankaccounts.html',
            controller: 'BankAccountsController',
            access: accessLevels.logged
        })
        .when('/app/policies/editclaim/:policyId/:claimId?', {
            templateUrl: 'views/app/policies/claims/claim.html',
            controller: 'ClaimController',
            access: accessLevels.logged
        })
        .when('/app/helparea/helpphones', {
            templateUrl: 'views/app/helparea/helpphones.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        })
        .when('/app/backoffice/import', {
            templateUrl: 'views/app/backoffice/import.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        })
        //.when('/app/backoffice/configurations', {
        //    templateUrl: 'views/app/backoffice/configurations.html',
        //    controller: 'ConfigurationsController',
        //    access: accessLevels.logged
        //})
        .when('/app/finance/providerpayments', {
            templateUrl: 'views/app/finance/providerpayments.html',
            controller: 'providerPaymentsCtrl',
            access: accessLevels.logged
        })
        .when('/app/finance/clientpayments/:entityId', {
            templateUrl: 'views/app/finance/clientpayments.html',
            controller: 'ClientPaymentsController',
            access: accessLevels.logged
        })
        .when('/misc/error404', {
            templateUrl: 'views/misc/error404.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        })
        .when('/unauthorized', {
            templateUrl: 'unauthorized.html',
            controller: 'PageViewController',
            access: accessLevels.logged
        });
        //.otherwise({
        //    redirectTo: '/misc/error404'
        //});

    }]).run(['$rootScope', '$location', '$window', 'user', function ($rootScope, $location, $window, user) {

        // register listener to watch route changes
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.showNavigation = true;
            $rootScope.isAdmin = user.isAdmin;
            //if (user.isLogged == false) {
            //    console.log('User is not logged');
            //    // no logged user, we should be going to #login
            //    //if (next.templateUrl == "login.html") {
            //    //    // already going to #login, no redirect needed
            //    //} else {
            //    //    // not going to #login, we should redirect now
            //    //    //$location.path("/login");
            //    //    location = 'login.html?returl=' + next.templateUrl;
            //    //}

            //    //location = 'login.html';
            //}
            if (typeof next.access === "undefined") {

            }
            else if (!user.hasAuth(next.access)) {
                //$rootScope.showNavigation = false;
                if (user.isLogged)
                    $location.path('/unauthorized');
                else
                    $window.location.href = 'login.html'
            }
        });
    }]);

    //app.directive("swiperDirective", ["$rootScope", function ($rootScope) {
    //    return {
    //        restrict: "A",
    //        controller: function () {
    //            //this.ready = function () {
    //            //    console.log("ready");
    //            //    $rootScope.doReady();
    //            //}
    //            console.log("swiper controller");
    //        },
    //        link: function (scope, element, attrs) {
    //            //var id = element[0].id;

    //            //$(function () {
    //            scope.myswip = $(element).swiper({
    //                //Your options here:
    //                mode: 'horizontal',
    //                loop: true,
    //                tdFlow: {
    //                    rotate: 50,
    //                    stretch: 0,
    //                    depth: 100,
    //                    modifier: 1,
    //                    shadows: false
    //                }
    //                //etc..
    //                //});
    //            });
    //        }
    //    }
    //}]);

    //app.directive("swiperSlide", [function () {
    //    return {
    //        restrict: "A",
    //        require: "^swiperDirective",
    //        //template: "<div>hello {{data[$index].copy}}</div>",
    //        templateUrl: "policySlider.html",
    //        link: function (scope, element, attrs, ctrl) {
    //            console.log("slider link");
    //            scope.myswip.reInit();
    //            if (scope.$last) {
    //                console.log("i'm last");
    //                //ctrl.ready();
    //                scope.myswip.reInit();
    //                //scope.$apply(function () {


    //                //});
    //            }
    //        }
    //    }
    //}]);

    //app.run(['$rootScope', '$injector', function($rootScope, $injector) {
    //    $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
    //        if ($rootScope.oauth) headersGetter()['Authorization'] = "Bearer "+$rootScope.oauth.access_token;
    //        if (data) {
    //            return angular.toJson(data);
    //        }
    //    };
    //});

    app.directive("dynamicName", ['$compile', function ($compile) {
        return {
            restrict: "A",
            terminal: true,
            priority: 1000,
            link: function (scope, element, attrs) {
                element.attr('name', scope.$eval(attrs.dynamicName));
                element.removeAttr("dynamic-name");
                $compile(element)(scope);
            }
        };
    }]);

    app.directive("dynamicId", ['$compile', function ($compile) {
        return {
            restrict: "A",
            terminal: true,
            priority: 1001,
            link: function (scope, element, attrs) {
                element.attr('id', scope.$eval(attrs.dynamicId));
                element.removeAttr("dynamic-id");
                $compile(element)(scope);
            }
        };
    }]);

    // FIXME: this will not probably work with minification
    app.directive('capitalize', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                var capitalize = function (inputValue) {
                    if (!inputValue)
                        return inputValue;
                    var capitalized = inputValue.toUpperCase();
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
                modelCtrl.$parsers.unshift(capitalize);
                capitalize(scope[attrs.ngModel]);  // capitalize initial value
            }
        };
    });
      //.directive('myFullscreen', function () {
      //    return {
      //        restrict: 'A',
      //        link: function (scope, element, attrs) {
      //            var condition = attrs.myFullscreen;
      //            scope.$watch(condition, function (newValue) {
      //                //if (newValue === undefined)
      //                //    return;

      //                //alert('change');

      //                if (newValue)
      //                    goFullscreen();
      //                else
      //                    goNormal();
      //            });

      //            function goFullscreen() {
      //                var p = $(element).parent('.myfullscreen');
      //                if (p.length)
      //                    return;

      //                p = $(element).wrap('<div class="myfullscreen"></div>');

      //                $('body').addClass('nooverflow');
      //                //heightFullscreen();

      //            }

      //            function goNormal() {
      //                var p = $(element).parent('.myfullscreen');
      //                if (!p.length)
      //                    return;

      //                $('body').removeClass('nooverflow');
      //                $(element).unwrap();
      //            }

      //            function heightFullscreen() {
      //                //if ($('#jarviswidget-fullscreen-mode')
      //                //    .length) {

      //                /**
      //                 * Setting height variables.
      //                 **/
      //                var heightWindow = $(window)
      //                    .height();
      //                //var heightHeader = $('#jarviswidget-fullscreen-mode')
      //                //    .find(self.o.widgets)
      //                //    .children('header')
      //                //    .height();

      //                /**
      //                 * Setting the height to the right widget.
      //                 **/
      //                $('.myfullscreen')
      //                    //.find(self.o.widgets)
      //                    //.children('div')
      //                //.height(heightWindow - heightHeader - 15);
      //                .height(heightWindow);
      //                // }
      //            }
      //        }
      //    };
      //});

    app.directive('firstTimer', function () {
        return {
            restrict: "A",
            require: '?ngModel',
            scope: false,
            link: function (scope, element, attr, modelCtrl) {
                if (!modelCtrl) {
                    return;
                }

                modelCtrl.firstTimer = true;

                function firstBlurOnly() {
                    scope.$apply(function () {
                        modelCtrl.firstTimer = false;
                    });
                    $(element).off('blur', firstBlurOnly);
                }

                $(element).on('blur', firstBlurOnly);
            }
        };
    })

    //app.directive('myvalidDate', function () {
    //    return {
    //        require: '?ngModel',
    //        link: function (scope, elm, attrs, modelCtrl) {
    //            if (!modelCtrl)
    //                return;

    //            modelCtrl.$parsers.unshift(function (viewValue) {

    //                if (!viewValue) {
    //                    modelCtrl.$setValidity('myvaliddate', true);
    //                    return;
    //                }

    //                var dateParts = viewValue.split("/");
    //                var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
    //                if (isNaN(date)) {
    //                    modelCtrl.$setValidity('myvaliddate', false);
    //                    return viewValue;
    //                }


    //                modelCtrl.$setValidity('myvaliddate', true);
    //                return viewValue;
    //            });
    //        }
    //    };
    //})

    .directive("dateFormatter", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, elem, attrs, ngModelCtrl) {

                ngModelCtrl.$formatters.push(function (value) {
                    if (!value)
                        return null;

                    return $.datepicker.formatDate('dd/mm/yy', new Date(value));
                });

                //$(elem).on('blur', function () {
                //    if (!ngModelCtrl.$viewValue)
                //        return;
                //    ngModelCtrl.$modelValue = $.datepicker.parseDate('dd/mm/yy', ngModelCtrl.$viewValue).convertLocalDateToUTC();
                //});

                ngModelCtrl.$parsers.push(function (value) {
                    if (!value)
                        return null;

                    var d = undefined;

                    try {
                        d = $.datepicker.parseDate('dd/mm/yy', value).convertLocalDateToUTC();
                    } catch (err) {

                    };

                    return d;
                });
            }
        }
    })

    .directive("jqueryDatepicker", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, elem, attrs, ngModelCtrl) {
                var updateModel = function (dateText) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(dateText);
                    });
                };
                //var options = {
                //    dateFormat: "dd/mm/yy",
                //    changeMonth: true,
                //    changeYear: true,
                //    onSelect: function (dateText) {
                //        updateModel(dateText);
                //    }
                //};

                var $this = elem;
                var dataDateFormat = $this.attr('data-dateformat') || 'dd.mm.yy';
                var dataDateChangeMonth = false;
                var dataDateChangeYear = false;
                if ($this.attr('data-datechangemonth'))
                    dataDateChangeMonth = Boolean($this.attr('data-datechangemonth'));
                if ($this.attr('data-datechangeyear'))
                    dataDateChangeYear = Boolean($this.attr('data-datechangeyear'));

                $this.datepicker({
                    dateFormat: dataDateFormat,
                    changeMonth: dataDateChangeMonth,
                    changeYear: dataDateChangeYear,
                    minDate: $this.attr('data-datemindate') || undefined,
                    maxDate: $this.attr('data-datemaxdate') || undefined,
                    yearRange: $this.attr('data-dateyearrange') || undefined,
                    showAnim: 'fadeIn',
                    prevText: '<i class="fa fa-chevron-left"></i>',
                    nextText: '<i class="fa fa-chevron-right"></i>',
                    onSelect: function (dateText) {
                        updateModel(dateText);
                    }
                });
            }
        }
    })

    .directive('fueluxWizard2', function () {
        return {
            restrict: 'A',
            scope: {
                'onWizFinish': '&',
                'wizardValidators': '=',
                'activeStep': '='
            },

            link: function link(scope, element, attrs, ctrl) {
                var validators = scope.wizardValidators;

                myLoadScript("js/plugin/fuelux/wizard/wizard.min.js", function () {
                    scope.activeStep = 1;

                    var wizard = $(element).wizard();

                    if (scope.onWizFinish) {
                        wizard.on('finished', function (e, data) {
                            scope.$apply(function () {
                                scope.onWizFinish();
                            });
                        });
                    }


                    wizard.on('change', function (e, data) {
                        if (data.direction === 'next') {
                            var valid = true;

                            if (DEBUG)
                            {
                                scope.$apply(function () {
                                    scope.activeStep = data.step + 1;
                                });
                                return;
                            }

                            if (validators[data.step - 1])
                                scope.$apply(function () {
                                    valid = validators[data.step - 1]();
                                });

                            if (!valid)
                                e.preventDefault();
                            else
                                scope.$apply(function () {
                                    scope.activeStep = data.step + 1;
                                });
                        } else {
                            scope.$apply(function () {
                                scope.activeStep = data.step - 1;
                            });
                        }

                    });
                });

            }
        };
    })

    .directive('greaterEqualDate', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                modelCtrl.$parsers.unshift(function (viewValue) {
                    if (!viewValue) {
                        modelCtrl.$setValidity('greaterequaldate', true);
                        return;
                    }

                    var dateParts = viewValue.split("/");
                    var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
                    if (isNaN(date)) {
                        modelCtrl.$setValidity('greaterequaldate', false);
                        return;
                    }

                    var smallDate = new Date(scope.$eval(attrs.greaterEqualDate).getTime());
                    smallDate.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);

                    if (date < smallDate) {
                        modelCtrl.$setValidity('greaterequaldate', false);
                        return;
                    }

                    modelCtrl.$setValidity('greaterequaldate', true);
                    return viewValue;
                });
            }
        };
    })
    .directive('lessEqualDate', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attrs, modelCtrl) {
                if (!modelCtrl)
                    return;

                modelCtrl.$parsers.unshift(function (viewValue) {
                    if (!viewValue) {
                        modelCtrl.$setValidity('lessequaldate', true);
                        return;
                    }

                    var dateParts = viewValue.split("/");
                    var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
                    if (isNaN(date)) {
                        modelCtrl.$setValidity('lessequaldate', false);
                        return;
                    }

                    var bigDate = new Date(scope.$eval(attrs.lessEqualDate).getTime());
                    bigDate.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);

                    if (date > bigDate) {
                        modelCtrl.$setValidity('lessequaldate', false);
                        return;
                    }

                    modelCtrl.$setValidity('lessequaldate', true);
                    return viewValue;
                });
            }
        };
    });

    // Utils
    Array.prototype.removeIndex = function (index) {
        this.splice(index, 1);
    };

    Array.prototype.groupBy = function (prop, map) {
        var distinct = [];
        var unique = {};

        for (var i = 0; i < this.length; i++) {
            if (typeof (unique[this[i][prop]]) === "undefined")
                distinct.push(map(this[i]));

            unique[this[i][prop]] = 0;
        }

        return distinct;
    };

    Date.prototype.convertLocalDateToUTC = function () {
        var hours = this.getHours() - (this.getTimezoneOffset() / 60);
        this.setHours(hours);
        return this;
    };
}();