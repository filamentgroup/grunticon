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

	var RSVP = require( path.join( '..', 'lib', 'rsvp' ) );
	var crushPath; // defined in grunt.registerMultiTask
	var crusher = require( path.join( '..', 'lib', 'pngcrusher' ) );
	var grunticoner = require( path.join( '..', 'lib', 'grunticoner' ) );
	var underlineLength = 77;
	var GruntiFile = require( path.join( '..', 'lib', 'grunticon-file') ).grunticonFile;

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
		grunt.log.subhead( "Look, it’s a grunticon!" );

		// get the config
		var config = this.options();

		config.files = {
			loader: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
			preview: path.join( __dirname, 'grunticon', 'static', 'preview.html'),
			phantom: path.join( __dirname,  'grunticon', 'phantom.js'),
			mascot: path.join( __dirname, 'grunticon', 'static', 'excessive.txt')
		};
		// fail if config or no src or dest config
		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your grunt.js file" );
			done( false );
		}

		var f = fs.readdirSync( config.src );
		f = f.filter( function( file ){
			return file.match( /png|svg/ );
		});
		if( f.length === 0 ){
			grunt.log.writeln( "Grunticon has no files to read!" );
			done();
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
		var loadersnippet = config.loadersnippet || "grunticon.loader.html";

		// css references base path for the loader
		var cssbasepath = config.cssbasepath || path.sep;

		var customselectors = JSON.stringify( config.customselectors ) || "{}";

		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png";
		pngfolder = path.join.apply( null, pngfolder.split( path.sep ) );

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

		var srcdir = config.src;
		var tmp = path.join( config.dest , 'tmp' );

		var compressPNG = true;
		var pngCrushPath = false;

		// config.pngcrush is set but is not "true". Assume it's a path to pngcrush.
		if( config.pngcrush && config.pngcrush !== true ){
			crushPath = config.pngcrush;
			config.pngcrush = true;
		} else {
			try {
				crushPath = require( 'pngcrush-installer' ).getBinPath();
			} catch (err){
				grunt.fatal("pngcrush is not installed. Your options:\n"+
				"  1. Install pngcrush with `npm install pngcrush-installer`\n"+
				"  2. Install pngcrush with homebrew and set `pngcrush` to\n"+
				"     `/usr/local/bin/pngcrush` in your Gruntfile");
				done(false);
			}
		}

		var compressPNG = config.pngcrush,
			render, writeCSS;

		// create temp directory
		if( grunt.file.exists( tmp ) ){
			grunt.file.delete( tmp );
			grunt.log.debug( "Deleted existing temp directory" );
		}
		grunt.file.mkdir( tmp );
		grunt.log.ok( "Temp directory: " + tmp );

		readDir( srcdir )
		.then( function( files ){
			var promise = new RSVP.Promise();

			files = files.filter( function( file ){
				if ( path.extname(file) === ".svg" || path.extname(file) === ".png" ){
					grunt.file.copy( path.join( srcdir, file ), path.join( tmp, file ) );
					return file;
				} else {
					grunt.log.debug("Skipped " + path.join( srcdir, file ));
				}
			});

			grunt.log.ok( "Copied "+files.length+" SVG/PNG file"+( files.length == 1 ? '' : 's' )+" from "+srcdir+" to "+tmp );

			promise.resolve();

			return promise;
		})
		.then( function(){
			// create the output directory
			grunt.file.mkdir( config.dest );

			// create the tmp output icons directory
			if( grunt.file.exists( path.join( tmp , pngfolder ))){
				grunt.file.delete( path.join( tmp, pngfolder ));
				grunt.log.debug( "Deleted existing temp directory at "+path.join( tmp, pngfolder ) );
			}
			grunt.file.mkdir( path.join( tmp , pngfolder ));

			var banner = grunt.file.read( asyncCSSBanner );
			var min = banner + "\n" + uglify.minify( asyncCSS ).code;
			var loaderCodeDest = path.join(config.dest, loadersnippet);

			grunt.file.write( loaderCodeDest, min );
			grunt.log.ok( "Grunticon loader file: "+loaderCodeDest );

			var callPhantom = function( pngf, temp, writeCSS , callback){
				// take it to phantomjs to do the rest

				var phantomJsPath;

				if( config.phantomjs && config.phantomjs !== true ){
					phantomJsPath = config.phantomjs;
				} else {
					try {
						phantomJsPath = require('phantomjs').path;
					} catch(err) {
						grunt.fatal("phantomjs is not installed. Your options:\n"+
						"  1. Install phantomjs with `npm install phantomjs`\n"+
						"  2. Install phantomjs with homebrew and set `phantomjs` to\n"+
						"     `/usr/local/bin/phantomjs` in your Gruntfile");
						done(false);
					}
				}

				grunt.log.ok('Spawning phantomjs (' + phantomJsPath + '). PREPARE YOURSELF.');
				grunt.log.writeln( Array(underlineLength+1).join("=") );

				// TODO: set debug to true only if grunt is run with --verbose flag
				var phantom = grunt.util.spawn({
					cmd: phantomJsPath,
					args: [
						'--debug=true',
						config.files.phantom,
						path.join(tmp,path.sep),
						path.join(config.dest,path.sep),
						loaderCodeDest,
						previewHTMLsrc,
						datasvgcss,
						datapngcss,
						urlpngcss,
						previewhtml,
						path.join(pngf,path.sep),
						cssprefix,
						cssbasepath,
						customselectors,
						width,
						height,
						temp,
						writeCSS
					],
					fallback: ''
				}, function(e,r,c){
					callback(e,r,c);
				}
				);

				// Print everything to the screen
				phantom.stdout.pipe(process.stdout);
				phantom.stderr.pipe(process.stderr);

			};

			var crush = function( pngfolder ){
				var tmpPngfolder = path.join( tmp, pngfolder );

				grunt.log.writeln( Array(underlineLength+1).join("=") );

				// Delete temp folder
				if( grunt.file.exists( tmpPngfolder ) ){
					grunt.log.ok('Deleting existing temp folder at '+tmpPngfolder)
					grunt.file.delete( tmpPngfolder );
				}

				grunt.file.mkdir(tmpPngfolder);

				grunt.log.ok( "CRUSHING IT (sponsored by "+crushPath+")");

				crusher.crush({
					input: tmpPngfolder,
					outputDir:  path.join( config.dest , pngfolder ),
					crushPath: crushPath,
					maxBuffer: 250
				}, function( stdout , stderr ){
					grunt.verbose.write( stdout );
					grunt.verbose.write( stderr );

					readDir( tmp ).then( function( files , err ){

						var dataarr = [];
						var o = {
							previewHTMLFilePath: previewHTMLsrc,
							previewFilePath: previewhtml,
							pngdatacss: datapngcss,
							asyncCSSpath: path.join( config.dest, loadersnippet),
							datacss: datasvgcss,
							outputdir: config.dest,
							fallbackcss: urlpngcss,
							cssbasepath: cssbasepath
						};

						grunt.log.writeln('Before: '+files.length+' files');

						files = files.filter( function( file ){
							var stats = fs.lstatSync( path.resolve( path.join( tmp , file ) ) );
							if( !stats.isDirectory() &&
								( path.extname( file ) === ".svg" || path.extname( file ) === ".png" ) ){
								return file;
							}
						});

						grunt.log.writeln('After: '+files.length+' files');

						files.forEach( function( file, idx ){
							var gFile = new GruntiFile( file );
							var imgLoc = gFile.isSvg ? tmp : path.resolve( path.join( tmp , pngfolder ) );

							gFile.setImageData( imgLoc );

							gFile.setPngLocation({
								relative: pngfolder,
								absolute: path.resolve( path.join( config.dest, pngfolder ) )
							});

							gFile.stats({
								inputDir: imgLoc,
								defaultWidth: config.defaultWidth,
								defaultHeight: config.defaultHeight
							}).then( function( stats , err ){
								var res = gFile.getCSSRules( stats, pngfolder, cssprefix, config );
								dataarr.push( res );
								if( idx +1 === files.length ){
									GruntiFile.writeCSS( dataarr, o );
								}
							});
						});
					});

				});
			};

			// Get this party started
			if( compressPNG !== false ){
				render = true;
				writeCSS = false;
			} else {
				render = true;
				writeCSS = true;
			}

			var pngpath;
			// FIXME
			if( render && writeCSS ){
				pngpath = pngfolder;
			} else {
				pngpath = pngfolder;
				grunt.log.writeln(' x  FIXME: render='+render+', writeCSS='+writeCSS);
				// pngpath = path.join( "tmp", pngfolder );
			}
			callPhantom( pngpath, render, writeCSS, function(err, result, code) {
				// TODO boost this up a bit.
				if( err ){
					grunt.log.writeln("Something went wrong with phantomjs");
					grunt.fatal( result.stderr );
					done( false );
				} else {
					grunt.log.writeln( result.stdout );
					if( !render || !writeCSS ){
						crush( pngfolder );
					} else {
						grunt.log.writeln('NOT DOING IT ('+pngpath+')');
					}

					// TODO: Handle cleanup with grunt-cleanup
					grunt.file.delete( tmp );

					grunt.log.ok('All done!');

					// Brought to you by unicornsay.
					// TODO: Does it work on Windows?
					// dot + backspace hack is so grunt.log.ok respects dat whitespace
					grunt.log.ok( ".\b"+grunt.file.read( config.files.mascot ) );
					done();

				}
			});

		});
	});
};
