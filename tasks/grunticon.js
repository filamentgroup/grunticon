/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

	grunt.registerMultiTask( 'grunticon', 'A mystical CSS icon solution.', function() {

		// just a quick starting message
		grunt.log.write( "Look, it's a grunticon!\n" );

		// get the config
		var config = typeof( this.data ) === 'object' ? this.data : {};

		// make sure src and dest have / at the end
		var src = this.file.src;
		if( !src.match( /\/$/ ) ){
				src += "/";
		}
		var dest = this.file.dest;
		if( !dest.match( /\/$/ ) ){
				dest += "/";
		}

		var asyncCSS = grunt.task.getFile( "grunticon/static/grunticon.loader.js" );
		var asyncCSSBanner = grunt.task.getFile( "grunticon/static/grunticon.loader.banner.js" );
		var previewHTMLsrc = grunt.task.getFile( "grunticon/static/preview.html" );

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

		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png/";
		// make sure pngfolder has / at the end
		if( !pngfolder.match( /\/$/ ) ){
				pngfolder += "/";
		}

		// css class prefix
		var cssprefix = config.cssprefix || "icon-";

		// create the output directory
		grunt.file.mkdir( dest );

		// create the output icons directory
		grunt.file.mkdir( dest + pngfolder );

		// minify the source of the grunticon loader and write that to the output
		grunt.log.write( "\ngrunticon now minifying the stylesheet loader source." );
		var asyncsrc = grunt.file.read( asyncCSS );
		var banner = grunt.file.read( asyncCSSBanner );
		var min = banner + "\n" + grunt.helper('uglify', asyncsrc );
		var loaderCodeDest = dest + loadersnippet;
		grunt.file.write( loaderCodeDest, min );
		grunt.log.write( "\ngrunticon loader file created." );

		// take it to phantomjs to do the rest
		grunt.log.write( "\ngrunticon now spawning phantomjs..." );

		grunt.utils.spawn({
			cmd: 'phantomjs',
			args: [
				grunt.task.getFile('grunticon/phantom.js'),
				src,
				dest,
				loaderCodeDest,
				previewHTMLsrc,
				datasvgcss,
				datapngcss,
				urlpngcss,
				previewhtml,
				pngfolder,
				cssprefix,
				cssbasepath
			],
			fallback: ''
		}, function(err, result, code) {
			// TODO boost this up a bit.
			grunt.log.write("\nSomething went wrong with phantomjs...");
		});

	});

};
