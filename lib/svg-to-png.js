/*
 * svg-to-png
 *
 * Copyright (c) 2013 Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global require:true*/
/*global __dirname:true*/
/*global console:true*/
/*global process:true*/
(function(exports) {

	"use strict";

	var path = require( 'path' );
	var RSVP = require( path.join( __dirname, 'rsvp' ) );
	var phantomJsPath = require('phantomjs').path;
	var phantomfile = path.join( __dirname, 'phantom.js' );
	var execFile = require('child_process').execFile;

	exports.convert = function( src, pngDest, opts ){
		var promise = new RSVP.Promise();
		// take it to phantomjs to do the rest
		console.log( "svg-to-png now spawning phantomjs..." );
		console.log('(using path: ' + phantomJsPath + ')');

		var dest = opts.dest + pngDest;

		execFile( phantomJsPath,
			[
				phantomfile,
				src,
				dest,
				opts.defaultWidth,
				opts.defaultHeight,
				opts.colors
			],

			function(err, stdout, stderr){
				if( err ){
					console.log("\nSomething went wrong with phantomjs...");
					promise.reject( err );
				}

				if( stderr ){
					console.log( stderr );
				}

				console.log( stdout );
				promise.resolve( opts.dest );
			});

		return promise;
	};

}(typeof exports === 'object' && exports || this));
