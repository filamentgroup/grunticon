/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";

	var fs = require('fs');
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );

	// console.log shortcut
	var clog = function(what){ console.log("[32m[grunticoner.js][39m "+what); };

	exports.writeCSS = function(dataArr, o){
		var pngFileRules = [];
		var pngDataRules = [];
		var svgDataRules = [];
		var htmlPreviewBody = [];

		// Output formatting
		var pretty = true;
		var tab = "";
		var newline = "";

		if (pretty){
			tab = "\t";
			newline = "\n";
		}

		var asyncCSS = fs.read(o.asyncCSSpath)+newline;

		var buildCSSRule = function(s,i){
			return s + '{background-image:url('+i+');' +
			// 'background-repeat: no-repeat;' +
			'}';
		}

		// Load data arrays for writing
		dataArr.forEach(function(iconData){
			sel = iconData.selector;

			// CSS Files
			pngFileRules.push(buildCSSRule(sel, iconData.pngFileURL));
			pngDataRules.push(buildCSSRule(sel, iconData.pngDataURI));
			svgDataRules.push(buildCSSRule(sel, iconData.svgDataURI));

			// Icon Preview
			htmlPreviewBody.push(iconData.htmlMarkup);
		});

		var asyncCSSpreview = asyncCSS + 'grunticon( [ "'+ o.datacss +'", "'+ o.pngdatacss +'", "'+ o.fallbackcss +'" ] );';
		var noscriptpreview = '<noscript><link href="' + o.fallbackcss + '" rel="stylesheet"></noscript>';
		var htmldoc = fs.read(o.previewFilePath);

		htmldoc = htmldoc.replace( /<script>/, "<script>\n" + asyncCSSpreview );
		htmldoc = htmldoc.replace( /<\/script>/, "</script>\n" + noscriptpreview );
		htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

		clog('Building filesnippet');

		var filesnippet = [
			'<script>',
			asyncCSS+'\ngrunticon([',
			tab + '"' + o.outputDir + o.datacss +'",',
			tab + '"' + o.outputDir + o.pngdatacss +'",',
			tab + '"' + o.outputDir + o.fallbackcss +'"',
			']);',
			"</script>\n",
			'<noscript>',
			tab + '<link href="' + o.outputDir + o.fallbackcss + '" rel="stylesheet">',
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
		var promise = new RSVP.Promise();

		var filename = svgFilename.split('/').pop();
		var ext = filename.split('.').pop();
		var basename = filename.substr(0, filename.length - ext.length - 1);

		// Check extension
		if( ext !== 'svg' ){
			console.log('processSVGFile only works on SVG files ('+svgFilename+')');
			promise.reject();
			return promise;
		}

		var svgSrcFile = o.inputDir + basename + '.svg';
		var pngDestFile = o.pngDestDirName + basename + '.png';

		var svgImgData = fs.readFileSync(o.inputDir, svgFilename).toString() || '';

		// Create div, fill it with SVG data
		var frag = window.document.createElement("div");
		frag.innerHTML = svgImgData;
		var svgelem = frag.querySelector("svg");
		var width = parseFloat(svgelem.getAttribute("width") || o.defaultWidth);
		var height = parseFloat(svgelem.getAttribute("height") || o.defaultHeight);

		// TODO: Rounding--bad or good?
		if(width % Math.round(width)){
			clog('Rounding width ('+width+') to the nearest whole number');
			width = Math.round(width);
		}

		if(svgHeight % Math.round(svgHeight)){
			clog('Rounding height ('+svgHeight+') to the nearest whole number');
			height = Math.round(height);
		}

		var page = require('webpage').create();

		clog(svgSrcFile+' [32m=>[39m '+ pngDestFile);

		// Set page viewport size to SVG dimensions
		page.viewportSize = {
			width: parseFloat(width),
			height: parseFloat(height)
		};

		// Open svgSrcFile with phantom, save as pngDestFile
		page.open(svgSrcFile, function(status){
			if(status !== 'success'){
				promise.reject();
			} else {
				// Save file as PNG
				page.render(pngDestFile);
				promise.resolve();
			}
		});

		return promise;
	};

}(typeof exports === 'object' && exports || this));