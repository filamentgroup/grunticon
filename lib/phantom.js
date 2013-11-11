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
	[3] - png folder name
	[4] - default width
	[5] - default height
	[6] - colors
*/

(function(){
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var grunticoner = require('./grunticoner');

	var options = {
		inputdir: phantom.args[0],
		outputdir: phantom.args[1],
		pngout:  phantom.args[2],
		defaultWidth: phantom.args[3],
		defaultHeight: phantom.args[4],
		colors: phantom.args[5]
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
					newFileContents = fileContents.replace( /(<svg[^>]+>)/im, '$1<style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: ' + (colorVar || color) + ' !important; }</style>' ),
					newFilePath = options.inputdir + "/" + newFileName;

				tempFiles.push( newFilePath );

				fs.write( newFilePath, newFileContents, 'w' );

				promises.push( grunticoner.processFile( newFileName , options ) );
			});
		}

		// write the default too
		promises.push( grunticoner.processFile( fileName, options ) );

	});



	RSVP.all( promises ).then( function( err ){
		deleteTempFiles();
		phantom.exit();
	});
})();
