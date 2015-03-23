/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global require:true*/

module.exports = function( grunt , undefined ) {

	"use strict";

	var Grunticon = require( '../lib/grunticon-lib' );

	grunt.registerMultiTask( 'grunticon', 'A mystical CSS icon solution.', function() {
		var done = this.async();

		// get the config
		var config = this.options({
			logger: {
				verbose: grunt.verbose.writeln,
				fatal: grunt.fatal,
				ok: grunt.log.ok
			}
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

		var output = this.files[0].orig.dest;

		if( !output || output && output === "" ){
			grunt.fatal("The destination must be a directory");
			done( false );
		}

		var grunticon = new Grunticon( files, output, config );

		grunticon.process(done);
	});
};
