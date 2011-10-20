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
            var store = new Ext.data.JsonStore({ 
                root: 'root',
                fields: ["thumbnail", "full"],
                data: { root: photos.urls }
            });
            console && console.log(store);
            this.add(
              this.createBrowser(store.getAt(0), layer)
            );
        }
        
        this.add({
            xtype: "propertygrid",
            region: "center",
            boxMinHeight: 100,
            source: source
        });
    },
    
    createBrowser: function(record, layer) {
        var activeItem = record.store.indexOf(record),
            count = record.store.getCount(),
            template = new Ext.Template(this.path);
        var photos = new Ext.Panel({
            modal: true,
            region: 'north',
            height: 200,
            bodyCfg: {
                tag: "div",
                style: "text-align:center",
                children: [{
                    tag: "img",
                    src: String.format(this.path, layer, record.data.thumbnail),
                    style: "max-height: 100%; max-width: 100%"
                }]
            },
            bbar: [{
                iconCls: "x-tbar-page-prev",
                ref: "../prev",
                disabled: activeItem == 0,
                handler: function() {
                    if (activeItem > 0) {
                        activeItem -= 1;
                        photos.body.child("img").dom.src = template.apply([layer, record.store.getAt(activeItem).data.thumbnail]);
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
                        photos.body.child("img").dom.src = template.apply([layer, record.store.getAt(activeItem).data.thumbnail]);
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
        });
        return photos;
    }
    
});

/** api: xtype = app_photogrid */
Ext.reg('app_photogrid', GeoExplorer.PhotoGrid);
