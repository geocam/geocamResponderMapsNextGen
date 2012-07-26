/**************************
* Application
**************************/
GeocamResponderMaps = Em.Application.create({
	name: 'Map Set',
	HOST: 'http://'+window.location.host+'/',
	ready: function(){
		GeocamResponderMaps.MapController.showMap();
	/*	$.get(GeocamResponderMaps.HOST+'library.json', function(data){
			GeocamResponderMaps.NewFileController.load(data);
			console.log(data);
    	}); */
		//for new server api
		$.get(GeocamResponderMaps.HOST+'api/layers/', function(data){
			GeocamResponderMaps.NewFileController.load(data);
			console.log(data);
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
 * Map overlay metadata container that holds a refrence to the overlay
 */
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
    id: '',
    toString: function(){
    	return this.name;
    },
 // ember objects cannot be stringified because they are circular. This takes care of that.
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
    	if(overlay.id == this.id)
    		return true;
    	return false;
    }, 
    copy: function(){
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
		    acceptTerms: this.acceptTerms,
		    id: this.id,
    	});
    	return newOverlay;
    },
});

GeocamResponderMaps.MapSetLayer = Em.Object.extend({
    name: '',
    alias: '',
    type: '',
    url: '',
    show: false,
    json: '',
    mapset: '',
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
    		if(this.MapOverlays.objectAt(i).externalCopy == overlayUrl)
    			return i;
    	}
    	return -1;
    },
    numOfOverlays: function(){
    	return MapOverlays.length;
    }
});

GeocamResponderMaps.MapSet = Em.Object.extend({
    shortName: '',
    name: '',
    description: '',
    url: '',
    mapsetjson: '',	
    json: '',
});


/**************************
* Views
**************************/



GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['nameContainer'],
    template: Ember.Handlebars.compile('{{#if isEditing}}\
							    		{{view Ember.TextField class="editing" placeholderBinding="name" valueBinding="change"}}\
							    		{{else}}\
							    		{{name}}\
							    		{{/if}}'),
	isEditing: false,
	name: 'Untitled',
	change: '',
	doubleClick: function(){
		console.log(GeocamResponderMaps.MapSetView);
    	this.set('isEditing', !this.isEditing);
    	if(!this.isEditing){
    		if(this.change != ''){
    			this.set('name', this.change); 
				this.set('change','');
    		}
		   }
	},
	setName: function(name){
		this.set('name', name);
	}
    
}).appendTo('#mapSetName');	

/*
 * defines the Mapset area 
 */
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button id="undo" {{action "undo" target="GeocamResponderMaps.LibController"}}>Undo</button><button id="redo" {{action "redo" target="GeocamResponderMaps.LibController"}}>Redo</button><button id="save" {{action "save" target="GeocamResponderMaps.LibController"}} >Save</button><button id="load" {{action "load" target="GeocamResponderMaps.LibController"}} >Load</button><button id="load" {{action "showOverlay" target="GeocamResponderMaps.LibController"}} >Create New</button>')
    
}).appendTo('#mapset_canvas');

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
     * representation of each list item
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
  //      _aliasChanged: function(){
  //          if(this.alias.length>20)
  //          	this.set('alias', this.alias.substring(0, 33));
  //      }.observes('alias'),
        _isCheckedChanged: function(){
            var isChecked = this.get('isChecked');
            GeocamResponderMaps.LibController.displayOverlay(isChecked, this);
          // console.log( GeocamResponderMaps.LibController.dumps(GeocamResponderMaps.MapSets.content));
        }.observes('isChecked'),
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
        dragOver: function(event){
            this.set('style', "border-top: 5px solid #CD3700");
            event.preventDefault();
        	},
        dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('index', this.get('contentIndex'));
            dataTransfer.setData('origin', 'set');
        },
        drop: function(event) {
            var indexFrom = event.originalEvent.dataTransfer.getData('index');
            var origin = event.originalEvent.dataTransfer.getData('origin'); //checks if you are bringing an overlay from the library or moving an item around in the mapSet
            var indexTo = GeocamResponderMaps.MapSets.content.indexOf(this.get('content'));
            var obj;
            var alias = '';
            var lastAlias = '';
            var checked = false;
            this.set('style', "");
            //if the overlay came from the mapset, save all the list item data
            if(origin=='set'){
            	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
            	alias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('alias');
            	lastAlias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('lastAlias');
            	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
            	GeocamResponderMaps.LibController.addToUndoStack('m'+indexTo+'-'+indexFrom, '');
            }
            else{
            	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).copy();
            	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
            }
            //if the mapset has the item already, delete it before re-adding it
            for(var i = 0; i<GeocamResponderMaps.MapSets.content.length; i++){
            	//console.log(GeocamResponderMaps.MapSets.content.objectAt(i));
            	 if(GeocamResponderMaps.MapSets.content.objectAt(i).compare(obj)){
                 	GeocamResponderMaps.MapSets.content.removeAt(i);
                 	
                 }
            }
          /*  if(GeocamResponderMaps.MapSets.content.indexOf(obj)>=0){
            	GeocamResponderMaps.MapSets.content.removeAt(GeocamResponderMaps.MapSets.content.indexOf(obj));

            }
         */  console.log(obj);
         	console.log(GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom));
            GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
            GeocamResponderMaps.LibController.updateContentIndices(indexTo);

            var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
            if(alias == '')
            	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
            else{
            	that.set('alias', alias);
            	that.set('lastAlias', lastAlias);
            	that.set('isChecked', checked);
            }
            event.preventDefault();
           
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

//var childView= GeocamResponderMaps.MapSets.itemViewClass.get('childViews');
//childView.pushObject(Ember.Checkbox.create({	  value: true	}));


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
    	
    	var indexFrom = event.originalEvent.dataTransfer.getData('index');
        var origin = event.originalEvent.dataTransfer.getData('origin');
        var indexTo =  GeocamResponderMaps.MapSets.content.length;
        var alias = '';
        var lastAlias = '';
        var obj;
        var checked = false;
        if(origin=='set'){
        	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
        	alias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('alias');
        	lastAlias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('lastAlias');	
        	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        	GeocamResponderMaps.LibController.addToUndoStack('m'+(indexTo-1)+'-'+indexFrom, '');
        }
        else{
        	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).copy();
        	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
        }
        for(var i = 0; i<GeocamResponderMaps.MapSets.content.length; i++){
        	//console.log(GeocamResponderMaps.MapSets.content.objectAt(i));
        	 if(GeocamResponderMaps.MapSets.content.objectAt(i).compare(obj)){
             	GeocamResponderMaps.MapSets.content.removeAt(i);
             	indexTo = indexTo-1;
             }
        }
      /*  if(GeocamResponderMaps.MapSets.content.indexOf(obj)>=0){
        	GeocamResponderMaps.MapSets.content.removeAt(GeocamResponderMaps.MapSets.content.indexOf(obj));
        	indexTo = indexTo-1;
        }
      */  
        GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(indexTo);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
        if(alias == '')
        	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        else{
        	that.set('alias', alias);
        	that.set('lastAlias', lastAlias);
        	that.set('isChecked', checked);
        }

        
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
    showOverlay: function(that){
    	console.log("dummy function");
    },
    removeOverlayFromMapSet: function(that){
    	var index = GeocamResponderMaps.MapSets.content.indexOf(that.get('content'));
    	GeocamResponderMaps.MapSets.content.removeAt(index);
    	
    },
	save: function(){
	//	 $.post(GeocamResponderMaps.HOST+'mapsets/', JSON.stringify({externalUrl: externalCopy, hosting: "external"}), function(data){
			  //TODO
	//	  });
    	
	},
	loadChoose: function(){
		
	},
	load: function(mapset){ //this loads mapsets
		library = this.library;

		$.get(GeocamResponderMaps.HOST+'map/alice/hurricane-irene-2011.json', function(data){
			console.log(data)
			//console.log(JSON.dumps(data.json));
			var overlayIndex;
			var numOfErrors = 0;

			for(var i = 0; i<data.children.length ;i++){
				overlayIndex = library.findOverlay(data.children[i].url);
				console.log('overlayIndex: '+overlayIndex);
				if(overlayIndex >= 0){
					GeocamResponderMaps.LibController.undoSafeAdd(library.MapOverlays.objectAt(overlayIndex), i-numOfErrors);
				}else{
					numOfErrors++;
				}
			}
			if(numOfErrors>0)
				alert(numOfErrors+' overlays no longer exist in the library.');
			console.log(data);
    	});
	//	For the new server api
//		$.post(GeocamResponderMaps.HOST+'mapsets/', JSON.stringify({externalUrl: externalCopy, hosting: "external"}), function(data){
			  //TODO
	//	  });
	},
    displayOverlay: function(isChecked, that){
    	var overlay;
    	if(GeocamResponderMaps.MapSets.content.objectAt(that.contentIndex).external){
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
        var alias = '';
        var lastAlias = '';
        var obj; 
        
        obj = GeocamResponderMaps.MapSets.content.objectAt(from);
        alias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('alias');
        lastAlias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('lastAlias');	
        checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        
        if(GeocamResponderMaps.MapSets.content.indexOf(obj)>=0){
        	GeocamResponderMaps.MapSets.content.removeAt(GeocamResponderMaps.MapSets.content.indexOf(obj));
        	
        }
        GeocamResponderMaps.MapSets.content.insertAt(to, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(to);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(to);
        if(alias == '')
        	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        else{
        	that.set('alias', alias);
        	that.set('lastAlias', lastAlias);
        	that.set('isChecked', checked);
        }
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
    metaUrl: '',
    file: null,
    createPrep: function(){
    	var metaUrl;
    	var externalCopy = this.externalCopy;
    	console.log(externalCopy);
  //  	$.post(GeocamResponderMaps.HOST+'layer/new/', JSON.stringify({externalUrl: externalCopy, hosting: "external"}), function(data){
	//		  metaUrl = data.result.metaUrl;
//		  });
 //   	this.metaUrl = metaUrl;
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
		   console.log(newOverlay.getJson());
	   $.post(GeocamResponderMaps.HOST+'api/layers/', JSON.stringify(newOverlay.getJson()), function(data){
			  console.log(data);
	  }, 'json');
	  GeocamResponderMaps.LibController.library.add(newOverlay);
	  GeocamResponderMaps.LibController.updateLibrary();
	  
	  this.resetValues();
	  return true;
	   }
   },
   load: function(data){//this loads the library
	   var i;
	   var external;
	  // var id;
	   	for(var index = 0; index < data.length; index++){
	   		i = data[index];
	   		//id = i.json;
	   		//console.log(id);
	   		external = false;
	   		if(i.externalUrl != '')
	   			external = true;
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			   	external: external,
			   	externalGeoXml:  new GGeoXml(i.externalUrl),
			   	externalCopy: i.externalUrl,
			    localCopy: i.localCopy,
			    complete: i.complete,
			    name: i.name,
			    type: i.type,
			    description: i.description,
			    coverage: i.coverage,
			    creator: i.creator,
			    contributer: i.contributer,
			    publisher: i.publisher,
			    rights: i.rights,
			    license: i.license,
			    permissions: i.permissions,
			    acceptTerms: true,
			    id: i.externalUrl, //have to make this a real id TODO
		
	   });
	   	if(newOverlay.complete)
	   		GeocamResponderMaps.LibController.library.add(newOverlay);

	   	}
	  GeocamResponderMaps.LibController.updateLibrary();
	  this.resetValues();
	  return true;
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
		  if(this.externalCopy != '')
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
 
 $.post(GeocamResponderMaps.HOST+'layers/', JSON.stringify({externalUrl: externalCopy, hosting: "external"}), function(data){
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
 
 $.post(GeocamResponderMaps.HOST+'mapsets/', JSON.stringify({externalUrl: externalCopy, hosting: "external"}), function(data){
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


