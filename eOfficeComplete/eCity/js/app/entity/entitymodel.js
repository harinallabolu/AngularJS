!function () {
    angular.module('eCity')

    .factory('Entity', function () {
        function Entity() {
            this.BasicInfo = {};
            //this.fullname = this.getFullname();
        }

        Entity.prototype.getFullname = function () {
            var result = this.BasicInfo.Lastname || '';

            if (this.isIndividual() && this.BasicInfo.Firstname)
                result += ' ' + this.BasicInfo.Firstname;

            return result;
        }

        Entity.prototype.searchName = function () {
            var result = this.getFullname();

            if (this.BasicInfo.Afm)
                result += ', ' + this.BasicInfo.Afm;
            if (this.BasicInfo.Age)
                result += ', (' + this.BasicInfo.Age + ')';

            return result;
        };

        Entity.prototype.isIndividual = function () {
            return this.BasicInfo.EntityType === 1;
        }

        Entity.prototype.isCompany = function () {
            return this.BasicInfo.EntityType === 2;
        }

        Entity.prototype.isCustomer = function () {
            return this.RelationType === 11 || this.RelationType === 47;
        };

        Entity.prototype.getAge = function () {
            if (!this.BasicInfo.DOB)
                return null;

            var today = new Date();
            return today.getYear() - this.BasicInfo.DOB.getYear();
        };

        return Entity;
    });
}();