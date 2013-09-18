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
			foo: {
				files: [
					{
						src: 'example/source/*.{svg,png}',
						filter: 'isFile'
					}
				],
				options: {
					dest: 'example/output',

					// pngcrush and phantomjs can be installed several ways:
					//   1. Install through npm:
					//      npm install pngcrush-installer
					//      npm install phantomjs
					//   2. Install through homebrew
					//      brew install pngcrush phantomjs
					// If you pick option 2, specify a path to the binaries like so:
					// pngcrush: '/usr/local/bin/pngcrush'
					// phantomjs: '/usr/local/bin/phantomjs'

					pngcrush: '/usr/local/bin/pngcrush',
					phantomjs: '/usr/local/bin/phantomjs',

					// CSS filenames
					svgDataCSS: "icons.data.svg.css",
					pngDataCSS: "icons.data.png.css",
					pngFileCSS: "icons.fallback.css",

					// preview HTML filename
					previewHTML: "preview.html",

					// Grunticon loader code snippet filename
					loaderSnippet: "grunticon.loader.html",

					// subfolder in dest for PNG output
					pngDestDir: "png",

					// prefix for CSS classnames
					cssPrefix: "icon-",

					// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
					// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
					cssBasePath: "{{ STATIC_URL }}/output",

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
