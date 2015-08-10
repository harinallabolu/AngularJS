!function () {
    angular.module('eCity')

    .factory('Address', function () {
        function Address(data) {
            if (data)
                angular.extend(this, data);
            else {
                this.IsMailing = true;
                this.IsBilling = true;
                this.IsCollection = true;
            }

            this.Action = 'Save';
            this.dirty = false;
        }

        Address.prototype.getDescription = function () {
            var result = this.Street || '';

            if (this.StreetNumber)
                result += ' ' + this.StreetNumber;

            // Required when for example: Umm Suqeim - Dubai - United Arab Emirates
            if (!result)
                result += this.Country;

            if (this.Zip)
                result += ', ' + this.Zip;
            if (this.City)
                result += ', ' + this.City;

            return result;
        };

        Address.prototype.isDirty = function () {
            return this.dirty;
        };

        Address.prototype.startProcessing = function () {
            this.dirty = false;
            this.processing = true;
        };

        Address.prototype.markUpdated = function () {
            this.dirty = false;
            this.processing = false;
        };

        Address.prototype.endProcessing = function () {
            this.dirty = true;
            this.processing = false;
        };

        Address.prototype.onProcess = function () {
            return this.processing;
        };

        Address.prototype.save = function () {
            return this.Action === 'Save';
        };

        Address.prototype.markForDelete = function () {
            this.Action = 'Delete';
            this.dirty = true;
        };

        Address.prototype.isDeleted = function () {
            return this.Action === 'Delete';
        };

        Address.prototype.validate = function () {
            var valid = this.IsBilling || this.IsMailing || this.IsCollection;

            return valid && !!this.Type && !!this.Doorbell && !!this.Country && !!this.CountryCode && !!this.Zip;
        };

        Address.prototype.hasLatLong = function () {
            return !!this.Latitude && !!this.Longitude;
        };

        Address.validateGroup = function(addresses)
        {
            var hasMailing = false;
            var hasBilling = false;
            var hasCollection = false;
            //var deleteOneAddress = false;

            angular.forEach(addresses, function (address) {
                //deleteOneAddress = deleteOneAddress || ;
                if (address.isDeleted())
                    return;

                hasMailing = hasMailing || address.IsMailing;
                hasBilling = hasBilling || address.IsBilling;
                hasCollection = hasCollection || address.IsCollection;
            });

            return hasMailing && hasBilling && hasCollection;
        }

        return Address;
    });
}();