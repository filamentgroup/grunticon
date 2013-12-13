/*global __dirname:true*/
/*global require:true*/
(function( exports ){
	"use strict";
	var path = require( 'path' );
	var fs = require( 'fs' );
	var Handlebars = require( 'handlebars' );
	var _ = require( 'lodash' );

	var imgStats = require( './img-stats' );

	var createPreview = function(src, dest, width, height, min, previewHTML, cssprefix){
		var prefix = (function(p){
			if( typeof p === "string" && p[0] === "."){
				p = p.substr(1);
			}
			return p;
		}(cssprefix));
		var source = fs.readFileSync( path.join( __dirname, "..", "example", "preview.hbs" ) ).toString( 'utf-8' );
		var template = Handlebars.compile(source);
		var icons = [];

		fs.readdirSync(src).forEach(function( file ){
			var ext = path.extname( file );
			if( ext === ".svg" || ext === ".png" ){
				var icon = {};
				icon.name = path.basename( file ).replace( path.extname( file ), "" );
				var data = imgStats.statsSync( path.join( src, file ) );
				data.width = String(data.width || width).replace(/px/, "");
				data.height = String(data.height || height).replace(/px/, "");
				data.prefix = cssprefix;
				data.prefixClass = prefix;
				_.extend( icon, data );
				icons.push( icon );
			}
		});

		var prevData = {
			loaderText: min,
			icons: icons
		};
		var html = template( prevData );
		fs.writeFileSync( path.join( dest, previewHTML ), html );
	};

	exports.createPreview = createPreview;

}(typeof exports === 'object' && exports || this));
