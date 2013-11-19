/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var fs = require( 'fs-extra' );
	var path = require( 'path' );

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

	var Colorfy = function( filepath ){
		var extraColors = Array.prototype.slice( arguments, 1 ),
			colors = [];

		colors = getColorConfig( filepath );
		colors.push.apply( colors, extraColors );

		this.originalContents = fs.readFileSync( filepath ).toString( 'utf-8' );
		this.originalFilepath = filepath.replace( colorsRegx, "" );
		this.originalFilename = path.basename( this.originalFilepath );
		this.filepath = filepath;
		this.colors = colors;
		this.colorFiles = {};
	};

	Colorfy.prototype.writeFiles = function( destFolder ){
		destFolder = destFolder || "";

		if( !fs.existsSync( destFolder ) ){
			fs.mkdirpSync( destFolder );
		}
		fs.writeFileSync( path.join( destFolder, this.originalFilename ), this.originalContents );

		for (var filepath in this.colorFiles) {
			if (this.colorFiles.hasOwnProperty(filepath)) {
				fs.writeFileSync( path.join( destFolder, filepath ), this.colorFiles[ filepath ] );
			}
		}
	};

	Colorfy.prototype.convert = function(){
		var self = this;

		self.colors.forEach( function( color ){
			var newFilePath = self.filepath.replace( colorsRegx, "-" + color ) ,
				newFilename = path.basename( newFilePath ),
				newFileContents = self.originalContents.replace( /(<svg[^>]+>)/im, '$1<style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: ' + color + ' !important; }</style>' );

			self.colorFiles[ newFilename ] = newFileContents;
		});
	};



	module.exports = Colorfy;
}());

