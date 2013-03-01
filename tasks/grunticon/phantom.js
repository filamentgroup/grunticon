/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global phantom:true*/
/*global window:true*/
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

(function(){
	"use strict";

	var fs = require( "fs" );
	var img_stats = require('../../lib/img-stats');
	var RSVP = require('../../lib/rsvp');

	var options = {
		inputdir: phantom.args[0],
		outputdir: phantom.args[1],
		pngout:  phantom.args[8],
		cssprefix: phantom.args[9],
		fallbackcss: phantom.args[6],
		pngdatacss: phantom.args[5],
		datacss: phantom.args[4],
		cssbasepath: phantom.args[10]
	};

	var pngcssrules = [],
		pngdatacssrules = [],
		datacssrules = [],
		htmlpreviewbody = [];


	// files have all been processed. write the css and html files and return
	var finishUp = function( o ){

		// make the preview HTML file and asyncCSS loader file
		var asyncCSS = fs.read( phantom.args[2] );

		// copy above for a slightly different output in the preview html file (different paths)
		var asyncCSSpreview = asyncCSS;

		// open up the static html document
		var htmldoc = fs.read( phantom.args[3]);

		// noscript for the snippet file
		var noscript = '<noscript><link href="' + o.cssbasepath + o.outputdir + o.fallbackcss + '" rel="stylesheet"></noscript>';

		// noscript for the preview file
		var noscriptpreview = '<noscript><link href="' + o.fallbackcss + '" rel="stylesheet"></noscript>';

		// add custom function call to asyncCSS
		asyncCSS += '\ngrunticon( [ "' + o.cssbasepath + o.outputdir + o.datacss +'", "' + o.cssbasepath + o.outputdir + o.pngdatacss +'", "' + o.cssbasepath + o.outputdir + o.fallbackcss +'" ] );';
		asyncCSSpreview += '\ngrunticon( [ "'+ o.datacss +'", "'+ o.pngdatacss +'", "'+ o.fallbackcss +'" ] );';

		// add async loader to the top
		htmldoc = htmldoc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );

		//add noscript
		htmldoc = htmldoc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );

		// add icons to the body
		htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		// write the preview html file
		fs.write( o.outputdir + phantom.args[7], htmldoc );

		// write CSS files
		fs.write( o.outputdir + o.fallbackcss, pngcssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.pngdatacss, pngdatacssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.datacss, datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.write( phantom.args[2], "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript );
	};

	// process an svg file from the source directory
	var processFile = function( theFile , o ){
		var promise = new RSVP.Promise();

			var svgRegex = /\.svg$/i,
				pngRegex = /\.png$/i,
				isSvg = theFile.match( svgRegex ),
				isPng = theFile.match( pngRegex );

			if( isSvg || isPng ){
				(function(){
					var page = require( "webpage" ).create();
					var imagedata = fs.read(  o.inputdir + theFile ) || "";
					var svgdatauri = "'data:image/svg+xml;charset=US-ASCII,";

					// kill the ".svg" or ".png" at the end of the filename
					var filenamenoext = theFile.replace( isSvg ? svgRegex : pngRegex, "" );

					var render = function( width , height ) {
						var buildSVGDataURI = function( imagedata ){
							// get base64 of svg file
							return encodeURIComponent( imagedata
								//strip newlines and tabs
								.replace( /[\n\r]/gmi, "" )
								.replace( /\t/gmi, " " )
								//strip comments
								.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
								//replace
								.replace(/'/gmi, "\\i") ) +
								// close string
								"'";
						}; //buildSVGDataURI

						var prefix = o.cssprefix + filenamenoext;

						if( isSvg ) {
							svgdatauri += buildSVGDataURI( imagedata );
						}

						var pngrule = '.' + prefix + " { background-image: url(" + o.pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }";


						// add rules to png url css file
						pngcssrules.push( pngrule );

						// add markup to the preview html file
						htmlpreviewbody.push( '<pre><code>.' + prefix + ':</code></pre><div class="' + prefix + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>' );

						// set page viewport size to svg dimensions
						page.viewportSize = {  width: parseFloat(width), height: parseFloat(height) };

						// open svg file in webkit to make a png
						page.open(  o.inputdir + theFile, function( status ){
							if( status === "success" ){
								var pngdatauri = "'data:image/png;base64,";
								var pngimgstring = page.renderBase64( "png" );
								var getPNGDataCSSRule = function( prefix , pngimgstring ){
									if (pngimgstring.length <= 32768) {
										// create png data URI
										return "." + prefix + " { background-image: url(" +  pngdatauri + "); background-repeat: no-repeat; }";
									} else {
										return "/* Using an external URL reference because this image would have a data URI of " +
											pngimgstring.length +
											" characters, which is greater than the maximum of 32768 allowed by IE8. */\n" +
											"." + prefix + " { background-image: url(" + o.pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }";
									}
								}; //getPNGDataCSSRule

								pngdatauri += pngimgstring + "'";

								// create png file
								page.render( o.outputdir + o.pngout + filenamenoext + ".png" );

								// add rules to svg data css file
								datacssrules.push( "." + prefix + " { background-image: url(" + ( isSvg ? svgdatauri : pngdatauri ) + "); background-repeat: no-repeat; }" );

								pngdatacssrules.push( getPNGDataCSSRule( prefix , pngimgstring ) );

								// process the next svg
								promise.resolve();
							} else {
								promise.reject();
							}
						} ); //page.open
					}; // render


					//TODO add SVG support to img_stats
					var getStats = function( imagedata , callback ){
						var width;
						var height;
						if( isSvg ) {
							// get svg element's dimensions so we can set the viewport dims later
							var frag = window.document.createElement( "div" );
							frag.innerHTML = imagedata;
							var svgelem = frag.querySelector( "svg" );
							width = svgelem.getAttribute( "width" );
							height = svgelem.getAttribute( "height" );
							callback( width , height );
						} else {
							img_stats.stats( o.inputdir + theFile , function( data ){
								width = data.width + 'px';
								height = data.height + 'px';
								callback( width , height );
							});
						}
					}; //getStats

					// Make the magic happen
					getStats( imagedata , function( w , h ){
						render( w, h );
					});
				}());
			} else {// if isSVG || isPNG
				promise.resolve();
			}
			return promise;
	}; // end of processFile

	// Get list of files from input directory
	// foreach in files
		// create css and png rules
		// render a png
	// write files
	
	var files = fs.list( options.inputdir );
	var promises = [];
	files.forEach( function( file ){
		promises.push( processFile( file , options ) );
	});

	RSVP.all( promises ).then( function(){
		finishUp( options );
		phantom.exit();
	});
})();
