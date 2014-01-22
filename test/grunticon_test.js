'use strict';

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

exports['grunt-grunticon'] = {
	setUp: function(done) {
		// setup here if necessary
		done();
	},
	loader: function(test) {
		test.expect(1);

		var actual = grunt.file.read('example/output/grunticon.loader.js');
		var expected = grunt.file.read('test/expected/grunticon.loader.js');
		test.equal(actual, expected, 'loader should match properly');

		test.done();
	},
	cssFiles: function( test ){
		test.expect(3);

		var actual1 = grunt.file.read('example/output/icons.data.png.css');
		var actual2 = grunt.file.read('example/output/icons.data.svg.css');
		var actual3 = grunt.file.read('example/output/icons.fallback.css');
		var expected1 = grunt.file.read('test/expected/icons.data.png.css');
		var expected2 = grunt.file.read('test/expected/icons.data.svg.css');
		var expected3 = grunt.file.read('test/expected/icons.fallback.css');
		test.equal(actual1, expected1, 'CSS png should match');
		test.equal(actual2, expected2, 'CSS svg should match');
		test.equal(actual3, expected3, 'CSS fallback should match');

		test.done();
	}
};
