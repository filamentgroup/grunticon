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
		cssbasepath: phantom.args[10],
		asyncCSSpath: phantom.args[2],
		previewFilePath: phantom.args[3],
		previewHTMLFilePath: phantom.args[7]
	};



	// files have all been processed. write the css and html files and return
	var writeCSS = function( dataarr , o ){
		var pngcssrules = [],
			pngdatacssrules = [],
			datacssrules = [],
			htmlpreviewbody = [];

		dataarr.forEach( function( dataset ){
			pngcssrules.push( dataset.pngcssrule );
			pngdatacssrules.push( dataset.pngdatacssrule );
			datacssrules.push( dataset.datacssrule );
			htmlpreviewbody.push( dataset.htmlmarkup );
		});

		// make the preview HTML file and asyncCSS loader file
		var asyncCSS = fs.read( o.asyncCSSpath );

		// copy above for a slightly different output in the preview html file (different paths)
		var asyncCSSpreview = asyncCSS;

		// open up the static html document
		var htmldoc = fs.read( o.previewFilePath );

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
		fs.write( o.outputdir + o.previewHTMLFilePath, htmldoc );

		// write CSS files
		fs.write( o.outputdir + o.fallbackcss, pngcssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.pngdatacss, pngdatacssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.datacss, datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.write( o.asyncCSSPath , "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript );
	};

	// process an svg file from the source directory
	var processFile = function( filename , o ){
		var promise = new RSVP.Promise();

		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = filename.match( svgRegex ),
			isPng = filename.match( pngRegex );

		var imagedata = fs.read(  o.inputdir + filename ) || "";

		// kill the ".svg" or ".png" at the end of the filename

		var render = function( width , height , type ) {
			var page = require( "webpage" ).create();

			// set page viewport size to svg dimensions
			page.viewportSize = {  width: parseFloat(width), height: parseFloat(height) };

			//TODO createPNG
			// open svg file in webkit to make a png
			page.open(  o.inputdir + filename, function( status ){
				if( status === "success" ){
					var res = {};
					var filenamenoext = filename.replace( isSvg ? svgRegex : pngRegex, "" );
					var prefix = o.cssprefix + filenamenoext;
					var pngdatauri = "'data:image/png;base64,";
					var svgdatauri = "'data:image/svg+xml;charset=US-ASCII,";
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

					if( isSvg ) {
						svgdatauri += buildSVGDataURI( imagedata );
					}

					pngdatauri += pngimgstring + "'";

					// create png file
					page.render( o.outputdir + o.pngout + filenamenoext + ".png" );

					// add rules to svg data css file

					res.pngcssrule = '.' + prefix + " { background-image: url(" + o.pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }";
					res.htmlmarkup = '<pre><code>.' + prefix + ':</code></pre><div class="' + prefix + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>';
					res.datacssrule = "." + prefix + " { background-image: url(" + ( isSvg ? svgdatauri : pngdatauri ) + "); background-repeat: no-repeat; }";
					res.pngdatacssrule = getPNGDataCSSRule( prefix , pngimgstring );

					// process the next svg
					promise.resolve( res );
				} else {
					promise.reject();
				}
			} ); //page.open
		}; // render


		//TODO add SVG support to img_stats
		var getStats = function( imagedata , callback ){
			var width, height, type;

			if( isSvg ) {
				// get svg element's dimensions so we can set the viewport dims later
				var frag = window.document.createElement( "div" );
				frag.innerHTML = imagedata;
				var svgelem = frag.querySelector( "svg" );
				width = svgelem.getAttribute( "width" );
				height = svgelem.getAttribute( "height" );
				callback( width , height );
			} else {
				img_stats.stats( o.inputdir + filename , function( data ){
					width = data.width + 'px';
					height = data.height + 'px';
					type = data.type;
					callback( width , height , type );
				});
			}
		}; //getStats

		// Make the magic happen
		getStats( imagedata , function( w , h , t ){
			render( w, h , t );
		});
		return promise;
	}; // end of processFile

	// Get list of files from input directory
	// foreach in files
		// create css and png rules
		// render a png
	// write files
	
	var files = fs.list( options.inputdir );
	var promises = [];

	files = files.filter( function( file ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = file.match( svgRegex ),
			isPng = file.match( pngRegex );

		return isSvg || isPng;
	});

	files.forEach( function( file ){
		promises.push( processFile( file , options ) );
	});

	RSVP.all( promises ).then( function( dataarr ){
		writeCSS( dataarr , options );
		phantom.exit();
	});
})();
