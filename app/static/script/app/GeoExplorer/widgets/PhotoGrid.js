/**
 * Copyright (c) 2008-2011 The Open Planning Project
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = PhotoPopup
 *  base_link = `GeoExt.Popup <http://geoext.org/lib/GeoExt/widgets/Popup.html>`_
 */
Ext.namespace("GeoExplorer");

/** api: constructor
 *  .. class:: PhotoGrid(config)
 */
GeoExplorer.PhotoGrid = Ext.extend(Ext.Panel, {
    
    /** api: config[source]
     *  ``Object`` Source for the PropertyGrid. Will also be scanned for photo
     *  links.
     */
    
    /** api: config[path]
     *  ``String`` The path template for images. "{0}" in the template will
     *  be replaced with the layer name (without namespace prefix), and "{1}"
     *  with the file name. Default is "/site_media/photo_layers/{0}/{1}"
     */
    path: "/site_media/photo_layers/{0}/{1}",
    
    /** api: config[imageFieldRegExp]
     *  ``RegExp`` Regular expression for finding field names that contain
     *  an image file name. Default is /IMAGE/.
     */
    imageFieldRegExp: /IMAGE/,
    
    /** api: config[thumbnailReplaceArgs]
     *  ``Array`` The arguments to the ``replace()`` function applied on the
     *  file name to get the file name for the respective thumbnail. Set to
     *  null if no thumbnails are available. Default is
     *  [(/\.(.*)$/), ".thumbnail.$1"], replacing e.g. "foo.jpg" to
     *  "foo.thumbnail.jpg".
     */
    thumbnailReplaceArgs: [(/\.(.*)$/), ".thumbnail.$1"],
    
    constructor: function(config) {
        config.layout = "border";
        GeoExplorer.PhotoGrid.superclass.constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        GeoExplorer.PhotoGrid.superclass.initComponent.apply(this, arguments);

        var source = this.source, photos = {urls: []}, propertyGrid,
            layer = this.title.split(".")[0];
        for (var p in source) {
            if (source.hasOwnProperty(p) && this.imageFieldRegExp.test(p) && source[p] != null) {
                photos.urls.push({
                    id: p,
                    thumbnail: this.thumbnailReplaceArgs ?
                        source[p].replace.apply(source[p], this.thumbnailReplaceArgs) :
                        source [p],
                    full: source[p]
                });
                delete source[p];
            }
        }
        
        if (photos.urls.length > 0) {
            this.add({
                xtype: "container",
                region: "north",
                height: 86,
                flex: 1,
                layout: "fit",
                cls: "images",
                items: [{
                    xtype: "dataview",
                    itemSelector: 'div.thumb-wrap',
                    style: 'overflow:auto',
                    singleSelect: true,
                    overClass: "x-view-selected",
                    store: new Ext.data.JsonStore({
                        data: photos,
                        autoLoad: true,
                        root: 'urls',
                        id: 'id',
                        fields:[
                            'id', 'thumbnail', 'full'
                        ]
                    }),
                    tpl: new Ext.XTemplate(
                        '<tpl for=".">',
                        '<div class="thumb-wrap" id="{id}">',
                        '<div class="thumb"><img src="',
                        String.format(this.path, layer, "{thumbnail}"),
                        '" class="thumb-img"></div>',
                        '</div>',
                        '</tpl>'
                    ),
                    listeners: {
                        selectionchange: function(view, selections) {
                            this.showFull(view.store.getById(selections[0].id), layer);
                        },
                        scope: this
                    }
                }]
            });
        }
        
        this.add({
            xtype: "propertygrid",
            region: "center",
            source: source
        });
    },
    
    showFull: function(record, layer) {
        var activeItem = record.store.indexOf(record),
            count = record.store.getCount(),
            template = new Ext.Template(this.path);
        var photos = new Ext.Window({
            title: "Photos",
            modal: true,
            maximizable: true,
            width: 400,
            bodyCfg: {
                tag: "img",
                src: String.format(this.path, layer, record.data.full),
                style: "text-align:center"
            },
            bbar: [{
                iconCls: "x-tbar-page-prev",
                ref: "../prev",
                disabled: activeItem == 0,
                handler: function() {
                    if (activeItem > 0) {
                        activeItem -= 1;
                        photos.body.dom.src = template.apply([layer, record.store.getAt(activeItem).data.full]);
                        photos.current.setText((activeItem + 1) + " / " + count);
                    }
                    if (activeItem == 0) {
                        this.disable();
                    }
                    if (activeItem < count - 1) {
                        photos.next.enable();
                    }
                }
            }, {
                xtype: "tbtext",
                ref: "../current",
                text: (activeItem + 1) + " / " + count
            }, {
                iconCls: "x-tbar-page-next",
                ref: "../next",
                disabled: activeItem == count - 1,
                handler: function() {
                    if (activeItem < count - 1) {
                        activeItem += 1;
                        photos.body.dom.src = template.apply([layer, record.store.getAt(activeItem).data.full]);
                        photos.current.setText((activeItem + 1) + " / " + count);
                        if (activeItem == count - 1) {
                            this.disable();
                        }
                        if (activeItem > 0) {
                            photos.prev.enable();
                        }
                    }
                }
            }]
        }).show();
    }
    
});

/** api: xtype = app_photogrid */
Ext.reg('app_photogrid', GeoExplorer.PhotoGrid);
