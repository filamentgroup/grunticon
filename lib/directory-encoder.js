var fs = require( 'fs' );
var path = require( 'path' );
var DataURIEncoder = require( './data-uri-encoder' );

function DirectoryEncoder( input, output ){
	this.input = input;
	this.output = output;
}

DirectoryEncoder.prototype.encode = function() {
	var self = this, seen = {};

	// remove the file if it's there
	fs.unlinkSync( this.output );

	// append each selector
	fs.readdirSync( this.input ).forEach(function( file ) {
		var css, encoder, name, extension = file.split('.').pop();

		name = file.replace("." + extension, '');

		if( seen[name] ){
			throw new Error("Two files with the same name: `" + name + "` exist in the input directory");
		}

		seen[name] = true;

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
