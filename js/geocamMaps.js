/**************************
* Application
**************************/
GeocamResponderMaps = Em.Application.create({
	name: 'Hurricane',
	ready: function(){
		GeocamResponderMaps.MapController.showMap();
	    //document.getElementById('fileUploadButton').addEventListener('change', GeocamResponderMaps.NewFileController.localFileSelect(), false);
	    GeocamResponderMaps.LibController.emptyMapSet();
	},
	cancel: function(event) {
        event.preventDefault();
        return false;
    },

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
    template: Ember.Handlebars.compile('<button>Undo</button><button>Redo</button><button>Save</button>')
    
}).appendTo('#mapset_canvas');

//defines the library area
GeocamResponderMaps.LibraryView = Ember.View.create({
    classNames: ['library', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button {{action "modalWinUrl" target="GeocamResponderMaps.NewFileController"}}>New Layer</button>')

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
      
      dragStart: function(event) {
    	  
          var dataTransfer = event.originalEvent.dataTransfer;
          dataTransfer.setData('index', this.get('contentIndex'));
          dataTransfer.setData('origin', 'lib');
      }
    })
  }).appendTo('.library');


//within the library area, contains the list of elements in the library
GeocamResponderMaps.MapSets = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList', 'mapsetdiv'],
    content: Em.A([]),
    //container for each list item
    itemViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile(
'<input type="checkbox" {{action toggleOverlay}}>{{content}}<img src="icons/delete.png" {{action remove}}/><img src="icons/Edit.ico" {{action edit}}/>'),
        attributeBindings: 'draggable',
        draggable: 'true',
        isChecked: false,
        
        toggleOverlay: function(){
        	this.isChecked = !this.isChecked;
        	GeocamResponderMaps.LibController.displayOverlay(this.isChecked, this);
        },
        edit: function(){
        	this.template = Em.Handlebars.compile('GeocamResponderMaps.FormInformation');
        	GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')).set('name', 'I was changed');
        	console.log(GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')).get('name'));
        	this.refresh();
        },
        dragEnter: GeocamResponderMaps.cancel,
        dragOver: GeocamResponderMaps.cancel,
        dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('index', this.get('contentIndex'));
            dataTransfer.setData('origin', 'set');
        },
        drop: function(event) {
            var indexFrom = event.originalEvent.dataTransfer.getData('index');width: 14; height: 16; 
            var origin = event.originalEvent.dataTransfer.getData('origin');
            var indexTo = GeocamResponderMaps.MapSets.content.indexOf(this.get('content'));
            var obj; 
            if(origin=='set')
            	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
            else
            	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom);
            if(GeocamResponderMaps.MapSets.content.indexOf(obj)>=0){
            	GeocamResponderMaps.MapSets.content.removeAt(GeocamResponderMaps.MapSets.content.indexOf(obj));
            	
            }
            GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
            GeocamResponderMaps.LibController.emptyMapSet();
            GeocamResponderMaps.LibController.updateContentIndices(indexTo);
            event.preventDefault();
            
            return false;
        },
        refresh: function(){
        	var index = this.get('contentIndex');
        	var obj = GeocamResponderMaps.MapSets.content.objectAt(index);
        	GeocamResponderMaps.MapSets.content.removeAt(index);
        	GeocamResponderMaps.MapSets.content.insertAt(index, obj);
        	//GeocamResponderMaps.LibController.updateContentIndices(index);
        },
        remove: function(){
        	if(this.isChecked)
        		this.toggleOverlay();
        	GeocamResponderMaps.LibController.removeOverlayFromMapSet(this);
        	GeocamResponderMaps.LibController.updateContentIndices(this.get('ContentIndex'));
        	GeocamResponderMaps.LibController.emptyMapSet();
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

GeocamResponderMaps.DropHere = Ember.View.create({
    classNames: ['DropHere'],
    template: Ember.Handlebars.compile('<h3>Drop Here</h3>'),
    attributeBindings: 'draggable',
    dragEnter: GeocamResponderMaps.cancel,
    dragOver: GeocamResponderMaps.cancel,
    drop: function(event){
    	console.log('hello');
    	var indexFrom = event.originalEvent.dataTransfer.getData('index');width: 14; height: 16; 
        var origin = event.originalEvent.dataTransfer.getData('origin');
        var indexTo = 0;
        var obj; 
        if(origin=='set')
        	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
        else
        	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom);
        if(GeocamResponderMaps.MapSets.content.indexOf(obj)>=0){
        	GeocamResponderMaps.MapSets.content.removeAt(GeocamResponderMaps.MapSets.content.indexOf(obj));
        	
        }
        GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
        GeocamResponderMaps.LibController.emptyMapSet();
        GeocamResponderMaps.LibController.updateContentIndices(indexTo);
        event.preventDefault();
    	
    }
    
}).appendTo('.mapsetdiv');


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
    undoStackG: [],
    undoStackIndexG: -1,
    UNDO_STACK_MAX_SIZE: 50,
    dropSpot: GeocamResponderMaps.MapOverlay.create({name: 'DROP HERE'}),
    library: GeocamResponderMaps.Library.create({MapOverlays: []}),
    updateLibrary: function() {
    	GeocamResponderMaps.MapSetsLib.content.clear();
    	GeocamResponderMaps.MapSetsLib.content.pushObjects(this.library.MapOverlays);
    },
    emptyMapSet: function() {
    	console.log('hey');
    	if(GeocamResponderMaps.MapSets.content.length==0){
    		GeocamResponderMaps.DropHere.replaceIn('.mapsetdiv');
    		GeocamResponderMaps.DropHere.rerender();
    		
    	}

    },
    updateContentIndices: function(index){
    	var childs = GeocamResponderMaps.MapSets.get('childViews');
        for(index=index+1;index<GeocamResponderMaps.MapSets.content.length;index++){
        	childs.objectAt(index).set('contentIndex', index);
        }
    },
    showOverlay: function(that){
    	console.log("dummy function");
    },
    removeOverlayFromMapSet: function(that){
    	var index = GeocamResponderMaps.MapSets.content.indexOf(that.get('content'));
    	GeocamResponderMaps.MapSets.content.removeAt(index);
        this.emptyMapSet();
    	
    },
    displayOverlay: function(isChecked, that){
    	var overlay;
    	if(GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).external){
    		overlay = GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).externalGeoXml;
    		console.log('external true');
    	}
    	else{
    		//this is a default until I get it working
    		var url_end = "?nocache=" + (new Date()).valueOf();
    		var server_root = "http://www.littled.net/exp/";
    		var kmlFile = server_root + "gmap.kml" + url_end;
    		overlay = new GGeoXml(kmlFile);
    		//TODO
    		console.log('external false');
    		console.log(GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).external);
    		console.log(GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).externalCopy);
    	}
    	if(isChecked){
    		GeocamResponderMaps.MapController.showOverlay(overlay);
    	}else{
    		GeocamResponderMaps.MapController.removeOverlay(overlay);

    	}
    },
    
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
	   if(this.name == ''){
		   alert('Name must be filled in.');
		   return false;
	   }
	   else if(!this.acceptTerms){
		   alert('Must accept terms of service.');
		   return false;
	   }
	   else{
		   if(!this.externalCopy==''){
			   this.external = true;
			   this.externalGeoXml = new GGeoXml(this.externalCopy);
			   console.log('true');
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
	  return true;
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
	    this.set('external', false);
	    this.set('externalGeoXml', '');
	    document.getElementById('fileUploadButton').value='';
	},
	localFileSelect: function() {
	    var file = document.getElementById("fileUploadButton").files[0]; // FileList object
	    var type = "application/vnd.google-earth.kml+xml";
	    if(!type==file.type){
	    	alert("Please choose a kml file");
	    	document.getElementById('fileUploadButton').value='';
	    	return ;
	    }
	      var reader = new FileReader();
	      localCopy = file;
	      
	      
	  },
	  modalWinUrl: function() {
		  $( "#divModalDialogUrl" ).dialog({ closeText: '', closeOnEscape: false});
		  $( "#divModalDialogUpload" ).dialog('close');
		  $( "#divModalDialogForm" ).dialog('close');
	  },
	  modalWinUpload: function() {
		  $( "#divModalDialogUpload" ).dialog({ closeText: '', closeOnEscape: false});
		  $( "#divModalDialogUrl" ).dialog('close');
		  $( "#divModalDialogForm" ).dialog('close');
	  },
	  modalWinForm: function() {
		  $( "#divModalDialogForm" ).dialog({ closeText: '', closeOnEscape: false });
		  $( "#divModalDialogUrl" ).dialog('close');
		  $( "#divModalDialogUpload" ).dialog('close');
	  },
	  modalWinClose: function() {
		  $( "#divModalDialogForm" ).dialog('destroy');
		  $( "#divModalDialogUrl" ).dialog('destroy');
		  $( "#divModalDialogUpload" ).dialog('destroy');
		  this.resetValues();
	  },
	  modalWinCloseAndCreate: function() {
		  if(this.create()){
		  $( "#divModalDialogForm" ).dialog('destroy');
		  $( "#divModalDialogUrl" ).dialog('destroy');
		  $( "#divModalDialogUpload" ).dialog('destroy');
		  }
		  
	  },

	  
    
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
		//https://developers.google.com/kml/documentation/KML_Samples.kml
		//http://www.skisprungschanzen.com/EN/Ski+Jumps/USA-United+States/CA-California.kml
		//http://faculty.cs.wit.edu/~ldeligia/PROJECTS/TCP/StatesPolys/California.kml
		//http://cordc.ucsd.edu/projects/asbs/asbs_locations.kml
		//http://www.coolworks.com/listings/placemarks/california.kml
		//http://www.ca.gov/kml/CSU.kml
	},
	removeOverlay: function(geo){
		this.map.removeOverlay(geo);
	}
    
});



