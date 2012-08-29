/*
 * grunt-unicon
 * https://github.com/filamentgroup/unicon
 *
 * Copyright (c) 2012 Scott Jehl
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerTask('unicon', 'A mystical CSS icon solution.', function() {
    grunt.log.write(grunt.helper('unicon'));

    var config = grunt.config.get( "unicon" ) || {
      inputdir: "icons/",
      outputdir: "output/"
    };


    // Get a valid semver tag from `git describe --tags` if possible.
    grunt.utils.spawn({
      cmd: 'phantomjs',
      args: [ grunt.task.getFile('unicon/phantom.js'), config.inputdir, config.outputdir ],
      fallback: ''
    }, function(err, result, code) {
      grunt.log.write("done!")
    });


});

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('unicon', function() {
    return 'unicon!!!';
  });

};
