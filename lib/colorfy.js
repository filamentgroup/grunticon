/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var fs = require( 'fs' );

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

	var Colorfy = function( file ){
		var extraColors = Array.prototype.slice( arguments, 1 ),
			colors = [];

		colors = getColorConfig( file );
		colors.push.apply( colors, extraColors );

		this.originalContents = fs.readFileSync( file ).toString( 'utf-8' );
		this.originalFilename = file.replace( colorsRegx, "" );
		this.file = file;
		this.colors = colors;
		this.colorFiles = {};
	};

	Colorfy.prototype.writeFiles = function( destFolder ){
		destFolder = destFolder || "";

		fs.writeFileSync( this.originalFilename, this.originalContents, 'w' );

		for (var key in this.colorFiles) {
			if (this.colorFiles.hasOwnProperty(key)) {
				fs.writeSync( key, this.colorFiles[ key ], 'w' );
			}
		}
	};

	Colorfy.prototype.convert = function(){
		var self = this;

		self.colors.forEach( function( color ){
			var newFileName = self.file.replace( colorsRegx, "-" + color ) ,
				newFileContents = self.originalContents.replace( /(<svg[^>]+>)/im, '$1<style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: ' + color + ' !important; }</style>' );

			self.colorFiles[ newFileName ] = newFileContents;
		});
	};



	module.exports = Colorfy;
}());

