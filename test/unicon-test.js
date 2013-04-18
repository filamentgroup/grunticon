var grunt = require('grunt');

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

exports['grunticon'] = {
	setUp: function(done) {
		"use strict";
		// setup here
		done();
	},
	'helper': function(test) {
		"use strict";
		test.expect(1);
		// tests here
		test.equal(grunt.helper('grunticon'), 'grunticon!!!', 'should return the correct value.');
		test.done();
	}
};
