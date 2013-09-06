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
		console.log( "MAKE THIS: "+outputDir );

		// var output = absolute( outputDir );
		// // If it does not exist, make it!
		// if( !exists( output ) ){
		// 	makeDir( output );
		// 	//if it exists and the input is a dir, remove it and make it
		// } else if( inputIsDir ){
		// 	removeTree( output , function(){
		// 		makeDir( output );
		// 	});
		// }
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

		var input = options.inputDir,
			output = options.outputDir,

			inputFilePath = options.inputFilePath,
			outputFilePath = absolute( options.outputFilePath ),

			pngFileName = options.pngFileName,

			pngCrushPath = options.crushPath,
			filequery,

			childProcessOptions = {
				maxBuffer: options.maxBuffer * 1024
			};

		filequery = [ inputFilePath , outputFilePath ];

		verboseLog('Running pngcrush with options: '+filequery.join(' '));

		// Spawn pngcrush process
		var pngCrushProcess = child_process.spawn(pngCrushPath, filequery, childProcessOptions);

		// pngCrushProcess.stdout.on('data',function(out){ verboseLog(out); });
		// pngCrushProcess.stderr.on('data',function(err){ verboseLog(err); });

		// Fire callback on close
		pngCrushProcess.on('exit',function(code){
			console.log(pngCrushPath+' exited with code '+code+' -- '+pngFileName);
			callback(pngFileName, output);
		});

	};

}(typeof exports === 'object' && exports || this));
