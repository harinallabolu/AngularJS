angular.module('sm', ['ui.bootstrap'])

.directive('mypopover', function ($http, $templateCache, $compile) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var templateUrl = attrs.mypopover;
            //scope.name = "name2";
            $http.get(templateUrl, { cache: $templateCache }).success(init);
            //$http.get('signature.html', { cache: $templateCache }).success(init);

            function init(template) {
                console.log('ok');

                var domElement = angular.element('<div>' + template + '</div>');
                $compile(domElement)(scope);


                elem.removeAttr('mypopover');
                elem.attr('tooltip-html-unsafe', domElement.html());
                $compile(elem)(scope);

                
                //elem.append(domElement);
            }
        }
    };
})
.controller('MyCtrl', function ($scope) {

    window.s = $scope;

    $scope.name = "kostas";
});