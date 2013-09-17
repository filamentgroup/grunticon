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

	exports.writeCSS = function(dataArr, o){
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

		var buildCSSRule = function(imgURL){
			return iconsel + '{background-image:url('+imgURL+');'+
				// 'background-repeat: no-repeat;'+
			'}';
		}

		// Load data arrays for writing
		dataArr.forEach(function(dataset){
			pngcssrules.push(dataset.pngcssrule);
			pngdatacssrules.push(dataset.pngdatacssrule);
			datacssrules.push(dataset.datacssrule);
			htmlpreviewbody.push(dataset.htmlmarkup);
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
		var promise = new RSVP.Promise();

		var ext = path.extname(svgFilename);
		var basename = path.basename(svgFilename, ext);

		// Check extension
		if( ext !== '.svg' ){
			console.log('processSVGFile only works on SVG files ('+svgFilename')');
			promise.reject();
			return promise;
		}

		var svgSrcFile = path.join(o.inputDir, basename + '.svg');
		var pngDestFile = path.join(o.pngDestDirName, basename + '.png');

		var svgImgData = fs.readFileSync(path.join(o.inputDir, svgFilename)).toString() || '';
		var pngImgData;

		// Create div, fill it with SVG data
		var frag = window.document.createElement("div");
		frag.innerHTML = svgImgData;
		var svgelem = frag.querySelector("svg");
		var width = parseFloat(svgelem.getAttribute("width") || o.defaultWidth);
		var height = parseFloat(svgelem.getAttribute("height") || o.defaultHeight);

		// Set gFile dimensions based on SVG
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
			width: parseFloat(gFile.width),
			height: parseFloat(gFile.height)
		};

		// Open svgSrcFile with phantom, save as pngDestFile
		page.open(svgSrcFile, function(status){

			if(status !== 'success'){
				promise.reject();
			} else {
				// Save file as PNG
				page.render(pngDestFile);

				/*
				pngImgData = page.renderBase64('png');

				var data = {};
				var cssselectors = o.customselectors ? JSON.parse(o.customselectors) : {}
				var prefix = o.cssprefix + basename;
				var iconsel = '.'+prefix;

				if (basename in cssselectors){
					iconsel = '.' + prefix + ", " + cssselectors[basename];
				}

				var imagedata = svgImgData
					//strip newlines and tabs
					.replace(/[\n\r]/gmi, "")
					.replace(/\t/gmi, " ")
					//strip comments
					.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
					//replace single quotes
					.replace(/'/gmi, "\\i");

				// imagedata = encodeURIComponent(imagedata);

				var svgDataURI = "'data:image/svg+xml;charset=US-ASCII," + svgImgData + "'";
				var pngDataURI = "'data:image/png;base64," + pngImgData + "'";

				data.pngcssrule = pngDestFile;
				data.datacssrule = svgDataURI;

				// Direct link for long data URIs (IE8)
				if (gFile.pngimgstring.length <= 32768) {
					data.pngdatacssrule = pngDataURI;
				} else {
					data.pngdatacssrule = pngDestFile;
				}

				data.htmlmarkup = '<pre><code>' + iconsel + ':</code></pre>'+
					'<div class="' + prefix + '" style="width: '+ gFile.width +'; height: '+ gFile.height +'"></div>'+
					'<hr/>';
				*/
				promise.resolve({
					htmlmarkup: 'TEMP',
					pngcssrule: 'NOPE',
					datacssrule: 'NADA',
					pngdatacssrule: 'NEIN'
				});
			}
		});

		return promise;
	};

}(typeof exports === 'object' && exports || this));