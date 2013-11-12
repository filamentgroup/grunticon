/*global console:true*/
/*global __dirname:true*/
/*global require:true*/
(function( exports ){

	"use strict";

	var path = require( 'path' );
	var fs = require( 'fs-extra' );

	var RSVP = require( path.join( __dirname, 'rsvp' ) );
	var GruntiFile = require( path.join( __dirname, 'grunticon-file') ).grunticonFile;

	var readDir = function( path ){
		var promise = new RSVP.Promise();
		fs.readdir( path , function( err , files ){
			if( err ){
				console.error( err );
				promise.reject( err );
			} else {
				promise.resolve( files );
			}
		});
		return promise;
	};

		var createCSS = function( tmp, o ){

			var promise = new RSVP.Promise();

			console.log( "Writing CSS" );
			readDir( tmp )
			.then( function( files , err ){
				var dataarr = [];
				files = files.filter( function( file ){
					var stats = fs.lstatSync( path.resolve( path.join( tmp , file ) ) );
					if( !stats.isDirectory() &&
						( path.extname( file ) === ".svg" || path.extname( file ) === ".png" ) ){
						return file;
					}
				});
				var newFiles = GruntiFile.colorConfig( files , {
					inputDir: path.resolve( tmp ),
					colors: JSON.parse( o.colors )
				});
				files.push.apply( files , newFiles );
				files.forEach( function( file, idx ){
					var gFile = new GruntiFile( file );
					var imgLoc = gFile.isSvg ? tmp : path.resolve( path.join( tmp , o.pngfolder ) );
					gFile.setImageData( imgLoc );
					gFile.setPngLocation({
						relative: o.pngfolder,
						absolute: path.resolve( path.join( o.outputdir, o.pngfolder ) )
					});
					gFile.stats({
						inputDir: imgLoc,
						defaultWidth: o.defaultWidth,
						defaultHeight: o.defaultHeight
					})
					.then( function( stats , err ){
						if( err ){
							promise.reject( err );
						}
						var res = gFile.getCSSRules( stats, o.pngfolder, o.cssprefix, o.config );
						dataarr.push( res );
						if( idx +1 === files.length ){
							GruntiFile.writeCSS( dataarr, o );
							try {
								if( fs.existsSync( tmp ) ){
									fs.removeSync( tmp );
								}
							} catch (e){
								console.error( e );
								promise.reject(e);
							}
							promise.resolve();
						}
					})
					.then( function( _, err ){
						promise.reject( err );
					});
				});
			});

			return promise;
		};


		exports.create = createCSS;
}(typeof exports === 'object' && exports || this));
