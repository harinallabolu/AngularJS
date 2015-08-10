!function () {

    var userRoles = {
        'public': 1, // 001
        'user': 2, // 010
        'admin': 4,  // 100
        'employee': 8,
        'producer': 16,
        'client': 32
    };

    var accessLevels = {
        'logged': userRoles.admin |
                userRoles.employee |
                userRoles.producer,
        'public': userRoles.public | // 111
                userRoles.user |
                userRoles.admin,
        anon: userRoles.public,  // 001
        user: userRoles.user |   // 110
                userRoles.admin,
        admin: userRoles.admin    // 100
    };


    var app = angular.module('eCity');

    app.constant('userRoles', userRoles);
    app.constant('accessLevels', accessLevels);

    app.factory('user', ['userRoles', function (userRoles) {
        var roles = [],
            rolesInt = 0,
            entityId = null,
            isAdmin,
            authToken = null,
            storageKey = 'eCityUser';

        if (sessionStorage) {
            var user = sessionStorage.getItem(storageKey);
            if (user) {
                user = JSON.parse(user);
                entityId = user.Entity;
                roles = user.Roles;
                authToken = user.authToken;
                if (hasRole('ADMIN'))
                    rolesInt += userRoles.admin;
                if (hasRole('Employee'))
                    rolesInt += userRoles.employee;
                if (hasRole('Producer'))
                    rolesInt += userRoles.producer;
            }
        }

        return {
            'isAdmin': hasRole('ADMIN'),
            'isEmployee': hasRole('Employee'),
            'isFinance': hasRole('ΛΟΓΙΣΤΗΡΙΟ'),
            'isProducer': hasRole('Producer'),
            'isProducerOnly': rolesInt === userRoles.producer,
            'entityId': entityId,
            'isLogged': !!entityId,
            'hasAuth': function (access) {
                return access & rolesInt;
            },
            'logout': function () {
                if (sessionStorage)
                    sessionStorage.removeItem(storageKey);
            },
            'authToken': authToken
        };

        function hasRole(role) {
            return $.inArray(role, roles) > -1;
        }
    }]);
}();