//describe('Controller: MainCtrl', function () {
//    beforeEach(module('MyApp'));
//    var MainCtrl, scope;
//    beforeEach(inject(function ($controller) {
//        scope = {};
//        MainCtrl = $controller('MainCtrl', {
//            $scope: scope
//        });
//    }));
//    it('should have scope defined', function () {
//        expect(scope).toBeDefined();
//    });
//});


myAppDev = angular.module('myAppDev', ['eCity', 'ngMockE2E']);
myAppDev.run(function ($httpBackend) {
    phones = [{ name: 'phone1' }, { name: 'phone2' }];

    // returns the current list of phones
    $httpBackend.whenGET('/phones').respond(phones);

    // adds a new phone to the phones array
    $httpBackend.whenPOST('/phones').respond(function (method, url, data) {
        var phone = angular.fromJson(data);
        phones.push(phone);
        return [200, phone, {}];
    });
    //$httpBackend.whenGET(/.*/).passThrough();
    //...
});

angular.module('plunker2', [])

.factory('githubApi', function ($http) {
    return {
        getJasonMore: function () {
            return $http.get('https://api.github.com/users/jasonmore');
        }
    }
})
.controller('MainCtrl', function ($scope, githubApi, $http) {
    $scope.name = 'World';

    githubApi.getJasonMore().success(function (data) {
        $scope.data = data;
    })
});

describe('mocking service http call', function () {
    beforeEach(module('plunker2'));

    var MainCtrl, $scope;

    describe('with spies', function () {
        beforeEach(inject(function ($controller, $rootScope, githubApi) {
            $scope = $rootScope.$new();

            spyOn(githubApi, 'getJasonMore').and.callFake(function () {
                return {
                    success: function (callback) { callback({ things: 'and stuff' }) }
                };
            });

            MainCtrl = $controller('MainCtrl', { $scope: $scope, githubApi: githubApi });
        }));

        it('should set data to "things and stuff"', function () {
            expect($scope.data).toEqual({
                things: 'and stuff'
            });
        });
    });

    describe('with httpBackend', function () {
        var httpBackend;

        beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
            $scope = $rootScope.$new();

            $httpBackend.when('GET', 'https://api.github.com/users/jasonmore')
              .respond({ things: 'and stuff' });

            MainCtrl = $controller('MainCtrl', { $scope: $scope });
            $httpBackend.flush();
            httpBackend = $httpBackend;
        }));

        it('should set data to "things and stuff"', function () {
            expect($scope.data).toEqual({
                things: 'and stuff'
            });
        });

        it('should set data to "things and stuff2"', inject(function (githubApi) {
            var mydata = undefined;

            var p = githubApi.getJasonMore();
            p.success(function (data) {
                mydata = data;
            });
            httpBackend.flush();

            expect(mydata.things).toEqual('and stuff');
        }));
    });
});


describe('Controller: MainCtrl', function () {
    beforeEach(module('myAppDev'));
    var policyService;
    var Policy, $httpBackend;
    var baseUri;

    beforeEach(inject(function (_policyService_, $injector) {
        policyService = _policyService_;
        $httpBackend = $injector.get('$httpBackend');
    }));

    beforeEach(inject(function (_baseUri_) {
        baseUri = _baseUri_;
    }));

    beforeEach(inject(function (_Policy_) {
        Policy = _Policy_;
    }));
   
    it('should have scope defined', function () {
        var p = new Policy();
        expect(p.getIconStyle).toBeDefined();
    });

    it('should have scope getCompanies', function () {
        expect(policyService.getCompanies).toBeDefined();
    });

    it('should have baseURI equal to http://localhost:53000/', function () {
        expect(baseUri).toEqual("http://localhost:53000/");
    });

    //it('should have phones', function () {
    //    var companies = null;
    //    //$httpBackend.expectGET(baseUri + 'api/Policies/GetCompanies').respond(200, '');

    //    $httpBackend.expectGET('/phones');

    //    $httpBackend.flush();
    //    //policyService.getCompanies().success(function (data) {
    //    //    companies = data;
    //    //});


    //    //expect(companies).toEqual(null);
    //});


    //it('should companies', function () {
    //    var companies = null;
    //    //$httpBackend.expectGET(baseUri + 'api/Policies/GetCompanies').respond(200, '');

    //    $httpBackend.expectGET(baseUri + 'api/Policies/GetCompanies');

    //    $httpBackend.flush();
    //    policyService.getCompanies().success(function (data) {
    //        companies = data;
    //    });


    //    expect(companies).toEqual(null);
    //});
});