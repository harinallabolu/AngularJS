!function () {
    angular.module('eCity')

    .factory('box', function () {
        return {
            'success': function (msg) {
                $.smallBox({
                    title: "Success!!!",
                    content: msg,
                    color: "#739E73",
                    timeout: 4000,
                    icon: "fa fa-check",
                });
            },
            'error': function (msg) {
                $.bigBox({
                    title: "Error",
                    content: msg,
                    color: "#C46A69",
                    //timeout: 6000,
                    icon: "fa fa-warning shake animated"
                });
            },
            'info': function (msg) {
                $.smallBox({
                    title: "Info",
                    content: msg,
                    color: "rgb(50, 118, 177)",
                    timeout: 4000,
                    iconSmall: "fa fa-bell swing animated"
                });
            },
            'attention': function (msg) {
                $.smallBox({
                    title: "Attention",
                    content: msg,
                    color: "#C79121",
                    //timeout: 4000,
                    icon: "fa fa-warning swing animated"
                });
            },
        };
    });
}();
