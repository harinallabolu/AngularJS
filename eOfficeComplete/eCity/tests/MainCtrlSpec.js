describe('Controller: MainCtrl', function () {
    beforeEach(module('MyApp'));
    var MainCtrl, scope;
    beforeEach(inject(function ($controller) {
        scope = {};
        MainCtrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));
    it('should have scope defined', function () {
        expect(scope).toBeDefined();
    });
});