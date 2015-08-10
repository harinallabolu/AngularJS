!function () {
    angular.module('eCity')

    .directive('googleAutocomplete', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                $(function () {
                    initAutocomplete();

                    function initAutocomplete() {
                        // Create the autocomplete object, restricting the search
                        // to geographical location types.
                        var autocomplete = new google.maps.places.Autocomplete(
                            /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
                            { types: ['geocode'] });
                        // When the user selects an address from the dropdown,
                        // populate the address fields in the form.
                        google.maps.event.addListener(autocomplete, 'place_changed', fillInAddress);

                        //$(document).on("keypress", 'form', function (e) {
                        //    var code = e.keyCode || e.which;
                        //    //console.log(code);
                        //    if (code == 13) {
                        //        //console.log('Inside');
                        //        e.preventDefault();
                        //        return false;
                        //    }
                        //});

                        function fillInAddress() {
                            // Get the place details from the autocomplete object.
                            var place = autocomplete.getPlace();

                            if (!place.address_components)
                                return;

                            //for (var component in componentForm) {
                            //    document.getElementById(component).value = '';
                            //    document.getElementById(component).disabled = false;
                            //}

                            //$(".addressField").prop('disabled', false);
                            //$(".googleField").val('');

                            // Get each component of the address from the place details
                            // and fill the corresponding field on the form.
                            //for (var i = 0; i < place.address_components.length; i++) {
                            //    var addressType = place.address_components[i].types[0];
                            //    if (componentForm[addressType]) {
                            //        var val = place.address_components[i][componentForm[addressType]];
                            //        document.getElementById(addressType).value = val;
                            //    }
                            //}

                            var data = {};
                            $.each(place.address_components, function (index, object) {
                                var name = object.types[0];
                                data[name] = object.long_name;
                                data[name + "_short"] = object.short_name;
                            });


                            var scope = $("#street").scope();
                            scope.$apply(function () {
                                var address = {
                                    autocomplete: $("#autocomplete").val(),
                                    Street: data['route'],
                                    StreetNumber: data['street_number'],
                                    City: data['locality'],
                                    Zip: data['postal_code'],
                                    Country: data['country'],
                                    CountryCode: data['country_short'],
                                    Latitude: place.geometry.location.lat(),
                                    Longitude: place.geometry.location.lng()
                                };

                                $.extend(scope.address, address);
                            });
                        }
                    }
                });
            }

        }
    });
}();
