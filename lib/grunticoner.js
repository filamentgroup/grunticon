/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );

	var createHTMLDoc = function( htmlpreviewbody , asyncCSSFile , o ){
		var noscriptpreview = '<noscript><link href="' + o.fallbackcss + '" rel="stylesheet"></noscript>',
			asyncCSSpreview, doc;

		asyncCSSpreview = asyncCSSFile + '\ngrunticon( [ "'+ o.datacss +'", "'+ o.pngdatacss +'", "'+ o.fallbackcss +'" ] );';

		doc = fs.read( o.previewFilePath );
		doc = doc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );
		doc = doc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );
		doc = doc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		return doc;
	};

	// files have all been processed. write the css and html files and return
	exports.writeCSS = function( dataarr , o ){
		var pngcssrules = [],
			pngdatacssrules = [],
			datacssrules = [],
			htmlpreviewbody = [],
			htmldoc, filesnippet, noscript, asyncCSSFile, asyncCSS;

		noscript = '<noscript><link href="' + o.cssbasepath + o.outputdir + o.fallbackcss + '" rel="stylesheet"></noscript>';
		// make the preview HTML file and asyncCSS loader file
		asyncCSSFile = fs.read( o.asyncCSSpath );
		// add custom function call to asyncCSS
		asyncCSS = asyncCSSFile + '\ngrunticon( [ "' + o.cssbasepath + o.outputdir + o.datacss +'", "' + o.cssbasepath + o.outputdir + o.pngdatacss +'", "' + o.cssbasepath + o.outputdir + o.fallbackcss +'" ] );';

		// Load data arrays for writing
		dataarr.forEach( function( dataset ){
			pngcssrules.push( dataset.pngcssrule );
			pngdatacssrules.push( dataset.pngdatacssrule );
			datacssrules.push( dataset.datacssrule );
			htmlpreviewbody.push( dataset.htmlmarkup );
		});

		htmldoc = createHTMLDoc( htmlpreviewbody , asyncCSSFile , o );
		filesnippet = "<!-- Unicode CSS Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript;

		// write the preview html file
		fs.write( o.outputdir + o.previewHTMLFilePath, htmldoc );

		// write CSS files
		fs.write( o.outputdir + o.fallbackcss, pngcssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.pngdatacss, pngdatacssrules.join( "\n\n" ) );
		fs.write( o.outputdir + o.datacss, datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.write( o.asyncCSSpath , filesnippet );
	};

	// process an svg file from the source directory
	exports.processFile = function( filename , o ){
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

			var data = {};

			if( isSvg ) {
				// get svg element's dimensions so we can set the viewport dims later
				var frag = window.document.createElement( "div" );
				frag.innerHTML = imagedata;
				var svgelem = frag.querySelector( "svg" );
				data.width = svgelem.getAttribute( "width" );
				data.height = svgelem.getAttribute( "height" );
				data.type = "SVG";

				callback( data );
			} else {
				img_stats.stats( o.inputdir + filename , function( data ){
					data.width = data.width + 'px';
					data.height = data.height + 'px';
					data.type = data.type;
					callback( data );
				});
			}
		}; //getStats

		// Make the magic happen
		getStats( imagedata , function( data ){
			render( data.width, data.height , data.type );
		});
		return promise;
	}; // end of processFile
}(typeof exports === 'object' && exports || this));
