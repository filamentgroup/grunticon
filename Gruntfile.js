module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		test: {
			files: ['test/**/*.js']
		},
		lint: {
			files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'default'
		},
		grunticon: {
			options: {
				dest: 'example/output',
				// css file path prefix, written to the loader snippet
				// If you don’t want a prefix path, set to to ""
				cssBasePath: "{{ STATIC_URL }}/output",

				// TODO: preflight check to ensure that files exist and are executable.
				// Specify a path to pngcrush
				// Set to false to disable pngcrush
				// Set to true to load npm-installed pngcrush (pngcrush-installer)
				pngcrush: '/usr/local/bin/pngcrush',
				// Specify a path to phantomjs
				// Set to false to load npm-installed phantomjs
				phantomjs: '/usr/local/bin/phantomjs',

				// Core Grunticon files that’ll be dumped in options.dest
				svgDataCSS: "icons.data.svg.css",
				pngDataCSS: "icons.data.png.css",
				pngFileCSS: "icons.fallback.css",

				// Specify the filename for the loader snippet
				// Set to false to prevent loader file from being generated
				loaderSnippet: "grunticon.loader.html",

				// Specify the filename for the preview HTML file
				// Set to false to prevent preview file from being generated
				previewHTML: "preview.html",

				// subfolder in options.dest for PNG output
				pngDestDir: "png",

				// prefix for CSS classnames
				cssPrefix: "overwritten-by-child-task-",
			},

			foo: {
				files: [
					{
						src: 'example/source/*.{svg,png}',
						filter: 'isFile'
					}
				],
				options: {
					cssPrefix: 'icon-',
					customSelectors: {
						'cat' : '#el-gato',
						'gummy-bears-2' : 'nav li a.deadly-bears:before'
					}
				}
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: false,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				smarttabs: true,
				node: true,
				es5: true,
				strict: false
			},
			globals: {
				Image: true,
				window: true
			}
		}
	});

	// Load local tasks.
	grunt.loadTasks('tasks');

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	// Default task.
	grunt.registerTask('default', ['jshint', 'grunticon:foo']);
	grunt.registerTask('travis', ['jshint', 'grunticon:foo']);

};
