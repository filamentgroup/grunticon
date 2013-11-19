var fs = require( 'fs' );
var path = require( 'path' );
var DataURIEncoder = require( './data-uri-encoder' );

function DirectoryEncoder( input, output ){
	this.input = input;
	this.output = output;
}

DirectoryEncoder.prototype.encode = function( options ) {
	var handler, self = this, seen = {};

	options = options || {};
	options.datauriHandlers = options.datauriHandlers || {};

	// remove the file if it's there
	if( fs.existsSync(this.output) ) {
		fs.unlinkSync( this.output );
	}

	// append each selector
	fs.readdirSync( this.input ).forEach(function( file ) {
		var css, encoder, name, datauri, extension = path.extname( file );

		name = file.replace( extension, '' );

		if( seen[name] ){
			throw new Error("Two files with the same name: `" + name + "` exist in the input directory");
		}

		seen[name] = true;

		encoder = new DataURIEncoder( path.join(self.input, file) );

		datauri = encoder.encode();

		// let external callers have a crack at the datauri before adding it to the file
		// E.g. for png files where the data uri is > some size a relative url is used
		if( handler = options.datauriHandlers[extension.replace(".", "")] ) {
			datauri = handler( datauri );
		}

		css = self._css( file.replace( extension, '' ), datauri );

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
