/*
 *  Project:        AvocodeFormExtensionsBundle
 *  Description:    jQuery plugin for Upload collection
 *  Author:         loostro <loostro@gmail.com>
 *  License:        MIT
 */
// Extend fileupload plugin
$.widget('blueimp.fileupload', $.blueimp.fileupload, {
    options: {
        trans: {
            maxNumFiles:        'Maximum number of files exceeded',
            typeNotAllowed:     'File type not allowed',
            maxFileSize:        'File is too big',
            minFileSize:        'File is too small',
            confirmBatchDelete: 'Are you sure you want to delete all selected elements?'
        },
    },
    _hasError: function (file) {
        if (file.error) {
            return file.error;
        }
        if (this.options.maxNumberOfFiles < 0) {
            return this.options.trans.maxNumFiles;
        }
        if (!(this.options.acceptFileTypes.test(file.type) ||
                this.options.acceptFileTypes.test(file.name))) {
            return this.options.trans.typeNotAllowed;
        }
        if (this.options.maxFileSize &&
                file.size > this.options.maxFileSize) {
            return this.options.trans.maxFileSize;
        }
        if (typeof file.size === 'number' &&
                file.size < this.options.minFileSize) {
            return this.options.trans.minFileSize;
        }
        return null;
    },
    _initButtonBarEventHandlers: function () {
        var that = this;
        var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
            filesList = this.options.filesContainer;
        this._on(fileUploadButtonBar.find('.start'), {
            click: function (e) {
                e.preventDefault();
                filesList.find('.start button').click();
            }
        });
        this._on(fileUploadButtonBar.find('.cancel'), {
            click: function (e) {
                e.preventDefault();
                filesList.find('.cancel button').click();
            }
        });
        this._on(fileUploadButtonBar.find('.delete'), {
            click: function (e) {
                e.preventDefault();
                if(confirm(that.options.trans.confirmBatchDelete)) {
                    filesList.find('.delete input:checked')
                        .parent().siblings('button').click();
                    fileUploadButtonBar.find('.toggle')
                        .prop('checked', false);
                }
            }
        });
        this._on(fileUploadButtonBar.find('.toggle'), {
            change: function (e) {
                filesList.find('.delete input').prop(
                    'checked',
                    $(e.currentTarget).is(':checked')
                );
            }
        });
    },
});
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, undefined ) {
    
    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.
    
    // window is passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'uploadCollection',
        document = window.document,
        defaults = {
            sortable:         false,
            sortable_field:   'position',
            trans: {
                maxNumFiles:        'Maximum number of files exceeded',
                typeNotAllowed:     'File type not allowed',
                maxFileSize:        'File is too big',
                minFileSize:        'File is too small',
                confirmBatchDelete: 'Are you sure you want to delete all selected elements?'
            },
            javascript: function(id) {}
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this._init();
    }
    
    Plugin.prototype = {

        _init: function() {
            // Plugin-scope helper
            var that = this;
            
            // Define global variables
            this.$element = $(this.element);
            this.$widgetContainer = $('#' + this.element.id + '_widget_container');
            this.$filesContainer = $('#' + this.element.id + '_files_list');
            
            // Init fileupload
            this.$widgetContainer.fileupload({
                trans:              this.options.trans,
                fileInput:          this.$element,
                replaceFileInput:   false,
                uploadTemplateId:   this.element.id + '_upload_template',
                downloadTemplateId: this.element.id + '_download_template',
                filesContainer:     this.$filesContainer,
                dropZone:           this.$widgetContainer,
                pasteZone:          this.$widgetContainer,
                destroy: function (e, data) {
                    var that = $(this).data('fileupload');
                    that._adjustMaxNumberOfFiles(1);
                    that._transition(data.context).done(
                        function () {
                            $(this).remove();
                            that._trigger('destroyed', e, data);
                        }
                    );
                },
                maxNumberOfFiles:         this.options.maxNumberOfFiles,
                maxFileSize:              this.options.maxFileSize,
                minFileSize:              this.options.minFileSize,
                acceptFileTypes:          this.options.acceptFileTypes,
                previewAsCanvas:          this.options.previewAsCanvas,
                prependFiles:             this.options.prependFiles,
                previewSourceFileTypes:   this.options.previewSourceFileTypes,
                previewSourceMaxFileSize: this.options.previewSourceMaxFileSize,
                previewMaxWidth:          this.options.previewMaxWidth,
                previewMaxHeight:         this.options.previewMaxHeight,
            });
            
            // Init sortable
            if (this.options.sortable) {
                $('#' + this.element.id + '_files_list').sortable({
                    helper: function(e, tr) {
                        // lock cell widths
                        tr.children().each(function() {
                            $(this).css('width', $(this).width());
                        });
                        return tr;
                    },
                    cancel: "a, button, img, input, textarea, select",
                    items: "> tr.template-download",
                    update: function(e, ui) {
                        // unlock cell widths
                        ui.item.children().each(function() {
                            $(this).css('width', '');
                        });
                        // update sortable positions
                        $('[id^="' + this.element.id + '"][id$="' + this.options.sortable_field + '"]').each(function(i){
                            $(this).val(i);
                        });
                    }
                });
            }
        },
        
        loadFiles: function(files) {
            this.$widgetContainer.fileupload('option', 'done').call(this.$widgetContainer, null, {result: files});
        }
        
    };

    // You don't need to change something below:
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
    $.fn[pluginName] = function ( options ) {
        var args = arguments;

        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };

}(jQuery, window));
