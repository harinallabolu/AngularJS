!function () {
    angular.module('eCity')

    .factory('ParsedReceipt', function () {
        function ParsedReceipt(receipt) {
            angular.extend(this, receipt);
            this.TypeID = null;

            if (this.matchesCount() === 1)
                this.setMatchedReceipt(this.Matches[0])

            this.action = calcAction(this);
        }

        function calcAction(receipt)
        {
            if (!receipt.getMatchedPolicyID())
                return 'N/A';

            if (receipt.getMatchedReceiptID())
                return 'Update';
            else
                return 'Insert';
        }

        // Passes validation if the receipt can be processed by our system. Otherwise it returns false and validationError property
        // describes the error.
        ParsedReceipt.prototype.validate = function () {
            this.validationError = null;

            if (!this.hasMatch())
                this.validationError = 'A match is missing.';
            else if (this.action === 'Insert' && !this.TypeID)
                    this.validationError = 'Type information is required for insert actions.';

            if (this.validationError)
                return false;

            return true;
        }


        ParsedReceipt.prototype.hasError = function () {
            return !!this.ErrorDescription;
        }

        ParsedReceipt.prototype.hasMatch = function () {
            return !!this.getMatchedPolicyID();
        }

        ParsedReceipt.prototype.matchesCount = function () {
            return this.Matches.length;
        }

        ParsedReceipt.prototype.getCustomerFullname = function () {
            if (this.CustomerFullname)
                return this.CustomerFullname;

            return this.CustomerLastname + ' ' + (this.CustomerFirstname || '');
        }

        ParsedReceipt.prototype.setMatchedPolicy = function (policyID) {
            this.PolicyID = policyID;
            this.ReceiptID = null;
            this.matchedReceipt = null;
            //this.matchedPolicy = policy;

            this.action = calcAction(this);
        }

        ParsedReceipt.prototype.setMatchedReceipt = function (receipt) {
            this.PolicyID = receipt.PolicyID;
            this.ReceiptID = receipt.ReceiptID;

            this.matchedReceipt = receipt;
            this.action = calcAction(this);
        }

        ParsedReceipt.prototype.getMatchedReceipt = function () {
            return this.matchedReceipt;
        }

        ParsedReceipt.prototype.getMatchedReceiptID = function () {
            return this.matchedReceipt ? this.matchedReceipt.ReceiptID : null;
        }

        ParsedReceipt.prototype.getMatchedPolicyID = function () {
            return this.PolicyID;
        }

        // Called after a successful insert/update to the database. The argument is the ID of the receipt that was updated
        // or inserted.
        ParsedReceipt.prototype.success = function (receiptID, notes) {
            this.Matches = [];
            this.ErrorDescription = null;
            this.notes = notes;
            var clone = angular.copy(this);
            clone.IsMatched = true;
            clone.ReceiptID = receiptID;
            this.Matches[0] = clone;
            this.setMatchedReceipt(clone);
        }

        // Returns true when an identical match is found in our system, therefore no processing is required. We have
        // all the information contained in this record.
        ParsedReceipt.prototype.hasIdenticalMatch = function () {
            if (this.hasError())
                return false;

            if (this.Matches.length !== 1)
                return false;

            var match = this.Matches[0];
            if (this.GrossPremium && this.GrossPremium !== match.GrossPremium)
                return false;
            if (this.NetPremium && this.NetPremium !== match.NetPremium)
                return false;
            if (this.Commission && this.Commission !== match.Commission)
                return false;
            if (this.StartDate && (!match.StartDate || this.StartDate.getTime() !== match.StartDate.getTime()))
                return false;
            if (this.IssuedDate && (!match.IssuedDate || this.IssuedDate.getTime() !== match.IssuedDate.getTime()))
                return false;
            if (this.EndDate && (!match.EndDate || this.EndDate.getTime() !== match.EndDate.getTime()))
                return false;
            if (this.ReceiptReference && this.ReceiptReference !== match.ReceiptReference)
                return false;
            if (this.PolicyReference && this.PolicyReference !== match.PolicyReference)
                return false;
            if (this.DiasCode && this.DiasCode !== match.DiasCode)
                return false;

            return match.IsMatched;
        }

        return ParsedReceipt;
    });
}();