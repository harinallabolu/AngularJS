angular.module('sm', [])
.directive("dynamicName", ['$compile', function ($compile) {
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
}])

.directive("dynamicId", ['$compile', function ($compile) {
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
}])

.controller('MyCtrl', function ($scope) {
    $scope.myformname = "fasfdsf"
    window.s = $scope;
});