/*global require:true*/
/*global module:true*/
(function(){
	"use strict";

	var fs = require( 'fs' );
	var DataURIEncoder = require( './data-uri-encoder' );

	function SvgURIEncoder(path) {
		DataURIEncoder.call( this, path );
	}

	SvgURIEncoder.prefix = "data:image/svg+xml;charset=US-ASCII,";

	SvgURIEncoder.prototype.encode = function() {
		var fileData = fs.readFileSync( this.path );

		return SvgURIEncoder.prefix + encodeURIComponent( fileData.toString('utf-8')
			//strip newlines and tabs
			.replace( /[\n\r]/gmi, "" )
			.replace( /\t/gmi, " " )
			//strip comments
			.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
			//replace
			.replace(/'/gmi, "\\i") );
	};

	module.exports = SvgURIEncoder;
}());
