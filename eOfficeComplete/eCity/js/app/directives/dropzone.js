!function () {
    angular.module('eCity')

    .directive('myDropzone', ['baseUri', 'user', function (baseUri, user) {
        return {
            scope: {
                'claimfiles': '='
            },
            link: function (scope, element, attrs) {
                myLoadScript("js/plugin/dropzone/dropzone.min.js", function () {
                    //console.log(baseUri);
                    Dropzone.autoDiscover = false;

                    //$(element).dropzone({
                    //    url: baseUri + 'api/Claims/Upload',
                    //    addRemoveLinks: true,
                    //    maxFilesize: 10, //MB
                    //    headers: {
                    //        'Authorization': 'Basic ' + user.authToken
                    //    },
                    //    dictResponseError: 'Error uploading file!',
                    //    dictDefaultMessage: 'hello',
                    //    autoProcessQueue: false
                    //    //init: function () {
                    //    //    this.on("error", function (file, message) { alert(message); });
                    //    //}
                    //});

                    //previewTemplate = $.trim($('<div/>').append('#previewTemplate').html());
                    //$('#previewTemplate').remove();

                    //var previewNode = document.querySelector("#template");
                    //previewNode.id = "";
                    //var previewTemplate = previewNode.parentNode.innerHTML;
                    //previewNode.parentNode.removeChild(previewNode);

                    var myDropzone = new Dropzone('#mydropzone', {
                        url: baseUri + 'api/Claims/Upload',
                        addRemoveLinks: true,
                        maxFilesize: 10, //MB
                        headers: {
                            'Authorization': 'Basic ' + user.authToken
                        },
                        dictResponseError: 'Error uploading file!',
                        dictDefaultMessage: 'hello',
                        autoProcessQueue: false,
                        //previewTemplate: previewTemplate,
                        //previewsContainer: "#previews", // Define the container to display the previews
                        //previewTemplate: '<div class="dz-preview dz-file-preview">'
                        //                +'<div class="dz-details">'
                        //                +'    <div class="dz-filename"><span data-dz-name></span></div>'
                        //                +'    <div class="dz-size" data-dz-size></div>'
                        //                +'    <img data-dz-thumbnail />'
                        //                +'  </div>'
                        //                 +' <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'
                        //                 +' <div class="dz-success-mark"><span></span></div>'
                        //                +'  <div class="dz-error-mark"><span></span></div>'
                        //                 + ' <div class="dz-error-message"><span data-dz-errormessage></span></div>'
                        //                 + '<div><select><option value="1">1</option><option value="2">2</option></select></div>'
                        //               + ' </div>',
                        //addedfile: function (file) {
                        //    //file.status = 'ready';
                        //    //updateForm();
                        //    //var _this = this;
                        //    //file.template = $(tpl.render());
                        //    //$(this.previewsContainer).append(file.template);
                        //    //file.template.find('.filename span').text(file.name);
                        //    //file.template.find('#filename').html(file.name);
                        //    //file.template.find('.btn-delete').on('click', function () {
                        //    //    $.when(deleteFileTemplate(file)).then(_this.removeFile(file));
                        //    //});
                        //    //return file.template.find('#filesize').html(this.filesize(file.size));
                        //},
                        //previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n <input type=\"text\" data-dz-doc-expiration-date class=\"dz-doc-input\" />\n <select class=\"dz-doc-input\" data-dz-doc-document-type-id  ></select>\n   <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>",
                        //previewsContainer: '#previewTemplate',

                        //previewTemplate: previewTemplate,


                        //init: function () {
                        //    this.on("error", function (file, message) { alert(message); });
                        //}
                    });

                    //myDropzone.on("addedfile", function (file) {
                    //    // Hookup the start button
                    //    //file.previewElement.querySelector(".start").onclick = function () { myDropzone.enqueueFile(file); };
                    //    var t = '"<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n <input type=\"text\" data-dz-doc-expiration-date class=\"dz-doc-input\" />\n <select class=\"dz-doc-input\" data-dz-doc-document-type-id  ></select>\n   <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>"';
                    //    file.template = $(t);
                    //    $(this.previewsContainer).append(file.template)
                    //});

                    //scope.getClaimFiles = function () {
                    //    return window.myDropzone.getQueuedFiles();
                    //};

                    scope.claimfiles.getall = function () {
                        return window.myDropzone.getQueuedFiles();
                    }


                    //var myDropzone = new Dropzone(element);
                });
            }
        };
    }]);
}();
