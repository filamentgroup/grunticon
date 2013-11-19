var fs = require( 'fs' );
var path = require( 'path' );
var DataURIEncoder = require( './data-uri-encoder' );

function DirectoryEncoder( input, output, options ){
	this.input = input;
	this.output = output;
	this.options = options || {};
	this.options.datauriHandlers = this.options.datauriHandlers || {};
}

DirectoryEncoder.prototype.encode = function() {
	var handler, self = this, seen = {};


	// remove the file if it's there
	if( fs.existsSync(this.output) ) {
		fs.unlinkSync( this.output );
	}

	// append each selector
	fs.readdirSync( this.input ).forEach(function( file ) {
		var css, name, datauri, extension = path.extname( file );

		self._checkName(seen, file.replace( extension, '' ));

		datauri = self._datauri( path.join(self.input, file) );

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

DirectoryEncoder.prototype._datauri = function( file ) {
	var encoder, datauri, handler, extension = path.extname( file );

	encoder = new DataURIEncoder( file );

	datauri = encoder.encode();

	// let external callers have a crack at the datauri before adding it to the file
	// E.g. for png files where the data uri is > some size a relative url is used
	if( handler = this.options.datauriHandlers[extension.replace(".", "")] ) {
		datauri = handler( datauri );
	}

	return datauri;
};

DirectoryEncoder.prototype._checkName = function( seen, name ) {
	if( seen[name] ){
		throw new Error("Two files with the same name: `" + name + "` exist in the input directory");
		}

	seen[name] = true;
};

module.exports = DirectoryEncoder;
