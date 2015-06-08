/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl
 * Licensed under the MIT license.
 */

/*global __dirname:true*/
/*global require:true*/
module.exports = function(grunt) {
	"use strict";

	var path = require( "path" );

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			files: '<config:lint.files>',
			tasks: 'default'
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'example/svgs',
					src: ['*.svg'],
					dest: 'example/source'
				}]
			}
		},
		grunticon: {
			foo: {
				files: [{
					expand: true,
					cwd: 'example/source',
					src: ['**/*.svg', '**/*.png'],
					dest: "example/output"
				}],
				options: {

					// CSS filenames
					datasvgcss: "icons.data.svg.css",
					datapngcss: "icons.data.png.css",
					urlpngcss: "icons.fallback.css",

					// preview HTML filename
					previewhtml: "preview.html",

					// grunticon loader code snippet filename
					loadersnippet: "grunticon.loader.js",

					// Include loader code for SVG markup embedding
					enhanceSVG: true,

					// Make markup embedding work across domains (if CSS hosted externally)
					corsEmbed: false,

					// folder name (within dest) for png output
					pngfolder: "png",

					// prefix for CSS classnames
					cssprefix: ".icon-",

					defaultWidth: "300px",
					defaultHeight: "200px",

					// define vars that can be used in filenames if desirable, like foo.colors-primary-secondary.svg
					colors: {
						primary: "red",
						secondary: "#666"
					},

					dynamicColorOnly: true,

					// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
					// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
					cssbasepath: "/",
					customselectors: {
						"cat" : ["#el-gato"],
						"gummy-bears-2" : ["nav li a.deadly-bears:before"]
					},

					template: path.join( __dirname, "example", "default-css.hbs" ),
					previewTemplate: path.join( __dirname, "example", "preview-custom.hbs" ),

					compressPNG: true

				}
			}
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

    // Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		}
	});

	// Load local tasks.
	grunt.loadTasks('tasks');

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-svgmin' );

	// Default task.
	grunt.registerTask('skip-tests', ['jshint', 'grunticon:foo']);
	grunt.registerTask('travis', ['jshint', 'svgmin', 'grunticon:foo']);
	grunt.registerTask('default', ['travis']);
	grunt.registerTask('stage', ['default']);

};
