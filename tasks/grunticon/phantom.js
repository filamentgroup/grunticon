/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global phantom:true*/
/*global window:true*/
/*global require:true*/

"use strict";

var fs = require('fs');
var RSVP = require('../../lib/rsvp');

var files = JSON.parse(phantom.args[1]);

var clog = function(what){
	console.log("[32m[phantom.js][39m "+what);
}

var vlog = function(what){
	if(phantom.args[0] == '--debug=true'){
		clog(what);
	}
}

var promises = [];
var idx = 0;
var filesLength = Object.keys(files).length;

var crunchSVG = function(fileObj){
	var promise = new RSVP.Promise();
	var page = require('webpage').create();

	// Minimum viewport size
	page.viewportSize = {
		width: 1,
		height: 1
	};

	// DO IT
	page.open(fileObj.src, function(status){
		vlog(fileObj.src+' [32m=>[39m '+ fileObj.temp);

		if(status !== 'success'){
			promise.reject();
		} else {
			page.render(fileObj.temp);
			promise.resolve();
		}
	});
	return promise;
}

// Convert SVGs to PNGs
// FIXME: Key gets overwritten
for(var f in files){
	promises.push( crunchSVG(files[f]) );
}

// Kill phantom once promises are fulfilled
RSVP.all(promises).then(function(){
	phantom.exit();
});