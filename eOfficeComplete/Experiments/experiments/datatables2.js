angular.module('tableExample', [])

.directive('myTable', function ($timeout) {
    return function (scope, element, attrs) {

        // apply DataTable options, use defaults if none specified by user
        var options = {};
        if (attrs.myTable.length > 0) {
            options = scope.$eval(attrs.myTable);
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
  
        options["aoColumnDefs"] =  [
        { "mDataProp": "category", "aTargets": [0] },
        { "mDataProp": "name", "aTargets": [1] },
        { "mDataProp": "price", "aTargets": [2] },
        { "mDataProp": "action", "aTargets": [3] }
            ];
        
        //options["aoColumns"] = [
        //                { mData: 'category', "fnRender": function (oObj) { return oObj.category } },
        //                { mData: 'name', "fnRender": function (oObj) { return oObj.name } },
        //                { mData: 'price', "fnRender": function (oObj) { return oObj.price } },
        //                 { mData: 'action', "fnRender": function (oObj) { return oObj.action } }
        //]

        if (attrs.fnRowCallback) {
            options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
        }



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
})

.controller('Ctrl', function ($scope) {

    $scope.message = '';

    $scope.myCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $('td:eq(2)', nRow).bind('click', function () {
            $scope.$apply(function () {
                $scope.someClickHandler(aData);
            });
        });
        return nRow;
    };

    $scope.someClickHandler = function (info) {
        $scope.message = 'clicked: ' + info.price;
    };

    $scope.columnDefs = [
        { "mDataProp": "category", "aTargets": [0] },
        { "mDataProp": "name", "aTargets": [1] },
        { "mDataProp": "price", "aTargets": [2] },
        { "mDataProp": "action", "aTargets": [3] }
    ];

    $scope.overrideOptions = {
        "bStateSave": true,
        "iCookieDuration": 2419200, /* 1 month */
        "bJQueryUI": true,
        "bPaginate": true,
        "bLengthChange": false,
        "bFilter": true,
        "bInfo": true,
        "bDestroy": true
    };


    $scope.sampleProductCategories = [
        //["1948 Porsche 356-A Roadster", 53.9, "Classic Cars", "x"]
          {
              "name": "1948 Porsche 356-A Roadster",
              "price": 53.9,
              "category": "Classic Cars",
              "action": "x"
          },
          {
              "name": "1948 Porsche Type 356 Roadster",
              "price": 62.16,
              "category": "Classic Cars",
              "action": "x"
          },
          {
              "name": "1949 Jaguar XK 120",
              "price": 47.25,
              "category": "Classic Cars",
              "action": "x"
          }
          ,
          {
              "name": "1936 Harley Davidson El Knucklehead",
              "price": 24.23,
              "category": "Motorcycles",
              "action": "x"
          },
          {
              "name": "1957 Vespa GS150",
              "price": 32.95,
              "category": "Motorcycles",
              "action": "x"
          },
          {
              "name": "1960 BSA Gold Star DBD34",
              "price": 37.32,
              "category": "Motorcycles",
              "action": "x"
          }
       ,
          {
              "name": "1900s Vintage Bi-Plane",
              "price": 34.25,
              "category": "Planes",
              "action": "x"
          },
          {
              "name": "1900s Vintage Tri-Plane",
              "price": 36.23,
              "category": "Planes",
              "action": "x"
          },
          {
              "name": "1928 British Royal Navy Airplane",
              "price": 66.74,
              "category": "Planes",
              "action": "x"
          },
          {
              "name": "1980s Black Hawk Helicopter",
              "price": 77.27,
              "category": "Planes",
              "action": "x"
          },
          {
              "name": "ATA: B757-300",
              "price": 59.33,
              "category": "Planes",
              "action": "x"
          }

    ];

});