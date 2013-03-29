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

	grunt.registerTask( 'grunticon', 'A mystical CSS icon solution.', function() {
		var done = this.async();

		// just a quick starting message
		grunt.log.write( "Look, it's a grunticon!\n" );

		// get the config
		var config = this.options();

		config.files = {
			loader: __dirname + "/grunticon/static/grunticon.loader.js",
			banner: __dirname + "/grunticon/static/grunticon.loader.banner.js",
			preview: __dirname + "/grunticon/static/preview.html",
			phantom: __dirname + "/grunticon/phantom.js"
		};
		// fail if config or no src or dest config
		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your grunt.js file" );
			return;
		}

		// make sure src and dest have / at the end
		if( !config.src.match( /\/$/ ) ){
				config.src += "/";
		}
		if( !config.dest.match( /\/$/ ) ){
				config.dest += "/";
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
		var cssbasepath = config.cssbasepath || "/";

		var customselectors = JSON.stringify( config.customselectors ) || "{}";

		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png/";
		// make sure pngfolder has / at the end
		if( !pngfolder.match( /\/$/ ) ){
				pngfolder += "/";
		}

		// css class prefix
		var cssprefix = config.cssprefix;
		if( cssprefix === undefined ){
			cssprefix = "icon-";
		}

		// create the output directory
		grunt.file.mkdir( config.dest );

		// create the output icons directory
		grunt.file.mkdir( config.dest + pngfolder );

		// minify the source of the grunticon loader and write that to the output
		grunt.log.write( "\ngrunticon now minifying the stylesheet loader source." );
		var banner = grunt.file.read( asyncCSSBanner );
		var min = banner + "\n" + uglify.minify( asyncCSS ).code;
		var loaderCodeDest = config.dest + loadersnippet;
		grunt.file.write( loaderCodeDest, min );
		grunt.log.write( "\ngrunticon loader file created." );

		// take it to phantomjs to do the rest
		grunt.log.write( "\ngrunticon now spawning phantomjs..." );

		grunt.util.spawn({
			cmd: 'phantomjs',
			args: [
				config.files.phantom,
				config.src,
				config.dest,
				loaderCodeDest,
				previewHTMLsrc,
				datasvgcss,
				datapngcss,
				urlpngcss,
				previewhtml,
				pngfolder,
				cssprefix,
				cssbasepath,
				customselectors
			],
			fallback: ''
		}, function(err, result, code) {
			// TODO boost this up a bit.
			if( err ){
				grunt.log.write("\nSomething went wrong with phantomjs...");
				grunt.log.write( result.stderr );
			}
				grunt.log.write( result.stdout );
			done();
		});
	});
};
