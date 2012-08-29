/*
 * grunt-unicon
 * https://github.com/filamentgroup/unicon
 *
 * Copyright (c) 2012 Scott Jehl
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  grunt.registerTask( 'unicon', 'A mystical CSS icon solution.', function() {

    grunt.log.write( "Look, it's a unicon." );

    var config = grunt.config.get( "unicon" );
    var asyncCSS = grunt.task.getFile( "unicon/static/asyncCSS.js" );
    var previewHTML = grunt.task.getFile( "unicon/static/preview.html" );

    if( !config || !config.src || !config.dest ){
      grunt.log.write( "Please specify src and dest in your grunt.js configuration" );
      return;
    }

    // Get a valid semver tag from `git describe --tags` if possible.
    grunt.utils.spawn({
      cmd: 'phantomjs',
      args: [
        grunt.task.getFile('unicon/phantom.js'),
        config.src,
        config.dest,
        asyncCSS,
        previewHTML
      ],
      fallback: ''
    }, function(err, result, code) {
      // TODO boost this up a bit.
      grunt.log.write("Something went wrong...");
    });
  });
};
