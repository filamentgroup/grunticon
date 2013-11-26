/*global module:true*/
/*global __dirname:true*/
/*global require:true*/
(function( exports ){
	"use strict";

	var path = require( 'path' );
	var fs = require( 'fs' );

	var Colorfy = require( path.join( __dirname, 'colorfy' ) );

	var DirectoryColorfy = function( input, output, opts ){
		if( typeof input !== "string" ){
			throw new Error( "Input required, must be string" );
		}
		if( !fs.lstatSync( input ).isDirectory() ){
			throw new Error( "Input is not a directory" );
		}
		this.input = input;
		this.output = output;
		this.options = opts || {};
		this.colors = this.options.colors || {};
	};

	DirectoryColorfy.prototype.convert = function(){
		var self = this;
		var files = fs.readdirSync( self.input );
		files = files.filter(function( file ){
			if( path.extname( file ) === ".svg" ){
				return file;
			}
		});
		files.forEach(function(file){
			var c = new Colorfy( path.join( self.input, file ), self.colors );
			c.convert();
			c.writeFiles( self.output );
		});
	};


	module.exports = DirectoryColorfy;

}(typeof exports === 'object' && exports || this));

