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

describe('Controller: MainCtrl', function () {
    beforeEach(module('eCity2'));
    var MainCtrl, scope, policyService;

    beforeEach(inject(function ($controller) {
        scope = {};
        policyService = {};
        MainCtrl = $controller('BankAccountsController', {
            $scope: scope,
            policyService: policyService,
            bankService: {}
        });
    }));

    beforeEach(inject(function (_policyService_) {
        policyService = _policyService_;
    }));

    it('should have scope defined', function () {
        expect(scope).toBeDefined();
    });

    it('should have company initialized to -1', function () {
        expect(scope.company).toBe(-1);
    });

    it('should have policyService.a initialized to be 1', function () {
        expect(policyService.a).toBe(1);
    });

    it('should have policyService.c initialized to be 125', function () {
        expect(policyService.c).toBe(125);
    });

    it('should have company initialized to -1', inject(function (policyService) {
        expect(policyService.c).toBe(125);
    }));

    it('should policyService to have policyFunc', inject(function (policyService) {
        var name = policyService.policy.name;
        expect(name).toEqual("Amazing policy");
    }));

    it('should policyService to have policyFunc', function () {
        expect(policyService.policy).toBeDefined();
    });

    //it('should have policyService.c initialized to be 12532', inject(function (policyService) {
    //    expect(policyService.c).toBe(12532);
    //}));

    //it('should have policyService.c initialized to be 12532', function () {

    //    module(function ($provide) {
    //        $provide.service('policyService', function () {
    //            this.c = 12532;
    //            this.b = "hello";
    //            this.a = 10;
    //        });
    //    });

    //    inject(function (policyService) {
    //        expect(policyService.c).toBe(12532);
    //    });
    //});
});