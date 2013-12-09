/*global module:true*/
/*global require:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var fs = require( 'fs' ),
		img_stats = require('./img-stats'),
		RSVP = require('./rsvp'),
		path;


	var Gfile = function( filename ){
		var svgRegex = /\.svg$/i,
			pngRegex = /\.png$/i,
			isSvg = filename.match( svgRegex ),
			isPng = filename.match( pngRegex );

		this.filename = filename;
		this.isSvg = isSvg;
		this.filenamenoext = filename.replace( isSvg ? svgRegex : pngRegex, "" );
	};

	// TODO remove second two branches
	Gfile.prototype.setImageData = function( inputdir , grunt ){
		if( fs.readFileSync && this.isSvg ){
			this.imagedata = fs.readFileSync( path.join( inputdir , this.filename )).toString() || "";
		} else if( fs.readFileSync ){
		} else {
			this.imagedata = fs.read( inputdir + this.filename ) || "";
		}
	};


	module.exports = Gfile;

}(typeof exports === 'object' && exports || this));
