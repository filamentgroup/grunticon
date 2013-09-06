/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );
	var GruntiFile = require( "./grunticon-file" ).grunticonFile;

	var clog = function(what){
		// Note the escape characters.
		console.log("[32m[grunticoner.js][39m "+what);
	}

	var vlog = function(what){
		if( isVerbose !== 'undefined' ){
			// Note the escape characters.
			clog(what);
		}
	}

	var createHTMLDoc = function( htmlpreviewbody , asyncCSSFile , htmlOptions ){
		var noscriptpreview = '<noscript><link href="' + htmlOptions.fallbackcss + '" rel="stylesheet"></noscript>',
			asyncCSSpreview, doc;

		asyncCSSpreview = asyncCSSFile + 'grunticon( [ "'+ htmlOptions.datacss +'", "'+ htmlOptions.pngdatacss +'", "'+ htmlOptions.fallbackcss +'" ] );';

		doc = fs.read( htmlOptions.previewFilePath );
		doc = doc.replace( /<script>/, "<script>\n" + asyncCSSpreview );
		doc = doc.replace( /<\/script>/, "</script>\n" + noscriptpreview );
		doc = doc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		return doc;
	};

	// Returns data dictionary with width, height, and filetype
	exports.getStats = function( gFile , statOptions ){
		var imagedata = gFile.imagedata,
			filename = gFile.filename,
			dir = statOptions.inputDir,
			data = {};

		var frag = window.document.createElement( "div" );
		frag.innerHTML = imagedata;

		var svgelem = frag.querySelector( "svg" );
		var pxRegex = /([\d\.]+)\D*/;
		var width = svgelem.getAttribute( "width" );
		var height = svgelem.getAttribute( "height" );

		// Set defaults
		data.width = statOptions.defaultWidth;
		data.height = statOptions.defaultHeight;

		// Get dimensions from SVG file
		if( width ){
			data.width = width.replace(pxRegex, "$1px");
		}
		if( height ){
			data.height = height.replace(pxRegex, "$1px");
		}

		clog('File dimensions: '+data.width+' × '+data.height);

		data.type = "SVG";

		return data;
	};


	exports.createCSSRules = function( gFile , cssOptions ){
		var imagedata = gFile.imagedata,
			pngimgstring = gFile.pngimgstring,
			filenameNoExt = gFile.filenameNoExt,
			isSvg = gFile.isSvg,
			width = gFile.width,
			height = gFile.height;

		// add rules to svg data css file
		var res = {};
		var pngdatauri = "'data:image/png;base64,";
		var svgdatauri = "'data:image/svg+xml;charset=US-ASCII,";
		var cssselectors = cssOptions.customselectors ? JSON.parse( cssOptions.customselectors ) : JSON.parse( "{}" );
		var prefix = cssOptions.cssprefix + filenameNoExt;
		var iconclass = "." + prefix;
		var iconsel = cssselectors[ filenameNoExt ] !== undefined ? iconclass + ",\n" + cssselectors[ filenameNoExt ] : iconclass;

		// FIXME: no-repeat the no-repeat.
		var extraCSS = '';
		// extraCSS = 'background-repeat: no-repeat';

		var buildSVGDataURI = function( imagedata ){
			// get base64 of SVG file
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
		};


		var getPNGDataCSSRule = function( prefix , pngimgstring ){
			clog('')
			if (pngimgstring.length <= 32768) {
				// create png data URI
				return iconsel + " { background-image: url(" +  pngdatauri + ");"+extraCSS+"}";
			} else {
				clog("Using an external URL reference because this image would have");
				clog("a data URI of " + pngimgstring.length + " characters, which is");
				clog("greater than the maximum of 32768 allowed by IE8.");

				return iconsel + " { background-image: url(" + cssOptions.pngDestDirName + filenameNoExt + ".png" + ");"+extraCSS+"}";
			}
		};

		if( isSvg ) {
			svgdatauri += buildSVGDataURI( imagedata );
		}

		pngdatauri += pngimgstring + "'";

		res.pngcssrule = iconsel + " { background-image: url(" + cssOptions.pngDestDirName + filenameNoExt + ".png" + ");"+extraCSS+"}";
		res.htmlmarkup = '<pre><code>.' + prefix + ':</code></pre><div class="' + prefix + '" style="width: '+ width +'; height: '+ height +'"></div><hr/>';
		res.datacssrule = iconsel + " { background-image: url(" + ( isSvg ? svgdatauri : pngdatauri ) + ");"+extraCSS+"}";
		res.pngdatacssrule = getPNGDataCSSRule( prefix , pngimgstring );

		return res;
	};

	exports.svg2png = function( gFile , renderOptions) {
		var promise = new RSVP.Promise();

		var self = this;

		var page = require( "webpage" ).create();

		var pngDest = renderOptions.outputDir;
		var svgSrc = renderOptions.inputDir;

		var pngFilename = pngDest + gFile.filenameNoExt + ".png";
		var svgFilename = svgSrc + gFile.filename;

		// Note the escape characters.
		clog(gFile.filename+' [32m=>[39m '+ pngFilename);

		// Set page viewport size to SVG dimensions
		page.viewportSize = {  width: parseFloat(gFile.width), height: parseFloat(gFile.height) };

		var testValue = page.open( svgFilename, function( status ){

			if( status !== 'success' ){

				clog('NOT RENDERING');
				promise.reject();

			} else {
				clog('Render SVG to '+pngFilename );
				page.render( pngFilename );

				// Generate PNG string for png-data.css
				gFile.pngimgstring = page.renderBase64( "png" );

				promise.resolve( self.createCSSRules( gFile, renderOptions ) );

			}
		});

		return promise;

	};

	exports.writeCSS = function( dataarr , writeOptions ){
		var pngcssrules = [],
			pngdatacssrules = [],
			datacssrules = [],
			htmlpreviewbody = [],
			htmldoc, filesnippet, asyncCSS, asyncCSSFile,

			// Output formatting
			pretty = false,
			tab = "",
			newline = "";

		if (pretty){
			tab = "\t";
			newline = "\n";
		}

		basepath = writeOptions.cssbasepath; // writeOptions.outputDir;

		asyncCSS = [
			fs.read( writeOptions.asyncCSSpath )+newline+'\ngrunticon([',
			tab + '"' + basepath + writeOptions.datacss +'",',
			tab + '"' + basepath + writeOptions.pngdatacss +'",',
			tab + '"' + basepath + writeOptions.fallbackcss +'"',
			']);'
		].join(newline)

		// Load data arrays for writing
		dataarr.forEach( function( dataset ){
			pngcssrules.push( dataset.pngcssrule );
			pngdatacssrules.push( dataset.pngdatacssrule );
			datacssrules.push( dataset.datacssrule );
			htmlpreviewbody.push( dataset.htmlmarkup );
		});

		htmldoc = createHTMLDoc(htmlpreviewbody, asyncCSS, writeOptions);

		filesnippet = [
			"<script>",
			asyncCSS,
			"</script>",
			'\n<noscript>',
			tab + '<link href="' + basepath + writeOptions.fallbackcss + '" rel="stylesheet">',
			'</noscript>'
		].join(newline);

		// write the preview html file
		fs.write( writeOptions.outputDir + writeOptions.previewHTMLFilePath, htmldoc );

		// write CSS files
		fs.write( writeOptions.outputDir + writeOptions.fallbackcss, pngcssrules.join( "\n\n" ) );
		fs.write( writeOptions.outputDir + writeOptions.pngdatacss, pngdatacssrules.join( "\n\n" ) );
		fs.write( writeOptions.outputDir + writeOptions.datacss, datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.write( writeOptions.asyncCSSpath , filesnippet );
	};

	exports.processFile = function( svgFilename, processOptions ){
		var self = this;
		var gFile = new GruntiFile( svgFilename );

		gFile.setImageData( processOptions.inputDir );

		clog('Get stats');
		var data = self.getStats( gFile, processOptions );

		gFile.width = data.width;
		gFile.height = data.height;
		gFile.type = data.type;

		// Needs to return a promise.
		return self.svg2png( gFile , processOptions );
	};

}(typeof exports === 'object' && exports || this));