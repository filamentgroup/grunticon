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

	// get colors from filename, if present
	var colorsRegx = /\.colors\-([^\.]+)/i;

	// test if value is a valid hex
	var isHex = function( val ){
		return (/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i).test( val );
	};
	var getColorConfig = function( str ){
		var colors = str.match( colorsRegx );
		if( colors ){
			colors = colors[ 1 ].split( "-" );
			colors.forEach( function( color, i ){
				if( isHex( color ) ){
					colors[ i ] = "#" + color;
				}
			});
			return colors;
		}
		else {
			return [];
		}
	}; //getColorConfig

	var createHTMLDoc = function( htmlpreviewbody , asyncCSSFile , o ){
		var noscriptpreview = '<noscript><link href="' + o.fallbackcss + '" rel="stylesheet"></noscript>',
			asyncCSSpreview, doc;

		asyncCSSpreview = asyncCSSFile + '\ngrunticon( [ "'+ o.datacss +'", "'+ o.pngdatacss +'", "'+ o.fallbackcss +'" ] );';

		doc = fs.readFileSync( o.previewHTMLFilePath ).toString();
		doc = doc.replace( /<script>/, "<script>\n\t" + asyncCSSpreview );
		doc = doc.replace( /<\/script>/, "</script>\n\t" + noscriptpreview );
		doc = doc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		return doc;
	};

	var Gfile = function( filename ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = filename.match( svgRegex ),
			isPng = filename.match( pngRegex );

		this.filename = filename;
		this.isSvg = isSvg;
		this.filenamenoext = filename.replace( isSvg ? svgRegex : pngRegex, "" );
	};

	Gfile.prototype.setImageData = function( inputdir , grunt ){
		if( fs.readFileSync && this.isSvg ){
			this.imagedata = fs.readFileSync( path.join( inputdir , this.filename )).toString() || "";
		} else if( fs.readFileSync ){
		} else {
			this.imagedata = fs.read( inputdir + this.filename ) || "";
		}
	};

	Gfile.prototype.setPngLocation = function( opts ){
		this.relPngLocation = path.join( opts.relative , this.filenamenoext + ".png" );
		this.absPngLocation = path.join( opts.absolute , this.filenamenoext + ".png" );
	};

	Gfile.prototype.svgdatauri = function(){
		if( !this._svgdatauri ){
			var imagedata = this.imagedata;
			// get base64 of svg file
			var prefix = "data:image/svg+xml;charset=US-ASCII,";
			this._svgdatauri = prefix + encodeURIComponent( imagedata
				//strip newlines and tabs
				.replace( /[\n\r]/gmi, "" )
				.replace( /\t/gmi, " " )
				//strip comments
				.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
				//replace
				.replace(/'/gmi, "\\i") );
		}
		return this._svgdatauri;
		}; //buildSVGDataURI

	Gfile.prototype.pngdatauri = function(){
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
		
	}; //getStats


	Gfile.colorConfig = function( files , options ){
		var tempFiles = [];
		files.forEach( function( file ){
			var colorConfig = getColorConfig( file ),
				fileName,
				colors = options.colors;

			if( colorConfig.length ){
				var fileContents = fs.readFileSync( path.join( options.inputDir , file )).toString( 'utf-8' );
				fileName = file.replace( colorsRegx, "" );
				var filepath = path.join( options.inputDir, fileName );

				// base file is used as default icon color - no qualifications in its name, tho.
				tempFiles.push( fileName );
				fs.writeFileSync( filepath , fileContents );
				fs.chmodSync( filepath , '0666' );

				colorConfig.forEach( function( color, i ){
					var colorVar = colors[ color ],
						newFileName = file.replace( colorsRegx, "-" + ( colorVar ? color : i + 1 ) ) ,
						newFileContents = fileContents.replace( /(<svg[^>]+)/im, '$1><style type="text/css">path { fill: ' + (colorVar || color) + ' !important; }</style>' ),
						newFilePath = path.join( options.inputDir, newFileName );

					tempFiles.push( newFileName );

					fs.writeFileSync( newFilePath, newFileContents );
					fs.chmodSync( newFilePath, '0666' );
				});
			}
		});
		return tempFiles;
	};

	Gfile.writeCSS = function( dataarr , config ){
		var o = {
			previewHTMLFilePath: config.previewHTMLFilePath,
			previewFilePath: config.previewFilePath,
			pngdatacss: config.pngdatacss,
			asyncCSSpath: config.asyncCSSpath,
			datacss: config.datacss,
			outputdir: config.outputdir,
			fallbackcss: config.fallbackcss,
			cssbasepath: config.cssbasepath
		};
		var pngcssrules = [],
			pngdatacssrules = [],
			datacssrules = [],
			htmlpreviewbody = [],
			htmldoc, filesnippet, noscript, asyncCSSFile, asyncCSS;

		noscript = '<noscript><link href="' + path.join( o.cssbasepath , o.outputdir , o.fallbackcss ) + '" rel="stylesheet"></noscript>';
		// make the preview HTML file and asyncCSS loader file
		asyncCSSFile = fs.readFileSync( o.asyncCSSpath ).toString( 'utf-8' );
		// add custom function call to asyncCSS
		asyncCSS = asyncCSSFile + '\ngrunticon( [ "' + path.join( o.cssbasepath, o.outputdir, o.datacss ) +'", "' + path.join( o.cssbasepath, o.outputdir, o.pngdatacss ) +'", "' + path.join( o.cssbasepath, o.outputdir, o.fallbackcss ) +'" ] );';

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
		fs.writeFileSync( path.join( o.outputdir , o.previewFilePath ), htmldoc );

		// write CSS files
		fs.writeFileSync( path.join( o.outputdir, o.fallbackcss ), pngcssrules.join( "\n\n" ) );
		fs.writeFileSync( path.join( o.outputdir, o.pngdatacss ), pngdatacssrules.join( "\n\n" ) );
		fs.writeFileSync( path.join( o.outputdir, o.datacss ), datacssrules.join( "\n\n" ) );

		// overwrite the snippet HTML
		fs.writeFileSync( o.asyncCSSpath , filesnippet );
	};
	exports.grunticonFile = Gfile;
}(typeof exports === 'object' && exports || this));
