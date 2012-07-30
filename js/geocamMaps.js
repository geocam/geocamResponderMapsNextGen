/**************************
* Application
**************************/

/*
 * This is the main application where you would put any global variables.
 * You can also insert anything you want done at the start of the session inside the ready function.
 */
GeocamResponderMaps = Em.Application.create({
	//
	mapSetName: 'Untitled',
	HOST: 'http://'+window.location.host+'/',
	ready: function(){
		GeocamResponderMaps.MapController.showMap();
		$.get(GeocamResponderMaps.HOST+'api/layers/', function(data){
			GeocamResponderMaps.NewFileController.load(data);
			GeocamResponderMaps.LibController.setEmptyMapset();
    	});
		
	},
	cancel: function(event) {
        event.preventDefault();
        return false;
    },
    

});

/**************************
* Models
**************************/
/*
 * User model
 */
GeocamResponderMaps.User = Em.Object.extend({
    username: null,
    password: null,
    email: null,
});
/*
 * Map overlay metadata container that is used in the library
 */
GeocamResponderMaps.MapOverlay = Em.Object.extend({
	//external: false,
	externalGeoXml: '',
    externalUrl: null,
    localCopy: null,
    complete: null,
    name: null,
    type: null,
    description: null,
    coverage: null,
    creator: null,
    contributors: null,
    publisher: null,
    rights: null,
    license: null,
    morePermissions: null,
    acceptTerms: false,
    json: null,
    toString: function(){
    	return this.name;
    },
 // ember objects cannot be stringified because they are circular. This creates a non-circular version of the object.
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                if (Ember.typeOf(v) === 'object')
                	continue;
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
    //returns a deep copy of this object
    copy: function(){
    	var newOverlay = GeocamResponderMaps.MapOverlay.create({
    		//external: this.external,
		   	externalGeoXml: this.externalGeoXml,
		   	externalUrl: this.externalUrl,
		    localCopy: this.localCopy,
		    complete: this.complete,
		    name: this.name,
		    type: this.type,
		    description: this.description,
		    coverage: this.coverage,
		    creator: this.creator,
		    contributors: this.contributors,
		    publisher: this.publisher,
		    rights: this.rights,
		    license: this.license,
		    morePermissions: this.morePermissions,
		    acceptTerms: this.acceptTerms,
    	});
    	return newOverlay;
    },
    //returns a mapSetOverlay of this object
    toMapSetOverlay: function(){
    	var newOverlay = GeocamResponderMaps.MapSetOverlay.create({
		   	externalGeoXml: this.externalGeoXml,
		   	url: this.externalUrl,
		    name: this.name,
		    type: this.type,
    	});
    	return newOverlay;
    },
});

/*
 * Overlay container for modified for the MapSet
 */
GeocamResponderMaps.MapSetOverlay = Em.Object.extend({
	externalGeoXml: '',
    url: '',
    name: '',
    type: '',
    json: '',
    toString: function(){
    	return this.name;
    },
 // ember objects cannot be stringified because they are circular. This creates a non-circular version of the object.
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                if (Ember.typeOf(v) === 'object')
                	continue;
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
    compare: function(overlay){
    	//TODO not sure if needed
    }, 
    // returns a deep copy of self
    copy: function(){
    	var newOverlay = GeocamResponderMaps.MapSetOverlay.create({
		   	externalGeoXml: this.externalGeoXml,
		   	url: this.url,
		    name: this.name,
		    type: this.type,
    	});
    	return newOverlay;
    },
});


/*
 * The overlay library. This holds MapOverlay objects, not the overlays themselves
 */
GeocamResponderMaps.Library = Em.Object.extend({
    MapOverlays: Em.A([]),
    add: function(overlay){
    	this.MapOverlays.insertAt(0, overlay);
    },
    remove: function(overlayIndex){
    	this.MapOverlays.removeAt(overlayIndex);
    },
    findOverlay: function(overlayUrl){
    	for(var i = 0; i<this.MapOverlays.length; i++){
    		if(this.MapOverlays.objectAt(i).externalUrl == overlayUrl)
    			return i;
    	}
    	return -1;
    },
    numOfOverlays: function(){
    	return MapOverlays.length;
    },
    sort: function(){//change this to however the library should be sorted. Currently most recent first
    	var lastIndex = this.MapOverlays.length-1;
    	var temp;
    	for(var i = 0;i<lastIndex;i++){
    		temp = this.MapOverlays.shiftObject();
    		this.MapOverlays.insertAt(lastIndex-i, temp);
    	}
    }
});
//not yet used TODO
GeocamResponderMaps.MapSet = Em.Object.extend({
    name: '',
    type: '',
    url: '',
    mapsetjson: '',	
    extensions: null,
    children: [],
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
});


/**************************
* Views
**************************/


/*
 * Displays the name of the mapset. This name is stored in GeocamResponderMaps.mapSetName. When a map set is saved this name overwrites the mapsets name.
 */
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['nameContainer'],
    template: Ember.Handlebars.compile('{{#if isEditing}}\
							    		{{view Ember.TextField class="editing" placeholderBinding="GeocamResponderMaps.mapSetName" valueBinding="change"}}\
							    		{{else}}\
							    		{{GeocamResponderMaps.mapSetName}}\
							    		{{/if}}'),
	isEditing: false,
	change: '',
	doubleClick: function(){
    	this.set('isEditing', !this.isEditing);
    	if(!this.isEditing){
    		if(this.change != ''){
    			GeocamResponderMaps.set('mapSetName', this.change); 
				this.set('change','');
    		}
		   }
	}
    
}).appendTo('#mapSetName');	

/*
 * defines the Mapset area 
 */
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button id="undo" {{action "undo" target="GeocamResponderMaps.LibController"}}>Undo</button><button id="redo" {{action "redo" target="GeocamResponderMaps.LibController"}}>Redo</button><button id="save" {{action "save" target="GeocamResponderMaps.LibController"}} >Save</button><button id="load" {{action "load" target="GeocamResponderMaps.LibController"}} >Load</button><button id="load" {{action "dev" target="GeocamResponderMaps.LibController"}} >Dev Button</button>')
    
}).appendTo('#mapset_canvas');

/*
 * holds the mapset items and the 'drop here' box. This is the container in which the scrollbar appears when there is an overflow.
 */
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set_bottom',],

    
}).appendTo('.map_set');

/*
 * defines the library area
 */
GeocamResponderMaps.LibraryView = Ember.View.create({
    classNames: ['library', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button {{action "modalWinUrl" target="GeocamResponderMaps.NewFileController"}}>New Layer</button>{{view GeocamResponderMaps.FormInformation placeholder="Search" valueBinding=""}}')

}).appendTo('#mapsetlib_canvas');
/*
 * within the mapset area, contains the list of elements in the map set
 */
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

/*
 * within the library area, contains the list of elements in the library
 */
GeocamResponderMaps.MapSets = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList', 'mapsetdiv'],
    content: Em.A([]),
    /*
     * representation of each list item. There is one list item for each item in content, but they are not the same object.
     */
    itemViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile(//isEditing switches this template between editing mode
        '<span>{{view Ember.Checkbox checkedBinding="isChecked" }}</span>\
        		{{#if isEditing}}\
        		  	{{view Ember.TextField class="editing" placeholderBinding="alias" valueBinding="change"}}\
    				<img src="icons/cancel.png" {{action cancelEdit}}/>\
    				<img src="icons/save.png" {{action edit}}/>\
        		{{else}}\
        			<div id="alias">{{alias}}</div>\
        			<img src="icons/delete.png" {{action removeAndAddToUndo}}/>\
        			<img src="icons/Edit.ico" {{action edit}}/>\
        			<br class="clearBoth" />\
        		{{/if}}	'
        ),
        
        attributeBindings: ['draggable', 'style'],
        draggable: 'true',
        isChecked: false,
        isEditing: false,
        style: '', //creates the orange border when moving items around
        alias: '', 
        lastAlias: '',
        change: '', 
        /*
         * keeps track of the edit checkbox state
         */
        _isCheckedChanged: function(){
            var isChecked = this.get('isChecked');
            GeocamResponderMaps.LibController.displayOverlay(isChecked, this);
        }.observes('isChecked'),
        /*
         * updates the name of the item every time the alias is changed. this is done this way instead of through the item name directly because 
         * handlebars does not allow extensive logic in the html, which would be necessary 
         */
        _aliasChanged: function(){
            var alias = this.get('alias');
            GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')).name = alias;
          
        }.observes('alias'),
        //this is called whenever the edit/save button is pressed to change the items name
        edit: function(){
        	this.set('isEditing', !this.isEditing);
        	if(this.isEditing){
        		this.set('lastAlias', this.alias);
        	} else{
        		if(this.change != ''){
        			this.set('alias', this.change); 
					this.set('change','');
        		}
			   }
        },
        //this clears any change that would have been named
        cancelEdit: function(){
        	this.set('isEditing', !this.isEditing);
        	this.set('alias', this.lastAlias);
        	this.set('change','');
        },
        dragEnter: function(event){
        this.set('style', "border-top: 5px solid #CD3700");
        event.preventDefault();
    	},
    	dragLeave: function(event){
    		this.set('style', "");
            event.preventDefault();
    	},
    	//this does the same thing as dragEnter
        dragOver: function(event){
            this.set('style', "border-top: 5px solid #CD3700");
            event.preventDefault();
        	},
        //where the item is being dragged from and its index is stored in the dataTransfer object
        dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('index', this.get('contentIndex'));
            dataTransfer.setData('origin', 'set');
        },
        /*
         * This is an add/move method for each list item. when an item is added, the item takes the index of whatever item it was dropped on.
         * This method is slightly different from the 'drop here' box's drop method.
         */
        drop: function(event) {
            var indexFrom = parseInt(event.originalEvent.dataTransfer.getData('index'));
            var origin = event.originalEvent.dataTransfer.getData('origin'); //checks if you are bringing an overlay from the library or moving an item around in the mapSet
            var indexTo = GeocamResponderMaps.MapSets.content.indexOf(this.get('content'));
            var obj;
            var checked = false; //this allows me to keep track of the checked state through moving items 
            this.set('style', "");
            //if the overlay came from the mapset, save the object and remove it from the array. also adds it to the undo stack as a move
            if(origin=='set'){
            	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
            	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
            	GeocamResponderMaps.LibController.addToUndoStack('m'+indexTo+'-'+indexFrom, '');
            	GeocamResponderMaps.MapSets.content.removeAt(indexFrom);
            }
            else{ //else (if the item came from the library) copy the item from the library and add it to the undo stack
            	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).toMapSetOverlay();
            	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
            }
            
            
            
            GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
            GeocamResponderMaps.LibController.updateContentIndices(indexTo);
            
            var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
            that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
            that.set('isChecked', checked);

            event.preventDefault(); //this cancels the default drop method
           
            return false;
        },
        removeAndAddToUndo: function(){
        	GeocamResponderMaps.LibController.addToUndoStack('r'+this.get('contentIndex'), GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')));
        	this.remove();
        },
        remove: function(){
        	if(this.isChecked)
        		this.set('isChecked', false);
        	GeocamResponderMaps.LibController.removeOverlayFromMapSet(this);
        	GeocamResponderMaps.LibController.updateContentIndices(this.get('ContentIndex'));
        	
        },
        
        
    		
    
      })
  }).appendTo('.map_set_bottom');


//insert url text field
GeocamResponderMaps.FileURLTextField = Em.TextField.extend({
    insertNewline: function(){
        
        
    }
});

GeocamResponderMaps.DropHere = Ember.View.create({
    classNames: ['DropHere'],
    attributeBindings: ['display'],
    template: Ember.Handlebars.compile('<h3>Drop Here</h3>'),
    dragEnter: GeocamResponderMaps.cancel,
    dragOver: GeocamResponderMaps.cancel,
    drop: function(event){
    	
    	var indexFrom = parseInt(event.originalEvent.dataTransfer.getData('index'));
        var origin = event.originalEvent.dataTransfer.getData('origin');
        var indexTo =  GeocamResponderMaps.MapSets.content.length;
        var obj;
        var checked = false;
        if(origin=='set'){
        	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
        	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        	GeocamResponderMaps.LibController.addToUndoStack('m'+(indexTo-1)+'-'+indexFrom, '');
        	GeocamResponderMaps.MapSets.content.removeAt(indexFrom);
         	indexTo = indexTo-1; //if just a move and not an add, removes the object from the content array and subtracts one from the index.
         						 // since the item is always added to the end of the array, this is always needed when moving
        }
        else{
        	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).toMapSetOverlay();
        	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
        }
        
        GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(indexTo);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
    	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
    	that.set('isChecked', checked);

        
        event.preventDefault();
       
        
    }
    
}).appendTo('.map_set_bottom');


//the barebones textfield used in the new layer form for all the metadata
GeocamResponderMaps.FormInformation = Em.TextField.extend({
    insertNewline: function(){
        
    }
});




/***********************************************************************************
* Controllers
***********************************************************************************/
GeocamResponderMaps.LibController = Em.ArrayController.create({
    contentLib: [],
    undoStack: Em.A([]),
    undoStackIndex: -1,
    UNDO_STACK_MAX_SIZE: 50,
    currentMapSet: null,
    dropSpot: GeocamResponderMaps.MapOverlay.create({name: 'DROP HERE'}),
    library: GeocamResponderMaps.Library.create({MapOverlays: []}),
    updateLibrary: function() {
    	GeocamResponderMaps.MapSetsLib.content.clear();
    	GeocamResponderMaps.MapSetsLib.content.pushObjects(this.library.MapOverlays);
    },
    updateContentIndices: function(index){
    	var childs = GeocamResponderMaps.MapSets.get('childViews');
        for(index=0;index<GeocamResponderMaps.MapSets.content.length;index++){
        	childs.objectAt(index).set('contentIndex', index);
        }
    },
    setEmptyMapset: function(){
    	GeocamResponderMaps.LibController.currentMapSet = GeocamResponderMaps.MapSet.create({
			children: [],
			extensions: null,
			url: '',
			mapsetjson: '',
			name: GeocamResponderMaps.mapSetName,
			type: 'Document'
		});
    },
    dev: function(that){
    	console.log(GeocamResponderMaps.MapSets.content);
    	console.log(GeocamResponderMaps.LibController.currentMapSet);
    	console.log(GeocamResponderMaps.LibController.currentMapSet.getJson());
    	
    },
    removeOverlayFromMapSet: function(that){
    	var index = GeocamResponderMaps.MapSets.content.indexOf(that.get('content'));
    	GeocamResponderMaps.MapSets.content.removeAt(index);
    	
    },
	save: function(){
		this.currentMapSet.name = GeocamResponderMaps.mapSetName;
		var temp = GeocamResponderMaps.MapSets.content;
		this.currentMapSet.children = [];
		for(var i=0;i<temp.length;i++){
			this.currentMapSet.children[i] = temp.objectAt(i).getJson();
		}			
		console.log(this.currentMapSet);
		console.log(this.currentMapSet.getJson());
		console.log(JSON.stringify(this.currentMapSet.getJson()));
		$.ajax({
			   type: "PUT",
			   url: GeocamResponderMaps.HOST+'api/mapset/alice/hurricane-irene-2011', //currently hardcoded url
			   data: JSON.stringify(this.currentMapSet.getJson()),
			   contentType: 'application/json',
			   success: function(data) {
				   console.log(data);
			   }
		});
    	
	},
	loadChoose: function(){
		//TODO this will fire a prompt/modal/window/etc where the user can choose what mapset he wants
	},
	load: function(mapset){ //this loads mapsets
		library = this.library;
		//currently hardcoded url
		$.get(GeocamResponderMaps.HOST+'api/mapset/alice/hurricane-irene-2011', function(data){
			var mapset = $.parseJSON(data);
			console.log(mapset);
			GeocamResponderMaps.LibController.currentMapSet = GeocamResponderMaps.MapSet.create({
				children: mapset.children,
				extensions: mapset.extensions,
				url: 'alice/hurricane-irene-2011',
				mapsetjson: mapset.mapsetjson,
				name: mapset.name,
				type: mapset.type
			});
			
			var overlay;
			GeocamResponderMaps.MapSets.content.clear();
			GeocamResponderMaps.set('mapSetName', mapset.name);
			for(var i = 0; i<mapset.children.length ;i++){
				overlay = GeocamResponderMaps.MapSetOverlay.create({
				    url: mapset.children[i].url,
				    externalGeoXml: new GGeoXml(mapset.children[i].url),
				    name: mapset.children[i].name,
				    type: mapset.children[i].type,

				    });

					GeocamResponderMaps.LibController.undoSafeAdd((overlay), i);
				}
			
    	});

	},
    displayOverlay: function(isChecked, that){
    	var overlay;
    	if(GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).externalUrl != ''){
    		overlay = GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).externalGeoXml;

    	}
    	else{
    		//this is a default until I get it working
    	//	var url_end = "?nocache=" + (new Date()).valueOf();
    		//var server_root = "http://www.littled.net/exp/";
    	//	var kmlFile = server_root + "gmap.kml" + url_end;
    		//overlay = new GGeoXml(kmlFile);
    		//TODO

    	}
    	if(isChecked){
    		GeocamResponderMaps.MapController.showOverlay(overlay);
    	}else{
    		GeocamResponderMaps.MapController.removeOverlay(overlay);

    	}
    },
    addToUndoStack: function(action, obj){
    	/*
    	 * action based undo
    	 * 	-remove r<position>-[obj]
    	 * 	-add a<position>-[obj]
    	 * 	-move m<position>-[from]
    	 * <a,r,m><position>[from][obj]
    	 * 
    	 * 
    	 */
    	if(this.undoStackIndex == this.UNDO_STACK_MAX_SIZE){
    		this.undoStack.shiftObject();
    		this.undoStackIndex--;
    	}
    	this.undoStackIndex++;
    	this.undoStack = this.undoStack.slice(0, this.undoStackIndex);
    	this.undoStack.pushObject(Em.A([action, obj]));
    	//console.log('stack: '+this.undoStack+'   index'+this.undoStackIndex);

    },
    undo: function(){
    	if(this.undoStackIndex<0){
    		alert('No more undos');
    	}
    	else{

    		var action = ((this.undoStack.slice(0)).objectAt(this.undoStackIndex).slice(0));

    		this.undoStack.removeAt(this.undoStackIndex);
    		
    		this.undoStack.insertAt(this.undoStackIndex, this.inverse(action));
    		this.undoStackIndex--;
    		this.doAction(action);
    		//console.log('stack: '+this.undoStack+'   index'+this.undoStackIndex);
    	}
    		
    },
    redo: function(){
    	if(this.undoStackIndex >= this.undoStack.length-1){
    		alert('No more redos');
    	}
    	else{

    		this.undoStackIndex++;
    		var action = this.undoStack.objectAt(this.undoStackIndex);
    		this.undoStack.removeAt(this.undoStackIndex);
    		this.undoStack.insertAt(this.undoStackIndex, this.inverse(action));
    		this.doAction(action);
    		//console.log('stack: '+this.undoStack+'   index'+this.undoStackIndex);
    	}
    	
    	
    },
    doAction: function(actionA){
    	/*
    	 * action based undo
    	 * 	-remove r<position>-[objLocationInLibrary]
    	 * 	-add a<position>-[objLocationInLibrary]
    	 * 	-move m<position>-[from]
    	 * <a,r,m><position>[from][obj]
    	 * 
    	 */

    	var obj = actionA.objectAt(1);
    	var action = actionA.objectAt(0);
    	

    	var pos = parseInt(action.substring(1));
  	  	
    	switch(action.charAt(0))
    	{
    	case 'm':
    		var from = parseInt(action.substring(action.search('-')+1));
    	  this.undoSafeMove(pos, from);
    	  break;
    	case 'a':
    	  this.undoSafeRemove(pos);
    	  break;
    	case 'r':
    		this.undoSafeAdd(obj, pos);
    		break;
    	default:
    	  console.log('not an action');
    	}
    	
    },
    inverse: function(actionA){

    	var inverted;
    	var obj = actionA.objectAt(1);
    	var action = actionA.objectAt(0);
    	switch(action.charAt(0))
    	{
    	case 'm':
    		var pos = parseInt(action.substring(1));
      	  var from = parseInt(action.substring(action.search('-')+1));
    	  inverted = Em.A(['m'+from+'-'+pos, obj]);
    	  break;
    	case 'a':
    	  inverted = Em.A(['r'+action.substring(1), obj]);
    	  break;
    	case 'r':
    		inverted = Em.A(['a'+action.substring(1), obj]);
    		break;
    	default:
    	  console.log('not an action');
    	}
    	return inverted;
    },
    undoSafeMove: function(from, to){
        var lastAlias = '';
        var obj; 
        
        obj = GeocamResponderMaps.MapSets.content.objectAt(from);
        lastAlias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('lastAlias');	
        checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        

        GeocamResponderMaps.MapSets.content.removeAt(from);
        
        GeocamResponderMaps.MapSets.content.insertAt(to, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(to);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(to);
        that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        that.set('lastAlias', lastAlias);
        that.set('isChecked', checked);

    },
    undoSafeAdd: function(obj, to){
        
        GeocamResponderMaps.MapSets.content.insertAt(to, obj);
        GeocamResponderMaps.LibController.updateContentIndices(to);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(to);
        
        that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        
        
    },
    undoSafeRemove: function(from){
    	GeocamResponderMaps.MapSets.get('childViews').objectAt(from).remove();
    },
    
});

/* 
 * 
 * 
 * 
 * 
 */

GeocamResponderMaps.NewFileController = Em.ArrayController.create({
    content: [],
    externalUrl: '',
    localCopy: null,
    complete: false,
    name: '',
    type: '',
    description: '',
    coverage: '',
    creator: '',
    contributors: '',
    publisher: '',
    rights: '',
    license: '',
    morePermissions: '',
    acceptTerms: false,
    //external: false,
    externalGeoXml: '',
    metaUrl: '',
    file: null,
    createPrep: function(){
    	//Anything that needs to be done before the form
   /* 	var metaUrl;
    	var externalUrl = this.externalUrl;
    	console.log(externalUrl);
    	$.post(GeocamResponderMaps.HOST+'layer/new/', JSON.stringify({externalUrl: externalUrl, hosting: "external"}), function(data){
			  metaUrl = data.result.metaUrl;
		  });
    	this.metaUrl = metaUrl;*/
    },
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
		   if(!this.externalUrl==''){
			   this.external = true;
			   this.externalGeoXml = new GGeoXml(this.externalUrl);
		   }
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			   //	external: this.external,
			   	externalGeoXml: this.externalGeoXml,
			   	externalUrl: this.externalUrl,
			    localCopy: this.localCopy,
			    complete: true,
			    name: this.name,
			    type: this.type,
			    description: this.description,
			    coverage: this.coverage,
			    creator: this.creator,
			    contributors: this.contributors,
			    publisher: this.publisher,
			    rights: this.rights,
			    license: this.license,
			    morePermissions: this.morePermissions,
			    acceptTerms: this.acceptTerms
	   });
		   console.log(newOverlay.getJson());
	   
	   $.ajax({
		   type: "POST",
		   url: GeocamResponderMaps.HOST+'api/layers/',
		   data: JSON.stringify(newOverlay.getJson()),
		   contentType: 'application/json',
		   success: function(data) {
			   console.log(data);
		   }
		 });
	  GeocamResponderMaps.LibController.library.add(newOverlay);
	  GeocamResponderMaps.LibController.updateLibrary();
	  
	  this.resetValues();
	  return true;
	   }
   },
   load: function(data){//this loads the library
	   var i;
	  // var external;
	  // var id;
	   	for(var index = 0; index < data.length; index++){
	   		i = data[index];
	   		//id = i.json;
	   		//console.log(id);
	   		//external = false;
	   		//if(i.externalUrl != '')
	   		//	external = true;
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			//   	external: external,
			   	externalGeoXml:  new GGeoXml(i.externalUrl),
			   	externalUrl: i.externalUrl,
			    localCopy: i.localCopy,
			    complete: i.complete,
			    name: i.name,
			    type: i.type,
			    description: i.description,
			    coverage: i.coverage,
			    creator: i.creator,
			    contributors: i.contributors,
			    publisher: i.publisher,
			    rights: i.rights,
			    license: i.license,
			    morePermissions: i.morePermissions,
			    acceptTerms: true,
		
	   });
	   	if(newOverlay.complete)
	   		GeocamResponderMaps.LibController.library.add(newOverlay);

	   	}
	   	GeocamResponderMaps.LibController.library.sort();
	  GeocamResponderMaps.LibController.updateLibrary();
	  this.resetValues();
	  return true;
	   },

	resetValues: function(){
		this.set('externalUrl', '');
		this.set('localCopy', null);
		this.set('complete', false);
		this.set('name', '');
	    this.set('type', '');
	    this.set('description', '');
	    this.set('coverage', '');
	    this.set('creator', '');
	    this.set('contributors', '');
	    this.set('publisher', '');
	    this.set('rights', '');
	    this.set('license', '');
	    this.set('morePermissions', '');
	    this.set('acceptTerms', false);
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
	      this.localCopy = file;
	      
	      
	  //    this.file = new FormData();
	      
	    //      this.file.append('', file);
	      
	      
	  },
	 fileUpload: function() {
			//starting setting some animation when the ajax starts and completes
		/*	$("#loading")
			.ajaxStart(function(){
				$(this).show();
			})
			.ajaxComplete(function(){
				$(this).hide();
			});
			*/
		  
			/*
				prepareing ajax file upload
				url: the url of script file handling the uploaded files
	            fileElementId: the file type of input element id and it will be the index of  $_FILES Array()
				dataType: it support json, xml
				secureuri:use secure protocol
				success: call back function when the ajax complete
				error: callback function when the ajax failed
				
	                */
			/* $.ajaxFileUpload
			(
				{
					url:'', 
					secureuri:false,
					fileElementId:'fileUploadButton',
					dataType: 'json',
					success: function (data, status)
					{
						if(typeof(data.error) != 'undefined')
						{
							if(data.error != '')
							{
								alert(data.error);
							}else
							{
								alert(data.msg);
							}
						}
					},
					error: function (data, status, e)
					{
						alert(e);
					}
				}
			)*/
		 
		 $.ajax({
			    url: GeocamResponderMaps.HOST+'layer/new/',
			    data: data,
			    cache: false,
			    contentType: false,
			    processData: false,
			    type: 'POST',
			    success: function(data){
			        alert(data);
			    }
			});
			
			return false;

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
		  if(this.externalUrl != '')
			  this.createPrep();
		  else if(this.file != null)
			 console.log('');// this.fileUpload();
		  else{
			  alert('You need a file or a url.');
			  return false;
		  }
			  
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
		/*
		 * 
		 */
	},
	removeOverlay: function(geo){
		this.map.removeOverlay(geo);
	}
    
});

/*
 /layers/ 
GET returns an array of library layer metadata
POST with data creates a new layer.

layer/<layer_id> 
GET returns a specific layer's metadata
PUT with some JSON updates the specified fields
DELETE does what you would expect

"/mapsets/" and "/mapset/<id_or_slug>/" would behave similarly


 $.get(GeocamResponderMaps.HOST+'layers/', function(data){
			GeocamResponderMaps.NewFileController.load(data);
    	});
 
 $.post(GeocamResponderMaps.HOST+'layers/', JSON.stringify({externalUrl: externalUrl, hosting: "external"}), function(data){
			  metaUrl = data.result.metaUrl; //This is first call to create new layer
		  });
 
 $.get(GeocamResponderMaps.HOST+'layer/<layer_id>', function(data){
			//save the layer somewhere
    	});
    	
 $.ajax({
    type: "PUT",
    url: GeocamResponderMaps.HOST+'layer/<layer_id>',
    contentType: "application/json",
    data: JSON.stringify(<layer>),
});
 
  $.ajax({
    type: "DELETE",
    url: GeocamResponderMaps.HOST+'layer/<layer_id>',
    contentType: "application/json",
});




 $.get(GeocamResponderMaps.HOST+'mapsets/', function(data){
			//Load it into the mapset area
    	});
 
 $.post(GeocamResponderMaps.HOST+'mapsets/', JSON.stringify({externalUrl: externalUrl, hosting: "external"}), function(data){
			  //TODO
		  });
 
 $.get(GeocamResponderMaps.HOST+'mapset/<id_or_slug>', function(data){
			//not sure if needed
    	});
    	
 $.ajax({
    type: "PUT",
    url: GeocamResponderMaps.HOST+'mapset/<id_or_slug>',
    contentType: "application/json",
    data: JSON.stringify(<layer>),
});
 
  $.ajax({
    type: "DELETE",
    url: GeocamResponderMaps.HOST+'mapset/<id_or_slug>',
    contentType: "application/json",
});
 
 
 
 
 
 
 */


