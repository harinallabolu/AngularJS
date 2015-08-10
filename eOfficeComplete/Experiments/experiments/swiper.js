angular.module('sm', [])
.directive('swiper', function ($timeout) {
    return {
        restrict: 'EA',
        template: "<div class='swiper-container'>" +
          "<div class='swiper-wrapper'></div>" +
          "<div style='display: none' ng-transclude></div>" +
          "</div>",
        replace: true,
        transclude: true,
        // We use a controller here so the slide directive
        // can require it and call `addSlide`.
        controller: function ($scope, $element, $attrs) {
            var newSlides = [];
            var mySwiper = null;
            var slideCount = 0;
            var callbacks = {};

            // Attached directly to the controller so other directives
            // have access to it.
            this.addSlide = function (html, callback) {
                if (mySwiper) {
                    shadowsHtml = '';

                    // See: https://github.com/nolimits4web/Swiper/issues/862
                    if (mySwiper.params.tdFlow.shadows)
                        shadowsHtml = '<div class="swiper-slide-shadow-left"></div><div class="swiper-slide-shadow-right"></div>';
                    var newSlide = mySwiper.createSlide(shadowsHtml + html.html());
                    console.log('Adding slide ' + slideCount);

                    html.data('slideNumber', slideCount);
                    //var newSlide = mySwiper.createSlide(html.html());
                    // Hackily save off the callback based on
                    // a unique ID since getData() for
                    // swiper.clickedSlide doesn't appear to work
                    // when using setData() on newSlide.
                    newSlide.data('slideNumber', ++slideCount);
                    mySwiper.appendSlide(newSlide);
                    callbacks[slideCount] = callback;
                    mySwiper.swipeTo(0, 0, false);

                    html.scope().mySlider = newSlide;
                } else {
                    // mySwiper hasn't been initialized yet; save
                    // the slide off in an array so we can add it later.
                    newSlides.push({ html: html, callback: callback });
                }
            };


            this.removeSlide = function (html, slider) {
                //mySwiper.removeSlide(0);
                //mySwiper.reInit();
                for (var s in mySwiper.slides)
                {
                    if (mySwiper.slides[s].data('slideNumber') === $(slider).data('slidenumber').toString())
                    {
                        var index = mySwiper.slides[s].index();
                        console.log('destroying index ' + index + ', ' + mySwiper.slides[s].data('slideNumber') + ' = ' + $(slider).data('slidenumber').toString());
                        //mySwiper.removeSlide(index);

                        mySwiper.slides[index].remove();
                        this.removeSlide(html, slider);
                        return;
                        //mySwiper.removeLoopedSlides();
                        //mySwiper.calcSlides();
                        //mySwiper.createLoop();

                        //mySwiper.reInit();
                        //mySwiper.swipeTo(0, 0, false);
                        //return;
                    }
                    //console.log('1');
                }

                mySwiper.calcSlides();
                mySwiper.createLoop();
                mySwiper.reInit();
                mySwiper.swipeTo(0, 0, false);
                return;
            };

            var swiperOptions = {
                loop: true,
                mode: 'vertical',
                slidesPerView: 3,
                mousewheelControl: true,
                onSlideClick: function (swiper) {
                    // Look up the callback we saved off and call it.
                    var clicked = swiper.clickedSlide;
                    var slideNumber = clicked.data('slideNumber');
                    var callback = callbacks[slideNumber];
                    if (callback) callback();
                },
                tdFlow: {
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    shadows: true
                }
            };
            if ($attrs.swiper) angular.extend(swiperOptions, $scope.$eval($attrs.swiper));
            $timeout(function () {
                

                mySwiper = $element.swiper(swiperOptions);


                //$scope.$watchCollection('filteredSlides', function (newvalue, oldvalue) {
                //    if (!newvalue || !oldvalue)
                //        return;
                //    console.log("data changed");
                //    mySwiper.removeAllSlides();
                //    //$compile($element)($scope);
                //});

                window.swiper = mySwiper;
                // Now that mySwiper has been initialized, iterate
                // over any calls to `addSlide` that happened
                // before we were ready and add them to the swiper.
                for (var i = 0; i < newSlides.length; i++) {
                    var slide = newSlides[i];
                    this.addSlide(slide.html, slide.callback);
                }
            }.bind(this));

 
        }
    }
})
.directive('slide', function ($timeout) {
    return {
        restrict: 'EA',
        // Look for a parent `swiper` element and get its controller
        require: '^swiper',
        template: "<div class='swiper-slide' ng-transclude></div>",
        replace: true,
        transclude: true,
        link: function (scope, element, attrs, swiper) {
            //swiper.addSlide(element, function () {
            //    scope.$apply(attrs.ngClick);
            //});

            $timeout(function () {
                swiper.addSlide(element, function () {
                    scope.$apply(attrs.ngClick);
                });
            });
            //element.bind('$destroy', function () {
            //    console.log('destroying DOM element (scope: ' + scope.$id + ')');
            //    swiper.removeSlide(element, scope.mySlider);
            //});

            scope.$on('$destroy', function () {
                console.log("destroy");
                swiper.removeSlide(element, scope.mySlider);
            });
        }
    }
})

.controller('MyCtrl', function ($scope) {

    window.s = $scope;
    $scope.filteredSlides = [];

    $scope.slides = [{
        name: 'one',
        hidden: 'kittens'
    }, {
        name: 'two',
        hidden: 'puppies'
    },
    {
        name: 'three',
        hidden: 'bacon'
    }, 
    //{
    //    name: 'two1',
    //    hidden: 'bacon'
    //}, {
    //    name: 'two2',
    //    hidden: 'bacon'
    //}, {
    //    name: 'two3',
    //    hidden: 'bacon'
    //}, {
    //    name: 'two4',
    //    hidden: 'bacon'
    //}
    ];

    //$scope.filterChanged = function () {
    //    swiper.removeAllSlides();
    //};
    
    $scope.items = ["Add to me", "please"];

    $scope.select = function (slide) {
        $scope.items.push(slide);

        $scope.slides.push({
            name: 'six',
            hidden: 'cheese'
        });
    };
});