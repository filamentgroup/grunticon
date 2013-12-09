/*global require:true*/
(function( exports ){
	"use strict";
	var path = require( 'path' );
	var fs = require( 'fs' );
	var Handlebars = require( 'handlebars' );
	var _ = require( 'lodash' );

	var imgStats = require( './img-stats' );

	var createPreview = function(src, dest, width, height, min){
		var source = fs.readFileSync( path.join( "example", "preview.hbs" ) ).toString( 'utf-8' );
		var template = Handlebars.compile(source);
		var icons = [];
		
		fs.readdirSync(src).forEach(function( file ){
			var icon = {};
			icon.name = path.basename( file ).replace( path.extname( file ), "" );
			var data = imgStats.statsSync( path.join( src, file ) );
			if( !data.width ){
				data.width = width.replace(/px/, "");
			}
			if( !data.height ){
				data.height = height.replace(/px/,"");
			}
			_.extend( icon, data );
			icons.push( icon );
		});

		var prevData = {
			loaderText: min,
			icons: icons
		};
		var html = template( prevData );
		fs.writeFileSync( path.join( dest, "preview.html" ), html );
	};

	exports.createPreview = createPreview;

}(typeof exports === 'object' && exports || this));
