// html to use with
//<div swiper="{}" swiper-data="e.policies" style="margin-bottom:40px" class="margin-top-10" ng-show="e.policies.length">
//                                      <div ng-repeat="p in e.policies">
//                                          <slide ng-click="selectPolicy(e, p)">
//                                              <div style="height:100%" ng-include="'policySlider.html'"></div>
//                                          </slide>
//                                      </div>
//                                  </div>

//                                  <div class='mypagination'></div>

//.swiper-container, .swiper-slide {
//    width: 100%;
//    height: 120px;
//}

//.mypagination {
//    position: absolute;
//    left: 0;
//    text-align: center;
//    /*bottom: 5px;*/
//    top: 140px;
//    width: 100%;
//}

//.swiper-pagination-switch {
//display: inline-block;
//width: 10px;
//height: 10px;
//border-radius: 10px;
//background: #999;
//box-shadow: 0px 1px 2px #555 inset;
//margin: 0 3px;
//cursor: pointer;
//}

//    .swiper-active-switch {
//background: #fff;
//}


!function () {
    angular.module('eCity')
    .directive('swiper', function ($timeout) {
        return {
            restrict: 'EA',
            //template: "<div class='swiper-container'>" +
            //  "<div class='swiper-wrapper'><div style='display: none' ng-transclude></div></div>" +
            //  "" +
            //  "</div>",
            template: "<div class='swiper-container'>" +
  "<div class='swiper-wrapper'></div>" +
  "<div style='display: none' ng-transclude></div>" +
  "</div>",
            replace: true,
            transclude: true,
            // We use a controller here so the slide directive
            // can require it and call `addSlide`.
            controller: function ($scope, $element, $attrs, $compile) {
                var newSlides = [];
                var mySwiper = null;
                var slideCount = 0;
                var callbacks = {};
                var shadowsHtml = null;

                //var collection = $attrs.swiperData;
                //$scope.$watchCollection(collection, function (newvalue, oldvalue) {
                //    if (!newvalue || !oldvalue)
                //        return;
                //    console.log("data changed");
                //    mySwiper.removeAllSlides();
                //    $compile($element)($scope);
                //});

                // Attached directly to the controller so other directives
                // have access to it.
                this.addSlide = function (html, callback) {
                    if (mySwiper) {
                        shadowsHtml = '';

                        // See: https://github.com/nolimits4web/Swiper/issues/862
                        if (mySwiper.params.tdFlow.shadows)
                            shadowsHtml = '<div class="swiper-slide-shadow-left"></div><div class="swiper-slide-shadow-right"></div>';
                        var newSlide = mySwiper.createSlide(shadowsHtml + html.html());

                        html.data('slideNumber', slideCount);
                        // Hackily save off the callback based on
                        // a unique ID since getData() for
                        // swiper.clickedSlide doesn't appear to work
                        // when using setData() on newSlide.
                        newSlide.data('slideNumber', ++slideCount);
                        mySwiper.appendSlide(newSlide);
                        callbacks[slideCount] = callback;
                        mySwiper.swipeTo(0, 0, false);

                        //html.scope().mySlider = newSlide;
                    } else {
                        // mySwiper hasn't been initialized yet; save
                        // the slide off in an array so we can add it later.
                        newSlides.push({ html: html, callback: callback });
                    }
                };

                //this.removeSlide = function (html, slider) {
                //    for (var s in mySwiper.slides) {
                //        if (mySwiper.slides[s].data('slideNumber') === $(slider).data('slidenumber').toString()) {
                //            var index = mySwiper.slides[s].index();
                //            console.log('destroying index ' + index + ', ' + mySwiper.slides[s].data('slideNumber') + ' = ' + $(slider).data('slidenumber').toString());
                //            //mySwiper.removeSlide(index);

                //            mySwiper.slides[index].remove();
                //            this.removeSlide(html, slider);
                //            return;
                //        }
                //    }

                //    mySwiper.calcSlides();
                //    mySwiper.createLoop();
                //    mySwiper.reInit();
                //    mySwiper.swipeTo(0, 0, false);
                //    return;
                //};

                //this.removeSlide = function (html, slider) {
                //    for (var i = 0; i < mySwiper.slides.length; i++) {
                //    //for (var s in mySwiper.slides) {
                //        if (mySwiper.slides[i].data('slideNumber') === $(slider).data('slidenumber').toString()) {
                //            var index = mySwiper.slides[i].index();
                //            //console.log('destroying index ' + index + ', ' + mySwiper.slides[i].data('slideNumber') + ' = ' + $(slider).data('slidenumber').toString());

                //            mySwiper.removeSlide(index);
                //            mySwiper.reInit();
                //            mySwiper.swipeTo(0, 0, false);
                //            return;
                //        }
                //    }
                //};

                var swiperOptions = {
                    loop: true,
                    mode: 'horizontal',
                    slidesPerView: 3,
                    mousewheelControl: true,
                    keyboardControl: true,
                    paginationClickable: true,
                    //pagination: '.mypagination',
                    pagination: $element.siblings('.mypagination')[0],
                    onSlideClick: function (swiper) {
                        // Look up the callback we saved off and call it.
                        var clicked = swiper.clickedSlide;
                        var slideNumber = clicked.data('slideNumber');
                        var callback = callbacks[slideNumber];
                        mySwiper.swipeTo(swiper.clickedSlideLoopIndex - 1, 1000, false);
                        if (callback) callback();
                    },
                    tdFlow: {
                        rotate: 0,
                        stretch: -50,
                        depth: 500,
                        modifier: 1,
                        shadows: true
                    }
                };
                if ($attrs.swiper) angular.extend(swiperOptions, $scope.$eval($attrs.swiper));
                //mySwiper = $element.swiper(swiperOptions);
                $timeout(function () {
                    //$timeout(function () {
                        mySwiper = $element.swiper(swiperOptions);

                        // Now that mySwiper has been initialized, iterate
                        // over any calls to `addSlide` that happened
                        // before we were ready and add them to the swiper.
                        for (var i = 0; i < newSlides.length; i++) {
                            var slide = newSlides[i];
                            this.addSlide(slide.html, slide.callback);
                        }

                    //}.bind(this));
                    
                }.bind(this));

                $scope.$on('$destroy', function () {
                    mySwiper.destroy(true);
                });
            }
        }
    })
    .directive('slide', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            // Look for a parent `swiper` element and get its controller
            require: '^swiper',
            template: "<div class='swiper-slide' ng-transclude></div>",
            replace: true,
            transclude: true,
            link: function (scope, element, attrs, swiper) {
                //var content = $compile(element)(scope);
                //swiper.addSlide(content, function () {
                $timeout(function () {
                    swiper.addSlide(element, function () {
                        scope.$apply(attrs.ngClick);
                    });
                });

                //scope.$on('$destroy', function () {
                //    console.log("destroy");
                //    swiper.removeSlide(element, scope.mySlider);
                //});
            }
        }
    }])


        //.directive('testSlider', function ($timeout) {
        //    return {
        //        restrict: 'A',
        //        link: function (scope, element, attrs) {
        //            $timeout(function () {
        //                $(element).swiper({
        //                    pagination: '.pagination',
        //                    paginationClickable: true,
        //                    mode: 'vertical',
        //                    loop: true
        //                })
        //            });
        //        }
        //    }
        //})



    //    .directive('test1', function () {
    //    return {
    //        restrict: 'E',
    //        // Look for a parent `swiper` element and get its controller
    //        //require: '^swiper',
    //        template: "<div>My test directive<div style='border:1px solid black;' ng-transclude></div><div>end of test</div></div>",
    //        replace: true,
    //        transclude: true,
    //        link: function (scope, elem, attrs, swiper) {
    //            //swiper.addSlide(elem, function () {
    //            //    scope.$apply(attrs.ngClick);
    //            //});
    //        }
    //    }
    //    })
    //    .directive('test2', function () {
    //    return {
    //        restrict: 'EΑ',
    //        // Look for a parent `swiper` element and get its controller
    //        //require: '^swiper',
    //        template: "<div>test2 directive<div style='border:1px solid red;' ng-transclude></div>end of test2</div>",
    //        replace: true,
    //        transclude: true,
    //        link: function (scope, elem, attrs, swiper) {
    //            //swiper.addSlide(elem, function () {
    //            //    scope.$apply(attrs.ngClick);
    //            //});
    //        }
    //    }
    //})

    //.controller('MyCtrl', function ($scope) {
    //    $scope.slides = [{
    //        name: 'one',
    //        hidden: 'kittens'
    //    }, {
    //        name: 'two',
    //        hidden: 'puppies'
    //    }, {
    //        name: 'three',
    //        hidden: 'bacon'
    //    }];

    //    $scope.items = ["Add to me", "please"];

    //    $scope.select = function (slide) {
    //        $scope.items.push(slide);
    //    };
    //});
}();
