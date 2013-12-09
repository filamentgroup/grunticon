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
	var fs = require( 'fs' );
	var path = require( 'path' );

	var Handlebars = require( 'handlebars' );
	var DirectoryEncoder = require( 'directory-encoder' );
	var RSVP = require( 'rsvp' );
	var _ = require( 'lodash' );

	var svgToPng = require( path.join( '..', 'lib', 'svg-to-png' ) );
	var DirectoryColorfy = require( path.join( '..', 'lib', 'directory-colorfy' ) );

	var imgStats = require( path.join( '..', 'lib', 'img-stats' ) );
	var helper = require( path.join( '..', 'lib', 'grunticon-helper' ) );

	grunt.registerMultiTask( 'grunticon', 'A mystical CSS icon solution.', function() {
		var done = this.async();

		// just a quick starting message
		grunt.log.write( "Look, it's a grunticon!\n" );

		// get the config
		var config = this.options({
			datasvgcss: "icons.data.svg.css",
			datapngcss: "icons.data.png.css",
			urlpngcss: "icons.fallback.css",
			files: {
				loader: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.js'),
				banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
				preview: path.join( __dirname, 'grunticon', 'static', 'preview.html'),
				phantom: path.join( __dirname,  'grunticon', 'phantom.js')
			},
			previewhtml: "preview.html",
			loadersnippet: "grunticon.loader.txt",
			cssbasepath: path.sep,
			customselectors: {}
		});

		// fail if config or no src or dest config
		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your grunt.js file" );
			done( false );
		}

		// make sure src and dest have / at the end
		if( !config.src.match( path.sep + '$' ) ){
			config.src += path.sep;
		}
		if( !config.dest.match( path.sep + '$' ) ){
			config.dest += path.sep;
		}

		var files = fs.readdirSync( config.src );
		files = files.filter( function( file ){
			return file.match( /png|svg/ );
		});
		if( files.length === 0 ){
			grunt.log.writeln( "Grunticon has no files to read!" );
			done();
		}


		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png";
		pngfolder = path.join.apply( null, pngfolder.split( path.sep ) );

		// make sure pngfolder has / at the end
		if( !pngfolder.match( path.sep + '$' ) ){
				pngfolder += path.sep;
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
		var colors = config.colors || {};

		// create the output directory
		grunt.file.mkdir( config.dest );

		// minify the source of the grunticon loader and write that to the output
		grunt.log.writeln( "grunticon now minifying the stylesheet loader source." );
		var banner = grunt.file.read( config.files.banner );
		var min = banner + "\n" + uglify.minify( config.files.loader ).code;
		var loaderCodeDest = config.dest + config.loadersnippet;
		grunt.file.write( loaderCodeDest, min );
		grunt.log.writeln( "grunticon loader file created." );

		var svgToPngOpts = {
			dest: config.dest,
			defaultWidth: width,
			defaultHeight: height
		};

		var o = {
			pngfolder: pngfolder,
			customselectors: config.customselectors,
			template: path.resolve( path.join( config.src, "..", "default-css.hbs" ) ),
			noencodepng: false
		};

		var o2 = {
			pngfolder: pngfolder,
			customselectors: config.customselectors,
			template: path.resolve( path.join( config.src, "..", "default-css.hbs" ) ),
			noencodepng: true
		};

		grunt.log.writeln("Coloring SVG files");
		var colorFiles;
		try{
			var dc = new DirectoryColorfy( config.src, config.src, colors );
			colorFiles = dc.convert();
		} catch( e ){
			grunt.fatal(e);
			done( false );
		}

		grunt.log.writeln("Converting SVG to PNG");
		svgToPng.convert( config.src, pngfolder, svgToPngOpts )
		.then( function( result, err ){
			if( err ){
				grunt.fatal( err );
			}

			var svgde = new DirectoryEncoder( config.src, path.join( config.dest, config.datasvgcss ), o ),
				pngde = new DirectoryEncoder( path.join( config.dest, pngfolder ) , path.join( config.dest, config.datapngcss ), o ),
				pngdefall = new DirectoryEncoder( path.join( config.dest, pngfolder ) , path.join( config.dest, config.urlpngcss ), o2 );

			grunt.log.writeln("Writing CSS");
			try {
				svgde.encode();
				pngde.encode();
				pngdefall.encode();
			} catch( e ){
				grunt.fatal( e );
				done( false );
			}


			grunt.log.writeln( "Grunticon now creating Preview File" );
			try {
				helper.createPreview(config.src, config.dest, width, height, min, config.previewhtml);
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
