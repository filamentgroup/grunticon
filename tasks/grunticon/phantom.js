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
	[11] - png pixel ratio
*/
(function(){
	"use strict";

var fs = require( "fs" );
var inputdir = phantom.args[0];
var outputdir = phantom.args[1];
var pngout =  phantom.args[8];
var cssprefix = phantom.args[9];
var files = fs.list( inputdir );
var currfile = 0;


var datacssrules = [];
var htmlpreviewbody = [];
var fallbackcss = phantom.args[6];
var pngdatacss = phantom.args[5];
var datacss = phantom.args[4];
var cssbasepath = phantom.args[10];

// these three arrays are dependent on each other, the value of an index in pngpixelratio decides which pixel ratio to use 
var pngpixelratio = phantom.args[11].split( "," ); // converted to string in the arglist, get it back to an array
var pngpixelratiorules = [[]];
var pngdatacssrules = [[]];

// increment the current file index and process it
function nextFile(){
	currfile++;
	processFile();
}

// files have all been processed. write the css and html files and return
function finishUp(){

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
	asyncCSS += '\ngrunticon( [ "' + cssbasepath + outputdir + datacss +'", "' + cssbasepath + outputdir + pngdatacss +'", "' + cssbasepath + outputdir + fallbackcss +'" ],[' + pngpixelratio + ']);';
	asyncCSSpreview += '\ngrunticon( [ "'+ datacss +'", "'+ pngdatacss +'", "'+ fallbackcss +'" ],[' + pngpixelratio + ']);';

	// add async loader to the top
	htmldoc = htmldoc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );

	//add noscript
	htmldoc = htmldoc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );

	// add icons to the body
	htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

	// write the preview html file
	fs.write( outputdir + phantom.args[7], htmldoc );

	// write PNG CSS files
	if ( pngpixelratiorules && pngpixelratio &&  pngpixelratiorules.length === pngpixelratio.length ) {
		for ( var i = 0; i < pngpixelratiorules.length; i++ ) {
			// print out CSS files and add pixelratio name to files that are not 1x
			if ( pngpixelratio[i] === '1' || pngpixelratio.length === 1 ) {
				fs.write( outputdir + fallbackcss, pngpixelratiorules[i].join( "\n\n" ) );	
				fs.write( outputdir + pngdatacss, pngdatacssrules[0].join( "\n\n" ) );
			} else {
				fs.write( outputdir + fallbackcss.replace( /\.css$/i, '-' + pngpixelratio[i] + "x.css" ), pngpixelratiorules[i].join( "\n\n" ) );	
				fs.write( outputdir + pngdatacss.replace( /\.css$/i, '-' + pngpixelratio[i] + "x.css" ), pngdatacssrules[i].join( "\n\n" ) );		
			}		
		}
	} else {
		//something is wrong with the pixel ratio, fallback to just print 1x
		fs.write( outputdir + fallbackcss, pngpixelratiorules[0].join( "\n\n" ) );	
		fs.write( outputdir + pngdatacss, pngdatacssrules[0].join( "\n\n" ) );
	}
	
	// write the rest of the CSS files	
	fs.write( outputdir + datacss, datacssrules.join( "\n\n" ) );

	// overwrite the snippet HTML
	fs.write( phantom.args[2], "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript );
}

// process an svg file from the source directory
function processFile(){
	var theFile = files[ currfile ];

	if( theFile ){
		// only parse svg files
		if( theFile.match( /\.svg$/i ) ){
			(function(){
				var page = require( "webpage" ).create();
				var svgdata = fs.read(  inputdir + theFile ) || "";
				var svgdatauri = "data:image/svg+xml;base64,";
				var pngdatauri = "data:image/png;base64,";

				// kill the ".svg" at the end of the filename
				var filenamenoext = theFile.replace( /\.svg$/i, "" );

				// get svg element's dimensions so we can set the viewport dims later
				var frag = window.document.createElement( "div" );
				frag.innerHTML = svgdata;
				var svgelem = frag.querySelector( "svg" );
				var width = svgelem.getAttribute( "width" );
				var height = svgelem.getAttribute( "height" );				

				// get base64 of svg file
				svgdatauri += btoa(svgdata);

				// add rules to svg data css file
				datacssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + svgdatauri + "); background-repeat: no-repeat; }" );

				// add markup to the preview html file
				htmlpreviewbody.push( '<pre><code>.' + cssprefix + filenamenoext + ':</code></pre><div class="' + cssprefix + filenamenoext + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>' );

				// set page viewport size to svg dimensions
				page.viewportSize = { width: parseFloat(width), height: parseFloat(height) };

				// open svg file in webkit to make a png
				page.open(  inputdir + theFile, function( status ){

				// create png data URI
				page.zoomFactor = 1;
				

				// create fallback png files, data png and add css rules
				if ( pngpixelratio &&  pngpixelratio.length > 0) {
					// creating files with different pixel densities
					var pxstring;
					for ( var i = 0; i < pngpixelratio.length; i++ ) {
						page.zoomFactor = pngpixelratio[i];						
						// add pixel ratio to filename (if it is not 1 or there is only one ratio defined)
						pxstring = ( ( pngpixelratio[i] === '1' || pngpixelratio.length === 1 ) ? '' : ('-' + pngpixelratio[i] + 'x' ) );
						// save png 
						page.render( outputdir + pngout + filenamenoext + pxstring + ".png" );		
						
						//make sure the array is defined
						if( !pngpixelratiorules[i] ) {
							pngpixelratiorules[i] = [];
						}

						if( !pngdatacssrules[i] ) {
							pngdatacssrules[i] = [];
						}

						// link to the correct filename and in the correct CSS file and use background-size: 100%
						pngpixelratiorules[i].push( "." + cssprefix + filenamenoext + " { background-image: url(" + pngout + filenamenoext + pxstring + ".png" + "); background-repeat: no-repeat; background-size: 100%; }" );
						pngdatacssrules[i].push( "." + cssprefix + filenamenoext + " { background-image: url(" +  pngdatauri + page.renderBase64( "png" ) + "); background-repeat: no-repeat; background-size: 100%; }" );
					}
				} else {
					// fallback to only creating 1 png version
					page.zoomFactor = 1;
					pngpixelratio = ['1']; // make sure we have pixelratio set to 1
					pngpixelratiorules[0].push( "." + cssprefix + filenamenoext + " { background-image: url(" + pngout + filenamenoext + ".png" + "); background-repeat: no-repeat;  }" );
					pngdatacssrules[0].push( "." + cssprefix + filenamenoext + " { background-image: url(" +  pngdatauri + page.renderBase64( "png" ) + "); background-repeat: no-repeat; }" );
				}


				nextFile();
					
					
				} );
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
})();