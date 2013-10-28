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
				// Optional: CSS file path prefix appended to CSS filenames with path.join
				// Defaults to ''
				cssBasePath: '{{ STATIC_URL }}/output',

				// Optional: path to pngcrush
				// Set to false to disable pngcrush
				// Set to true to load npm-installed pngcrush (pngcrush-installer)
				// Defaults to false
				pngcrush: '/usr/local/bin/pngcrush',

				// Optional: path to phantomjs
				// Set to false to load npm-installed phantomjs
				// Defaults to false
				phantomjs: '/usr/local/bin/phantomjs',

				// Optional: SVG data URI stylesheet name
				// Defaults to 'icons.data.svg.css'
				svgDataCSS: 'icons.data.svg.css',

				// Optional: PNG data URI stylesheet name
				// Defaults to 'icons.data.png.css'
				pngDataCSS: 'icons.data.png.css',

				// Optional: linked PNG stylesheet name
				// Defaults to 'icons.fallback.css'
				pngFileCSS: 'icons.fallback.css',

				// Optional: the filename for the loader snippet
				// Defaults to 'snippet.html'
				snippetFile: 'snippet.html',

				// Optional: the filename for the preview HTML file
				// Set to false to prevent preview file from being generated
				// Defaults to 'preview.html'
				previewFile: 'preview.html',

				// Optional: subfolder in options.dest for PNG output
				// Defaults to 'png'
				pngDestDir: 'png',

				// Optional: prefix for CSS classnames
				// Defaults to 'icon-'
				cssPrefix: 'overwritten-by-child-task-',

				// Optional: path to templates
				// Relative paths are (of course) relative to pwd
				previewTemplate: 'example/templates/preview.html',
				snippetTemplate: 'example/templates/snippet.html',
				cssTemplate:     'example/templates/icons.css',
				loaderTemplate:  'example/templates/loader.js'
			},

			foo: {
				files: [
					{
						src: 'example/source/*.{svg,png}',
						filter: 'isFile'
					}
				],
				options: {
					// Required: output directory, relative to pwd
					dest: 'example/output',
					cssPrefix: 'icon-'
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
