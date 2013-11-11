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
var constructor = GrunticonFile;

module.exports = {
	setUp: function( done ) {
		done();
	},

	isSvgIsSet: function( test ) {
		test.expect( 1 );
		var gf = new constructor( "foo.svg" );
		test.ok( gf.isSvg );
		test.done();
	},

	isSvgIsNotSet: function( test ) {
		test.expect( 1 );
		var gf = new constructor( "foo.png" );
		test.ok( !gf.isSvg );
		test.done();
	},

	fileNameSet: function( test ) {
		test.expect( 1 );
		var gf = new constructor( "bar.svg" );
		test.equal( gf.filenamenoext, "bar" );
		test.done();
	}
};
