/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var fs = require( 'fs-extra' );
	var path = require( 'path' );

	var _ = require( 'lodash' );

	var colorsRegx = /\.colors\-([^\.]+)/i;

	// test if value is a valid hex
	var isHex = function( val ){
		return (/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i).test( val );
	};

	var getColorConfig = function( str ){
		var colors = str.match( colorsRegx ), colorObj = {};
		if( colors ){
			colors = colors[ 1 ].split( "-" );
			colors.forEach( function( color, i ){
				if( isHex( color ) ){
					colorObj[ i ] = "#" + color;
				}
			});
			return colorObj;
		}
		else {
			return colorObj;
		}
	}; //getColorConfig

	var Colorfy = function( filepath, extraColors ){

		var colors = getColorConfig( filepath );
		_.extend( colors, extraColors );

		this.originalContents = fs.readFileSync( filepath ).toString( 'utf-8' );
		this.originalFilepath = filepath.replace( colorsRegx, "" );
		this.originalFilename = path.basename( this.originalFilepath );
		this.ofnNoExt = this.originalFilename.replace( path.extname( this.originalFilename ), "" );
		this.filepath = filepath;
		this.colors = colors;
		this.colornames = Object.keys(this.colors);
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

		for( var name in self.colors ){
			if( self.colors.hasOwnProperty(name) ){
				var color = self.colors[name];
				var newFilePath = path.join( path.dirname( self.originalFilepath ), self.ofnNoExt + "-" + name + path.extname( self.originalFilepath ) ) ,
					newFilename = path.basename( newFilePath ),
					newFileContents = self.originalContents.replace( /(<svg[^>]+>)/im, '$1<style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: ' + color + ' !important; }</style>' );

				self.colorFiles[ newFilename ] = newFileContents;
			}
		}
	};



	module.exports = Colorfy;
}());

