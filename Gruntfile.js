module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		nodeunit: {
			files: ['test/**/*.js']
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
				options: {
					// required config
					src: "example/source/",
					dest: "example/output/",

					// optional grunticon config properties
					// SVGO compression, false is the default, true will make it so
					svgo: true,

					// PNG compression, false is the default, true will make it so
					pngcrush: false,

					// CSS filenames
					datasvgcss: "icons.data.svg.css",
					datapngcss: "icons.data.png.css",
					urlpngcss: "icons.fallback.css",

					// preview HTML filename
					previewhtml: "preview.html",

					// grunticon loader code snippet filename
					loadersnippet: "grunticon.loader.txt",

					// folder name (within dest) for png output
					pngfolder: "png",

					// prefix for CSS classnames
					cssprefix: "icon-",

					defaultWidth: "300px",
					defaultHeight: "200px",

					// define vars that can be used in filenames if desirable, like foo.colors-primary-secondary.svg
					colors: {
						primary: "red",
						secondary: "#666"
					},

					// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
					// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
					cssbasepath: "/",
					customselectors: {
						"cat" : ["#el-gato"],
						"gummy-bears-2" : ["nav li a.deadly-bears:before"]
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
				strict: false,
				browser: true

			},
			all: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js']
		}
	});

	// Load local tasks.
	grunt.loadTasks('tasks');

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-svgmin' );

	// Default task.
	grunt.registerTask('default', ['nodeunit', 'jshint', 'svgmin', 'grunticon:foo']);
	grunt.registerTask('skip-tests', ['jshint', 'grunticon:foo']);
	grunt.registerTask('travis', ['nodeunit', 'jshint', 'svgmin', 'grunticon:foo']);

};
