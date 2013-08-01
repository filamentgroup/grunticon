/*global require:true*/
/*global console:true*/
(function(exports) {
	"use strict";

	var execFile = require( "child_process" ).execFile;

	var fs = require( 'fs' ), path;

	var absolute, exists, makeDir, removeTree, list, isDirectory;
	if( !fs.absolute ){ //node
		fs = require( "fs-extra" );
		path = require( "path" );
		absolute = path.resolve;
		exists = fs.existsSync;
		makeDir = fs.mkdirpSync;
		removeTree = function( path , callback ){
			fs.remove( path , callback );
		};
		list = fs.readdirSync;
		isDirectory = function( path ){
			var stats = fs.statSync( path );
			return stats.isDirectory();
		};
	} else {//phantom
		absolute = fs.absolute;
		exists = fs.exists;
		makeDir = fs.makeDirectory;
		removeTree = function( path, callback ){
			fs.removeTree( path );
			callback();
		};
		list = fs.list;
		isDirectory = fs.isDirectory;
	}

	exports.makeOutputDir = function( outputDir , inputIsDir ){
		var output = absolute( outputDir );
		// If it does not exist, make it!
		if( !exists( output ) ){
			makeDir( output );
			//if it exists and the input is a dir, remove it and make it
		} else if( inputIsDir ){
			removeTree( output , function(){
				makeDir( output );
			});
		}
	};

	exports.buildQuery = function( absInput , output ){
		var filelist, relFiles, filequery, arr;
		filelist = list( absInput );
		relFiles = filelist.filter( function( file ){
			return file !== "." && file !== "..";
		});
		filequery = relFiles.map( function( file ){
			return path.join( absInput , file );
		});
		arr = [ "-d", output ];
		arr.push.apply( arr , filequery );
		return arr;
	};


	exports.crush = function( options , callback ){
		var input = options.input,
			absInput = absolute( input ),
			output = options.outputDir,
			outputFile = options.outputFilename,
			pngCrushPath = options.crushPath,
			filequery;

		if( typeof output !== "undefined" && output !== null ){
			this.makeOutputDir( output, isDirectory( absInput ) );
		}
		if( isDirectory( absInput ) ){
			filequery = this.buildQuery( absInput , output );
			execFile( pngCrushPath , filequery , null, function( err , stdout, stderr ){
				if( err ){
					console.log( err );
				}
				callback( stdout , stderr );
			});
		} else {
			execFile( pngCrushPath, [ input , output + outputFile ] , null , function( err , stdout, stderr ){
				if( err ){
					console.log( err );
				}
				callback();
			});
		}
	};

}(typeof exports === 'object' && exports || this));
