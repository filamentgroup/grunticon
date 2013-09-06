/*global require:true*/
/*global console:true*/
(function(exports) {
	"use strict";

	var child_process = require( "child_process" );

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

	exports.listFiles = function( absInput ){
		var filelist, relFiles, filequery, arr;
		filelist = list( absInput );

		relFiles = filelist.filter( function( file ){
			return file !== "." && file !== "..";
		});

		filequery = relFiles.map( function( file ){
			return path.join( absInput , file );
		});

		return filequery;
	};


	exports.crush = function( options , callback ){
		var isVerbose = options.verboseMode || false;
		var verboseLog = function(what){
			if( isVerbose ){
				// Note the escape characters.
				console.log("[32m[pngcrush][39m "+what);
			}
		}

		verboseLog('WELCOME 2 THE CRUSHER');

		var input = options.inputDir,
			absInput = absolute( input ),
			output = options.outputDir,
			outputFile = options.outputFilename,
			pngCrushPath = options.crushPath,
			filequery,
			childProcessOptions = {
				maxBuffer: options.maxBuffer * 1024
			};

		if( typeof output !== "undefined" && output !== null ){
			verboseLog('Make output dir: '+output);
			this.makeOutputDir( output, isDirectory( absInput ) );
		}

		if( isDirectory( absInput ) ){
			verboseLog('Crushing from ' + absInput+' to '+output);

			filequery = ["-d", output]
			filequery.concat( this.listFiles( absInput ) );

			verboseLog("pngcrush " + filequery.join(' ')+"\n");

			child_process.execFile( pngCrushPath, filequery, childProcessOptions, function( err , stdout, stderr ){

				console.log('FUCK');

				if( err ){
					console.log('err: '+err);
				}

				if( stderr ){
					console.log('stderr: '+stderr);
				}

				if( stdout ) {
					console.log('stdout: '+stdout);
				}

				callback( stdout , stderr );

			});

		} else {
			verboseLog('PNGCRUSH GOT A FILE');
			verboseLog(input+' => '+output+outputFile);

			child_process.execFile( pngCrushPath, [ input , output + outputFile ] , childProcessOptions , function( err , stdout, stderr ){

				if( err ){
					console.log( err );
				}
				callback( stdout, stderr );

			});

		}

	};

}(typeof exports === 'object' && exports || this));
