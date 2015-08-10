!function () {
    angular.module('eCity')

        .factory('Policy', function () {
            function Policy(data) {
                angular.extend(this, data);
            }

            Policy.prototype.getStyle = function () {
                var style = {
                    'background-color': 'white'
                };
                if (this.WebColor)
                    style['border-top'] = '4px solid ' + '#' + this.WebColor;

                return style;
            };

            Policy.prototype.getIcon = function () {
                var icon = {};
                if (this.IconName)
                    icon[this.IconName] = true;

                return icon;
            };

            Policy.prototype.getIconStyle = function () {
                var iconStyle = {};
                if (this.WebColor)
                    iconStyle['color'] = '#' + this.WebColor;

                return iconStyle;
            };

            return Policy;
        });
}();