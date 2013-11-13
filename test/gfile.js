var path = require( 'path' );
var GrunticonFile = require( path.join( '..', 'lib', 'grunticon-file') ).grunticonFile;

/*
	======== A Handy Little Nodeunit Reference ========
	https://github.com/caolan/nodeunit

	Test methods:
		test.expect(numAssertions)
		test.done()
	Test assertions:
		test.ok(value, [message])
		test.equal(actual, expected, [message])
		test.notEqual(actual, expected, [message])
		test.deepEqual(actual, expected, [message])
		test.notDeepEqual(actual, expected, [message])
		test.strictEqual(actual, expected, [message])
		test.notStrictEqual(actual, expected, [message])
		test.throws(block, [error], [message])
		test.doesNotThrow(block, [error], [message])
		test.ifError(value)
*/
"use strict";
var gf, constructor = GrunticonFile;

exports['constructor'] = {
	setUp: function( done ) {
		gf = new constructor( "foo.svg" );
		done();
	},

	isSvgIsSet: function( test ) {
		test.expect( 1 );
		test.ok( gf.isSvg );
		test.done();
	},

	isSvgIsNotSet: function( test ) {
		test.expect( 1 );
		gf = new constructor( "foo.png" );
		test.ok( !gf.isSvg );
		test.done();
	},

	fileNameSet: function( test ) {
		test.expect( 1 );
		test.equal( gf.filenamenoext, "foo" );
		test.done();
	}
};

exports['setImageData'] = {
	setUp: function( done ) {
		gf = new constructor( "foo.svg" );
		done();
	},

  setImageData: function( test ) {
		test.expect( 2 );
    test.equal( gf.imagedata, undefined );
    gf.setImageData( "test/files/" );
    test.equal( gf.imagedata, "<foo/>\n" );
		test.done();
  }
};
