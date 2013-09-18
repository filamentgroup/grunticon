/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */

/*global __dirname:true*/
/*global require:true*/

module.exports = function(grunt, undefined) {
	"use strict";

	var isVerbose = false;

	if(grunt.option('verbose')){
		isVerbose = true;
	}

	var uglify = require('uglify-js');
	var fs = require('fs');
	var path = require('path');
	// TODO: Load official RSVP module?
	var RSVP = require(path.join('..', 'lib', 'rsvp'));

	grunt.registerMultiTask('grunticon', 'A mystical CSS icon solution.', function(){
		grunt.log.subhead('Look, it’s a grunticon!');
		var done = this.async();

		// Load config
		var options = this.options({
			svgDataCSS:      'icons.data.svg.css',
			pngDataCSS:      'icons.data.png.css',
			pngFileCSS:      'icons.fallback.css',
			previewHTML:     'preview.html',
			loaderSnippet:   'grunticon.loader.html',
			pngDestDir:      'png',
			pngTempDir:     'grunticon-temp',
			cssPrefix:       'icon-',
			customSelectors: {},
			cssBasePath:     '',
			defaultWidth:    400,
			defaultHeight:   300
		});

		// Grunticon templates and assorted what-not
		var grunticonFiles = {
			loader:  path.join(__dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			banner:  path.join(__dirname, 'grunticon', 'static', 'grunticon.loader.banner.js'),
			preview: path.join(__dirname, 'grunticon', 'static', 'preview.html'),
			phantom: path.join(__dirname, 'grunticon', 'phantom.js'),
			mascot:  path.join(__dirname, 'grunticon', 'static', 'excessive.txt')
		};

		var phantomJsPath = options.phantomjs;
		var phantomJsArgs;

		// pngcrush?
		var crushingIt = false;
		var pngcrushPath;

		if(options.pngcrush) {
			pngcrushPath = options.pngcrush;
			crushingIt = true;
		}

		var sep = function(msg){
			grunt.log.subhead(msg);
		}

		var svgFiles = {};
		var pngFiles = {};
		var allFiles = {};

		var svgCount = 0;
		var pngCount = 0;

		var pngTempDir = path.join(options.dest, options.pngTempDir);
		var pngDestDir = path.join(options.dest, options.pngDestDir);

		// Reset!
		if(grunt.file.exists(options.dest)){
			grunt.file.delete(options.dest);
		}
		grunt.file.mkdir(options.dest);
		grunt.file.mkdir(pngTempDir);
		grunt.file.mkdir(pngDestDir);

		// Filter out nonexistent files, build file objects
		this.files.forEach(function(file){
			file.src.filter(function(filename){

				if(!grunt.file.exists(filename)){
					grunt.verbose.warn('File '+filename+' does not exist');
					return false;
				}

				var f = {};
				f.ext = path.extname(filename);
				f.basename = path.basename(filename, f.ext);

				f.src = filename;
				f.temp = path.join(pngTempDir, f.basename + '.png');
				f.dest = path.join(pngDestDir, f.basename + '.png');

				if (f.ext === '.svg') {
					svgFiles[filename] = f;
					svgCount++;
				} else if(f.ext === '.png'){
					pngFiles[filename] = f;
					pngCount++;
				} else {
					grunt.log.debug('Skipped ' + filename);
					return false;
				}
				allFiles[filename] = f;

				return true;
			});
		});

		var preflight = function(){
			sep('Preflight checks');
			var p = new RSVP.Promise();
			if( svgCount + pngCount > 0 ){
				// Nice message about PNGs
				if(pngCount > 0){
					if(crushingIt){
						grunt.log.ok(pngCount+' PNG file'+(pngCount===1?'':'s')+' => pngcrush => "'+pngDestDir+'"');
					} else {
						grunt.log.ok(pngCount+' PNG file'+(pngCount===1?'':'s')+' => "'+pngDestDir+'"');
					}
				} else {
					grunt.log.warn('No PNG files were found.');
				}

				// Nice message about SVGs
				if(svgCount > 0){
					if(crushingIt){
						grunt.log.ok(svgCount+' SVG file'+(svgCount===1?'':'s')+' => phantomjs => "'+pngTempDir+'" => pngcrush => "'+pngDestDir+'"');
					} else {
						grunt.log.ok(svgCount+' SVG file'+(svgCount===1?'':'s')+' => phantomjs => "'+pngTempDir+'" => "'+pngDestDir+'"');
					}

				} else {
					grunt.log.warn('No SVG files were found.');
				}

				p.resolve();
			} else {
				grunt.log.error('No SVG or PNG files were found.');
				p.reject();
			}
			return p;
		}

		var processSVGs = function(){
			sep('Processing SVGs');
			var p = new RSVP.Promise();

			// Process SVGs
			if(svgCount === 0){
				p.resolve();
				grunt.verbose.or.ok('Done!');
			} else {
				phantomJsArgs = [
					grunticonFiles.phantom,
					'--debug='+isVerbose,
					JSON.stringify(svgFiles)
				]

				var phantomjs = grunt.util.spawn({
					cmd: phantomJsPath,
					args: phantomJsArgs,
					fallback: ''
				},
				function(err, result, code){
					if(err){
						p.reject();
					} else {
						p.resolve();
						grunt.verbose.or.ok('Done!');
					}
				});

				// Print everything to the screen
				phantomjs.stdout.pipe(process.stdout);
				phantomjs.stderr.pipe(process.stderr);
			}

			return p;
		}

		var processPNGs = function(){
			sep('Processing PNGs');
			var p = new RSVP.Promise();

			if(pngCount > 0){
				grunt.verbose.ok('Copying files to temp directory');

				// Copy non-rendered PNGs
				for(var b in pngFiles){
					var f = pngFiles[b];
					grunt.file.copy(
						path.join(f.src),
						path.join(f.temp)
					);
				}
			}

			var promises = [];

			// Compress all PNGs
			var files = fs.readdirSync(pngTempDir);

			if(crushingIt){
				grunt.verbose.ok('Crunching '+files.length+' PNG file'+(files.length===1?'':'s')+' from '+pngTempDir+' to '+pngDestDir);
			} else {
				grunt.verbose.ok('Copying '+files.length+' PNG file'+(files.length===1?'':'s')+' from '+pngTempDir+' to '+pngDestDir);
			}

			files.forEach(function(pngFileName, idx){
				var promise = new RSVP.Promise();

				if(path.extname(pngFileName) !== '.png'){
					grunt.log.ok('['+(idx+1)+'/'+files.length+'] Ignoring '+pngFileName);
					promise.resolve();
				} else {

					if(crushingIt){
						var pngcrushArgs = [
							path.join(pngTempDir, pngFileName),
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
								grunt.verbose.ok('Crushed '+pngFileName);
								promise.resolve();
							} else {
								promise.reject(err);
							}
						});

						// pngcrush.stdout.pipe(process.stdout);
						// pngcrush.stderr.pipe(process.stderr);

					} else {
						grunt.file.copy(
							path.join(pngTempDir, pngFileName),
							path.join(pngDestDir, pngFileName)
						);
						promise.resolve();
					}
				}
				promises.push(promise);
			});

			RSVP.all(promises).then(function(){
				p.resolve();
				grunt.verbose.or.ok('Done!');
			});

			return p;
		}

		var buildCSS = function(){
			sep('Building CSS files');
			var p = new RSVP.Promise();

			if(pngCount + svgCount === 0){
				p.reject();
			} else {
				var buildCSSRule = function(s,i){
					return '.'+s+'{\n\tbackground-image: url('+i+');'+'\n}\n';
				}

				var pngFileRules = [];
				var pngDataRules = [];
				var svgDataRules = [];
				var htmlPreviewBody = [];

				var svgHeader = "data:image/svg+xml;charset=US-ASCII,";
				var pngHeader = "data:image/png;base64,";

				var idx = 0;

				// Load data arrays for writing
				for(var b in allFiles){
					var pngFileURL, pngData, pngDataURI, svgData, svgDataURI;
					var f = allFiles[b];

					pngFileURL = path.join(options.pngDestDir, f.basename+'.png');
					pngData = new Buffer(fs.readFileSync(f.dest)).toString('base64');

					// IE8
					if(pngData.length >= 32768){
						pngDataURI = pngFileURL;
					} else {
						pngDataURI = pngHeader+pngData;
					}

					if(b in svgFiles){
						svgData = fs.readFileSync(f.src).toString()
							.replace(/[\n\r]/gmi, "")
							.replace(/[\t\s]+/gmi, " ")
							.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, "")
							.replace(/'/gmi, "\\i");

						// Is this necessary?
						svgData = encodeURIComponent(svgData);

						svgDataURI = svgHeader+svgData;
					} else {
						svgDataURI = pngDataURI;
					}

					var sel = options.cssPrefix + f.basename;
					sel = sel.replace(/[^\w]+/gmi, '-').toLowerCase();

					if( f.basename in options.customSelectors ){
						sel += ', '+options.customSelectors[f.basename];
					}

					grunt.verbose.ok((++idx)+'/'+(svgCount+pngCount)+' -- '+sel);

					// CSS Files
					pngFileRules.push(buildCSSRule(sel, pngFileURL));
					pngDataRules.push(buildCSSRule(sel, pngDataURI));
					svgDataRules.push(buildCSSRule(sel, svgDataURI));

				};

				// Output formatting
				var pretty = true;
				var tab = "";
				var newline = "";

				if (pretty){
					tab = "\t";
					newline = "\n";
				}

				grunt.verbose.or.ok('Done!');

				sep('Writing snippet HTML file (' + options.loaderSnippet + ')');
				var loader = grunt.file.read(grunticonFiles.banner) + "\n" + uglify.minify(grunticonFiles.loader).code;

				var filesnippet = [
					'<script>',
					loader,
					'grunticon([',
					tab + '"' + path.join(options.cssBasePath, options.svgDataCSS) +'",',
					tab + '"' + path.join(options.cssBasePath, options.pngDataCSS) +'",',
					tab + '"' + path.join(options.cssBasePath, options.pngFileCSS) +'"',
					']);',
					"</script>\n",
					'<noscript>',
					tab + '<link href="' + path.join(options.cssBasePath, options.pngFileCSS) + '" rel="stylesheet">',
					'</noscript>'
				].join(newline);
				grunt.file.write(path.join(options.dest, options.loaderSnippet), filesnippet);
				grunt.verbose.or.ok('Done!');

				sep('Writing preview CSS files');
				grunt.file.write(path.join(options.dest, options.pngFileCSS), pngFileRules.join("\n"));
				grunt.file.write(path.join(options.dest, options.pngDataCSS), pngDataRules.join("\n"));
				grunt.file.write(path.join(options.dest, options.svgDataCSS), svgDataRules.join("\n"));

				p.resolve();
				grunt.verbose.or.ok('Done!');
			}

			return p;
		}

		var cleanup = function(){
			sep('Cleaning up temp dir');

			var p = new RSVP.Promise();
			grunt.file.delete(pngTempDir);
			p.resolve();
			grunt.verbose.or.ok('Done!');

			return p;
		}

		var declareVictory = function(){
			sep('Success!!');
			grunt.log.writeln("\n"+grunt.file.read(grunticonFiles.mascot));
			done();
		}

		// DO IT
		preflight()
			.then(processSVGs)
			.then(processPNGs)
			.then(buildCSS)
			.then(cleanup)
			.then(declareVictory);
	});
};