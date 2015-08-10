!function () {
    angular.module('eCity')

    .directive('myAddress', function () {
        return {
            restrict: 'E',
            scope: {
                addresses: '=',
                doorbell: '@',
                // See https://github.com/angular-ui/angular-google-maps/issues/76
                mapRender: '='
            },

            templateUrl: 'views/app/entities/addressedit.html',
            controller: ['$scope', 'Address', 'box', function ($scope, Address, box) {
                if (DEBUG)
                    window.s2 = $scope;

                
                //$scope.render = true;
                if ($scope.mapRender === undefined)
                    $scope.mapRender = true;

                $scope.$watch('mapRender', function (newValue, oldValue) {
                    if (newValue === true && oldValue === false)
                    {
                       // $scope.mapRender = true;
                    }

                });

                $scope.map = {
                    center: {
                        latitude: 37.9825472,
                        longitude: 23.761345800000072
                    },
                    zoom: 17
                };


                $scope.marker = {
                    id: 0,
                    //coords: {
                    //    latitude: 40.1451,
                    //    longitude: -99.6680
                    //},
                    //options: { draggable: true },
                    title: "City Brokers Insurance",
                    events: {
                        dragend: function (marker, eventName, args) {
                            console.log('marker dragend');
                            console.log(marker.getPosition().lat());
                            console.log(marker.getPosition().lng());
                        }
                    },
                    show: true
                }

                $scope.title = "Window Title!";

                angular.forEach($scope.addresses, function (a) {
                    a.new = false;
                    a.markUpdated();
                });

                if (DEBUG) {
                    window.addresses = $scope.addresses;
                    window.s2 = $scope;
                }

                $scope.address = newAddressFn();

                $scope.$watchCollection('[address.Latitude, address.Longitude]', function (newValues) {
                    if (newValues[0])
                    {
                        $scope.map.center.latitude = newValues[0];
                        $scope.marker.title = null;
                    }
                    if (newValues[1])
                    {
                        $scope.map.center.longitude = newValues[1];
                        $scope.marker.title = null;
                    }
                });

                $scope.$watch('doorbell', function (newValue) {
                    $scope.address.Doorbell = newValue || $scope.address.Doorbell;
                });

                $scope.showAddress = function () {
                    return function (address) {
                        return !(address.isDeleted() || address.onProcess());
                    }
                };

                $scope.addAddress = function () {
                    $scope.trySaveAddress = true;

                    if (!$scope.address.validate())
                    {
                        $scope.showErrors = true;
                        return;
                    } else if (!$scope.address.hasLatLong()) {
                        box.attention('Please use the Google autocomplete to locate the address before saving it.');
                        return;
                    }

                    $scope.trySaveAddress = false;
                    $scope.showErrors = false;
                    var index = $scope.addresses.indexOf($scope.address);
                    if (index < 0)
                        $scope.addresses.push($scope.address);
                    $scope.address.endProcessing();

                    $scope.address = newAddressFn();
                };

                $scope.removeAddress = function (address) {
                    if (address.new) {
                        var index = $scope.addresses.indexOf(address);
                        $scope.addresses.removeIndex(index);
                    }
                    else {
                        address.markForDelete();
                    }
                    //$scope.addresses.removeIndex(index);
                    $scope.address = newAddressFn();
                };

                $scope.editAddress = function (address) {
                    $scope.showErrors = false;
                    address.startProcessing();
                    $scope.address = address;
                    $scope.address.autocomplete = $scope.address.autocomplete || $scope.address.getDescription();
                };

                $scope.hasAddressType = function () {
                    return $scope.address.IsMailing || $scope.address.IsBilling || $scope.address.IsCollection
                }

                function newAddressFn() {
                    var a = new Address();
                    a.Doorbell = $scope.doorbell;
                    a.new = true;
                    a.startProcessing();
                    //$scope.addresses.push(a);
                    return a;
                }
            }]
        }
    });
}();
