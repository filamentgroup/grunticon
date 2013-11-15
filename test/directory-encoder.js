var path = require( 'path' );
var constructor = require( path.join('..', 'lib', 'directory-encoder'));
var fs = require('fs');

"use strict";
var encoder;


exports['encode'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", "test/output/encoded.css" );
		done();
	},

	output: function( test ) {
		encoder.encode();
		test.ok( fs.existsSync("test/output/encoded.css") );
		test.done();
	},

	selector: function( test ) {
		// TODO differentiate between same name files
		encoder._css = function( name ){
			test.equal( name, "bear" );
		};

		encoder.encode();
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
