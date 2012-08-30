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
    unicon: {
      // required config
      src: "example/source/",
      dest: "example/output/",

      // optional unicon config properties

      // CSS filenames
      datasvgcss: "icons.data.svg.css",
      datapngcss: "icons.data.png.css",
      urlpngcss: "icons.fallback.css",

      // preview HTML filename
      previewhtml: "preview.html",

      // Unicon loader code snippet filename
      loadersnippet: "unicon.loader.txt",

      // folder name (within dest) for png output
      pngfolder: "png/",

      // prefix for CSS classnames
      cssprefix: "icon-wee-"
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
  grunt.registerTask('default', 'lint unicon');

};
