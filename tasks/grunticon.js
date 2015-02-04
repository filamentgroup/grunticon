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
	var os = require( 'os' );

	var fs = require( 'fs-extra' );
	var uglify = require( 'uglify-js' );

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
				embed: path.join( __dirname, 'grunticon', 'static', 'grunticon.embed.js'),
				corsEmbed: path.join( __dirname, 'grunticon', 'static', 'grunticon.embed.cors.js'),
				banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js')
			},
			previewhtml: "preview.html",
			loadersnippet: "grunticon.loader.js",
			cssbasepath: path.sep,
			customselectors: {},
			cssprefix: ".icon-",
			defaultWidth: "400px",
			defaultHeight: "300px",
			colors: {},
			dynamicColorOnly: false,
			pngfolder: "png",
			pngpath: "",
			template: "",
			tmpPath: os.tmpDir(),
			tmpDir: "grunticon-tmp",
			previewTemplate: path.join( __dirname, "..", "example", "preview.hbs" ),
			compressPNG: false,
			optimizationLevel: 3,
			enhanceSVG: false,
			corsEmbed: false
		});

		// just a quick starting message
		grunt.verbose.writeln( "Look, it's a grunticon!" );

		var files = this.files.filter( function( file ){
			return file.src[0].match( /png|svg/ );
		});
		if( files.length === 0 ){
			grunt.log.writeln( "Grunticon has no files to read!" );
			done();
			return;
		}

		files = files.map( function( file ){
			return file.src[0];
		});

		config.dest = this.files[0].orig.dest;

		if( !config.dest || config.dest && config.dest === "" ){
			grunt.fatal("The destination must be a directory");
			done( false );
		}

		// folder name (within the output folder) for generated png files
		var pngfolder = path.join.apply( null, config.pngfolder.split( path.sep ) );

		// create the output directory
		fs.mkdirpSync( config.dest );

		// minify the source of the grunticon loader and write that to the output
		grunt.verbose.writeln( "grunticon now minifying the stylesheet loader source." );
		var banner = fs.readFileSync( config.files.banner );
		config.min = banner + "\n" + uglify.minify( config.files.loader ).code;
		if( config.enhanceSVG ){
			config.min += uglify.minify( config.files.embed ).code;
			if( config.corsEmbed ){
				config.min += uglify.minify( config.files.corsEmbed ).code;
			}
		}
		fs.writeFileSync( path.join( config.dest, config.loadersnippet ), config.min );
		grunt.verbose.writeln( "grunticon loader file created." );

		var svgToPngOpts = {
			defaultWidth: config.defaultWidth,
			defaultHeight: config.defaultHeight,
			compress: config.compressPNG,
			optimizationLevel: config.optimizationLevel
		};

		var o = {
			pngfolder: pngfolder,
			pngpath: config.pngpath,
			customselectors: config.customselectors,
			template: config.template ? path.resolve( config.template ) : "",
			previewTemplate: path.resolve( config.previewTemplate ),
			noencodepng: false,
			prefix: config.cssprefix
		};

		var o2 = JSON.parse(JSON.stringify(o)); /* clone object */
		o2.noencodepng = true;

		grunt.verbose.writeln("Coloring SVG files");
		// create the tmp directory
		var tmp = path.join( config.tmpPath, config.tmpDir );
		if( fs.existsSync( tmp ) ){
			fs.removeSync( tmp );
		}
		fs.mkdirpSync( tmp );
		var dc;
		try{
			dc = new DirectoryColorfy( files, tmp, {
				colors: config.colors,
				dynamicColorOnly: config.dynamicColorOnly
			});
		} catch( e ){
			grunt.fatal(e);
			done( false );
		}

		dc.convert()
		.then(function(){
			//copy non color config files into temp directory
			var transferFiles = files.filter( function( f ){
				return !f.match( /\.colors/ );
			});

			transferFiles.forEach( function( f ){
				var filename = path.basename(f);
				fs.copySync( f, path.join( tmp, filename ) );
			});

			grunt.verbose.writeln("Converting SVG to PNG");

			var tmpFiles = fs.readdirSync( tmp )
				.map( function( file ){
					return path.join( tmp, file );
				});

			var svgFiles = tmpFiles.filter( function( file ){
				return path.extname( file ) === ".svg";
			}),
			pngFiles = tmpFiles.filter( function( file ){
				return path.extname( file ) === ".png";
			});

			pngFiles.forEach(function( f ){
				var filename = path.basename(f);
				fs.copySync( f, path.join( config.dest, pngfolder, filename ) );
			});


			svgToPng.convert( svgFiles, path.join( config.dest, pngfolder ), svgToPngOpts )
			.then( function( result , err ){
				if( err ){
					grunt.fatal( err );
					done( false );
				}

				var pngs = fs.readdirSync( path.join( config.dest, pngfolder ) )
				.map(function( file ){
					return path.join( config.dest, pngfolder, file );
				});

				var svgde = new DirectoryEncoder( tmpFiles, path.join( config.dest, config.datasvgcss ), o ),
					pngde = new DirectoryEncoder( pngs, path.join( config.dest, config.datapngcss ), o ),
					pngdefall = new DirectoryEncoder( pngs, path.join( config.dest, config.urlpngcss ), o2 );

				grunt.verbose.writeln("Writing CSS");
				try {
					svgde.encode();
					pngde.encode();
					pngdefall.encode();
				} catch( e ){
					grunt.fatal( e );
					done( false );
				}

				grunt.verbose.writeln( "Grunticon now creating Preview File" );
				try {
					helper.createPreview( tmp, config );
				} catch(er) {
					grunt.fatal(er);
					done( false );
				}

				grunt.verbose.writeln( "Delete Temp Files" );
				fs.removeSync( tmp );

				grunt.log.ok( "Grunticon processed " + files.length + " files." );

				done();
			});
		});

	});
};
