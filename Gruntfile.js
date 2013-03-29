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
				// required config
				src: "example/source/",
				dest: "example/output/",

				// optional grunticon config properties

				// CSS filenames
				datasvgcss: "icons.data.svg.css",
				datapngcss: "icons.data.png.css",
				urlpngcss: "icons.fallback.css",

				// preview HTML filename
				previewhtml: "preview.html",

				// grunticon loader code snippet filename
				loadersnippet: "grunticon.loader.txt",

				// folder name (within dest) for png output
				pngfolder: "png/",

				// prefix for CSS classnames
				cssprefix: "icon-",

				// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
				// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
				cssbasepath: "/",
				customselectors: {
					"cat" : "#el-gato",
					"gummy-bears-2" : "nav li a.deadly-bears:before"
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
	grunt.registerTask('default', ['jshint', 'grunticon']);

};
