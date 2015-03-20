/*global require:true*/
(function(exports){
	"use strict";

	var path = require( "path" );
	var fs = require( "fs-extra" );

	var uglify = require( "uglify-js" );
	var DirectoryColorfy = require( "directory-colorfy" );
	var DirectoryEncoder = require( "directory-encoder" );
	var svgToPng = require( "svg-to-png" );

	var helper = require( "./grunticon-helper.js" );

	exports.process = function(files, config, grunt, cb){
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
			cb( false );
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
					cb( false );
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
					cb( false );
				}

				grunt.verbose.writeln( "Grunticon now creating Preview File" );
				try {
					helper.createPreview( tmp, config );
				} catch(er) {
					grunt.fatal(er);
					cb( false );
				}

				grunt.verbose.writeln( "Delete Temp Files" );
				fs.removeSync( tmp );

				grunt.log.ok( "Grunticon processed " + files.length + " files." );

				cb();
			});
		});
	};

}(typeof exports === 'object' && exports || this));
