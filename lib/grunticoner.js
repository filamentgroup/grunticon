/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );
	var GruntiFile = require( "./grunticon-file" ).grunticonFile;

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

	//TODO - Write test
	// gFile
	// o
	//
	// resolve promise with obj
	// {
	//	width: int
	//	height: int
	//	type: "SVG" || "PNG"
	// }
	exports.getStats = function( gFile , o ){

		var p = new RSVP.Promise(),
			imagedata = gFile.imagedata,
			isSvg = gFile.isSvg,
			filename = gFile.filename,
			dir = o.inputdir,
			data = {};

		if( isSvg ) {
			// get svg element's dimensions so we can set the viewport dims later
			var frag = window.document.createElement( "div" );
			frag.innerHTML = imagedata;
			var svgelem = frag.querySelector( "svg" );
			var pxre = /([\d\.]+)\D*/;
			var width = svgelem.getAttribute( "width" );
			var height = svgelem.getAttribute( "height" );
			if( width ){
				data.width = width.replace(pxre, "$1px");
			} else {
				data.width = o.defaultWidth;
			}
			if( height ){
				data.height = height.replace(pxre, "$1px");
			} else {
				data.height = o.defaultHeight;
			}
			data.type = "SVG";

			p.resolve( data );
		} else {
			img_stats.stats( dir + filename , function( data ){
				data.width = data.width + 'px';
				data.height = data.height + 'px';
				data.type = data.type;
				p.resolve( data );
			});
		}
		return p;
	}; //getStats

	//TODO - Write test
	//params:
	//  imagedata
	//  pngimgstring
	//  filenamenoext
	//  isSvg
	//  width
	//  height
	//  o
	exports.createCSSRules = function( gFile , o ){
		var imagedata = gFile.imagedata,
			pngimgstring = gFile.pngimgstring,
			filenamenoext = gFile.filenamenoext,
			isSvg = gFile.isSvg,
			width = gFile.width,
			height = gFile.height;

		// add rules to svg data css file
		var res = {};
		var pngdatauri = "'data:image/png;base64,";
		var svgdatauri = "'data:image/svg+xml;charset=US-ASCII,";
		var cssselectors = o.customselectors ? JSON.parse( o.customselectors ) : JSON.parse( "{}" );
		var prefix = o.cssprefix + filenamenoext;
		var iconclass = "." + prefix;
		var iconsel = cssselectors[ filenamenoext ] !== undefined ? iconclass + ",\n" + cssselectors[ filenamenoext ] : iconclass;

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

		var getPNGDataCSSRule = function( prefix , pngimgstring ){
			if (pngimgstring.length <= 32768) {
				// create png data URI
				return iconsel + " { background-image: url(" +  pngdatauri + "); background-repeat: no-repeat; }";
			} else {
				return "/* Using an external URL reference because this image would have a data URI of " +
					pngimgstring.length +
					" characters, which is greater than the maximum of 32768 allowed by IE8. */\n" +
					iconsel + " { background-image: url(" + o.pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }";
			}
		}; //getPNGDataCSSRule
		if( isSvg ) {
			svgdatauri += buildSVGDataURI( imagedata );
		}

		pngdatauri += pngimgstring + "'";

		res.pngcssrule = iconsel + " { background-image: url(" + o.pngout + filenamenoext + ".png" + "); background-repeat: no-repeat; }";
		res.htmlmarkup = '<pre><code>.' + prefix + ':</code></pre><div class="' + prefix + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>';
		res.datacssrule = iconsel + " { background-image: url(" + ( isSvg ? svgdatauri : pngdatauri ) + "); background-repeat: no-repeat; }";
		res.pngdatacssrule = getPNGDataCSSRule( prefix , pngimgstring );

		return res;
	};

	//TODO - Requires Phantom - No test?
	exports.render = function( gFile , o) {
		var renderp = new RSVP.Promise();
		var self = this;

		var page = require( "webpage" ).create();

		var pngDest = o.outputdir + o.pngout;
		var pngName = gFile.filenamenoext + ".png";
		var filename;
		if( o.render !== "false" ){
			filename = o.inputdir + gFile.filename;
		} else {
			filename = pngDest + pngName;
		}
		// set page viewport size to svg dimensions
		page.viewportSize = {  width: parseFloat(gFile.width), height: parseFloat(gFile.height) };
		// open svg file in webkit to make a png || png to grab base64
		page.open(  filename, function( status ){
			if( status === "success" ){
				if( o.render !== "false" ){
					// create tmp file
					page.render( pngDest + pngName );
				}
				var pngimgstring = page.renderBase64( "png" );
				renderp.resolve( pngimgstring );
			} else {
				renderp.reject( status );
			}
		}); //page.open
		return renderp;
	}; // render


	// files have all been processed. write the css and html files and return
	//TODO - Just uses filesystem - no test?
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
		filesnippet = "<!-- Grunticon Loader: place this in the head of your page -->\n<script>\n" + asyncCSS + "</script>\n" + noscript;

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
	//TODO - test - integration test?
	//params
	// filename
	// o
	//
	//resolves promise
	exports.processFile = function( filename , o ){
		var promise = new RSVP.Promise();
		var self = this;

		var gFile = new GruntiFile( filename );

		gFile.setImageData( o.inputdir );

		self.getStats( gFile , o )
		.then( function( data ){
			gFile.width = data.width;
			gFile.height = data.height;
			gFile.type = data.type;

			return self.render( gFile , o );
		})
		.then( function( pngimgstring ){
			gFile.pngimgstring = pngimgstring;
			return self.createCSSRules( gFile, o );
		})
		.then( function( res ){
			promise.resolve( res );
		});

		return promise;
	}; // end of processFile
}(typeof exports === 'object' && exports || this));

