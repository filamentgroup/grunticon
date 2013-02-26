/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global phantom:true*/
/*global window:true*/
/*global btoa:true*/
/*global require:true*/

/*
phantom args sent from grunticon.js:
	[0] - input directory path
	[1] - output directory path
	[2] - asyncCSS output file path
	[3] - preview.html static file path
	[4] - CSS filename for datasvg css
	[5] - CSS filename for datapng css
	[6] - CSS filename for urlpng css
	[7] - filename for preview HTML file
	[8] - png folder name
	[9] - css classname prefix
	[10] - css basepath prefix
*/

var fs = require( "fs" );
var img_stats = require('../../lib/img-stats.js');
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
var cssbasepath = phantom.args[10];

// increment the current file index and process it
function nextFile(){
	"use strict";

	currfile++;
	processFile();
}

// files have all been processed. write the css and html files and return
function finishUp(){
	"use strict";

	// make the preview HTML file and asyncCSS loader file
	var asyncCSS = fs.read( phantom.args[2] );

	// copy above for a slightly different output in the preview html file (different paths)
	var asyncCSSpreview = asyncCSS;

	// open up the static html document
	var htmldoc = fs.read( phantom.args[3]);

	// noscript for the snippet file
	var noscript = '<noscript><link href="' + cssbasepath + outputdir + fallbackcss + '" rel="stylesheet"></noscript>';

	// noscript for the preview file
	var noscriptpreview = '<noscript><link href="' + fallbackcss + '" rel="stylesheet"></noscript>';

	// add custom function call to asyncCSS
	asyncCSS += '\ngrunticon( [ "' + cssbasepath + outputdir + datacss +'", "' + cssbasepath + outputdir + pngdatacss +'", "' + cssbasepath + outputdir + fallbackcss +'" ] );';
	asyncCSSpreview += '\ngrunticon( [ "'+ datacss +'", "'+ pngdatacss +'", "'+ fallbackcss +'" ] );';

	// add async loader to the top
	htmldoc = htmldoc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );

	//add noscript
	htmldoc = htmldoc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );

	// add icons to the body
	htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

	// write the preview html file
	fs.write( outputdir + phantom.args[7], htmldoc );

	// write CSS files
	fs.write( outputdir + fallbackcss, pngcssrules.join( "\n\n" ) );
	fs.write( outputdir + pngdatacss, pngdatacssrules.join( "\n\n" ) );
	fs.write( outputdir + datacss, datacssrules.join( "\n\n" ) );

	// overwrite the snippet HTML
	fs.write( phantom.args[2], "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript );
}

// process an svg file from the source directory
function processFile(){
	"use strict";

	var theFile = files[ currfile ];

	if( theFile ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = theFile.match( svgRegex ),
			isPng = theFile.match( pngRegex );

		if( isSvg || isPng ){
			(function(){
				var page = require( "webpage" ).create();
				var imagedata = fs.read(  inputdir + theFile ) || "";
				var svgdatauri = "'data:image/svg+xml;charset=US-ASCII,";
				var pngdatauri = "'data:image/png;base64,";

				// kill the ".svg" or ".png" at the end of the filename
				var filenamenoext = theFile.replace( isSvg ? svgRegex : pngRegex, "" );
				var width;
				var height;

				if( isSvg ) {
					// get svg element's dimensions so we can set the viewport dims later
					var frag = window.document.createElement( "div" );
					frag.innerHTML = imagedata;
					var svgelem = frag.querySelector( "svg" );
					width = svgelem.getAttribute( "width" );
					height = svgelem.getAttribute( "height" );

					render();
				} else {
					img_stats.stats( inputdir + theFile , function( data ){
						width = data.width + 'px';
						height = data.height + 'px';
						render();
					});
				}

				function render() {
					if( isSvg ) {
						// get base64 of svg file
						svgdatauri += encodeURIComponent( imagedata
							//strip newlines and tabs
							.replace( /[\n\r]/gmi, "" )
							.replace( /\t/gmi, " " )
							//strip comments
							.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
							//replace 
							.replace(/'/gmi, "\\i") ) +
							// close string
							"'";
					}

					// add rules to png url css file
					pngcssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }" );

					// add markup to the preview html file
					htmlpreviewbody.push( '<pre><code>.' + cssprefix + filenamenoext + ':</code></pre><div class="' + cssprefix + filenamenoext + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>' );

					// set page viewport size to svg dimensions
					page.viewportSize = {  width: parseFloat(width), height: parseFloat(height) };

					// open svg file in webkit to make a png
					page.open(  inputdir + theFile, function( status ){

						var pngimgstring = page.renderBase64( "png" );

						pngdatauri += pngimgstring + "'";

						// create png file
						page.render( outputdir + pngout + filenamenoext + ".png" );

						// add rules to svg data css file
						datacssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + ( isSvg ? svgdatauri : pngdatauri ) + "); background-repeat: no-repeat; }" );

						if (pngimgstring.length <= 32768) {
							// create png data URI
							pngdatacssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" +  pngdatauri + "); background-repeat: no-repeat; }" );
						} else {
							pngdatacssrules.push( "/* Using an external URL reference because this image would have a data URI of " + pngimgstring.length + " characters, which is greater than the maximum of 32768 allowed by IE8. */\n" +
								"." + cssprefix + filenamenoext + " { background-image: url(" + pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }" );
						}

						// process the next svg
						nextFile();
					} );
				} // render
			}());
		}
		else {
			// process the next svg
			nextFile();
		}
	}
	else {
		// fin
		finishUp();
		phantom.exit();
	}
}

// go ahead with the first file
processFile();
