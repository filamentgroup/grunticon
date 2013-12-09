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

	Gfile.prototype.setPngLocation = function( opts ){
		this.relPngLocation = path.join( opts.relative , this.filenamenoext + ".png" );
		this.absPngLocation = path.join( opts.absolute , this.filenamenoext + ".png" );
	};

	Gfile.prototype.svgdatauri = function(){
		if( !this._svgdatauri ){
			var imagedata = this.imagedata;
			var prefix = this.isSvg ? "data:image/svg+xml;charset=US-ASCII," : "data:image/png;base64,";
			this._svgdatauri = prefix + encodeURIComponent( imagedata
				//strip newlines and tabs
				.replace( /[\n\r]/gmi, "" )
				.replace( /\t/gmi, " " )
				//strip comments
				.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
				//replace
				.replace(/'/gmi, "\\i") );
		}
		return this._svgdatauri;
		}; //buildSVGDataURI

	Gfile.prototype.pngdatauri = function(){
		if( !this._pngdatauri ){
			try{
				var prefix = "data:image/png;base64,";
				var base64 = fs.readFileSync( this.absPngLocation ).toString( 'base64');
				this._pngdatauri = prefix + base64;
			} catch( e ){
				throw new Error( e );
			}
		}
		return this._pngdatauri;
	};


	exports.grunticonFile = Gfile;
}(typeof exports === 'object' && exports || this));
