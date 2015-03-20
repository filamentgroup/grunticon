/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var path = require( "path" );
	var fs = require( "fs-extra" );

	var uglify = require( "uglify-js" );
	var DirectoryColorfy = require( "directory-colorfy" );
	var DirectoryEncoder = require( "directory-encoder" );
	var svgToPng = require( "svg-to-png" );

	var helper = require( "./grunticon-helper.js" );

	var Grunticon = function(files, output, config){
		this.files = files;
		this.output = output;

		this.logger = config.logger;
		this.options = config;
	};

	Grunticon.prototype.process = function(cb){
		// folder name (within the output folder) for generated png files
		var config = this.options;
		var logger = this.logger;

		var pngfolder = path.join.apply( null, config.pngfolder.split( path.sep ) );

		// create the output directory
		fs.mkdirpSync( this.output );

		// minify the source of the grunticon loader and write that to the output
		logger.verbose( "grunticon now minifying the stylesheet loader source." );
		var banner = fs.readFileSync( config.files.banner );
		config.min = banner + "\n" + uglify.minify( config.files.loader ).code;
		if( config.enhanceSVG ){
			config.min += uglify.minify( config.files.embed ).code;
			if( config.corsEmbed ){
				config.min += uglify.minify( config.files.corsEmbed ).code;
			}
		}
		fs.writeFileSync( path.join( this.output, config.loadersnippet ), config.min );
		logger.verbose( "grunticon loader file created." );

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

		logger.verbose("Coloring SVG files");
		// create the tmp directory
		var tmp = path.join( config.tmpPath, config.tmpDir );
		if( fs.existsSync( tmp ) ){
			fs.removeSync( tmp );
		}
		fs.mkdirpSync( tmp );
		var dc;
		try{
			dc = new DirectoryColorfy( this.files, tmp, {
				colors: config.colors,
				dynamicColorOnly: config.dynamicColorOnly
			});
		} catch( e ){
			logger.fatal(e);
			cb( false );
		}

		dc.convert()
		.then(function(){
			//copy non color config files into temp directory
			var transferFiles = this.files.filter( function( f ){
				return !f.match( /\.colors/ );
			});

			transferFiles.forEach( function( f ){
				var filename = path.basename(f);
				fs.copySync( f, path.join( tmp, filename ) );
			});

			logger.verbose("Converting SVG to PNG");

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
				fs.copySync( f, path.join( this.output, pngfolder, filename ) );
			}, this);


			svgToPng.convert( svgFiles, path.join( this.output, pngfolder ), svgToPngOpts )
			.then( function( result , err ){
				if( err ){
					logger.fatal( err );
					cb( false );
				}

				var pngs = fs.readdirSync( path.join( this.output, pngfolder ) )
				.map(function( file ){
					return path.join( this.output, pngfolder, file );
				}, this);

				var svgde = new DirectoryEncoder( tmpFiles, path.join( this.output, config.datasvgcss ), o ),
					pngde = new DirectoryEncoder( pngs, path.join( this.output, config.datapngcss ), o ),
					pngdefall = new DirectoryEncoder( pngs, path.join( this.output, config.urlpngcss ), o2 );

				logger.verbose("Writing CSS");
				try {
					svgde.encode();
					pngde.encode();
					pngdefall.encode();
				} catch( e ){
					logger.fatal( e );
					cb( false );
				}

				logger.verbose( "Grunticon now creating Preview File" );
				try {
					helper.createPreview( tmp, this.output, config );
				} catch(er) {
					logger.fatal(er);
					cb( false );
				}

				logger.verbose( "Delete Temp Files" );
				fs.removeSync( tmp );

				logger.ok( "Grunticon processed " + this.files.length + " files." );

				cb();
			}.bind( this ));
		}.bind( this ));
	};

	module.exports = Grunticon;

}(typeof exports === 'object' && exports || this));
