/*
 * Unicon
 * https://github.com/filamentgroup/unicon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  grunt.registerTask( 'unicon', 'A mystical CSS icon solution.', function() {

    grunt.log.write( "Look, it's a unicon." );

    var config = grunt.config.get( "unicon" );
    var asyncCSS = grunt.task.getFile( "unicon/static/unicon.loader.js" );
    var asyncCSSBanner = grunt.task.getFile( "unicon/static/unicon.loader.banner.js" );
    var previewHTML = grunt.task.getFile( "unicon/static/preview.html" );

    // CSS filenames with optional mixin from config
    var cssfiles = grunt.utils._.extend({
        datasvg: "icons.data.svg.css",
        datapng: "icons.data.png.css",
        urlpng: "icons.fallback.css"
    }, config.cssfiles );

    if( !config || !config.src || !config.dest ){
      grunt.log.writeIn( "Please specify src and dest in your grunt.js configuration" );
      return;
    }

    // create the output directory
    grunt.file.mkdir( config.dest );

    // minify the source of the unicon loader and write that to the output
    grunt.log.write( "\nUnicon now minifying the stylesheet loader source." );
    var src = grunt.file.read( asyncCSS );
    var banner = grunt.file.read( asyncCSSBanner );
    var min = banner + "\n" + grunt.helper('uglify', src );
    var loaderCodeDest = config.dest + "unicode.loader.html";
    grunt.file.write( loaderCodeDest, min );
    grunt.log.write( "\nUnicon loader file created." );

    // take it to phantomjs to do the rest
    grunt.log.write( "\nUnicon now spawning phantomjs..." );
    grunt.utils.spawn({
      cmd: 'phantomjs',
      args: [
        grunt.task.getFile('unicon/phantom.js'),
        config.src,
        config.dest,
        loaderCodeDest,
        previewHTML,
        cssfiles.datasvg,
        cssfiles.datapng,
        cssfiles.urlpng
      ],
      fallback: ''
    }, function(err, result, code) {
      // TODO boost this up a bit.
      grunt.log.write("\nSomething went wrong with phantomjs...");
    });
  });
};
