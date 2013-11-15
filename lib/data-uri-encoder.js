var fs = require( 'fs' );

var prefixes = {
	'svg': "data:image/svg+xml;charset=US-ASCII,",
	'png': "data:image/png;base64,"
};

function DataURIEncoder( path, prefix ) {
	this.path = path;
	this.extension = path.split('.').pop();
	this.prefix = prefix || prefixes[ this.extension ];
};

DataURIEncoder.prototype.encode = function( callback ) {
	var fileData = fs.readFileSync( this.path );

	if( callback ){
		callback( this.prefix , fileData );
	} else {
		var base64 = fileData.toString( 'base64');
		return this.prefix + base64;
	}
};

module.exports = DataURIEncoder;
