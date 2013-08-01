/*global require:true*/
/*global window:true*/

(function(exports) {
	"use strict";
	var fs = require( "fs" );


	exports.pngdatauri = function( filepath ){
		var prefix = "data:image/png;base64,";
		var base64 = fs.readFileSync( filepath ).toString( 'base64');
		return prefix + base64;
	};
	/**
	 * Slowly work to reimplementing all of these.
	 */
	exports.getStats = function( gFile , o ){
	}; //getStats

	exports.createCSSRules = function( gFile , o ){
	}; //buildSVGDataURI

	exports.render = function( gFile , o) {
	}; // render

	exports.writeCSS = function( dataarr , o ){
	};

	exports.processFile = function( filename , o ){
	}; // end of processFile
}(typeof exports === 'object' && exports || this));

