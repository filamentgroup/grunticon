/*global grunticon:true*/
(function(window) {
	/*
		======== A Handy Little QUnit Reference ========
		http://api.qunitjs.com/

		Test methods:
			module(name, {[setup][ ,teardown]})
			test(name, callback)
			expect(numberOfAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			throws(block, [expected], [message])
	*/

	module( 'Grunticon Loader Setup' );

	test( 'function grunticon exists', function(){
		expect(2);
		ok( window.grunticon, "grunticon should exist on the window object" );
		ok( typeof window.grunticon === "function", "grunticon should be a function" );
	});

	test( 'loadCSS function exists', function(){
		expect(2);
		ok( window.grunticon.loadCSS, "grunticon.loadCSS should exist on the window object" );
		ok( typeof window.grunticon.loadCSS === "function", "grunticon.loadCSS should be a function" );
	});

	asyncTest( 'loadCSS loads css file', function(){
		expect(1);
		window.grunticon.loadCSS( "./files/loadcss.css" );

		setTimeout(function(){
			ok( Array.prototype.some.call(document.styleSheets, function(ss){
				return ss.href.match(/loadcss/);
			}),"File should load");
			start();
		}, 200);

	});

}(window));
