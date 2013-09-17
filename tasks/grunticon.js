/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global __dirname:true*/
/*global require:true*/

module.exports = function( grunt , undefined ) {
	"use strict";

	// grunt.config.requires('options.src','options.dest');

	var isVerbose = grunt.option('verbose');

	var uglify = require('uglify-js');
	var fs = require('fs');
	var path = require('path');
	var RSVP = require(path.join('..', 'lib', 'rsvp'));

	var readDir = function( path ){
		var promise = new RSVP.Promise();
		fs.readdir(path , function(err, files){
			if(err){
				grunt.log.error(err);
				promise.reject(err);
			} else {
				promise.resolve(files);
			}
		});
		return promise;
	};

	var readFile = function( filepath ){
		var promise = new RSVP.Promise();
		fs.readFile(filepath, function(err, data){
			if(err){
				grunt.log.error(err);
				promise.reject(err);
			} else {
				promise.resolve(data);
			}
		});
		return promise;
	};

	var writeFile = function( filepath , result ){
		var promise = new RSVP.Promise();
		fs.writeFile(filepath, result, function(err){
			if(err){
				grunt.log.error(err);
				promise.reject(err);
			} else {
				promise.resolve();
			}
		});
		return promise;
	};

	grunt.registerMultiTask('grunticon', 'A mystical CSS icon solution.', function(){
		grunt.log.subhead('Look, it’s a grunticon!');
		var config = this.options();

		config.files = {
			loader:  path.join(__dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			banner:  path.join(__dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
			preview: path.join(__dirname, 'grunticon', 'static', 'preview.html'),
			phantom: path.join(__dirname, 'grunticon', 'phantom.js'),
			mascot:  path.join(__dirname, 'grunticon', 'static', 'excessive.txt')
		};

		// Load ’er up
		var asyncCSS = config.files.loader;
		var asyncCSSBanner = config.files.banner;
		var previewHTMLsrc = config.files.preview;

		var svgDataCSS = config.svgDataCSS || "icons.data.svg.css";
		var pngDataCSS = config.pngDataCSS || "icons.data.png.css";
		var pngFileCSS = config.urlpngcss || "icons.fallback.css";

		var previewHTML = config.previewhtml || "preview.html";
		var loaderSnippet = config.loadersnippet || "grunticon.loader.html";
		var cssBasePath = config.cssbasepath || path.sep;
		var customSelectors = JSON.stringify( config.customselectors ) || "{}";

		var pngDestDirName = config.pngfolder || "png";
		var pngSrcDirName = pngDestDirName;
		var cssClassPrefix = config.cssprefix || "icon-";

		var pngcrushPath;

		var width = config.defaultWidth || 400;
		var height = config.defaultHeight || 300;

		var done = this.async();

		/*
		PNG/SVG files will be read from here.
		SVGs are embedded in CSS, processsed to PNGs with phantomjs,
		and then deleted. PNGs are dropped in pngSrcDir for more lovin’.
		*/
		var srcDir = config.src;

		/*
		This is where everything else lives. pngDestDir is a subfolder.
		*/
		var destDir = config.dest;

		/*
		PNG files here will be either crushed by pngcrush to pngDestDir
		or copied directly to pngDestDir if the user disables pngcrush.
		*/
		var pngSrcDir = path.join(destDir, 'grunticon-tmp');

		/*
		PNG files here will be embedded in the PNG data CSS file
		and linked in the PNG reference CSS file.
		*/
		var pngDestDir = path.join(destDir, pngDestDirName);

		// Reset generated directories
		var resetDirs = {
			'grunticon destination': destDir,
			'PNG source': pngSrcDir,
			'PNG destination': pngDestDir
		}

		for(var key in resetDirs){
			grunt.log.ok('Resetting '+key+' ('+resetDirs[key]+')');

			if( grunt.file.exists( resetDirs[key] ) ){
				grunt.file.delete( resetDirs[key] );
				grunt.log.ok('.\b - Deleting '+key+' directory');
			} else {
				grunt.log.ok('.\b - '+key+' directory doesn’t exist and will be created');
			}

			grunt.log.ok('.\b - Creating '+key+' directory');
			grunt.file.mkdir(resetDirs[key]);
		}

		grunt.log.writeln('');

		/*
		Files to process.
		TODO: Change to native grunt file object.
		*/
		var svgFiles = [];
		var pngFiles = [];
		var allFiles = [];

		// Filter out non SVG/PNG files
		var files = fs.readdirSync(srcDir).filter(
			function(file){
				var ext = path.extname(file);
				var basename = path.basename(file, ext);

				if (ext === '.svg') {
					svgFiles.push(basename);
				} else if(ext === '.png'){
					pngFiles.push(basename);
				} else {
					grunt.log.debug('Skipped ' + path.join(srcDir, file));
					return;
				}
				allFiles.push(basename);
				return file;
			}
		);

		if( files.length === 0 ){
			grunt.fatal(srcDir + " contains no SVG/PNG files. Grunticon out.");
			done(false);
		}

		var crushingIt = false;

		// Set pngcrushPath
		if(config.pngcrush) {
			pngcrushPath = config.pngcrush;
			crushingIt = true;
		}

		// Nice li’l message
		grunt.log.subhead(
			svgFiles.length+" SVG file"+( svgFiles.length == 1 ? '' : 's' )+
			" and "+
			pngFiles.length+" PNG file"+( pngFiles.length == 1 ? '' : 's' )+
			" in "+srcDir
		);

		var phantomJsPath = config.phantomjs;
		var temp = true;
		var writeCSS = true;

		grunt.log.ok('Setting a phantomjs upon "'+srcDir+'" forthwith');
		grunt.log.ok('Converting '+svgFiles.length+' SVG'+( svgFiles.length == 1 ? '' : 's' )+' to PNG format with phantomjs ('+phantomJsPath+')');
		grunt.log.writeln( '\n'+Array(78).join("=")+'\n' );

		var phantomJsArgs = [
			config.files.phantom,
			path.join(srcDir, path.sep),
			path.join(pngSrcDir, path.sep),
			isVerbose
		]

		if( isVerbose ){
			phantomJsArgs.unshift('--debug=true');
		}

		/*
		* STEP 1: Crunch SVGs to PNGs
		*/

		var phantomjs = grunt.util.spawn({
			cmd: phantomJsPath,
			args: phantomJsArgs,
			fallback: ''
		},
		function(err, result, code){
			if(err){
				grunt.log.ok('PHANTOMJS ERROR ENCOUNTERED');
			} else {
				grunt.log.writeln( '\n'+Array(78).join("=")+'\n' );

				/*
				* STEP 2: Copy PNGs to from srcDir to pngSrcDir
				*/

				if( pngFiles.length > 0 ){
					grunt.log.subhead('Copying PNG files from '+srcDir+' to '+pngSrcDir);
					pngFiles.forEach(function(b){
						grunt.log.ok(b+'.png');
						grunt.file.copy(
							path.join(srcDir, b+'.png'),
							path.join(pngSrcDir, b+'.png')
						);
					})
				} else {
					grunt.log.ok('No PNG files found in '+srcDir);
				}

				grunt.log.writeln('');

				/*
				* STEP 3: Compress/copy PNGs from pngSrcDir to pngDestDir
				*/

				readDir(pngSrcDir)
				.then(function(files, err){
					var dataArray = [];

					grunt.log.subhead('Processing PNGs in '+pngSrcDir);

					if( err ){
						grunt.log.ok('readDir error: '+err);
					} else {
						grunt.log.ok('Looks like '+files.length+'-ish files you’ve got here.');

						files.forEach(function(pngFileName, idx){
							// Crush or copy
							if(path.extname(pngFileName) !== '.png'){
								grunt.log.ok('['+(idx+1)+'/'+files.length+'] Ignoring '+pngFileName);
							} else {

								if(crushingIt){
									grunt.log.ok('['+(idx+1)+'/'+files.length+'] Crushing '+pngFileName);

									var pngcrushArgs = [
										path.join(pngSrcDir, pngFileName),
										path.join(pngDestDir, pngFileName)
									];

									// Spawn pngcrush
									var pngcrush = grunt.util.spawn({
										cmd: pngcrushPath,
										args: pngcrushArgs,
										fallback: '',
										opts: {
											maxBuffer: 250 * 1024
										}
									},
									function(err, result, code){
										if(!err){
											grunt.log.writeln( '\n'+Array(78).join("=")+'\n' );
											processPNGCallback(pngFileName);
										}
									});

									pngcrush.stdout.pipe(process.stdout);
									pngcrush.stderr.pipe(process.stderr);

								} else {
									grunt.log.ok('['+(idx+1)+'/'+files.length+'] Copying '+pngFileName);
									grunt.file.copy(
										path.join(pngSrcDir, pngFileName),
										path.join(pngDestDir, pngFileName)
									);
									processPNGCallback(pngFileName);
								}
							}

						});
					}
				})
				.then(function(){
					grunt.log.writeln('');
					grunt.log.subhead('Building CSS');

					var buildCSSRule = function(s,i){
						return '.'+s+'{\n\tbackground-image: url('+i+');'+'\n}\n';
					}

					var pngFileRules = [];
					var pngDataRules = [];
					var svgDataRules = [];
					var htmlPreviewBody = [];

					var svgHeader = "data:image/svg+xml;charset=US-ASCII,";
					var pngHeader = "data:image/png;base64,";

					// Load data arrays for writing
					allFiles.forEach(function(f){
						var pngFileURL, pngData, pngDataURI, svgData, svgDataURI;
						//
						pngFileURL = path.join(pngDestDirName, f+'.png');
						pngData = new Buffer(fs.readFileSync(path.join(pngDestDir, f+'.png'))).toString('base64');

						// IE8
						if(pngData.length >= 32768){
							pngDataURI = pngFileURL;
						} else {
							pngDataURI = pngHeader+pngData;
						}

						//
						if( ~svgFiles.indexOf(f) ){
							svgData = fs.readFileSync(path.join(srcDir, f+'.svg')).toString()
								.replace(/[\n\r]/gmi, "")
								.replace(/[\t\s]+/gmi, " ")
								.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
								.replace(/'/gmi, "\\i");

							// svgData = encodeURIComponent(svgData);

							svgDataURI = svgHeader+svgData;
						} else {
							svgDataURI = pngDataURI;
						}

						var sel = cssClassPrefix+f;

						sel = sel.replace(/[^\w]+/gmi, '-');

						// // CSS Files
						pngFileRules.push(buildCSSRule(sel, pngFileURL));
						pngDataRules.push(buildCSSRule(sel, pngDataURI));
						svgDataRules.push(buildCSSRule(sel, svgDataURI));

					});

					// Output formatting
					var pretty = true;
					var tab = "";
					var newline = "";

					if (pretty){
						tab = "\t";
						newline = "\n";
					}

					var loader = grunt.file.read(asyncCSSBanner) + "\n" + uglify.minify(asyncCSS).code;
					var cssFilePrefix = '{{ STATIC_URL }}/';

					var filesnippet = [
						'<script>',
						loader,
						'grunticon([',
						tab + '"' + cssFilePrefix + svgDataCSS +'",',
						tab + '"' + cssFilePrefix + pngDataCSS +'",',
						tab + '"' + cssFilePrefix + pngFileCSS +'"',
						']);',
						"</script>\n",
						'<noscript>',
						tab + '<link href="' + cssFilePrefix + pngFileCSS + '" rel="stylesheet">',
						'</noscript>'
					].join(newline);

					console.log('filesnippet:\n\n'+filesnippet);

					grunt.log.ok('Writing preview CSS files');
					grunt.file.write(path.join(destDir, pngFileCSS), pngFileRules.join("\n"));
					grunt.file.write(path.join(destDir, pngDataCSS), pngDataRules.join("\n"));
					grunt.file.write(path.join(destDir, svgDataCSS), svgDataRules.join("\n"));

					grunt.log.ok('Updating snippet HTML file (' + loaderSnippet + ')');
					grunt.file.write(path.join(destDir, loaderSnippet), filesnippet);
				})
				.then(function(){
					grunt.log.writeln('');
					// Brought to you by unicornsay.
					// TODO: Does it work on Windows?
					// dot + backspace hack is so grunt.log.ok respects dat whitespace
					grunt.log.ok(".\b"+grunt.file.read(config.files.mascot));
					done();
				});

			}
		});

		// Print everything to the screen
		phantomjs.stdout.pipe(process.stdout);
		phantomjs.stderr.pipe(process.stderr);

		var processPNGCallback = function(f){
			// grunt.log.ok('Processed: '+f);
		}

	});
};