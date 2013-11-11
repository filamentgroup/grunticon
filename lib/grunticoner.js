/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";
	var fs = require( "fs" );
	var RSVP = require('./rsvp');
	var img_stats = require( './img-stats' );
	var GruntiFile = require( "./grunticon-file" ).grunticonFile;


	//TODO - Write test
	// gFile
	// o
	//
	// resolve promise with obj
	// {
	//	width: int
	//	height: int
	//	type: "SVG" || "PNG"
	// }
	exports.getStats = function( gFile , o ){

		var p = new RSVP.Promise(),
			imagedata = gFile.imagedata,
			isSvg = gFile.isSvg,
			filename = gFile.filename,
			dir = o.inputdir,
			data = {};

		if( isSvg ) {
			// get svg element's dimensions so we can set the viewport dims later
			var frag = window.document.createElement( "div" );
			frag.innerHTML = imagedata;
			var svgelem = frag.querySelector( "svg" );
			var pxre = /([\d\.]+)\D*/;
			var width = svgelem.getAttribute( "width" );
			var height = svgelem.getAttribute( "height" );
			if( width ){
				data.width = width.replace(pxre, "$1px");
			} else {
				data.width = o.defaultWidth;
			}
			if( height ){
				data.height = height.replace(pxre, "$1px");
			} else {
				data.height = o.defaultHeight;
			}
			data.type = "SVG";

			p.resolve( data );
		} else {
			img_stats.stats( dir + filename , function( data ){
				data.width = data.width + 'px';
				data.height = data.height + 'px';
				data.type = data.type;
				p.resolve( data );
			});
		}
		return p;
	}; //getStats


	//TODO - Requires Phantom - No test?
	exports.render = function( gFile , o) {
		var renderp = new RSVP.Promise();
		var self = this;

		var page = require( "webpage" ).create();

		var pngDest = o.outputdir + o.pngout;
		var pngName = gFile.filenamenoext + ".png";
		var filename = o.inputdir + gFile.filename;
		// set page viewport size to svg dimensions
		page.viewportSize = {  width: parseFloat(gFile.width), height: parseFloat(gFile.height) };
		// open svg file in webkit to make a png || png to grab base64
		page.open(  filename, function( status ){
			if( status === "success" ){
				// create tmp file
				page.render( pngDest + pngName );
				var pngimgstring = page.renderBase64( "png" );
				renderp.resolve( pngimgstring );
			} else {
				renderp.reject( status );
			}
		}); //page.open
		return renderp;
	}; // render

	// process an svg file from the source directory
	//TODO - test - integration test?
	//params
	// filename
	// o
	//
	//resolves promise
	exports.processFile = function( filename , o ){
		var promise = new RSVP.Promise();
		var self = this;

		var gFile = new GruntiFile( filename );

		gFile.setImageData( o.inputdir );

		self.getStats( gFile , o )
		.then( function( data ){
			gFile.width = data.width;
			gFile.height = data.height;
			gFile.type = data.type;

			return self.render( gFile , o );
		})
		.then( function(){
			promise.resolve();
		});

		return promise;
	}; // end of processFile
}(typeof exports === 'object' && exports || this));

