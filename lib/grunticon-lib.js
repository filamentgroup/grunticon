/*global require:true*/
/*global module:true*/
/*global __dirname:true*/
/*global console:true*/
(function(){
	"use strict";

	var path = require( "path" );
	var os = require( "os" );

	var fs = require( "fs-extra" );
	var uglify = require( "uglify-js" );
	var DirectoryColorfy = require( "directory-colorfy" );
	var DirectoryEncoder = require( "directory-encoder" );
	var svgToPng = require( "svg-to-png" );
	var _ = require( "lodash" );
	_.mixin({ 'defaultsDeep': require('merge-defaults') });

	var helper = require( "./grunticon-helper.js" );

	var defaults = {
		datasvgcss: "icons.data.svg.css",
		datapngcss: "icons.data.png.css",
		urlpngcss: "icons.fallback.css",
		files: {
			loader: path.join( __dirname, "..", "static", "grunticon.loader.js"),
			embed: path.join( __dirname, "..", "static", "grunticon.embed.js"),
			corsEmbed: path.join( __dirname, "..", "static", "grunticon.embed.cors.js"),
			banner: path.join( __dirname, "..", "static", "grunticon.loader.banner.js")
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
		corsEmbed: false,
		logger: {
			verbose: console.info,
			fatal: console.error,
			ok: console.log
		}
	};


	var Grunticon = function(files, output, config){
		config = config || {};

		if( !Array.isArray( files ) ){
			throw new Error( "The first argument passed into the Grunticon constructor must be an array of files" );
		}

		if( typeof output !== "string" ){
			throw new Error( "The second argument passed into the Grunticon constructor must be a string, a path to an output directory" );
		}

		this.files = files;
		this.output = output;

		this.options = _.defaultsDeep( config, defaults );
		this.logger = this.options.logger;
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
