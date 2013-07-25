/*global require:true*/
(function( exports ){
	"use strict";
	var fs = require( 'fs' );

	var Gfile = function( filename ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = filename.match( svgRegex ),
			isPng = filename.match( pngRegex );

		this.filename = filename;
		this.isSvg = isSvg;
		this.filenamenoext = filename.replace( isSvg ? svgRegex : pngRegex, "" );
	};

	Gfile.prototype.setImageData = function( inputdir ){
		this.imagedata = fs.read(  inputdir + this.filename ) || "";
	};


	exports.grunticonFile = Gfile;
}(typeof exports === 'object' && exports || this));
