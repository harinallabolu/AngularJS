!function () {
    var app = angular.module('eCity');


    app.directive('myDataTable', function ($timeout) {
        return function (scope, element, attrs) {

            // apply DataTable options, use defaults if none specified by user
            var options = {};
            if (attrs.myDataTable.length > 0) {
                options = scope.$eval(attrs.myDataTable);
            } else {
                options = {
                    "bStateSave": true,
                    "iCookieDuration": 2419200, /* 1 month */
                    "bJQueryUI": true,
                    "bPaginate": false,
                    "bLengthChange": false,
                    "bFilter": false,
                    "bInfo": false,
                    "bDestroy": true
                };
            }

            // Tell the dataTables plugin what columns to use
            // We can either derive them from the dom, or use setup from the controller           
            //var explicitColumns = [];
            //element.find('th').each(function (index, elem) {
            //    explicitColumns.push($(elem).text());
            //});
            //if (explicitColumns.length > 0) {
            //    options["aoColumns"] = explicitColumns;
            //}
            //else if (attrs.aoColumns) {
            //    options["aoColumns"] = scope.$eval(attrs.aoColumns);
            //}

            // aoColumnDefs is dataTables way of providing fine control over column config
            //        if (attrs.aoColumnDefs) {

            options["aoColumnDefs"] = [
            { "mDataProp": "BankName", "aTargets": [0] },
            { "mDataProp": "AccountNumber", "aTargets": [1] },
            { "mDataProp": "IBAN", "aTargets": [2] },
            { "mDataProp": "Holder", "aTargets": [3] }
            ];

            //options["aoColumns"] = [
            //                { mData: 'category', "fnRender": function (oObj) { return oObj.category } },
            //                { mData: 'name', "fnRender": function (oObj) { return oObj.name } },
            //                { mData: 'price', "fnRender": function (oObj) { return oObj.price } },
            //                 { mData: 'action', "fnRender": function (oObj) { return oObj.action } }
            //]

            //if (attrs.fnRowCallback) {
            //    options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
            //}



            var responsiveHelper_dt_basic = undefined;

            var breakpointDefinition = {
                tablet: 1024,
                phone: 480
            };

            options.autoWidth = true;
            options.preDrawCallback = function () {
                // Initialize the responsive datatables helper once.
                if (!responsiveHelper_dt_basic) {
                    responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($(element), breakpointDefinition);
                }
            };

            options.rowCallback = function (nRow) {
                responsiveHelper_dt_basic.createExpandIcon(nRow);
            };

            options.drawCallback = function (oSettings) {
                responsiveHelper_dt_basic.respond();
            };

            $timeout(function () {
                var dataTable = element.dataTable(options);

                // watch for any changes to our data, rebuild the DataTable
                scope.$watch(attrs.aaData, function (value) {
                    var val = value || null;
                    if (val) {
                        dataTable.fnClearTable();
                        dataTable.fnAddData(scope.$eval(attrs.aaData));
                    }
                });
            });
            // apply the plugin

        };
    });
}();
