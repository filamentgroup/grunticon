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
	var path = require( 'path' );

	var RSVP = require( path.join( '..', 'lib', 'rsvp' ) );
	var crushPath = require( 'pngcrush-installer' ).getBinPath();
	var crusher = require( path.join( '..', 'lib', 'pngcrusher' ) );
	var grunticoner = require( path.join( '..', 'lib', 'grunticoner' ) );

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

	var optimize = function( file , data , opt ){
		var promise = new RSVP.Promise();
		try{
			if( file.match( /png/ ) || !opt ){
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
			grunt.log.error( e + ": File - " + file);
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
			loader: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
			preview: path.join( __dirname, 'grunticon', 'static', 'preview.html'),
			phantom: path.join( __dirname,  'grunticon', 'phantom.js')
		};
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
		var loadersnippet = config.loadersnippet || "grunticon.loader.txt";

		// css references base path for the loader
		var cssbasepath = config.cssbasepath || path.sep;

		var customselectors = JSON.stringify( config.customselectors ) || "{}";

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
		var colors = JSON.stringify( config.colors || {} );

		var svgosrc = config.src;
		var tmp = path.join( config.dest , 'tmp' , path.sep );

		var compressPNG = config.pngcrush,
			render, writeCSS;


		// create temp directory
		grunt.log.write( "creating temp directory at:" + tmp );
		if( grunt.file.exists( tmp ) ){
			grunt.file.delete( tmp );
		}
		grunt.file.mkdir( tmp );


		readDir( svgosrc )
		.then( function( files ){
			var promise = new RSVP.Promise();
			var promises = [];
			if( config.svgo ){
				grunt.log.write( "\nUsing SVGO to optimize.\n" );
			}
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
						return optimize( file , data , config.svgo );
					})
					.then( function( result , err ){
						if( err ){
							grunt.fatal( err );
							done( false );
						}
						return writeFile( path.join( tmp , file) , result );
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

			// create the tmp output icons directory
			if( grunt.file.exists( path.join( tmp , pngfolder ))){
				grunt.file.delete( path.join( tmp, pngfolder ));
			}
			grunt.file.mkdir( path.join( tmp , pngfolder ));


			// minify the source of the grunticon loader and write that to the output
			grunt.log.write( "\ngrunticon now minifying the stylesheet loader source." );
			var banner = grunt.file.read( asyncCSSBanner );
			var min = banner + "\n" + uglify.minify( asyncCSS ).code;
			var loaderCodeDest = config.dest + loadersnippet;
			grunt.file.write( loaderCodeDest, min );
			grunt.log.write( "\ngrunticon loader file created." );



			var callPhantom = function( pngf, temp, writeCSS , callback){
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
						pngf, //path.join( "tmp","png", path.sep),
						cssprefix,
						cssbasepath,
						customselectors,
						width,
						height,
						colors,
						temp,
						writeCSS
					],
					fallback: ''
				}, callback );
			};

			var crush = function( pngfolder ){
				grunt.log.write( "\ngrunticon now spawning pngcrush..." );
				grunt.log.writeln('(using path: ' + crushPath + ')');
				var tmpPngfolder = path.join( tmp, pngfolder );

				if( grunt.file.exists( path.join( config.dest , pngfolder ) ) ){
					grunt.file.delete( path.join( config.dest, pngfolder ) );
				}

				crusher.crush({
					input: tmpPngfolder,
					outputDir:  path.join( config.dest , pngfolder ),
					crushPath: crushPath
				}, function( stdout , stderr ){
					grunt.verbose.write( stdout );
					grunt.verbose.write( stderr );

					grunt.log.writeln( "Writing CSS" );
					readDir( tmp )
					.then( function( files , err ){
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
						files = files.filter( function( file ){
							var stats = fs.lstatSync( path.resolve( path.join( tmp , file ) ) );
							if( !stats.isDirectory() &&
								( path.extname( file ) === ".svg" || path.extname( file ) === ".png" ) ){
								return file;
							}
						});
						var newFiles = GruntiFile.colorConfig( files , {
							inputDir: path.resolve( tmp ),
							colors: JSON.parse( colors )
						});
						files.push.apply( files , newFiles );
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
							})
							.then( function( stats , err ){
								var res = gFile.getCSSRules( stats, pngfolder, cssprefix, config );
								dataarr.push( res );
								if( idx +1 === files.length ){
									GruntiFile.writeCSS( dataarr, o );
									grunt.file.delete( tmp );
									done();
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
			if( render && writeCSS ){
				pngpath = pngfolder;
			} else {
				pngpath = path.join( "tmp", pngfolder , path.sep );
			}
			callPhantom( pngpath, render, writeCSS, function(err, result, code) {
				// TODO boost this up a bit.
				if( err ){
					grunt.log.write("\nSomething went wrong with phantomjs...");
					grunt.fatal( result.stderr );
					done( false );
				} else {
					grunt.log.write( result.stdout );
					if( render && writeCSS ){
						grunt.file.delete( tmp );
						done();
					} else {
						crush( pngfolder );
					}
				}
			});

		});
	});
};
