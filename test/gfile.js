var path = require( 'path' );
var GrunticonFile = require( path.join( '..', 'lib', 'grunticon-file') ).grunticonFile;
var fs = require('fs');

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

exports['setPngLocation'] = {
	setUp: function( done ) {
		gf = new constructor( "foo.svg" );
		done();
	},

	setPngLocation: function( test ) {
		test.expect( 4 );

		test.equal( gf.relPngLocation, undefined );
		test.equal( gf.absPngLocation, undefined );

		gf.setPngLocation({
			relative: "test/files",
			absolute: path.resolve( "test/files" )
		});

		test.equal( gf.relPngLocation.toString(), "test/files/foo.png" );
		test.ok( /test\/files\/foo.png$/.test(gf.absPngLocation.toString()) );
		test.done();
	}
};

exports['svgdatauri'] = {
	setUp: function( done ) {
		gf = new constructor( "foo.svg" );
		done();
	},

	assignedOnce: function( test ) {
		test.expect( 2 );
		var val = gf._svgdatauri = "test/files/foo.svg";

		test.equal( val, gf.svgdatauri() );
		test.equal( val, gf.svgdatauri() );
		test.done();
	},

	prefix: function( test ) {
		test.expect( 1 );
		gf.setImageData( "test/files/" );
		test.equal( gf.svgdatauri().indexOf("data:image/svg"), 0 );
		test.done();
	},

	replace: function( test ) {
		var data;
		test.expect( 2 );
		gf = new constructor( "complex-foo.svg" );
		gf.setImageData( "test/files/" );
		test.equal( gf.imagedata, "<foo/>\n<bar/>\n<!-- comment -->\n", 0 );

		data = gf.svgdatauri().split( "ASCII," )[1];

		test.equal( data, encodeURIComponent( "<foo/><bar/>" ) );
		test.done();
	}
};

function testEncoded( test, str ) {
	str.split('base64,')[1].split('').forEach(function( c ) {
		test.ok( /[a-zA-Z0-9+\/=]+/.test(c) );
	});
}

exports['pngdatauri'] = {
	setUp: function( done ) {
		gf = new constructor( "foo.png" );
		gf.setPngLocation({
			relative: "test/files",
			absolute: path.resolve( "test/files" )
		});
		done();
	},

	encoded: function( test ) {
		// test that all characters are base64, might include = for low bytes
		testEncoded( test, gf.pngdatauri() );
		test.done();
	}
};

function imageSetup( gf ) {
	gf.setImageData( "test/files/" );

	gf.setPngLocation({
		relative: "test/files",
		absolute: path.resolve( "test/files" )
	});
}

exports['stats'] = {
	setUp: function( done ) {
		gf = new constructor( "bear.svg" );
		done();
	},

	// NOTE png stats should probably be recorded in the image_stats tests
	actualStats: function( test ) {
		test.expect( 2 );
		imageSetup( gf );

		gf.stats({ inputDir: "test/files" }).then(function( data ) {
			test.equal( parseInt(data.width.replace(/px/, ''), 10), 100 );
			test.equal( parseInt(data.height.replace(/px/, ''), 10), 62 );
			test.done();
		}, function() {
			test.done();
		});
	},

	defaultStats: function( test ) {
		test.expect( 2 );
		gf = new constructor( "no-stats-bear.svg" );

		imageSetup( gf );

		gf.stats({
			inputDir: "test/files",
			defaultWidth: "10px",
			defaultHeight: "10px"
		}).then(function( data ) {
			test.equal( parseInt(data.width.replace(/px/, ''), 10), 10 );
			test.equal( parseInt(data.height.replace(/px/, ''), 10), 10 );
			test.done();
		}, function() {
			test.done();
		});
	}
};

exports['getCSSRules'] = {
	setUp: function( done ) {
		gf = new constructor( "bear.svg" );
		done();
	},

	output: function( test ) {
		imageSetup(gf);

		gf.stats({
			inputDir: "test/files"
		}).then(function( stats ) {
			var res = gf.getCSSRules( stats, "test/files", "foo-", {});

			// remove the trailing css from the encoding, the preceding css
			// is removed in testEncode
			testEncoded(test, res.pngdatacssrule.split("')")[0]);

			test.ok( res.pngdatacssrule.indexOf("foo-bear") > 0 );
			test.ok( res.datacssrule.indexOf("foo-bear") > 0 );
			test.done();
		}, function() {
			test.done();
		});
	}
};

exports['writeCSS'] = {
	setUp: function( done ) {
		gf = new constructor( "bear.svg" );
		done();
	},

	output: function( test ) {
		imageSetup(gf);

		gf.stats({
			inputDir: "test/files"
		}).then(function( stats ) {
			var images = [gf.getCSSRules( stats, "test/files", "foo-", {})];

			constructor.writeCSS( images, {
				outputdir: "test/output",
				cssbasepath: "",
				previewHTMLFilePath: "test/files/foo.html",
				previewFilePath: "foo.html",
				fallbackcss: "foo.css",
				pngdatacss: "foo-pngdata.css",
				datacss: "foo-data.css",
				asyncCSSpath: "test/files/async.css"
			});

			test.ok( fs.existsSync("test/output/foo-data.css") );
			test.ok( fs.existsSync("test/output/foo-pngdata.css") );
			test.ok( fs.existsSync("test/output/foo.css") );
			test.ok( fs.existsSync("test/output/foo.html") );

			test.done();
		}, function() {
			test.done();
		});
	}
};
