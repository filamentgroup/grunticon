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

	var path = require( 'path' );

	var uglify = require( 'uglify-js' );
	var RSVP = require( 'rsvp' );

	var DirectoryColorfy = require( 'directory-colorfy' );
	var DirectoryEncoder = require( 'directory-encoder' );

	var helper = require( path.join( '..', 'lib', 'grunticon-helper' ) );

	grunt.registerMultiTask( 'grunticon', 'A mystical CSS icon solution.', function() {
		var done = this.async();

		// get the config
		var config = this.options({
			datasvgcss: "icons.data.svg.css",
			datapngcss: "icons.data.png.css",
			urlpngcss: "icons.fallback.css",
			files: {
				loader: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.js'),
				banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js')
			},
			previewhtml: "preview.html",
			loadersnippet: "grunticon.loader.txt",
			cssbasepath: path.sep,
			customselectors: {},
			cssprefix: ".icon-",
			defaultWidth: "400px",
			defaultHeight: "300px",
			colors: {},
			pngfolder: "png",
			template: ""
		});

		// just a quick starting message
		grunt.log.writeln( "Look, it's a grunticon!" );

		var files = this.files.filter( function( file ){
			return file.src[0].match( /png|svg/ );
		});
		if( files.length === 0 ){
			grunt.log.writeln( "Grunticon has no files to read!" );
			done();
		}

		files = files.map( function( file ){
			return file.src[0];
		});

		config.src = this.files[0].orig.cwd;
		config.dest = this.files[0].orig.dest;

		// folder name (within the output folder) for generated png files
		var pngfolder = path.join.apply( null, config.pngfolder.split( path.sep ) );

		// create the output directory
		grunt.file.mkdir( config.dest );

		// minify the source of the grunticon loader and write that to the output
		grunt.log.writeln( "grunticon now minifying the stylesheet loader source." );
		var banner = grunt.file.read( config.files.banner );
		var min = banner + "\n" + uglify.minify( config.files.loader ).code;
		grunt.file.write( path.join( config.dest, config.loadersnippet ), min );
		grunt.log.writeln( "grunticon loader file created." );

		var svgToPngOpts = {
			pngfolder: pngfolder,
			defaultWidth: config.defaultWidth,
			defaultHeight: config.defaultHeight
		};

		var o = {
			pngfolder: pngfolder,
			customselectors: config.customselectors,
			template: path.resolve( config.template ),
			noencodepng: false,
			prefix: config.cssprefix
		};

		var o2 = {
			pngfolder: pngfolder,
			customselectors: config.customselectors,
			template: path.resolve( config.template ),
			noencodepng: true,
			prefix: config.cssprefix
		};

		grunt.log.writeln("Coloring SVG files");
		var colorFiles;
		try{
			var dc = new DirectoryColorfy( config.src, config.src, config.colors );
			colorFiles = dc.convert();
		} catch( e ){
			grunt.fatal(e);
			done( false );
		}

		// svgToPng is optional
		var svgToPng;
		try {
			svgToPng = require( 'svg-to-png' );
		} catch (e) {
			svgToPng = null;
		}

		var isShouldConvertToPng = config.datapngcss || config.urlpngcss;
		if (isShouldConvertToPng) {
			if (!svgToPng) {
				grunt.fatal('svg-to-png is not installed. ' +
							'Install it using `npm install svg-to-png` ' +
							'or set datapngcss and urlpngcss to null in ' +
							'options to disable png generation.');
				done( false );
			}
			grunt.log.writeln( "Converting SVG to PNG" );
		}
		RSVP.Promise.cast(
			isShouldConvertToPng ? svgToPng.convert( config.src, config.dest, svgToPngOpts ) : false
		)
		.then( function( result , err ){
			if( err ){
				grunt.fatal( err );
			}

			var svgde = new DirectoryEncoder( config.src, path.join( config.dest, config.datasvgcss ), o ),
				pngde, pngdefall;

			if (result !== false) {
				if (config.datapngcss) {
					pngde = new DirectoryEncoder( path.join( config.dest, pngfolder ) , path.join( config.dest, config.datapngcss ), o );
				}
				if (config.urlpngcss) {
					pngdefall = new DirectoryEncoder( path.join( config.dest, pngfolder ) , path.join( config.dest, config.urlpngcss ), o2 );
				}
			}

			grunt.log.writeln("Writing CSS");
			try {
				svgde.encode();
				if (pngde) {
					pngde.encode();
				}
				if (pngde) {
					pngdefall.encode();
				}
			} catch( e ){
				grunt.fatal( e );
				done( false );
			}


			grunt.log.writeln( "Grunticon now creating Preview File" );
			try {
				helper.createPreview(config.src, config.dest, config.defaultWidth, config.defaultHeight, min, config.previewhtml, config.cssprefix);
			} catch(er) {
				grunt.fatal(er);
			}


			grunt.log.writeln( "Delete Temp Files" );
			colorFiles.forEach( function( file ){
				grunt.file.delete( file );
			});
			done();
		});

	});
};
