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
		pkg: grunt.file.readJSON('package.json'),
		nodeunit: {
			files: ['test/node/**/*_test.js']
		},
		qunit: {
			files: ['test/qunit/**/*.html']
		},
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

					template: "example/default-css.hbs",
					previewTemplate: "example/preview-custom.hbs",

					compressPNG: true

				}
			}
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/**/*.js',
				'lib/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		concat: {
			banner: {
				options: {
					banner: '/*! <%= pkg.name %> Stylesheet Loader - v<%= pkg.version %> | https://github.com/filamentgroup/grunticon | (c) <%= grunt.template.today("yyyy") %> Scott Jehl, Filament Group, Inc. | MIT license. */\n'
				},
				src: [],
				dest: 'tasks/grunticon/static/grunticon.loader.banner.js'
			},
			loader: {
				options: {
					banner: ';(function(window){\n',
					footer: '\n}(this));'
				},
				src: [ 
					'node_modules/fg-loadcss/loadCSS.js',
					'node_modules/fg-loadcss/onloadCSS.js',
					'tasks/grunticon/loader.js',
					'tasks/grunticon/globals.js' ],
				dest: 'tasks/grunticon/static/grunticon.loader.js'
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
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );

	grunt.loadNpmTasks( 'grunt-svgmin' );

	// Default task.
	grunt.registerTask('skip-tests', ['jshint', 'grunticon:foo']);
	grunt.registerTask('travis', ['concat', 'jshint', 'svgmin', 'grunticon:foo', 'nodeunit', 'qunit']);
	grunt.registerTask('default', ['travis']);
	grunt.registerTask('stage', ['default']);

};

