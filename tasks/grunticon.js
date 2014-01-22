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
	var svgToPng = require( 'svg-to-png' );

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
		var tmp = path.resolve( "tmp" );
		grunt.file.mkdir( tmp );
		try{
			var dc = new DirectoryColorfy( config.src, tmp, {
				colors: config.colors
			});
			colorFiles = dc.convert();
		} catch( e ){
			grunt.fatal(e);
			done( false );
		}

		//copy non color config files into temp directory
		var transferFiles = this.files.filter( function( f ){
			return !f.src[0].match( /\.colors/ );
		});

		transferFiles.forEach( function( f ){
			var filenameArr = f.src[0].split( "/" ),
				filename = filenameArr[filenameArr.length - 1];
			grunt.file.copy( f.src[0], path.join( tmp, filename ) );
		});

		grunt.log.writeln("Converting SVG to PNG");
		svgToPng.convert( tmp, config.dest, svgToPngOpts )
		.then( function( result , err ){
			if( err ){
				grunt.fatal( err );
			}

			var svgde = new DirectoryEncoder(tmp, path.join( config.dest, config.datasvgcss ), o ),
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
				helper.createPreview(tmp, config.dest, config.defaultWidth, config.defaultHeight, min, config.previewhtml, config.cssprefix);
			} catch(er) {
				grunt.fatal(er);
			}


			grunt.log.writeln( "Delete Temp Files" );
			grunt.file.delete( tmp );
			done();
		});

	});
};
