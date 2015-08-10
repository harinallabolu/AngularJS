!function () {
    angular.module('eCity')

        //.directive("footable", ['$timeout', function ($timeout) {
        //return {
        //    restrict: 'A',
        //    link: function (scope, element, attrs) {
        //        myLoadScript("js/plugin/FooTable-2/dist/footable.min.js", function () {
        //            //element.footable(scope.$eval(attrs.footable));
        //            $timeout(function () {
        //                //element.footable();

        //                //element.trigger('footable_redraw');

        //                //scope.$watch('filteredAccounts', function () {
        //                //    element.trigger('footable_redraw');
        //                //});
        //            });
        //            //scope.$watch('filteredAccounts', function () {
        //            //    element.trigger('footable_redraw');
        //            //});

        //        });

        //    }
        //}
        //}])

    //.directive('fooRow', function () {
    //    return function (scope, element) {
    //        var $footable = $(element).parents('.footable');
    //        if (scope.$last && !$footable.hasClass('footable-loaded')) {
    //            myLoadScript("js/plugin/FooTable-2/dist/footable.min.js", function () {

    //                var options = scope.$eval($footable.attr('footable'));
    //                $footable.footable(options);
    //            });
    //        }

    //        var footableObject = $footable.data('footable');
    //        if (footableObject !== undefined) {
    //            footableObject.appendRow($(element));
    //        }
    //    };
    //});

    .directive('fooRow', function () {
        return function(scope, element){
            var footableTable = element.parents('table');


            if( !scope.$last ) {
                return false;
            }

            scope.$evalAsync(function(){


                myLoadScript("js/plugin/FooTable-2/dist/footable.min.js", function () {
                    if (!footableTable.hasClass('footable-loaded')) {
                        footableTable.footable();
                    }

                    footableTable.trigger('footable_initialized');
                    footableTable.trigger('footable_resize');
                    footableTable.data('footable').redraw();
                });
            });
        };
    })
}();
