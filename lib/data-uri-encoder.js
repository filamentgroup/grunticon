/*global module:true*/
/*global require:true*/
(function(){
	"use strict";
	var fs = require( 'fs' );

	function DataURIEncoder( path ) {
		this.path = path;
		this.extension = path.split('.').pop();
	}

	DataURIEncoder.prototype.encode = function() {
		var fileData = fs.readFileSync( this.path );
		var base64 = fileData.toString( 'base64');
		return base64;
	};

	module.exports = DataURIEncoder;
}());
