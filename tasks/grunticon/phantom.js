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

/*
phantom args sent from grunticon.js:
	[0] - input directory path
	[1] - output directory path
	[2] - asyncCSS output file path
	[3] - preview.html static file path
	[4] - CSS filename for datasvg css
	[5] - CSS filename for datapng css
	[6] - CSS filename for urlpng css
	[7] - filename for preview HTML file
	[8] - png folder name
	[9] - css classname prefix
	[10] - css basepath prefix
	[11] - custom CSS selectors
	[12] - default width
	[13] - default height
	[14] - if we should render files
	[15] - if we should write CSS
	[16] - verbose?
*/

(function(){
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('../../lib/rsvp');
	var grunticoner = require('../../lib/grunticoner');
	var isVerbose = phantom.args[16];

	var clog = function(what){
		// Note the escape characters.
		console.log("[32m[phantom.js][39m "+what);
	}

	var vlog = function(what){
		if( isVerbose !== 'undefined' ){
			// Note the escape characters.
			clog(what);
		}
	}

	var options = {
		inputDir:            phantom.args[0],
		outputDir:           phantom.args[1],
		asyncCSSpath:        phantom.args[2],
		previewFilePath:     phantom.args[3],
		datacss:             phantom.args[4],
		pngdatacss:          phantom.args[5],
		fallbackcss:         phantom.args[6],
		previewHTMLFilePath: phantom.args[7],
		pngDestDirName:      phantom.args[8],
		cssprefix:           phantom.args[9],
		cssbasepath:         phantom.args[10],
		customselectors:     phantom.args[11],
		defaultWidth:        phantom.args[12],
		defaultHeight:       phantom.args[13],
		render:              phantom.args[14],
		writeCSS:            phantom.args[15]
	};

	var files = fs.list( options.inputDir );
	var promises = [];

	var title = 'SVG files in '+options.inputDir+':';

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

	files.forEach(function(file, idx){
		clog('[' + (idx+1) + '/' + files.length + '] -- ' + file);
		promises.push(grunticoner.processSVGFile(file, options));
	});

	RSVP.all(promises).then(function(dataArray){
		if(options.writeCSS !== "false"){
			clog('Writing CSS with grunticoner.writeCSS');
			grunticoner.writeCSS( dataArray , options );
		} else {
			clog('Not writing CSS (options.writeCSS == '+options.writeCSS+')');
		}
		phantom.exit();
	});

})();
