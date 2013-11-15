var path = require( 'path' );
var constructor = require( path.join('..', 'lib', 'data-uri-encoder'));
var fs = require('fs');

"use strict";
var encoder;

exports['constructor'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/files/bear.svg" );
		done();
	},

	path: function( test ) {
		test.equal( encoder.path, "test/files/bear.svg" );
		test.done();
	},

	extension: function( test ) {
		test.equal( encoder.extension, "svg" );
		test.done();
	},

	prefix: function( test ) {
		test.equal( encoder.prefix, "data:image/svg+xml;charset=US-ASCII," );
		test.done();
	},

	prefixOverride: function( test ) {
		encoder = new constructor( "test/files/bear.svg", "foo" );
		test.equal( encoder.prefix, "foo" );
		test.done();
	}
};

function testEncoded( test, str ) {
	str.split('').forEach(function( c ) {
		test.ok( /[a-zA-Z0-9+\/=]+/.test(c) );
	});
}

exports['encode'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/files/bear.png" );
		done();
	},

	output: function( test ) {
		testEncoded( test, encoder.encode().replace(encoder.prefix, "") );
		test.done();
	},

	callback: function( test ) {
		encoder.encode(function( prefix, fileData ) {
			test.equal( prefix, encoder.prefix );
			test.ok( fileData );
		});

		test.done();
	}
};
