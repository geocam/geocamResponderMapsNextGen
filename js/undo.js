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

GeocamResponderMaps.FormInformation = Em.TextField.extend({
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
    create: function(){
	   var newOverlay = GeocamResponderMaps.MapOverlay.create({
		   	
	   })
   }
    
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
		var zl = 5;
		map.setCenter(new GLatLng(37.388163,-122.082138),zl);
		
		
	}
    
});

/**********************************************************************/
/* DEMO DRAG AND DROP CODE */
/**********************************************************************/


function assert(exp, message) {
    if (!exp) {
        throw message;
    }
}

/**********************************************************************/
/* GENERIC UNDO/REDO CODE */
/**********************************************************************/

var undoStackG = [];
var undoStackIndexG = -1;
var UNDO_STACK_MAX_SIZE = 50;

function pushUndoStack(state) {
    if (undoStackG.length > 0 && state == undoStackG[undoStackIndexG]) {
        return; // no change in state, do nothing
    }

    if (undoStackIndexG < undoStackG.length - 1) {
        // reverse redo history (mimic emacs behavior)
        var n = undoStackG.length - undoStackIndexG;
        var redoEntries = undoStackG.splice(undoStackIndexG, n);
        undoStackG = undoStackG.concat(redoEntries.reverse());
        undoStackIndexG = undoStackG.length - 1;
    }

    // keep undo stack from growing past size limit
    if (undoStackG.length == UNDO_STACK_MAX_SIZE) {
        undoStackG.shift();
    }

    // push new entry on top of stack
    undoStackG.push(state);
    undoStackIndexG = undoStackG.length - 1;

    setUndoRedoButtonMode();
}

function undo() {
    assert(undoStackIndexG > 0, "got undo at beginning of undo history");
    undoStackIndexG--;
    checkAndSetState(undoStackG[undoStackIndexG]);
    setUndoRedoButtonMode();
}

function redo() {
    assert(undoStackIndexG < undoStackG.length - 1, "got redo at end of undo history");
    undoStackIndexG++;
    checkAndSetState(undoStackG[undoStackIndexG]);
    setUndoRedoButtonMode();
}

function dumps(obj) {
    return JSON.stringify(obj);
}

function checkAndSetState(state) {
    var obj = JSON.parse(state);
    assert(dumps(obj) == state, "oops, parse is not inverse of dumps");
    setStateObject(obj);
}

function setButtonDisabled(button, disabled) {
    if (disabled) {
        button.button('disable');
    } else {
        button.button('enable');
    }
}

function setUndoRedoButtonMode() {
    setButtonDisabled($('#undo'), undoStackIndexG <= 0);
    setButtonDisabled($('#redo'), undoStackIndexG >= undoStackG.length - 1);
}

/**********************************************************************/
/* CUSTOM CODE FOR DEMO */
/**********************************************************************/

var wordsG;
var initManageListG = ["San Francisco", "San Jose", "Fresno", "Los Angeles", "San Diego", "Las Vegas", "Portland", "Reno", "Phoenix"];
var lastTerm;

function setStateObject(obj) {
    setManageList(obj);
}

function handleChangeToMapSet() {
    pushUndoStack(dumps(getManageList()));
}

function getManageList() {
    var result = [];
    $('#manageList li').each(function (i, li) {
        result.push(li.innerHTML);
    });
    return result;
}

function setManageList(manageList) {
    var manageHtml = [];
    manageHtml.push('<ul id="manageList">');
    $.each(manageList, function (i, val) {
        manageHtml.push('<li class="ui-state-default">' + val + '</li>');
    });
    manageHtml.push('</ul>');
    $('#manageLayers').html(manageHtml.join(""));

    $('#manageList').sortable({
        stop: handleChangeToMapSet
    });
    $('#manageList ul, li').disableSelection();
}

function setLibraryList(libraryList) {
    var libraryHtml = [];
    libraryHtml.push('<ul id="libraryList">');
    $.each(libraryList, function (i, val) {
        libraryHtml.push('<li class="ui-state-default">' + val + '</li>');
    });
    libraryHtml.push('</ul>');
    $('#libraryLayers').html(libraryHtml.join(""));

    $('#libraryList').sortable({
        stop: handleChangeToMapSet,
        connectWith: '#manageList'
    });
    $('#libraryList ul, li').disableSelection();
}

function save() {
    alert("pretending to save with state:\n\n" + getManageList());
}

function handleSearch() {
    handleSearchTerm($(this).val());
}

function capitalize(s) {
    return s[0].toUpperCase() + s.substr(1);
}

function handleSearchTerm(term) {
    if (term == "Search") {
        // avoid bogus call due to putting a hint word in the search box
        return;
    }
    if (term == lastTerm) {
        // don't handle the same search twice
        return;
    }

    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term, "i"));
    var allResults = $.grep(wordsG, function (word) {
        return matcher.test(word);
    });
    var topResults = allResults.slice(0, 10);
    setLibraryList($.map(topResults, capitalize));
    lastTerm = term;
}

function searchHint(force) {
    var layerSearch = $('#layerSearch');
    if (force || layerSearch.val() == '') {
        layerSearch.val('Search');
        layerSearch.css('color', '#999');
    }
}

function searchClear() {
    var layerSearch = $('#layerSearch');
    if (layerSearch.val() == 'Search') {
        layerSearch.val('');
        layerSearch.css('color', 'black');
    }
}

function initialize() {
    // fetch words
    searchHint(true);

    $.getJSON("words.json", function (data) {
        wordsG = data;

        // initialize library
        handleSearchTerm('');
        $('#layerSearch')
            .change(handleSearch)
            .keyup(handleSearch)
            .focus(searchClear)
            .blur(searchHint);
    });

    // initialize map set
    $('#manageDiv button').button();
    $('#undo').click(undo);
    $('#redo').click(redo);
    $('#save').click(save);

    pushUndoStack(dumps(initManageListG));
    setManageList(initManageListG);
}

$(document).ready(initialize);
