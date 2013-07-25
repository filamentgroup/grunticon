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
	[14] - colors
	[15] - if we should render files
	[16] - if we should write CSS
*/

(function(){
	"use strict";
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
		customselectors: phantom.args[11],
		defaultWidth: phantom.args[12],
		defaultHeight: phantom.args[13],
		colors: phantom.args[14],
		render: phantom.args[15],
		writeCSS: phantom.args[16]
	};

	var files = fs.list( options.inputdir );
	var promises = [];

	// get colors from filename, if present
	var colorsRegx = /\.colors\-([^\.]+)/i;
	var tempFiles = [];

	// test if value is a valid hex
	var isHex = function( val ){
		return (/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i).test( val );
	};

	var getColorConfig = function( str ){
		var colors = str.match( colorsRegx );
		if( colors ){
			colors = colors[ 1 ].split( "-" );
			colors.forEach( function( color, i ){
				if( isHex( color ) ){
					colors[ i ] = "#" + color;
				}
			});
			return colors;
		}
		else {
			return [];
		}
	}; //getColorConfig


	var colors = JSON.parse( options.colors );

	var deleteTempFiles = function(){
		tempFiles.forEach( function( file ){
			fs.remove( file );
		});
	};

	files = files.filter( function( file ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = file.match( svgRegex ),
			isPng = file.match( pngRegex );

		return isSvg || isPng;
	});

	files.forEach( function( file ){
		var colorConfig = getColorConfig( file ),
			fileName = file;

		if( colorConfig.length ){
			var fileContents = fs.read( options.inputdir + "/" + file ),
				path = options.inputdir + "/";

			// base file is used as default icon color - no qualifications in its name, tho.
			fileName = file.replace( colorsRegx, "" );
			tempFiles.push( path + fileName );
			fs.write( path + fileName, fileContents, 'w' );

			colorConfig.forEach( function( color, i ){
				var colorVar = colors[ color ],
					newFileName = file.replace( colorsRegx, "-" + ( colorVar ? color : i + 1 ) ) ,
					newFileContents = fileContents.replace( /(<svg[^>]+)/im, '$1><style type="text/css">path { fill: ' + (colorVar || color) + ' !important; }</style>' ),
					newFilePath = options.inputdir + "/" + newFileName;

				tempFiles.push( newFilePath );

				fs.write( newFilePath, newFileContents, 'w' );

				promises.push( grunticoner.processFile( newFileName , options ) );
			});
		}

		// write the default too
		promises.push( grunticoner.processFile( fileName, options ) );

	});



	RSVP.all( promises ).then( function( dataarr ){
		if( options.writeCSS !== "false" ){
			grunticoner.writeCSS( dataarr , options );
		}
		deleteTempFiles();
		phantom.exit();
	});
})();
