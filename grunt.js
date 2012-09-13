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

      // text file that will hold the original list of icons
      // to be copy/pasted into a customizable scss file by editor
      // that file must be requiered inside scss files
      iconslistfile: "icons.list.txt",

      // YOU create this file manually so that we dont overwrite content on icons change
      iconslistcss: "icons.list.scss",

      // CSS filenames (now sass powered in order to manage different selectors)
      datasvgcss: "icons.data.svg.scss",
      datapngcss: "icons.data.png.scss",
      urlpngcss: "icons.fallback.scss",

      // preview HTML filename
      previewhtml: "preview.html",

      // Unicon loader code snippet filename
      loadersnippet: "unicon.loader.txt",

      // folder name (within dest) for png output
      pngfolder: "png/",

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

  // load npm tasks.
  grunt.loadNpmTasks('grunt-unicon');

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'lint unicon');

};
