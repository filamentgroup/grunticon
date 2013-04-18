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
*/

(function(){
	var fs = require( "fs" );
	var RSVP = require('../../lib/rsvp');
	var grunticoner = require('../../lib/grunticoner');

	var options = {
		inputdir: phantom.args[0],
		outputdir: phantom.args[1],
		pngout:  phantom.args[8],
		cssprefix: phantom.args[9],
		fallbackcss: phantom.args[6],
		pngdatacss: phantom.args[5],
		datacss: phantom.args[4],
		cssbasepath: phantom.args[10],
		asyncCSSpath: phantom.args[2],
		previewFilePath: phantom.args[3],
		previewHTMLFilePath: phantom.args[7],
		customselectors: phantom.args[11]
	};

	var files = fs.list( options.inputdir );
	var promises = [];

	files = files.filter( function( file ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = file.match( svgRegex ),
			isPng = file.match( pngRegex );

		return isSvg || isPng;
	});

	files.forEach( function( file ){
		promises.push( grunticoner.processFile( file , options ) );
	});

	RSVP.all( promises ).then( function( dataarr ){
		grunticoner.writeCSS( dataarr , options );
		phantom.exit();
	});
})();
