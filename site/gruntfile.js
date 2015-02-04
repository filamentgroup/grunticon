/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		watch: {
			files: 'src/svg/*',
			tasks: 'default'
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/svg',
					src: ['*.svg'],
					dest: 'src/svg'
				}]
			}
		},
		grunticon: {
			foo: {
				files: [{
					expand: true,
					cwd: 'src/svg',
					src: ['*.svg', '*.png'],
					dest: "grunticon/"
				}],
				options: {

					// CSS filenames
					datasvgcss: "icons.data.svg.css",
					datapngcss: "icons.data.png.css",
					urlpngcss: "icons.fallback.css",

					// grunticon loader code snippet filename
					loadersnippet: "grunticon.loader.js",

					// folder name (within dest) for png output
					pngfolder: "png",

					// prefix for CSS classnames
					cssprefix: ".icon-",


					// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
					// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
					cssbasepath: "/",
					enhanceSVG: true

				}
			}
		}
	});

	// Load local tasks.
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-svgmin' );

	//load parent grunti
	grunt.loadTasks('../tasks');

	// Default task.
	grunt.registerTask('default', [ 'svgmin', 'grunticon']);


};

