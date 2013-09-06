/*global require:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var fs = require( 'fs' ),
		img_stats = require('./img-stats'),
		RSVP = require('./rsvp'),
		DOMParser, path;

	if( fs.readFileSync ){//node check
		DOMParser = require('xmldom').DOMParser;
		path = require( 'path' );
	}

	var createHTMLDoc = function( htmlpreviewbody , asyncCSSFile , gfileHTMLOptions ){
		var noscriptpreview = '<noscript><link href="' + gfileHTMLOptions.fallbackcss + '" rel="stylesheet"></noscript>',
			asyncCSSpreview, doc;

		asyncCSSpreview = asyncCSSFile + '\ngrunticon( [ "'+ gfileHTMLOptions.datacss +'", "'+ gfileHTMLOptions.pngdatacss +'", "'+ gfileHTMLOptions.fallbackcss +'" ] );';

		doc = fs.readFileSync( gfileHTMLOptions.previewHTMLFilePath ).toString();
		doc = doc.replace( /<script>/, "<script>\n" + asyncCSSpreview );
		doc = doc.replace( /<\/script>/, "</script>\n" + noscriptpreview );
		doc = doc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		return doc;
	};

	var Gfile = function( svgFilename ){
		this.filename = svgFilename;
		this.isSvg = true;
		this.filenameNoExt = this.filename.replace( /\.svg$/i, "" );
	};

	Gfile.prototype.setImageData = function( inputDir , grunt ){
		if( fs.readFileSync && this.isSvg ){
			this.imagedata = fs.readFileSync( path.join( inputDir , this.filename )).toString() || "";
		} else if( fs.readFileSync ){
			console.log('setImageData >> fs.readFileSync');
		} else {
			this.imagedata = fs.read( inputDir + this.filename ) || "";
		}
	};

	Gfile.prototype.setPngLocation = function( opts ){
		this.relPngLocation = path.join( opts.relative , this.filenameNoExt + ".png" );
		this.absPngLocation = path.join( opts.absolute , this.filenameNoExt + ".png" );
	};

	Gfile.prototype.svgDataURI = function(){
		if( !this._svgdatauri ){
			var imagedata = this.imagedata;
			var prefix = this.isSvg ? "data:image/svg+xml;charset=US-ASCII," : "data:image/png;base64,";
			this._svgdatauri = prefix + encodeURIComponent( imagedata
				.replace( /[\n\r]/gmi, "" )
				.replace( /\t/gmi, " " )
				.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
				.replace(/'/gmi, "\\i")
			);
		}
		return this._svgdatauri;
		};

	Gfile.prototype.pngDataURI = function(){
		if( !this._pngdatauri ){
			try{
				var prefix = "data:image/png;base64,";
				var base64 = fs.readFileSync( this.absPngLocation ).toString( 'base64');
				this._pngdatauri = prefix + base64;
			} catch( e ){
				throw new Error( e );
			}
		}
		return this._pngdatauri;
	};

	Gfile.prototype.stats = function( settings ){
		var p = new RSVP.Promise();

		if( typeof settings === "undefined" || settings === null ){
			p.resolve( this._stats );
		} else {
			var imagedata = this.imagedata,
				isSvg = this.isSvg,
				filename = this.filename,
				dir = settings.inputDir,
				data = {};

			if( isSvg ) {
				try {
					// get svg element's dimensions so we can set the viewport dims later
					var doc = new DOMParser().parseFromString( this.imagedata ,'text/xml'),
						svgelem = doc.getElementsByTagName( "svg" )[0],
						pxre = /([\d\.]+)\D*/,
						width = svgelem.getAttribute( "width" ),
						height = svgelem.getAttribute( "height" );

					if( width ){
						data.width = width.replace(pxre, "$1px");
					} else {
						data.width = settings.defaultWidth;
					}
					if( height ){
						data.height = height.replace(pxre, "$1px");
					} else {
						data.height = settings.defaultHeight;
					}
					data.type = "SVG";
					this._stats = data;
					p.resolve( data );
				} catch( e ){
					p.reject( e );
				}
			} else {
				img_stats.stats( path.join( dir , filename ) , function( data ){
					data.width = data.width + 'px';
					data.height = data.height + 'px';
					data.type = data.type;
					p.resolve( data );
				});
			}
		return p;
		}

	};

	Gfile.prototype.getCSSRules = function( stats, pngfolder, cssprefix, config ){
		var res = {};
		var cssselectors = config.customselectors || {};
		var prefix = cssprefix + this.filenameNoExt;
		var iconclass = "." + prefix;
		var iconsel = cssselectors[ this.filenameNoExt ] !== undefined ? iconclass + ",\n" + cssselectors[ this.filenameNoExt ] : iconclass;
		var extraCSS = '';
		// extraCSS = 'background-repeat: no-repeat';

		var getPNGDataCSSRule = function( prefix, pngdatauri, relPngLocation ){

			if (pngdatauri.length <= 32768) {
				return iconsel + " { background-image: url('" +  pngdatauri + "');"+extraCSS+"}";
			} else {
				// let them off with a warning
				return "/* Using an external URL reference because this image would have a data URI of " +
					pngdatauri.length +
					" characters, which is greater than the maximum of 32768 allowed by IE8. */\n" +
					iconsel + " { background-image: url('" + relPngLocation.split( path.sep ).join( "/" ) + "');"+extraCSS+"}";
			}
		};

		res.pngcssrule = iconsel + " { background-image: url(" + pngfolder.split( path.sep ).join( "/" ) + this.filenameNoExt + ".png" + ");"+extraCSS+"}";
		res.htmlmarkup = '<pre><code>.' + prefix + ':</code></pre><div class="' + prefix + '" style="width: '+ stats.width +'; height: '+ stats.height +'"></div><hr/>';
		res.datacssrule = iconsel + " { background-image: url('" + ( this.isSvg ? this.svgDataURI() : this.pngDataURI() ) + "');"+extraCSS+"}";
		res.pngdatacssrule = getPNGDataCSSRule( prefix , this.pngDataURI(), this.relPngLocation );
		return res;
	};

	Gfile.writeCSS = function( dataarr , gfileWriteOptions ){
		var pngcssrules = [],
			pngdatacssrules = [],
			datacssrules = [],
			htmlpreviewbody = [],
			htmldoc, filesnippet, noscript, asyncCSSFile, asyncCSS;

		noscript = '<noscript><link href="' + path.join( gfileWriteOptions.cssbasepath , gfileWriteOptions.outputDir , gfileWriteOptions.fallbackcss ) + '" rel="stylesheet"></noscript>';

		// make the preview HTML file and asyncCSS loader file
		asyncCSSFile = fs.readFileSync( gfileWriteOptions.asyncCSSpath ).toString( 'utf-8' );

		// add custom function call to asyncCSS
		asyncCSS = asyncCSSFile + '\ngrunticon( [ "' + path.join( gfileWriteOptions.cssbasepath, gfileWriteOptions.outputDir, gfileWriteOptions.datacss ) +'", "' + path.join( gfileWriteOptions.cssbasepath, gfileWriteOptions.outputDir, gfileWriteOptions.pngdatacss ) +'", "' + path.join( gfileWriteOptions.cssbasepath, gfileWriteOptions.outputDir, gfileWriteOptions.fallbackcss ) +'" ] );';

		// Load data arrays for writing
		dataarr.forEach( function( dataset ){
			pngcssrules.push( dataset.pngcssrule );
			pngdatacssrules.push( dataset.pngdatacssrule );
			datacssrules.push( dataset.datacssrule );
			htmlpreviewbody.push( dataset.htmlmarkup );
		});

		htmldoc = createHTMLDoc( htmlpreviewbody , asyncCSSFile , gfileWriteOptions );

		filesnippet = [
			// "<!-- Grunticon Loader: place this in the head of your page -->",
			"<script>",
			"\t"+asyncCSS,
			"</script>",
			noscript
		].join("\n");

		// write the preview html file
		fs.writeFileSync( path.join( gfileWriteOptions.outputDir , gfileWriteOptions.previewFilePath ), htmldoc );

		// write CSS files
		fs.writeFileSync( path.join( gfileWriteOptions.outputDir, gfileWriteOptions.fallbackcss ), pngcssrules.join( "\n\n" ) );
		fs.writeFileSync( path.join( gfileWriteOptions.outputDir, gfileWriteOptions.pngdatacss ), pngdatacssrules.join( "\n\n" ) );
		fs.writeFileSync( path.join( gfileWriteOptions.outputDir, gfileWriteOptions.datacss ), datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.writeFileSync( gfileWriteOptions.asyncCSSpath , filesnippet );
	};

	exports.grunticonFile = Gfile;
}(typeof exports === 'object' && exports || this));
