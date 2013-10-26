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
	var imgstats = require(path.join('..', 'lib', 'img-stats'))
	var imgdata = {};

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
			pngTempDir:      'grunticon-temp',
			cssPrefix:       'icon-',
			customSelectors: {},
			cssBasePath:     '',
			generatePreview: true
		});

		// Grunticon templates and assorted what-not
		var grunticonFiles = {
			snippet: path.join(__dirname, 'grunticon', 'static', 'snippet.html'),
			loader:  path.join(__dirname, 'grunticon', 'static', 'grunticon.loader.js'),
			css:     path.join(__dirname, 'grunticon', 'static', 'icons.css'),
			preview: path.join(__dirname, 'grunticon', 'static', 'preview.html'),
			mascot:  path.join(__dirname, 'grunticon', 'static', 'excessive.txt'),
			phantom: path.join(__dirname, 'grunticon', 'phantom.js')
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

			// Reset!
			if(grunt.file.exists(options.dest)){
				grunt.file.delete(options.dest);
			}
			grunt.file.mkdir(options.dest);
			grunt.file.mkdir(pngTempDir);
			grunt.file.mkdir(pngDestDir);

			if( svgCount + pngCount > 0 ){
				// Nice message about PNGs
				if(pngCount > 0){
					if(crushingIt){
						grunt.log.ok('PNG'+(pngCount===1?'':'s')+' => pngcrush => "'+pngDestDir+'"');
					} else {
						grunt.log.ok('PNG'+(pngCount===1?'':'s')+' => "'+pngDestDir+'"');
					}
				} else {
					grunt.log.warn('No PNG files were found.');
				}

				// Nice message about SVGs
				if(svgCount > 0){
					if(crushingIt){
						grunt.log.ok('SVG'+(svgCount===1?'':'s')+' => phantomjs => "'+pngTempDir+'" => pngcrush => "'+pngDestDir+'"');
					} else {
						grunt.log.ok('SVG'+(svgCount===1?'':'s')+' => phantomjs => "'+pngTempDir+'" => "'+pngDestDir+'"');
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

		var processImages = function(){
			var sepText = [];
			if(pngCount > 0){ sepText.push(pngCount+' PNG'+(pngCount===1?'':'s')); }
			if(svgCount > 0){ sepText.push(svgCount+' SVG'+(svgCount===1?'':'s')); }
			sep('Processing source images: '+sepText.join(' and '));
			var p = new RSVP.Promise();

			// Copy PNGs
			if(pngCount > 0){
				for(var b in pngFiles){
					var f = pngFiles[b];
					grunt.file.copy(
						path.join(f.src),
						path.join(f.temp)
					);
				}
			}

			// Process SVGs
			if(svgCount > 0){
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
			var p = new RSVP.Promise();
			var promises = [];

			// Compress all PNGs
			var files = fs.readdirSync(pngTempDir);

			if(crushingIt){
				sep('Compressing '+files.length+' PNG'+(files.length===1?'':'s')+' with pngcrush');
			} else {
				sep('Copying '+files.length+' PNG'+(files.length===1?'':'s')+' to '+pngDestDir);
			}

			var idx = 0;
			files.forEach(function(pngFileName){
				var promise = new RSVP.Promise();
				var wait_for_imgstats = new RSVP.Promise();

				if(path.extname(pngFileName) !== '.png'){
					grunt.log.ok('['+(idx+1)+'/'+files.length+'] Ignoring '+pngFileName);
					promise.resolve();
				} else {

					imgstats.stats(path.join(pngTempDir, pngFileName), function(data){
						imgdata[path.basename(pngFileName,'.png')] = data;
						wait_for_imgstats.resolve();
					});

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
								idx++;
								grunt.verbose.ok(grunt.log.table([5,65],[idx+'.', pngFileName]));
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
				promises.push(wait_for_imgstats);
			});

			RSVP.all(promises).then(function(){
				p.resolve();
				grunt.verbose.or.ok('Done!');
			});

			return p;
		}

		var buildCSS = function(){
			sep('Building HTML/CSS files');
			var p = new RSVP.Promise();

			if(pngCount + svgCount === 0){
				p.reject();
			} else {
				var pngFileRules = [];
				var pngDataRules = [];
				var svgDataRules = [];
				var cssFiles = [];

				var svgHeader = "data:image/svg+xml;charset=US-ASCII,";
				var pngHeader = "data:image/png;base64,";

				var idx = 0;

				// Load data arrays for writing
				for(var b in allFiles){
					idx++;
					var pngFileURL, pngData, pngDataURI, svgData, svgDataURI;
					var f = allFiles[b];
					var width = 100;
					var height = 100;

					if(f.basename in imgdata){
						width = imgdata[f.basename].width;
						height = imgdata[f.basename].height;
					} else {
						grunt.log.warn('No dimensions for '+f.basename);
					}

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

					// TODO: Calculate width/height
					cssFiles.push({
						width: width,
						height: height,
						selector: sel
					});

					if( f.basename in options.customSelectors ){
						sel += ', '+options.customSelectors[f.basename];
					}

					grunt.verbose.ok( grunt.log.table([5,11,64],[idx+'.', width+'x'+height+'px','.'+sel]) );

					// CSS Files
					pngFileRules.push({selector: sel, url: pngFileURL, size: {w:width, h:height}});
					pngDataRules.push({selector: sel, url: pngDataURI, size: {w:width, h:height}});
					svgDataRules.push({selector: sel, url: svgDataURI, size: {w:width, h:height}});

				};
				grunt.verbose.or.ok('Done!');

				sep('Writing HTML/CSS files');
				var snippetTemplate = grunt.file.read(grunticonFiles.snippet);
				var loaderJS = uglify.minify(grunticonFiles.loader).code;
				var iconCSS = grunt.file.read(grunticonFiles.css);

				// Production Grunticon snippet
				var loaderSnippet = grunt.template.process(snippetTemplate, {
					data: {
						loader: loaderJS,
						svgDataPath: path.join(options.cssBasePath, options.svgDataCSS),
						pngDataPath: path.join(options.cssBasePath, options.pngDataCSS),
						pngFilePath: path.join(options.cssBasePath, options.pngFileCSS)
					}
				});

				grunt.file.write(path.join(options.dest, options.loaderSnippet), loaderSnippet);

				// Grunticon CSS
				var pngFileCSS = grunt.template.process(iconCSS, {data: {
					icons: pngFileRules
				}});
				var pngDataCSS = grunt.template.process(iconCSS, {data: {
					icons: pngDataRules
				}});
				var svgDataCSS = grunt.template.process(iconCSS, {data: {
					icons: svgDataRules
				}});

				grunt.file.write(path.join(options.dest, options.pngFileCSS), pngFileCSS);
				grunt.file.write(path.join(options.dest, options.pngDataCSS), pngDataCSS);
				grunt.file.write(path.join(options.dest, options.svgDataCSS), svgDataCSS);

				// Preview HTML file
				if(options.generatePreview){
					var previewTemplate = grunt.file.read(grunticonFiles.preview);
					var previewSnippet = grunt.template.process(snippetTemplate, {
						data: {
							loader: loaderJS,
							svgDataPath: options.svgDataCSS,
							pngDataPath: options.pngDataCSS,
							pngFilePath: options.pngFileCSS
						}
					});

					var previewHTML = grunt.template.process(previewTemplate, {
						data: {
							snippet: previewSnippet,
							cssFiles: cssFiles
						}
					});

					grunt.file.write(path.join(options.dest, options.previewHTML), previewHTML);
				}

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
			.then(processImages)
			.then(processPNGs)
			.then(buildCSS)
			.then(cleanup)
			.then(declareVictory);
	});
};