/*global require:true*/
(function( exports ){
	"use strict";
	var path = require( 'path' );
	var fs = require( 'fs' );
	var Handlebars = require( 'handlebars' );
	var _ = require( 'lodash' );

	var imgStats = require( './img-stats' );

	var createPreview = function(src, opts){
		var dest = opts.dest,
				width = opts.defaultWidth,
				height = opts.defaultHeight,
				min = opts.min,
				embed = opts.embed,
				previewHTML = opts.previewhtml,
				cssprefix = opts.cssprefix,
				previewTemplate = opts.previewTemplate,
				cssFiles = {
					svg: opts.datasvgcss,
					png: opts.datapngcss,
					fallback: opts.urlpngcss
				};

		var prefix = (function(p){
			var ret = {},
				selectorString, selectorType;
			if( typeof p === "string" && (p[0] === "." || p[0] === "#")){
				selectorString = p.substr(1);
				selectorType = p[0];
			} else {
				selectorString = p;
			}

			ret.selectorString = selectorString;
			ret.selectorType = selectorType;

			return ret;
		}(cssprefix));

		var source = fs.readFileSync( previewTemplate ).toString( 'utf-8' );
		var template = Handlebars.compile(source);
		var icons = [];

		fs.readdirSync(src)
		.filter(function(file){
			var ext = path.extname( file );
			return ext === ".svg" || ext === ".png";
		}).forEach(function( file ){
			var icon = {};
			icon.name = path.basename( file ).replace( path.extname( file ), "" );
			var data = imgStats.statsSync( path.join( src, file ) );
			data.width = String(data.width || width).replace(/px/, "");
			data.height = String(data.height || height).replace(/px/, "");
			data.prefix = cssprefix;
			data.selectorString = prefix.selectorString;
			data.selectorType = (function(selectorType){
				var type = "";
				if( selectorType === "." ){
					type = "class";
				} else {
					type = "id";
				}
				return type;
			}(prefix.selectorType));
			_.extend( icon, data );
			icons.push( icon );
		});

		var prevData = {
			loaderText: min,
			embedText: embed,
			cssFiles: cssFiles,
			icons: icons
		};
		var html = template( prevData );
		fs.writeFileSync( path.join( dest, previewHTML ), html );
	};

	exports.createPreview = createPreview;

}(typeof exports === 'object' && exports || this));
