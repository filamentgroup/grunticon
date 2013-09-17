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
var RSVP = require('../../lib/rsvp')

var inputDir = phantom.args[0];
var outputDir = phantom.args[1];
var isVerbose = phantom.args[2];

var clog = function(what){
	console.log("[32m[phantom.js][39m "+what);
}

var vlog = function(what){
	if( isVerbose !== 'undefined' ){
		// Note the escape characters.
		clog(what);
	}
}

var files = fs.list(inputDir);
var promises = [];

var title = 'SVG files in '+inputDir+':';

vlog(title);
vlog(Array(title.length+1).join('-'));

files = files.filter( function( file ){
	if( file.match( /\.svg$/i ) ){
		vlog('[x] '+file);
		return file;
	} else {
		vlog('[ ] '+file);
	}
});

vlog(Array(title.length+1).join('-'));

// Convert SVGs to PNGs
files.forEach(function(file, idx){
	clog('[' + (idx+1) + '/' + files.length + '] -- ' + file);

	var promise = new RSVP.Promise();
	var filename = file.split('/').pop();
	var ext = filename.split('.').pop();
	var basename = filename.substr(0, filename.length - ext.length - 1);

	// Check extension
	if(ext !== 'svg'){
		promise.reject();
	} else {
		var svgSrcFile = inputDir + basename + '.svg';
		var pngDestFile = outputDir + basename + '.png';
		var page = require('webpage').create();

		// Minimum viewport size
		page.viewportSize = {
			width: 1,
			height: 1
		};

		page.open(svgSrcFile, function(status){
			clog(svgSrcFile+' [32m=>[39m '+ pngDestFile);

			// global.imageSizes[basename] = [document.body.clientWidth, document.body.clientHeight];

			if(status !== 'success'){
				promise.reject();
			} else {
				page.render(pngDestFile);
				promise.resolve();
			}
		});
	}

	// Add promise to promise list
	promises.push(promise);
});

// Kill phantom once promises are fulfilled
RSVP.all(promises).then(function(){
	phantom.exit();
});