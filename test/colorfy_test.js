/*global require:true*/
(function( exports ){

	"use strict";

	var fs = require( 'fs' );
	var path = require( 'path' );
	var Colorfy = require( path.join('..', 'lib', 'colorfy'));
	var bearSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="62.905px">\n<path d="M11.068,34.558c-1.585-2.365-2.595-5.098-2.939-8.106c-0.344,0.092-0.666,0.161-1.033,0.161\n\tc-2.342,0-4.248-1.906-4.248-4.248c0-1.47,0.758-2.756,1.883-3.514l12.147-8.45c2.549-1.562,5.534-2.526,8.749-2.641l30.149,0.092\n\tL77.819,4.34c0-0.115,0-0.229,0-0.345C77.819,1.791,79.586,0,81.791,0c2.205,0,3.996,1.791,3.996,3.995\n\tc0,0.345-0.046,0.712-0.138,1.034l2.043,0.275c2.365,0.459,4.156,2.549,4.156,5.052c0,0.161,0,0.298-0.022,0.436l6.544,3.536\n\tc0.941,0.368,1.63,1.309,1.63,2.388c0,0.367-0.068,0.689-0.206,1.01l-1.631,3.697c-0.804,1.309-2.181,2.228-3.788,2.411\n\tl-15.041,1.791L65.787,41.527l7.738,13.363l5.098,2.365c0.803,0.552,1.354,1.493,1.354,2.549c0,1.699-1.378,3.078-3.101,3.078\n\tl-9.805,0.022c-2.525,0-4.707-1.424-5.809-3.49l-8.382-15.155l-18.92,0.023l6.682,10.287l4.937,2.25\n\tc0.919,0.551,1.516,1.538,1.516,2.664c0,1.699-1.378,3.076-3.077,3.076l-9.828,0.023c-2.388,0-4.5-1.286-5.649-3.215l-9.208-14.627\n\tl-6.429,6.246l-0.528,4.087l2.158,1.423c0.368,0.184,0.689,0.438,0.965,0.758c1.056,1.332,0.872,3.284-0.459,4.34\n\tc-0.574,0.482-1.286,0.713-1.975,0.689l-4.317,0.023c-1.194-0.139-2.273-0.758-2.962-1.677l-5.029-8.68C0.275,51.033,0,50,0,48.898\n\tc0-1.676,0.62-3.215,1.676-4.387L11.068,34.558z"/>\n</svg>\n';
	var bearBlueSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="62.905px"><style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: blue !important; }</style>\n<path d="M11.068,34.558c-1.585-2.365-2.595-5.098-2.939-8.106c-0.344,0.092-0.666,0.161-1.033,0.161\n\tc-2.342,0-4.248-1.906-4.248-4.248c0-1.47,0.758-2.756,1.883-3.514l12.147-8.45c2.549-1.562,5.534-2.526,8.749-2.641l30.149,0.092\n\tL77.819,4.34c0-0.115,0-0.229,0-0.345C77.819,1.791,79.586,0,81.791,0c2.205,0,3.996,1.791,3.996,3.995\n\tc0,0.345-0.046,0.712-0.138,1.034l2.043,0.275c2.365,0.459,4.156,2.549,4.156,5.052c0,0.161,0,0.298-0.022,0.436l6.544,3.536\n\tc0.941,0.368,1.63,1.309,1.63,2.388c0,0.367-0.068,0.689-0.206,1.01l-1.631,3.697c-0.804,1.309-2.181,2.228-3.788,2.411\n\tl-15.041,1.791L65.787,41.527l7.738,13.363l5.098,2.365c0.803,0.552,1.354,1.493,1.354,2.549c0,1.699-1.378,3.078-3.101,3.078\n\tl-9.805,0.022c-2.525,0-4.707-1.424-5.809-3.49l-8.382-15.155l-18.92,0.023l6.682,10.287l4.937,2.25\n\tc0.919,0.551,1.516,1.538,1.516,2.664c0,1.699-1.378,3.076-3.077,3.076l-9.828,0.023c-2.388,0-4.5-1.286-5.649-3.215l-9.208-14.627\n\tl-6.429,6.246l-0.528,4.087l2.158,1.423c0.368,0.184,0.689,0.438,0.965,0.758c1.056,1.332,0.872,3.284-0.459,4.34\n\tc-0.574,0.482-1.286,0.713-1.975,0.689l-4.317,0.023c-1.194-0.139-2.273-0.758-2.962-1.677l-5.029-8.68C0.275,51.033,0,50,0,48.898\n\tc0-1.676,0.62-3.215,1.676-4.387L11.068,34.558z"/>\n</svg>\n';
	var bearRedSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="62.905px"><style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: red !important; }</style>\n<path d="M11.068,34.558c-1.585-2.365-2.595-5.098-2.939-8.106c-0.344,0.092-0.666,0.161-1.033,0.161\n\tc-2.342,0-4.248-1.906-4.248-4.248c0-1.47,0.758-2.756,1.883-3.514l12.147-8.45c2.549-1.562,5.534-2.526,8.749-2.641l30.149,0.092\n\tL77.819,4.34c0-0.115,0-0.229,0-0.345C77.819,1.791,79.586,0,81.791,0c2.205,0,3.996,1.791,3.996,3.995\n\tc0,0.345-0.046,0.712-0.138,1.034l2.043,0.275c2.365,0.459,4.156,2.549,4.156,5.052c0,0.161,0,0.298-0.022,0.436l6.544,3.536\n\tc0.941,0.368,1.63,1.309,1.63,2.388c0,0.367-0.068,0.689-0.206,1.01l-1.631,3.697c-0.804,1.309-2.181,2.228-3.788,2.411\n\tl-15.041,1.791L65.787,41.527l7.738,13.363l5.098,2.365c0.803,0.552,1.354,1.493,1.354,2.549c0,1.699-1.378,3.078-3.101,3.078\n\tl-9.805,0.022c-2.525,0-4.707-1.424-5.809-3.49l-8.382-15.155l-18.92,0.023l6.682,10.287l4.937,2.25\n\tc0.919,0.551,1.516,1.538,1.516,2.664c0,1.699-1.378,3.076-3.077,3.076l-9.828,0.023c-2.388,0-4.5-1.286-5.649-3.215l-9.208-14.627\n\tl-6.429,6.246l-0.528,4.087l2.158,1.423c0.368,0.184,0.689,0.438,0.965,0.758c1.056,1.332,0.872,3.284-0.459,4.34\n\tc-0.574,0.482-1.286,0.713-1.975,0.689l-4.317,0.023c-1.194-0.139-2.273-0.758-2.962-1.677l-5.029-8.68C0.275,51.033,0,50,0,48.898\n\tc0-1.676,0.62-3.215,1.676-4.387L11.068,34.558z"/>\n</svg>\n';
	var bearPrimaryFFA500 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="62.905px"><style type="text/css">circle, ellipse, line, path, polygon, polyline, rect, text { fill: #ffa500 !important; }</style>\n<path d="M11.068,34.558c-1.585-2.365-2.595-5.098-2.939-8.106c-0.344,0.092-0.666,0.161-1.033,0.161\n\tc-2.342,0-4.248-1.906-4.248-4.248c0-1.47,0.758-2.756,1.883-3.514l12.147-8.45c2.549-1.562,5.534-2.526,8.749-2.641l30.149,0.092\n\tL77.819,4.34c0-0.115,0-0.229,0-0.345C77.819,1.791,79.586,0,81.791,0c2.205,0,3.996,1.791,3.996,3.995\n\tc0,0.345-0.046,0.712-0.138,1.034l2.043,0.275c2.365,0.459,4.156,2.549,4.156,5.052c0,0.161,0,0.298-0.022,0.436l6.544,3.536\n\tc0.941,0.368,1.63,1.309,1.63,2.388c0,0.367-0.068,0.689-0.206,1.01l-1.631,3.697c-0.804,1.309-2.181,2.228-3.788,2.411\n\tl-15.041,1.791L65.787,41.527l7.738,13.363l5.098,2.365c0.803,0.552,1.354,1.493,1.354,2.549c0,1.699-1.378,3.078-3.101,3.078\n\tl-9.805,0.022c-2.525,0-4.707-1.424-5.809-3.49l-8.382-15.155l-18.92,0.023l6.682,10.287l4.937,2.25\n\tc0.919,0.551,1.516,1.538,1.516,2.664c0,1.699-1.378,3.076-3.077,3.076l-9.828,0.023c-2.388,0-4.5-1.286-5.649-3.215l-9.208-14.627\n\tl-6.429,6.246l-0.528,4.087l2.158,1.423c0.368,0.184,0.689,0.438,0.965,0.758c1.056,1.332,0.872,3.284-0.459,4.34\n\tc-0.574,0.482-1.286,0.713-1.975,0.689l-4.317,0.023c-1.194-0.139-2.273-0.758-2.962-1.677l-5.029-8.68C0.275,51.033,0,50,0,48.898\n\tc0-1.676,0.62-3.215,1.676-4.387L11.068,34.558z"/>\n</svg>\n';

	var arrayEqual = function( arr1, arr2 ){
		if(!( Array.isArray( arr1 ) && Array.isArray( arr2 ) )){
			return false;
		}

		if( arr1.length !== arr2.length ){
			return false;
		}

		for( var i = 0, l = arr1.length; i < l; i++ ){
			if( arr1[i] instanceof Array && arr2[i] instanceof Array ){
				if( !arrayEqual( arr1[i], arr2[i] ) ){
					return false;
				}
			} else if( arr1[i] !== arr2[i] ){
				return false;
			}
		}

		return true;
	};

	exports.constructor = {
		setUp: function( done ) {
			this.c = new Colorfy( "test/files/bear.svg" );
			this.c2 = new Colorfy( "test/files/bear.colors-blue-red.svg" );
			this.c3 = new Colorfy( "test/files/bear.svg", {"orange": "orange", "green": "green" } );
			done();
		},

		file: function( test ) {
			test.equal( this.c.filepath, "test/files/bear.svg" );
			test.equal( this.c2.filepath, "test/files/bear.colors-blue-red.svg");
			test.done();
		},

		filename: function( test ) {
			test.equal( this.c.originalFilename, "bear.svg" );
			test.equal( this.c2.originalFilename, "bear.svg" );
			test.done();
		},

		originalContents: function( test ) {
			test.equal( this.c.originalContents, bearSVG );
			test.done();
		},

		originalFilepathNoColor: function( test ) {
			test.equal( this.c.originalFilepath, "test/files/bear.svg" );
			test.done();
		},

		originalFilepath: function( test ) {
			test.equal( this.c.originalFilepath, "test/files/bear.svg" );
			test.done();
		},

		originalFilename: function( test ) {
			test.equal( this.c.originalFilename, "bear.svg" );
			test.done();
		},

		originalFilenameNoExt: function( test ) {
			test.equal( this.c.ofnNoExt, "bear" );
			test.done();
		},

		colorsNone: function( test ) {
			test.ok( arrayEqual( this.c.colornames, [] ) );
			test.done();
		},
		colors: function( test ) {
			test.ok( arrayEqual( this.c2.colornames, ['blue', 'red'] ) );
			test.done();
		},
		colorsAsArg: function( test ){
			test.ok( arrayEqual( this.c3.colornames, ['orange', 'green'] ) );
			test.done();
		}
	};

	exports.convert = {
		setUp: function( done ) {
			this.c = new Colorfy( "test/files/bear.svg" );
			this.c2 = new Colorfy( "test/files/bear.colors-blue-red.svg" );
			this.c3 = new Colorfy( "test/files/bear.svg", { "orange": "#ffa500", "green": "#00ff00"} );
			this.c4 = new Colorfy( "test/files/bear.colors-primary-blue-red.svg", { "primary": "#ffa500" } );
			this.c5 = new Colorfy( "test/files/bear.colors-secondary.svg", { "primary": "#ffa500" } );
			done();
		},
		colorFilesNoColor: function( test ){
			this.c.convert();
			test.equals( Object.keys( this.c.colorFiles ).length, 0 );
			test.done();
		},
		colorFiles: function( test ){
			this.c2.convert();
			test.equals( Object.keys( this.c2.colorFiles ).length, 2 );
			test.ok( arrayEqual( Object.keys( this.c2.colorFiles ), ['bear-blue.svg', 'bear-red.svg'] ));
			test.done();
		},
		colorFilesContents: function( test ){
			this.c2.convert();
			test.equals( this.c2.colorFiles['bear-blue.svg'], bearBlueSVG );
			test.equals( this.c2.colorFiles['bear-red.svg'], bearRedSVG );
			test.done();
		},
		colorFilesOpts: function( test ){
			this.c3.convert();
			test.equals( Object.keys( this.c3.colorFiles ).length, 2 );
			test.ok( arrayEqual( Object.keys( this.c3.colorFiles ), ['bear-orange.svg', 'bear-green.svg'] ));
			test.done();
		},
		colorFilesOptsDefinition: function( test ){
			this.c4.convert();
			test.equals( Object.keys( this.c4.colorFiles ).length, 3 );
			test.ok( arrayEqual( Object.keys( this.c4.colorFiles ), ['bear-blue.svg', 'bear-red.svg', 'bear-primary.svg'] ));
			test.equals( this.c4.colorFiles['bear-primary.svg'], bearPrimaryFFA500 );
			test.done();
		},
		colorFilesOptsDefinitionNoMatch: function( test ){
			this.c5.convert();
			test.equals( this.c5.colorFiles['bear-secondary.svg'], undefined );
			test.done();
		}
	};

	exports.writeFile = {
		setUp: function( done ) {
			this.c = new Colorfy( "test/files/bear.svg" );
			this.c2 = new Colorfy( "test/files/bear.colors-blue-red.svg" );
			done();
		},
		tearDown: function( done ){
			["bear", "bear-blue", "bear-red"].forEach( function( base ){
				if( fs.existsSync( "test/files/temp/" + base + ".svg" ) ){
					fs.unlinkSync( "test/files/temp/" + base + ".svg" );
				}
			});
			done();
		},
		writeFirstFile: function( test ) {
			this.c.convert();
			this.c.writeFiles( "test/files/temp" );
			test.ok( fs.existsSync( "test/files/temp/bear.svg" ) );
			test.done();
		},
		writeColorFiles: function( test ) {
			this.c2.convert();
			this.c2.writeFiles( "test/files/temp" );
			test.ok( fs.existsSync( "test/files/temp/bear.svg" ) );
			test.ok( fs.existsSync( "test/files/temp/bear-blue.svg" ) );
			test.ok( fs.existsSync( "test/files/temp/bear-red.svg" ) );
			test.done();
		}
	};


}(typeof exports === 'object' && exports || this));

