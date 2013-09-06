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
				grunt.file.delete( resetDirs[key] );
				grunt.log.ok( '.\b - Deleting '+key+' directory' );
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

		// Formerly callPhantom
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

		var processPNGs = function(){

			if( crushingIt ) {
				grunt.log.ok('CRUSHING IT: '+pngSrcDir+' --> '+pngDestDir);
			} else {
				grunt.log.ok('COPYING IT: '+pngSrcDir+' --> '+pngDestDir);
			}

			// List the directory of crushed files
			readDir( pngSrcDir )

			// Filter out non-PNGs, build dataArray
			.then( function( files , err ){
				var dataArray = [];

				if( err ){
					grunt.log.ok('readDir error: '+err);
				} else {
					grunt.log.ok('Looks like about '+files.length+' files you’ve got here.');

					files.forEach(function(pngFileName, idx ){
						// Crush or copy
						if( path.extname( pngFileName ) == '.png' ){
							if( crushingIt ) {
								crusher.crush({

									inputFilePath: path.join(pngSrcDir, pngFileName),
									outputFilePath: path.join(pngDestDir, pngFileName),

									crushPath: pngcrushBinPath,
									maxBuffer: 250,
									verboseMode: grunt.option('verbose')

								}, function(p){
									console.log( 'processPNGCallback' );
									processPNGCallback(p);
								});
							} else {
								grunt.log.ok('['+(idx+1)+'/'+files.length+'] Copying '+pngFileName);
								grunt.file.copy(
									path.join(pngSrcDir, pngFileName),
									path.join(pngDestDir, pngFileName)
								);
								processPNGCallback(pngFileName);
							}
						} else {
							grunt.log.ok('['+(idx+1)+'/'+files.length+'] Ignoring '+pngFileName);
						}

					});
				}
			})
			.then( function(){
				declareVictory();
			});
		}

		var processPNGCallback = function( pngFileName ){

			grunt.log.ok('PROCESSING '+pngFileName);

			var gFile = new GruntiFile( pngFileName );
			var imgLoc = path.resolve( path.join( pngFileName ) );

			grunt.log.ok('TEST1: '+imgLoc);

			gFile.setImageData( imgLoc );

			// At this point we’ve only got PNGs, so we can make assumptions.
			gFile.setPngLocation({
				relative: pngDestDirName,
				absolute: path.resolve( pngDestDirName )
			});

			grunt.log.ok('TEST2');

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
						outputDir: destDir,
						fallbackcss: urlPngCss,
						cssbasepath: cssBasePath
					});
				}
			});

		}

		var declareVictory = function(){
			grunt.log.ok('All done!');

			// Brought to you by unicornsay.
			// TODO: Does it work on Windows?
			// dot + backspace hack is so grunt.log.ok respects dat whitespace
			grunt.log.ok( ".\b"+grunt.file.read( config.files.mascot ) );
			done();
		}

		/*
		Convert SVGs to PNGs
		*/

		grunt.log.ok('Setting a phantomjs upon '+srcDir+' forthwith');
		grunt.log.ok('Converting '+svgFiles.length+' SVG'+( svgFiles.length == 1 ? '' : 's' )+' to PNG format with phantomjs ('+phantomJsPath+')');
		grunt.log.writeln( '\n'+Array(underlineLength+1).join("=")+'\n' );

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
				path.join(pngDestDir,path.sep), // destination
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
		}, function(err, result, code){
			grunt.log.ok('PHANTOMJS OUT');

				if( !err ){
					grunt.log.writeln( '\n'+Array(underlineLength+1).join("=")+'\n' );
					processPNGs( pngSrcDir, pngDestDir );
				} else {
					grunt.log.ok('ERROR ENCOUNTERED');
				}

			}
		);

		// Print everything to the screen
		phantom.stdout.pipe(process.stdout);
		phantom.stderr.pipe(process.stderr);

	});
};
