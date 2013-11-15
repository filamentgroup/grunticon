var path = require( 'path' );
var constructor = require( path.join('..', 'lib', 'directory-encoder'));
var fs = require('fs');

"use strict";
var encoder, output = "test/output/encoded.css";


exports['encode'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", output );
		done();
	},

	output: function( test ) {
		encoder.encode();
		test.ok( fs.existsSync(output) );
		test.ok( /\.bear/.test(fs.readFileSync(output, {encoding: "utf8"})) );
		test.done();
	},

	selector: function( test ) {
		encoder._css = function( name, data ){
			test.ok( name === "bear" || name === "dog" );

			return constructor.prototype._css(name, data);
		};

		encoder.encode();
		test.done();
	},

	dup: function( test ) {
		encoder = new constructor( "test/encoding-dup", output );
		test.throws(function() { encoder.encode(); });
		test.done();
	}
};

exports['css'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", "test/output/encoded.css" );
		done();
	},

	rule: function( test ) {
		test.equal( encoder._css("foo", "bar"),
			".foo { background-image: url('bar'); background-repeat: no-repeat; }" );
		test.done();
	}
};
