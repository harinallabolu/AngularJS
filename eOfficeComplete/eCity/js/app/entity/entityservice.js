!function () {
    var app = angular.module('eCity');

    app.service('entityService', ['$http', 'baseUri', 'Entity', '$q', '$rootScope', 'Address', '$filter', function ($http, baseUri, Entity, $q, $rootScope, Address, $filter) {
        this.getRelationTypes = function () {
            return $http.get(baseUri + 'api/Entity/GetRelationTypes');
        };
        this.getBirthnames = function () {
            return $http.get(baseUri + 'api/Entity/GetBirthnames');
        };
        this.getDoys = function () {
            return $http.get(baseUri + 'api/Entity/GetDoys');
        };
        this.getNationalities = function () {
            return $http.get(baseUri + 'api/Entity/GetNationalities');
        };
        this.getContactUses = function () {
            return $http.get(baseUri + 'api/Entity/GetContactUses');
        };
        //// Gets contacts by entity id
        //this.getContacts = function (entityid) {
        //    return $http.get(baseUri + 'api/Entity/GetContacts/' + entityid);
        //};
        this.getContactTypes = function () {
            return $http.get(baseUri + 'api/Entity/GetContactTypes');
        };
        this.getLogActions = function (entityID) {
            return $http.get(baseUri + 'api/Entity/GetLogActions/' + entityID);
        };
        this.getProducers = function () {
            return $http.get(baseUri + 'api/Entity/GetProducers');
        };
        this.getRelations = function () {
            return $http.get(baseUri + 'api/Entity/GetRelations');
        };
        this.getContactUses = function () {
            return $http.get(baseUri + 'api/Entity/GetContactUses');
        };
        this.taxIdExists = function (taxId) {
            return $http.get(baseUri + 'api/Entity/taxIdExists?afm=' + taxId);
        };
        this.emailVerify = function (email) {
            return $http.get(baseUri + 'api/Entity/EmailVerify?email=' + email);
        };
        this.createEntity = function (entity) {
            if (entity.BasicInfo.EntityType === 'Company' && !entity.BasicInfo.CompanyLegalName)
                entity.BasicInfo.CompanyLegalName = entity.BasicInfo.CompanyName;

            if (DEBUG)
                entity = {
                    'BasicInfo': {
                        //"TaxID": "044725101", "Doy": 17,
                        "Birthname": 329,
                        "Producer": 19617,
                        "EntityType": 2,
                        "Lastname": "Amazing company!!!",
                        "CompanyType": "AE",
                        "DOB": "04/07/2014",
                        "Middlename": "ds", "Firstname": "fasdfd",
                        "Passport": "33333",
                        "Gender": "Male", "Nationality": 4,
                        "InsuranceNumber": "12345678901"
                    },
                    "RelationType": 47,
                    "Contacts": [{ "Type": "Email", "Value": "ymamalis@citybrokers.gr", "IsDefault": true, "Use": "0" }
                    ], "Addresses": [
                    {
                        "IsMailing": true, "IsBilling": true, "IsCollection": true,
                        "Doorbell": "asdfdf fasdfd", "autocomplete": "Μιχαλακοπούλου 125, Αθήνα, Κεντρικός Τομέας Αθηνών, Ελλάδα",
                        "Street": "Μιχαλακοπούλου", "StreetNumber": "125", "City": "Αθήνα", "Zip": "115 27",
                        "Country": "Ελλάδα", "CountryCode": "GR", "Latitude": 37.9816592, "POBox": 323,
                        "Longitude": 23.7586312, "Floor": "333", "Comments": "fsdf", "Type": "Home", 'Action': 'Save'
                    }],
                    'Relations': [{ 'ID': 16, 'EntityID': 251, 'IsParent': true }]
                };

            return $http.post(baseUri + 'api/Entity/CreateEntity', entity).then(function (response) {

                var e = response.data;
                if (entities) {
                    var entity = new Entity();
                    entity.BasicInfo = e;
                    entity.fullname = entity.getFullname();
                    entity.EntityID = e.EntityID;
                    entities.push(entity);

                    $rootScope.$broadcast('entityAdded');
                }

                return response;
            });
        };

        this.saveAddresses = function (entityID, addresses) {
            var i = 0;
            var tmpAddresses = [];

            angular.forEach(addresses, function (a) {
                if (!(a.AddressID > 0))
                    a.AddressID = --i;

                var tmp = angular.copy(a);
                if (tmp.isDeleted())
                {
                    // If the record belongs to the old system some properties may not have values. It doesn't
                    // matter the record will be deleted.
                    tmp.Latitude = 0.1;
                    tmp.Longitude = 0.1;
                    tmp.Zip = 11111;
                    tmp.City = "Dummy";
                    tmp.CountryCode = "GR";
                    tmp.Country = "Dummy";
                    tmp.Doorbell =  "Dummy";
                    tmp.IsMailing = false;
                    tmp.IsBilling = false;
                    tmp.IsCollection = false;
                }

                tmpAddresses.push(tmp);
            });

            return $http.post(baseUri + 'api/Entity/SaveAddresses', { 'EntityID': entityID, 'Addresses': tmpAddresses }).then(function (response) {
                if (response.data.Message === 'SuccessWithNoData')
                    return response.data.Message;
                
                angular.forEach(addresses, function (a) {
                    a.markUpdated();

                    if (a.AddressID > 0)
                        return;

                    var id = $filter('filter')(response.data.Addresses, { 'ID': a.AddressID });
                    if (id.length)
                        a.AddressID = id[0].AddressID;
                });

                return response.data.Message;
            });
        };

        var entities = null;
        this.getAllEntities = function () {
            if (entities) {
                var deferred = $q.defer();
                deferred.resolve(entities);
                return deferred.promise;
            }

            return $http.get(baseUri + 'api/Entity/GetAllEntities').then(function (response) {
                entities = response.data.map(function (e) {
                    //var entity = angular.extend(new Entity(), e);
                    var entity = new Entity();
                    entity.BasicInfo = e;
                    entity.EntityID = e.EntityID;
                    entity.fullname = entity.getFullname();
                    return entity;
                });

                return entities;
            });
        };

        this.searchEntitiesByPolicy = function (policyReference) {
            return $http.post(baseUri + 'api/Entity/SearchEntities', '"' + policyReference + '"');
        };

        var entitiesInfoCache = {};
        this.getEntityInfo = function (entityID) {
            if (entitiesInfoCache[entityID]) {
                var deferred = $q.defer();
                deferred.resolve(entitiesInfoCache[entityID]);
                return deferred.promise;
            }

            return $http.get(baseUri + 'api/Entity/GetEntity/' + entityID).then(function (response) {
                response.data.Addresses = $.map(response.data.Addresses, function (a) {
                    //return angular.extend(new Address(), a);
                    return new Address(a);
                    //address.markUpdated();
                    //return address;
                });

                var entity = angular.extend(new Entity(), response.data);
                //var entity = new Entity();
                //entity.BasicInfo = response.data;
                entity.fullname = entity.getFullname();
                entity.BasicInfo.Age = entity.getAge();
                entitiesInfoCache[entityID] = entity;

                return entity;
            });
        };

        this.getEntityAdditionalInfo = function (entityID) {
            return $http.get(baseUri + 'api/Entity/GetEntityAdditionalData/' + entityID);
        };
    }]);
}();