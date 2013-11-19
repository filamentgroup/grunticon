var path = require( 'path' );
var constructor = require( path.join('..', 'lib', 'data-uri-encoder'));
var SvgURIEncoder = require( path.join('..', 'lib', 'svg-uri-encoder'));
var PngURIEncoder = require( path.join('..', 'lib', 'png-uri-encoder'));
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
		testEncoded( test, encoder.encode());
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

exports['SvgURIEncoder'] = {
	setUp: function( done ) {
		encoder = new SvgURIEncoder( "test/files/bear.svg" );
		done();
	},

	encode: function( test ) {
		var datauri = encoder.encode();

		test.ok( datauri.indexOf(SvgURIEncoder.prefix) >= 0 );
		test.ok( datauri.indexOf( '%' ) >= 0 );
		test.done();
	}
};

var parentDecode = constructor.prototype.encode;

exports['PngURIEncoder'] = {
	setUp: function( done ) {
		encoder = new PngURIEncoder( "test/files/bear.png" );
		done();
	},

	tearDown: function( done ) {
		constructor.prototype.encode = parentDecode;
		done();
	},

	encode: function( test ) {
		var datauri = encoder.encode();

		testEncoded( test, encoder.encode().replace(PngURIEncoder.prefix, "") );
		test.done();
	},

	pathSwitch: function( test ) {
		constructor.prototype.encode = function(){
			var i = 32768, datauri = "";

			while( i >= 0 ) {
				datauri += "a";
				i--;
			}

			return datauri;
		};

		test.equal( encoder.encode({ pngfolder: "foo" }), "foo/bear.png" );
		test.done();
	}
};
