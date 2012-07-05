/**************************
* Application
**************************/
GeocamResponderMaps = Em.Application.create({
	name: 'Hurricane',
	ready: function(){
		GeocamResponderMaps.MapController.showMap();
	    //document.getElementById('fileButton').addEventListener('change', GeocamResponderMaps.NewFileController.localFileSelect(), false);

	}
});

/**************************
* Models
**************************/
//User model
GeocamResponderMaps.User = Em.Object.extend({
    username: null,
    password: null,
    email: null,
});
//Map overlay metadata container that holds a refrence to the overlay
GeocamResponderMaps.MapOverlay = Em.Object.extend({
	external: false,
	externalGeoXml: '',
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
    acceptTerms: false,
    json: null,
    toString: function(){
    	return this.name;
    }
});
//The overlay library. This holds MapOverlay objects, not the overlays themselves
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



//defines the Mapset area
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set', 'overlayContainer'],
    
}).appendTo('#mapset_canvas');

//defines the library area
GeocamResponderMaps.LibraryView = Ember.View.create({
    classNames: ['library', 'overlayContainer'],
    template: Ember.Handlebars.compile('<form style="display: inline" action="#divModalDialog1" method="get"><button>New Layer</button></form>')

}).appendTo('#mapsetlib_canvas');

//within the mapset area, contains the list of elements in the map set
GeocamResponderMaps.MapSetsLib = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList'],
    content: Em.A([]),
    
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("{{content}}"),
      attributeBindings: 'draggable',
      draggable: 'true',
      doubleClick: function(){
    	  return GeocamResponderMaps.LibController.addOverlayToMapSet(this.content);
    	  
      }
    })
  }).appendTo('.library');


//within the library area, contains the list of elements in the library
GeocamResponderMaps.MapSets = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList'],
    content: Em.A([]),
    
    itemViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile('<input type="checkbox" {{action check}}>{{content}}'),
        attributeBindings: 'draggable',
        draggable: 'true',
        isChecked: false,
        check: function(){
        	this.isChecked = !this.isChecked;
        	//console.log(GeocamResponderMaps.MapSets.content.objectAt(this.contentIndex).externalCopy);
        	if(this.isChecked){
        		GeocamResponderMaps.MapController.showOverlay(GeocamResponderMaps.MapSets.content.objectAt(this.contentIndex).externalGeoXml);
        	}else{
        		GeocamResponderMaps.MapController.removeOverlay(GeocamResponderMaps.MapSets.content.objectAt(this.contentIndex).externalGeoXml);

        	}
        },
        doubleClick: function(){
        	if(this.isChecked){
        		GeocamResponderMaps.MapController.removeOverlay(GeocamResponderMaps.MapSets.content.objectAt(this.contentIndex).externalGeoXml);
        	}
        	GeocamResponderMaps.LibController.removeOverlayFromMapSet(this);	
        	
        },
        
    		
    
      })
  }).appendTo('.map_set');

//var childView= GeocamResponderMaps.MapSets.itemViewClass.get('childViews');
//childView.pushObject(Ember.Checkbox.create({	  value: true	}));


//insert url text field
GeocamResponderMaps.FileURLTextField = Em.TextField.extend({
    insertNewline: function(){
        
        
    }
});

//the barebones textfield used in the new layer form for all the metadata
GeocamResponderMaps.FormInformation = Em.TextField.extend({
    insertNewline: function(){
        
    }
});


/**************************
* Controllers
**************************/
GeocamResponderMaps.LibController = Em.ArrayController.create({
    contentLib: [],
    library: GeocamResponderMaps.Library.create({MapOverlays: []}),
    updateLibrary: function() {
    	GeocamResponderMaps.MapSetsLib.content.clear();
    	GeocamResponderMaps.MapSetsLib.content.pushObjects(this.library.MapOverlays);
    },
    addOverlayToMapSet: function(overlay) {
    	GeocamResponderMaps.MapSets.content.pushObject(overlay);
    	
    },
    showOverlay: function(that){
    	console.log("dummy function");
    },
    removeOverlayFromMapSet: function(that){
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
    externalCopy: '',
    localCopy: null,
    complete: false,
    name: '',
    type: '',
    description: '',
    coverage: '',
    creator: '',
    contributer: '',
    publisher: '',
    rights: '',
    license: '',
    permissions: '',
    acceptTerms: false,
    external: false,
    externalGeoXml: '',
   create: function(){
	   if(this.name == '')
		   alert('Name must be filled in.');
	   else if(!this.acceptTerms)
		   alert('Must accept terms of service.');
	   else{
		   if(!this.externalCopy==''){
			   this.external = true;
			   this.externalGeoXml = new GGeoXml(this.externalCopy);
		   }
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			   	external: this.external,
			   	externalGeoXml: this.externalGeoXml,
			   	externalCopy: this.externalCopy,
			    localCopy: this.localCopy,
			    complete: this.complete,
			    name: this.name,
			    type: this.type,
			    description: this.description,
			    coverage: this.coverage,
			    creator: this.creator,
			    contributer: this.contributer,
			    publisher: this.publisher,
			    rights: this.rights,
			    license: this.license,
			    permissions: this.permissions,
			    acceptTerms: this.acceptTerms
	   });
	   GeocamResponderMaps.LibController.library.add(newOverlay);
	  GeocamResponderMaps.LibController.updateLibrary();
	  this.resetValues();
	  
	  document.location.href = '#';
	   }
   },

	resetValues: function(){
		this.set('externalCopy', '');
		this.set('localCopy', null);
		this.set('complete', false);
		this.set('name', '');
	    this.set('type', '');
	    this.set('description', '');
	    this.set('coverage', '');
	    this.set('creator', '');
	    this.set('contributer', '');
	    this.set('publisher', '');
	    this.set('rights', '');
	    this.set('license', '');
	    this.set('permissions', '');
	    this.set('acceptTerms', false);
	    
	},
	localFileSelect: function(evt) {
	    var file = evt.target.fileButton; // FileList object
	    
	      var reader = new FileReader();

	      // Read in the image file as a data URL.
	     // console.log(reader.readAsDataURL(file));
	      //console.log(file);
	  }

	  
    
});

GeocamResponderMaps.MapController = Em.ArrayController.create({
    content: Em.A([]),
    map: null,
     showMap: function() {
		
		var geocoder = new GClientGeocoder();
		geocoder.setCache=null;
		var map = new GMap2(document.getElementById("map_canvas"));
		// Add controls
		map.addControl(new GLargeMapControl());
		map.addControl(new GMapTypeControl());
		
		// Default zoom level
		var zl = 1
		map.setCenter(new GLatLng(37.388163,-122.082138),zl);
		this.map = map;
		
	},
	showOverlay: function(geo){
		//var url_end = "?nocache=" + (new Date()).valueOf();
		//var server_root = "http://www.littled.net/exp/";
		//var kmlFile = server_root + "gmap.kml" + url_end;
		//geoxml = new GGeoXml(kmlFile);
		this.map.addOverlay(geo);
		//http://www.littled.net/exp/gmap.kml?nocache=1341509049207
	},
	removeOverlay: function(geo){
		this.map.removeOverlay(geo);
	}
    
});

