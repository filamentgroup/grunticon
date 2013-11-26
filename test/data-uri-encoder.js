/*global require:true*/
(function(){
	"use strict";
	var path = require( 'path' );
	var constructor = require( path.join('..', 'lib', 'data-uri-encoder'));
	var SvgURIEncoder = require( path.join('..', 'lib', 'svg-uri-encoder'));
	var PngURIEncoder = require( path.join('..', 'lib', 'png-uri-encoder'));
	var fs = require('fs');
	var _ = require( 'lodash' );

	exports['constructor'] = {
		setUp: function( done ) {
			this.encoder = new constructor( "test/files/bear.svg" );
			done();
		},

		path: function( test ) {
			test.equal( this.encoder.path, "test/files/bear.svg" );
			test.done();
		},

		extension: function( test ) {
			test.equal( this.encoder.extension, "svg" );
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
			this.encoder = new constructor( "test/files/bear.png" );
			done();
		},

		output: function( test ) {
			testEncoded( test, this.encoder.encode());
			test.done();
		},

		callback: function( test ) {
			this.encoder.encode(function( prefix, fileData ) {
				test.equal( prefix, this.encoder.prefix );
				test.ok( fileData );
			});

			test.done();
		}
	};

	exports['SvgURIEncoder'] = {
		setUp: function( done ) {
			this.encoder = new SvgURIEncoder( "test/files/bear.svg" );
			done();
		},

		encode: function( test ) {
			var datauri = this.encoder.encode();

			test.ok( datauri.indexOf(SvgURIEncoder.prefix) >= 0 );
			test.ok( datauri.indexOf( '%' ) >= 0 );
			test.done();
		}
	};


	exports['PngURIEncoder'] = {
		setUp: function( done ) {
			this.encoder = new PngURIEncoder( "test/files/bear.png" );
			this.encode = _.clone( constructor.prototype.encode );
			done();
		},

		tearDown: function( done ) {
			constructor.prototype.encode = this.encode;
			done();
		},

		encode: function( test ) {
			var datauri = this.encoder.encode();

			testEncoded( test, this.encoder.encode().replace(PngURIEncoder.prefix, "") );
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

			test.equal( this.encoder.encode({ pngfolder: "foo" }), "foo/bear.png" );
			test.done();
		}
	};
	exports['PngURIEncoder2'] = {
		setUp: function( done ) {
			this.encoder = new PngURIEncoder( "test/files/bear.png" );
			done();
		},
		tearDown: function( done ){
			done();
		},
		noencode: function( test ){
			var options = {
				noencodepng: true,
				pngfolder: "bar"
			};

			test.equal( this.encoder.encode(options), "bar/bear.png" );
			test.done();
		}
	};
}());
