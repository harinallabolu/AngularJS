angular.module('sm', ['ngRoute'])
.config(function ($routeProvider) {
    $routeProvider
 .when('/dashboard', {
     templateUrl: 'mytemplate.html',
     //controller: 'PageViewController',
 });
   
})
        .controller('MyCtrl', function ($scope) {
            $scope.myformname = "fasfdsf";
            window.s = $scope;
            $scope.isFullscreen = false;

            $scope.fullscreen = function () {
                $scope.isFullscreen = !$scope.isFullscreen;
            };
        })
        .directive('myFullscreen', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var condition = attrs.myFullscreen;
                    scope.$watch(condition, function (newValue) {
                        //if (newValue === undefined)
                        //    return;

                        //alert('change');

                        if (newValue)
                            goFullscreen();
                        else
                            goNormal();
                    });

                    function goFullscreen() {
                        var p = $(element).parent('.myfullscreen');
                        if (p.length)
                            return;

                        p = $(element).wrap('<div class="myfullscreen"></div>');

                        $('body').addClass('nooverflow');
                        //heightFullscreen();

                    }

                    function goNormal() {
                        var p = $(element).parent('.myfullscreen');
                        if (!p.length)
                            return;

                        $('body').removeClass('nooverflow');
                        $(element).unwrap();
                    }

                    function heightFullscreen() {
                        //if ($('#jarviswidget-fullscreen-mode')
                        //    .length) {

                            /**
                             * Setting height variables.
                             **/
                            var heightWindow = $(window)
                                .height();
                            //var heightHeader = $('#jarviswidget-fullscreen-mode')
                            //    .find(self.o.widgets)
                            //    .children('header')
                            //    .height();

                            /**
                             * Setting the height to the right widget.
                             **/
                            $('.myfullscreen')
                                //.find(self.o.widgets)
                                //.children('div')
                            //.height(heightWindow - heightHeader - 15);
                            .height(heightWindow);
                       // }
                    }
                }
            };
        });