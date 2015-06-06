/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global __dirname:true*/
/*global require:true*/
var path = require( 'path' );
var os = require( 'os' );

var Grunticon = require( 'grunticon-lib' );

module.exports = function( grunt , undefined ) {
	"use strict";

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

		var gicon = new Grunticon(files, config.dest, config);

		gicon.process(function( result ) {
			done( result );
		});
	});
};
