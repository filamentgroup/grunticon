var path = require( 'path' );
var fs = require( 'fs' );
var DataURIEncoder = require( './data-uri-encoder' );

function PngURIEncoder(path) {
	DataURIEncoder.call( this, path );
}

PngURIEncoder.prefix = "data:image/png;base64,";

PngURIEncoder.prototype.encode = function( options ) {
	var datauri, fileData = fs.readFileSync( this.path );

	datauri = PngURIEncoder.prefix + DataURIEncoder.prototype.encode.call(this);

	//IE LTE8 cannot handle datauris that are this big. Need to make sure it just
	//links to a file
	if (datauri.length > 32768 && options ) {
		return path.join(options.pngfolder, path.basename(this.path))
			.split( path.sep )
			.join( "/" );
	}

	return datauri;
};

module.exports = PngURIEncoder;
