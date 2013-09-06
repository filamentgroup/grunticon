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
	var pngcrushBinPath; // defined in grunt.registerMultiTask
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
		grunt.log.subhead( "Look, it’s a grunticon!" );
		var config = this.options();

		config.files = {
			loader: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			banner: path.join( __dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
			preview: path.join( __dirname, 'grunticon', 'static', 'preview.html'),
			phantom: path.join( __dirname,  'grunticon', 'phantom.js'),
			mascot: path.join( __dirname, 'grunticon', 'static', 'excessive.txt')
		};

		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your grunt.js file" );
			done( false );
		}

		// Load ’er up
		var asyncCSS = config.files.loader;
		var asyncCSSBanner = config.files.banner;
		var previewHTMLsrc = config.files.preview;

		var dataSvgCSS = config.datasvgcss || "icons.data.svg.css";
		var dataPngCSS = config.datapngcss || "icons.data.png.css";
		var urlPngCSS = config.urlpngcss || "icons.fallback.css";

		var previewHTML = config.previewhtml || "preview.html";
		var loaderSnippet = config.loadersnippet || "grunticon.loader.html";
		var cssBasePath = config.cssbasepath || path.sep;
		var customSelectors = JSON.stringify( config.customselectors ) || "{}";

		var pngDestDirName = config.pngfolder || "png";
		var pngSrcDirName = pngDestDirName;
		var cssClassPrefix = config.cssprefix || "icon-";

		var width = config.defaultWidth || "400px";
		var height = config.defaultHeight || "300px";

		var done = this.async();

		/*
		PNG/SVG files will be read from here.
		SVGs are embedded in CSS, processsed to PNGs with phantomjs,
		and then deleted. PNGs are dropped in pngSrcDir for more lovin’.
		*/
		var srcDir = config.src;

		/*
		This is where everything else lives. pngDestDir is a subfolder.
		*/
		var destDir = config.dest;

		/*
		PNG files here will be either crushed by pngcrush to pngDestDir
		or copied directly to pngDestDir if the user disables pngcrush.
		*/
		var pngSrcDir = path.join(destDir, 'grunticon-tmp');

		/*
		PNG files here will be embedded in the PNG data CSS file
		and linked in the PNG reference CSS file.
		*/
		var pngDestDir = path.join(destDir, pngDestDirName);

		/*
		Files to process.
		TODO: Change to native grunt file object.
		*/
		var svgFiles = [];
		var pngFiles = [];
		var files = fs.readdirSync( srcDir );

		files = files.filter( function( file ){
			if ( path.extname(file) === ".svg" ) {
				svgFiles.push(file);
			} else if( path.extname(file) === ".png" ){
				pngFiles.push(file);
			} else {
				grunt.log.debug("Skipped " + path.join( srcDir, file ));
				return;
			}
			return file;
		});

		if( files.length === 0 ){
			grunt.fatal( srcDir+" contains no SVG/PNG files. Grunticon out." );
			done(false);
		}

		// pngcrush
		var crushingIt = false;

		// config.pngcrush is set but is not "true". Assume it's a path to pngcrush.
		if( config.pngcrush ) {
			if( config.pngcrush === true ){
				try {
					pngcrushBinPath = require( 'pngcrush-installer' ).getBinPath();
					crushingIt = true;
				} catch (err){
					grunt.fatal("pngcrush is not installed. Your options:\n"+
					"  1. Install pngcrush with `npm install pngcrush-installer`\n"+
					"  2. Install pngcrush with homebrew and set `pngcrush` to\n"+
					"     `/usr/local/bin/pngcrush` in your Gruntfile");
					done(false);
				}
			} else {
				pngcrushBinPath = config.pngcrush;
				crushingIt = true;
			}
		}

		// Reset!
		var resetDirs = {
			'grunticon destination': destDir,
			'PNG source': pngSrcDir,
			'PNG destination': pngDestDir
		}

		for( var key in resetDirs ){
			grunt.log.ok('Resetting '+key+' ('+resetDirs[key]+')');
			// TODO: switch grunt.log.ok back to grunt.verbose.or.ok
			if( grunt.file.exists( resetDirs[key] ) ){
				// grunt.file.delete( resetDirs[key] );
				// grunt.log.ok( '.\b - Deleting '+key+' directory' );
			} else {
				grunt.log.ok( '.\b - '+key+' directory doesn’t exist and will be created' );
			}
			grunt.log.ok( '.\b - Creating '+key+' directory');
			grunt.file.mkdir( resetDirs[key] );
		}

		// Breathing room
		grunt.log.writeln('')

		// Nice li’l message
		grunt.log.ok( "Processing "+
			svgFiles.length+" SVG file"+( svgFiles.length == 1 ? '' : 's' )+
			" and "+
			pngFiles.length+" PNG file"+( pngFiles.length == 1 ? '' : 's' )+
			" from "+srcDir);

		var banner = grunt.file.read( asyncCSSBanner );
		var min = banner + "\n" + uglify.minify( asyncCSS ).code;
		var loaderCodeDest = path.join(destDir, loaderSnippet);

		grunt.log.ok( 'Writing grunticon loader file: ('+loaderCodeDest+')' );
		grunt.file.write( loaderCodeDest, min );

		var callPhantom = function( phantomPNGFolder, callback){
			var phantomJsPath;
			var temp = true;
			var writeCSS = true;

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

			grunt.log.ok('Converting '+svgFiles.length+' SVG'+( svgFiles.length == 1 ? '' : 's' )+' to PNG format with phantomjs ('+phantomJsPath+')');
			grunt.log.writeln( '\n'+Array(underlineLength+1).join("=")+'\n' );

			// TODO: set debug to true only if grunt is run with --verbose flag
			var phantom = grunt.util.spawn({
				cmd: phantomJsPath,
				args: [
					(grunt.option('verbose') ? '--debug=true' : '--debug=false'),
					config.files.phantom,
					path.join(srcDir,path.sep),
					path.join(pngSrcDir,path.sep),
					loaderCodeDest,
					previewHTMLsrc,
					dataSvgCSS,
					dataPngCSS,
					urlPngCSS,
					previewHTML,
					path.join(phantomPNGFolder,path.sep), // destination
					cssClassPrefix,
					cssBasePath,
					customSelectors,
					width,
					height,
					temp,
					writeCSS,
					grunt.option('verbose'),
				],
				fallback: ''
			}, function(e,r,c){
				// grunt.log.ok('PHANTOMJS OUT');
				callback(e,r,c);
			});

			// Print everything to the screen
			phantom.stdout.pipe(process.stdout);
			phantom.stderr.pipe(process.stderr);

		};

		var processPNGs = function( crushSrc, crushDest ){

			if( crushingIt ) {
				grunt.log.ok('CRUSHING IT');

				// pngcrush
				crusher.crush({
					inputDir: crushSrc,
					outputDir:  crushDest,
					crushPath: pngcrushBinPath,
					maxBuffer: 250,
					verboseMode: grunt.option('verbose')
				},

					function( stdout , stderr, d ){
						// List the directory of crushed files
						readDir( crushDest )

						// Filter out non-PNGs, build dataArray
						.then( function( files , err ){
							var dataArray = [];

							// PNGs only
							files = files.filter( function( file ){
								var stats = fs.lstatSync( path.resolve( path.join( tmpDir , file ) ) );
								if( !stats.isDirectory() && path.extname( file ) !== ".png" ){
									return file;
								} else {
									grunt.log.ok('Rejected: '+file);
								}
							});

							grunt.log.writeln(files.length+' crushed PNG file'+(files.length == 1 ? '' : 's'));

							// Loop through each file, build an array of GruntiFile instances
							files.forEach( function( file, idx ){
								var gFile = new GruntiFile( file );
								var imgLoc = path.resolve( path.join( tmpDir , pngDestDirName ) );

								gFile.setImageData( imgLoc );

								// At this point we’ve only got PNGs, so we can make assumptions.
								gFile.setPngLocation({
									relative: pngDestDirName,
									absolute: path.resolve( path.join( pngDestDir, pngDestDirName ) )
								});

								gFile.stats({
									inputDir: imgLoc,
									defaultWidth: config.defaultWidth,
									defaultHeight: config.defaultHeight
								}).then( function( stats , err ){

									var res = gFile.getCSSRules( stats, pngDestDirName, cssClassPrefix, config );
									dataArray.push( res );

									if( idx + 1 == files.length ){
										grunt.log.ok('My work here is done. Write the CSS.');

										// Write GruntiFiles to CSS
										GruntiFile.writeCSS( dataArray, {
											previewHTMLFilePath: previewHTMLsrc,
											previewFilePath: previewHTML,
											pngdatacss: dataPngCSS,
											asyncCSSpath: path.join( destDir, loaderSnippet),
											datacss: dataSvgCSS,
											outputDir: pngDestDir,
											fallbackcss: urlPngCss,
											cssbasepath: cssBasePath
										});
									}
								});
							});
						});
					}
				); // wowow
			} else {
				grunt.log.ok('NOT CRUSHING IT :C');

				readDir( pngSrcDir ).then(function( files, err ){
					files = files.filter( function( file ){
						var stats = fs.lstatSync(path.resolve( path.join( tmpDir, file )));
						if( !stats.isDirectory() && path.extname( file ) !== ".png" ){
							return file;
						}
					});

					grunt.file.ok('Copy '+file.length+
						' PNG file'+(file.length == 1 ? '' : 's')+
						' from '+pngSrcDir+
						' to '+pngDestDir);

					files.forEach(function(pngFileName, idx){
						grunt.file.ok('Copying '+pngFileName+' (file '+(idx+1)+' of '+file.length+')');
						grunt.file.copy(
							path.join(pngSrcDir, pngFileName),
							path.join(pngDestDir, pngFileName)
						)
					});
				});
			}
		}

		grunt.log.ok('Setting a phantomjs upon '+srcDir+' forthwith');

		callPhantom( srcDir, function(err, result, code) {
			if( !err ){
				grunt.log.writeln( '\n'+Array(underlineLength+1).join("=")+'\n' );

				processPNGs( pngSrcDir, pngDestDir );

				grunt.log.ok('All done!');

				// Brought to you by unicornsay.
				// TODO: Does it work on Windows?
				// dot + backspace hack is so grunt.log.ok respects dat whitespace
				grunt.log.ok( ".\b"+grunt.file.read( config.files.mascot ) );
				done();

			}
		});
	});
};
