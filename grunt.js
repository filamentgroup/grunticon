(function(){
'use strict';

module.exports = function(grunt) {

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

			//specify more png sizes
			pngpixelratio: [1, 1.5, 2],

			// prefix for CSS classnames
			cssprefix: "icon-wee-",

			// css file path prefix - this defaults to "/" and will be placed before the "dest" path when stylesheets are loaded.
			// This allows root-relative referencing of the CSS. If you don't want a prefix path, set to to ""
			cssbasepath: "/"
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
				node: true,
				es5: true
			},
			globals: {
				Image: true,
				window: true
			}
		}
	});

	// Load local tasks.
	grunt.loadTasks('tasks');

	// Default task.
	grunt.registerTask('default', 'lint grunticon');

};
})();
