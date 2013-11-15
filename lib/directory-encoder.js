var fs = require( 'fs' );
var path = require( 'path' );
var DataURIEncoder = require( './data-uri-encoder' );

function DirectoryEncoder( input, output ){
	this.input = input;
	this.output = output;
}

DirectoryEncoder.prototype.encode = function() {
	var self = this;

	// clean out the file if it's there
	fs.truncateSync( this.output, 0 );

	// append each selector
	fs.readdirSync( this.input ).forEach(function( file ) {
		var css, encoder, extension = file.split('.').pop();

		encoder = new DataURIEncoder( path.join(self.input, file) );

		css = self._css( file.replace("." + extension, ''), encoder.encode() );

		fs.appendFileSync( self.output, css + "\n\n" );
	});
};

DirectoryEncoder.prototype._css = function( name, datauri ) {
	return "." + name +
		" { background-image: url('" +
		datauri +
		"'); background-repeat: no-repeat; }";

};

module.exports = DirectoryEncoder;
