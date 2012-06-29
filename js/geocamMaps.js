/**************************
* Application
**************************/
GeocamResponderMaps = Em.Application.create({
	ready: function(){
		GeocamResponderMaps.MapController.showMap();
	}
});

/**************************
* Models
**************************/

GeocamResponderMaps.User = Em.Object.extend({
    username: null,
    password: null,
    email: null,
});

GeocamResponderMaps.MapOverlay = Em.Object.extend({
    externalCopy: null,
    localCopy: null,
    complete: null,
    name: null,
    type: null,
    description: null,
    coverage: null,
    creator: null,
    contributer: null,
    publisher: null,
    rights: null,
    license: null,
    permissions: null,
    acceptTerms: null,
    json: null,
    toString: function(){
    	return this.name;
    }
});

GeocamResponderMaps.Library = Em.Object.extend({
    MapOverlays: [],
    add: function(overlay){
    	this.MapOverlays.pushObject(overlay);
    },
    remove: function(overlay){
    	//TODO
    }, 
    removeLast: function(){
    	//TODO
    },
    findOverlay: function(overlay){
    	return ;//TODO
    },
    numOfOverlays: function(){
    	return MapOverlays.length;
    }
});


/**************************
* Views
**************************/
GeocamResponderMaps.MapView = Ember.View.create({
    template: Ember.Handlebars.compile('{{GeocamResponderMaps.name}}\n')

}).appendTo('.pageTitle');

GeocamResponderMaps.MapView = Ember.View.create({
    classNames: ['map'],

}).appendTo('#map_canvas');


GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set', 'overlayContainer'],
    
}).appendTo('#mapset_canvas');


GeocamResponderMaps.LibraryView = Ember.View.create({
    classNames: ['library', 'overlayContainer'],
    template: Ember.Handlebars.compile('<form style="display: inline" action="#divModalDialog1" method="get"><button>New Layer</button></form>')
//{{action "createLayer" target="GeocamResponderMaps.LibController"}}
}).appendTo('#mapsetlib_canvas');

GeocamResponderMaps.MapSetsLib = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList'],
    content: Em.A([]),
    
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("{{content}}"),
      attributeBindings: 'draggable',
      draggable: 'true',
      doubleClick: function(){
    	  return GeocamResponderMaps.LibController.addOverlay(this.content);
    	  
      }
    })
  }).appendTo('.library');



GeocamResponderMaps.MapSets = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList'],
    content: Em.A([]),
    
    itemViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile('<input type="checkbox">{{content}}'),
        attributeBindings: 'draggable',
        draggable: 'true',
        doubleClick: function(){
        	GeocamResponderMaps.LibController.removeOverlay(this);	
        }
    
      })
  }).appendTo('.map_set');

GeocamResponderMaps.FileURLTextField = Em.TextField.extend({
    insertNewline: function(){
        ToDoApp.ListController.prepItem();
    }
});

/**************************
* Controllers
**************************/
GeocamResponderMaps.LibController = Em.ArrayController.create({
    contentLib: [],
    library: GeocamResponderMaps.Library.create({MapOverlays: []}),
    createLayer: function() {
    	var overlay = GeocamResponderMaps.MapOverlay.create({name: "Mountain View Sewer System"});
    	this.library.add(overlay);
        console.log(this.library);
        this.updateLibrary();
    },
    updateLibrary: function() {
    	GeocamResponderMaps.MapSetsLib.content.clear();
    	GeocamResponderMaps.MapSetsLib.content.pushObjects(this.library.MapOverlays);
    },
    addOverlay: function(overlay) {
    	GeocamResponderMaps.MapSets.content.pushObject(overlay);
    	console.log(overlay);
    },
    showOverlay: function(that){
    	console.log("dummy function");
    },
    removeOverlay: function(that){
    	var index = that.valueOf().contentIndex;
    	var end = GeocamResponderMaps.MapSets.get('childViews').length;
    	GeocamResponderMaps.MapSets.content.removeAt(index);
    	//updating the variable (contentIndex) that keeps track of their position
    	var childs = GeocamResponderMaps.MapSets.get('childViews');
    	for(index;index<end;index++){
    		childs.objectAt(index).valueOf().contentIndex = index;
    	}
    }
});



GeocamResponderMaps.NewFileController = Em.ArrayController.create({
    content: [],
   
    
});

GeocamResponderMaps.MapController = Em.ArrayController.create({
    content: [],
     showMap: function() {
		
		var geocoder = new GClientGeocoder();
		geocoder.setCache=null;

		// Google Maps caches KML files -- use a random query string parameter set to Date.
		var url_end = "?nocache=" + (new Date()).valueOf();
		var server_root = "http://www.littled.net/exp/";
		var kmlFile = server_root + "gmap.kml" + url_end;
			
		var map = new GMap2(document.getElementById("map_canvas"));
		// Add controls
		map.addControl(new GLargeMapControl());
		map.addControl(new GMapTypeControl());
		geoxml = new GGeoXml(kmlFile);
		map.addOverlay(geoxml);
			
		
		
		// Default zoom level
		var zl = 14;
		map.setCenter(new GLatLng(37.388163,-122.082138),zl);
		
		
	}
    
});

