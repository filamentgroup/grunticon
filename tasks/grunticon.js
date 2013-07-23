/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global __dirname:true*/
/*global require:true*/

module.exports = function( grunt , undefined ) {
	"use strict";

	var uglify = require( 'uglify-js' );
	var svgo = new (require( 'svgo' ))();
	var fs = require( 'fs' );

	var RSVP = require( '../lib/rsvp' );

	var readDir = function( path ){
		var promise = new RSVP.Promise();
		fs.readdir( path , function( err , files ){
			if( err ){
				grunt.log.error( err );
				promise.reject( err );
			} else {
				promise.resolve( files );
			}
		});
		return promise;
	};

	var readFile = function( filepath ){
		var promise = new RSVP.Promise();
		fs.readFile( filepath , function( err , data ){
			if( err ){
				grunt.log.error( err );
				promise.reject( err );
			} else {
				promise.resolve( data );
			}
		});
		return promise;
	};

	var optimize = function( file , data ){
		var promise = new RSVP.Promise();
		try{
			if( file.match( /png/ ) ){
				promise.resolve( data );
			} else {
				svgo.optimize( data.toString() , function( result ){
					if( result.error ){
						grunt.log.error( result.error );
						promise.reject( result.error );
					} else {
						promise.resolve( result.data );
					}
				});
			}
		} catch(e) {
			promise.reject( e );
		}
		return promise;
	};

	var writeFile = function( filepath , result ){
		var promise = new RSVP.Promise();
		fs.writeFile( filepath , result , function( err ){
			if( err ){
				grunt.log.error( err );
				promise.reject( err );
			} else {
				promise.resolve();
			}
		});
		return promise;
	};

	grunt.registerMultiTask( 'grunticon', 'A mystical CSS icon solution.', function() {
		var done = this.async();

		// just a quick starting message
		grunt.log.write( "Look, it's a grunticon!\n" );

		// get the config
		var config = this.options();

		config.files = {
			loader: __dirname + "/grunticon/static/grunticon.loader.js",
			banner: __dirname + "/grunticon/static/grunticon.loader.banner.js",
			preview: __dirname + "/grunticon/static/preview.html",
			phantom: __dirname + "/grunticon/phantom.js"
		};
		// fail if config or no src or dest config
		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your grunt.js file" );
			done( false );
		}

		// make sure src and dest have / at the end
		if( !config.src.match( /\/$/ ) ){
				config.src += "/";
		}
		if( !config.dest.match( /\/$/ ) ){
				config.dest += "/";
		}

		var asyncCSS = config.files.loader;
		var asyncCSSBanner = config.files.banner;
		var previewHTMLsrc = config.files.preview;

		// CSS filenames with optional mixin from config
		var datasvgcss = config.datasvgcss || "icons.data.svg.css";
		var datapngcss = config.datapngcss || "icons.data.png.css";
		var urlpngcss = config.urlpngcss || "icons.fallback.css";

		//filename for generated output preview HTML file
		var previewhtml = config.previewhtml || "preview.html";

		//filename for generated loader HTML snippet file
		var loadersnippet = config.loadersnippet || "grunticon.loader.txt";

		// css references base path for the loader
		var cssbasepath = config.cssbasepath || "/";

		var customselectors = JSON.stringify( config.customselectors ) || "{}";

		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png/";
		// make sure pngfolder has / at the end
		if( !pngfolder.match( /\/$/ ) ){
				pngfolder += "/";
		}

		// css class prefix
		var cssprefix = config.cssprefix;
		if( cssprefix === undefined ){
			cssprefix = "icon-";
		}


		var width = config.defaultWidth;
		if( !width ){
			width = "400px";
		}
		var height = config.defaultHeight;
		if( !height ){
			height = "300px";
		}

		// get color variables from config
		var colors = JSON.stringify( config.colors || {} );

		var svgosrc = config.src;
		var tmp = __dirname + "/tmp/";


		// create temp directory
		grunt.log.write( "creating temp directory at:" + tmp );
		grunt.file.mkdir( tmp );

		grunt.log.write( "\nUsing SVGO to optimize.\n" );

		readDir( svgosrc )
		.then( function( files ){
			var promise = new RSVP.Promise();
			var promises = [];
			files.forEach( function( file ){
				var p;
				if( file.match( /svg|png/ ) ){
					p = new RSVP.Promise();

					readFile( svgosrc + file )
					.then( function( data , err ){
						if( err ){
							grunt.fatal( err );
							done( false );
						}
						return optimize( file , data );
					})
					.then( function( result , err ){
						if( err ){
							grunt.fatal( err );
							done( false );
						}
						return writeFile( tmp + file , result );
					})
					.then( function( _null , err ){
						if( err ){
							grunt.fatal( err );
							done( false );
						} else {
							p.resolve();
						}
					});
					promises.push( p );
				}
			});
			RSVP.all( promises ).then( function(){
				promise.resolve();
			});
			return promise;
		})
		.then( function(){
			// create the output directory
			grunt.file.mkdir( config.dest );

			// create the output icons directory
			grunt.file.mkdir( config.dest + pngfolder );


			// minify the source of the grunticon loader and write that to the output
			grunt.log.write( "\ngrunticon now minifying the stylesheet loader source." );
			var banner = grunt.file.read( asyncCSSBanner );
			var min = banner + "\n" + uglify.minify( asyncCSS ).code;
			var loaderCodeDest = config.dest + loadersnippet;
			grunt.file.write( loaderCodeDest, min );
			grunt.log.write( "\ngrunticon loader file created." );

			// take it to phantomjs to do the rest
			grunt.log.write( "\ngrunticon now spawning phantomjs..." );
			var phantomJsPath = require('phantomjs').path;
			grunt.log.write('(using path: ' + phantomJsPath + ')');


			grunt.util.spawn({
				cmd: phantomJsPath,
				args: [
					config.files.phantom,
					tmp,
					config.dest,
					loaderCodeDest,
					previewHTMLsrc,
					datasvgcss,
					datapngcss,
					urlpngcss,
					previewhtml,
					pngfolder,
					cssprefix,
					cssbasepath,
					customselectors,
					width,
					height,
					colors
				],
				fallback: ''
			}, function(err, result, code) {
				// TODO boost this up a bit.
				if( err ){
					grunt.log.write("\nSomething went wrong with phantomjs...");
					grunt.fatal( result.stderr );
					done( false );
				} else {
					grunt.log.write( result.stdout );
					grunt.file.delete( tmp );
					done();
				}
			});
		});
	});
};
