/*
 * Unicon
 * https://github.com/filamentgroup/unicon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global phantom:true*/
/*global window:true*/
/*global btoa:true*/

/*
phantom args sent from unicon.js:
  [0] - input directory path
  [1] - output directory path
  [2] - asyncCSS static javascript file source
  [3] - preview.html static file source
  [4] - CSS filename for datasvg
  [5] - CSS filename for datapng,
  [6] - CSS filename for urlpng
  [7] - filename for preview HTML file
  [8] - png folder name
  [9] - css classname prefix
*/

var fs = require( "fs" );
var inputdir = phantom.args[0];
var outputdir = phantom.args[1];
var pngout =  phantom.args[8];
var cssprefix = phantom.args[9];
var files = fs.list( inputdir );
var currfile = 0;
var pngcssrules = [];
var pngdatacssrules = [];
var datacssrules = [];
var htmlpreviewbody = [];

var fallbackcss = phantom.args[6];
var pngdatacss = phantom.args[5];
var datacss = phantom.args[4];

function nextFile(){
  currfile++;
  processFile();
}

function finishUp(){
  // make the preview HTML file and asyncCSS loader file
  var asyncCSS = fs.read( phantom.args[2] );
  var asyncCSSpreview = asyncCSS;
  var htmldoc = fs.read( phantom.args[3]);
  var noscript = '<noscript><link href="/' + outputdir + fallbackcss + '" rel="stylesheet"></noscript>';
  var noscriptpreview = '<noscript><link href="' + fallbackcss + '" rel="stylesheet"></noscript>';

  // add custom function call to asyncCSS
  asyncCSS += '\nunicon( [ "/'+ outputdir + datacss +'", "/'+ outputdir + pngdatacss +'", "/'+ outputdir + fallbackcss +'" ] );';
  asyncCSSpreview += '\nunicon( [ "'+ datacss +'", "'+ pngdatacss +'", "'+ fallbackcss +'" ] );';

  // add async loader to the top
  htmldoc = htmldoc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );
  //add noscript
  htmldoc = htmldoc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );

  // add icons to the body
  htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

  fs.write( outputdir + phantom.args[7], htmldoc );

  // write CSS file
  fs.write( outputdir + fallbackcss, pngcssrules.join( "\n\n" ) );
  fs.write( outputdir + pngdatacss, pngdatacssrules.join( "\n\n" ) );
  fs.write( outputdir + datacss, datacssrules.join( "\n\n" ) );
  fs.write( phantom.args[2], "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript );
}

function processFile(){
  var theFile = files[ currfile ];

  if( theFile ){
    if( theFile.match( /\.svg$/i ) ){
      (function(){
        var page = require( "webpage" ).create(),
          svgdata = fs.read(  inputdir + theFile ),
          svgdatauri = "data:image/svg+xml;base64,",
          pngdatauri = "data:image/png;base64,",
          filename = theFile,
          filenamenoext = filename.replace( /\.svg$/i, "" ),
          frag = window.document.createElement( "div" ),
          svgelem, height, width;

        // get svg element's dimensions
        if( svgdata ){
          frag.innerHTML = svgdata;
          svgelem = frag.querySelector( "svg" );
          width = svgelem.getAttribute( "width" );
          height = svgelem.getAttribute( "height" );
        }

        // get base64 of svg file
        svgdatauri += btoa(svgdata);

        // 
        pngcssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }" );
        
        datacssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + svgdatauri + "); background-repeat: no-repeat; }" );

        htmlpreviewbody.push( '<pre><code>.' + cssprefix + filenamenoext + ':</code></pre><div class="' + cssprefix + filenamenoext + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>' );

        // set page viewport size to svg dimensions
        page.viewportSize = {  width: parseFloat(width), height: parseFloat(height) };

        // open svg file in webkit to make a png
        page.open(  inputdir + theFile, function( status ){

          // create png file
          page.render( outputdir + pngout + filenamenoext + ".png" );

          // create png data URI
          pngdatacssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" +  pngdatauri + page.renderBase64( "png" ) + "); background-repeat: no-repeat; }" );

          // process the next svg
          nextFile();
        } );
      }());
    }
    else {
      nextFile();
    }
  }
  else {
    finishUp();
    phantom.exit();
  }
}



processFile();