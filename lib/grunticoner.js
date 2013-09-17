/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";

	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );
	var GruntiFile = require( "./grunticon-file" ).grunticonFile;

	// console.log shortcut
	var clog = function(what){ console.log("[32m[grunticoner.js][39m "+what); };

	exports.writeCSS = function(dataarr, o){
		var pngcssrules = [];
		var pngdatacssrules = [];
		var datacssrules = [];
		var htmlpreviewbody = [];
		var htmldoc;
		var filesnippet;

		// Output formatting
		var pretty = true;
		var tab = "";
		var newline = "";

		if (pretty){
			tab = "\t";
			newline = "\n";
		}

		var basepath = o.outputDir;

		var asyncCSS = fs.read(o.asyncCSSpath)+newline;

		// Load data arrays for writing
		dataarr.forEach( function( dataset ){
			pngcssrules.push( dataset.pngcssrule );
			pngdatacssrules.push( dataset.pngdatacssrule );
			datacssrules.push( dataset.datacssrule );
			htmlpreviewbody.push( dataset.htmlmarkup );
		});

		var asyncCSSpreview = asyncCSS + 'grunticon( [ "'+ o.datacss +'", "'+ o.pngdatacss +'", "'+ o.fallbackcss +'" ] );';
		var noscriptpreview = '<noscript><link href="' + o.fallbackcss + '" rel="stylesheet"></noscript>';
		var htmldoc = fs.read(o.previewFilePath);

		htmldoc = htmldoc.replace( /<script>/, "<script>\n" + asyncCSSpreview );
		htmldoc = htmldoc.replace( /<\/script>/, "</script>\n" + noscriptpreview );
		htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		clog('Building filesnippet');

		filesnippet = [
			'<script>',
			asyncCSS+'\ngrunticon([',
			tab + '"' + basepath + o.datacss +'",',
			tab + '"' + basepath + o.pngdatacss +'",',
			tab + '"' + basepath + o.fallbackcss +'"',
			']);',
			"</script>\n",
			'<noscript>',
			tab + '<link href="' + basepath + o.fallbackcss + '" rel="stylesheet">',
			'</noscript>'
		].join(newline);

		clog('Writing preview HTML file (' + o.outputDir + o.previewHTMLFilePath+')');
		fs.write(o.outputDir + o.previewHTMLFilePath, htmldoc);

		clog('Writing preview CSS files');
		fs.write(o.outputDir + o.fallbackcss, pngcssrules.join("\n\n"));
		fs.write(o.outputDir + o.pngdatacss, pngdatacssrules.join("\n\n"));
		fs.write(o.outputDir + o.datacss, datacssrules.join("\n\n"));

		clog('Updating snippet HTML file (' + o.asyncCSSpath + ')');
		fs.write(o.asyncCSSpath , filesnippet);
	};

	exports.processSVGFile = function(svgFilename, o){
		var self = this;

		var pngDest = o.outputDir;
		var svgSrc = o.inputDir;

		var gFile = new GruntiFile(svgFilename);

		// Load SVG data from svgSrc/inputDir
		gFile.setImageData(svgSrc);

		// Create div, fill it with SVG data
		var frag = window.document.createElement("div");
		frag.innerHTML = gFile.imagedata;
		var svgelem = frag.querySelector("svg");
		var svgWidth = parseFloat(svgelem.getAttribute("width"));
		var svgHeight = parseFloat(svgelem.getAttribute("height"));

		// Set gFile dimensions based on SVG
		// TODO: Rounding--bad or good?
		if(svgWidth){
			if(svgWidth % Math.round(svgWidth)){
				clog('Rounding width ('+svgWidth+') to the nearest whole number');
			}
			gFile.width = Math.round(svgWidth) + 'px';
		} else {
			gFile.width = o.defaultWidth;
		}

		if(svgHeight){
			if(svgHeight % Math.round(svgHeight)){
				clog('Rounding height ('+svgHeight+') to the nearest whole number');
			}
			gFile.height = Math.round(svgHeight) + 'px';
		} else {
			gFile.height = o.defaultHeight;
		}

		gFile.type = 'SVG';

		var promise = new RSVP.Promise();
		var page = require('webpage').create();

		var pngFilename = pngDest + gFile.filenameNoExt + '.png';
		var svgFilename = svgSrc + gFile.filename;

		// Note the escape characters.
		clog(gFile.filename+' [32m=>[39m '+ pngFilename);

		// Set page viewport size to SVG dimensions
		page.viewportSize = {
			width: parseFloat(gFile.width),
			height: parseFloat(gFile.height)
		};

		var testValue = page.open(svgFilename, function(status){

			if(status !== 'success'){
				clog('NOT RENDERING');
				promise.reject();
			} else {
				page.render(pngFilename);

				// Generate PNG string for png-data.css
				gFile.pngimgstring = page.renderBase64('png');

				// add rules to svg data css file
				var res = {};
				var cssselectors = o.customselectors ? JSON.parse(o.customselectors) : {}
				var prefix = o.cssprefix + gFile.filenameNoExt;
				var iconsel = '.'+prefix;

				if (gFile.filenameNoExt in cssselectors){
					iconsel = '.' + prefix + ", " + cssselectors[gFile.filenameNoExt];
				}

				var buildCSSRule = function(imgURL){
					return iconsel + '{background-image:url('+imgURL+');'+
						// 'background-repeat: no-repeat;'+
					'}';
				}

				var imagedata = gFile.imagedata
					//strip newlines and tabs
					.replace(/[\n\r]/gmi, "")
					.replace(/\t/gmi, " ")
					//strip comments
					.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
					//replace single quotes
					.replace(/'/gmi, "\\i");

				// imagedata = encodeURIComponent(imagedata);

				var svgdatauri = "'data:image/svg+xml;charset=US-ASCII," + imagedata + "'";
				var pngdatauri = "'data:image/png;base64," + gFile.pngimgstring + "'";

				res.pngcssrule = buildCSSRule(o.pngDestDirName + gFile.filenameNoExt + '.png');

				if( gFile.isSvg ){
					res.datacssrule = buildCSSRule(svgdatauri);
				} else {
					res.datacssrule = buildCSSRule(pngdatauri);
				}

				// Direct link for long data URIs (IE8)
				if (gFile.pngimgstring.length <= 32768) {
					res.pngdatacssrule = buildCSSRule(pngdatauri);
				} else {
					res.pngdatacssrule = buildCSSRule(o.pngDestDirName + gFile.filenameNoExt + '.png');
				}

				res.htmlmarkup = '<pre><code>' + iconsel + ':</code></pre>'+
					'<div class="' + prefix + '" style="width: '+ gFile.width +'; height: '+ gFile.height +'"></div>'+
					'<hr/>';

				promise.resolve(res);
			}
		});

		return promise;
	};

}(typeof exports === 'object' && exports || this));