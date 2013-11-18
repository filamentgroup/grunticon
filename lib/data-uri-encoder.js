/*global module:true*/
/*global require:true*/
(function(){
	"use strict";

	var fs = require( 'fs' );

	var prefixes = {
		'svg': "data:image/svg+xml;charset=US-ASCII,",
		'png': "data:image/png;base64,"
	};

	function DataURIEncoder( path, prefix ) {
		this.path = path;
		this.extension = path.split('.').pop();
		this.prefix = prefix || prefixes[ this.extension ];
	}

	DataURIEncoder.prototype.encode = function( callback ) {
		var fileData = fs.readFileSync( this.path );

		callback = callback || DataURIEncoder.handlers[this.extension];

		if( callback ){
			return callback( this.prefix , fileData );
		} else {
			var base64 = fileData.toString( 'base64');
			return this.prefix + base64;
		}
	};

	DataURIEncoder.handlers = {
		'svg': function( prefix, data ){
			return prefix + encodeURIComponent( data.toString()
				//strip newlines and tabs
				.replace( /[\n\r]/gmi, "" )
				.replace( /\t/gmi, " " )
				//strip comments
				.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
				//replace
				.replace(/'/gmi, "\\i") );
		}
	};

	module.exports = DataURIEncoder;
}());
