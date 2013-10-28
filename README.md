# grunticon!
[![Build Status](https://travis-ci.org/filamentgroup/grunticon.png?branch=master)](https://travis-ci.org/filamentgroup/grunticon)

```
         /'
        //
    .  //
    |\//7
   /' " \
  .   . .
  | (    \
  |  '._  '
  /    \'-'

```

## A mystical CSS icon solution.

grunticon is a [Grunt.js][grunt] task that makes it easy to manage icons and background images for all devices. It loads SVG and PNG images in one (1) single HTTP request (!!!) for the latest and greatest browsers, and it falls back to the best supported option for “lesser” browsers.

From a CSS perspective, it’s easy to use, as it generates a class referencing each icon and it doesn’t use CSS sprites (no more fiddling around with background-position!). It’s future-friendly and forward thinking and why aren’t you using it already.

## The Details

grunticon takes a grunt file object comprised of [SVG and PNG files][example source]. PNG files are copied to the destination folder. SVGs are run through `phantomjs` and converted to PNGs in the destination folder. All PNGs are optionally crushed with `pngcrush` (recommended but not enabled by default).

[Three CSS files][example output] are created:

1. [a CSS file with SVG data URIs][SVG data URIs] for latest and greatest browsers,
2. [a CSS file with PNG data URIs][PNG data URIs] for browsers that don’t support SVG, and
3. [a fallback CSS file with references to those generated PNG images][PNG fallback] for browsers that don’t do data URIs.

All three files are [placed in the destination folder][final] along with a subfolder containing the generated PNGs. grunticon also generates [a snippet of HTML][snippet] that you’ll need to drop into your project’s `<head>`. The snippet asynchronously loads the appropriate icon CSS depending on the browser’s capabilities. grunticon also (optionally) generates a preview HTML file so you can see how those icons look all in one document.

You can see [a demonstration of the output here][demotron].

[example source]: https://github.com/filamentgroup/grunticon/tree/master/example/source
[example output]: https://github.com/filamentgroup/grunticon/tree/master/example/output
[SVG data URIs]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.svg.css
[PNG data URIs]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.png.css
[PNG fallback]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.fallback.css
[final]: https://github.com/filamentgroup/grunticon/tree/master/example/output/png
[snippet]: https://github.com/filamentgroup/grunticon/blob/master/example/output/grunticon.loader.txt
[demotron]: http://filamentgroup.github.com/grunticon/example/output/preview.html


## License
Copyright (c) 2013 Scott Jehl, [Filament Group, Inc.](http://filamentgroup.com)
Licensed under the MIT license.

## Before you get started!

[Have you seen Grumpicon?][grump]

[<img src="http://filamentgroup.com/images/grunticon_workflow_grumpicon.jpg" width="400">][grump]

[Grumpicon][grump] is a browser-based app that performs much of the functionality of Grunticon through a simple drag-and-drop interface. It’s much easier to set up than Grunticon, and sometimes, it’s all you need (though it won’t always be!)

If you’re interested in trying out Grumpicon, you might be interested in this handy guide as well: [Grumpicon Workflow][]

[grump]: http://grumpicon.com
[grumpicon workflow]: http://filamentgroup.com/lab/grumpicon_workflow/

## Installing grunticon

You’ll need to have `node` and [Grunt][grunt] installed.

- Mac: You can install `node` with [Homebrew][brew], a package manager. It’s one of the easiest way to manage command-line binaries on your Mac. [Read more on the Homebrew wiki][brew wiki].
- Linux: You can install `node` with your OS’s preferred package manager.
- Windows: ???

Once `node` is installed, you’ll have access to the node package manager (`npm`). Installing grunt is a two-step thing:

1. Install the grunt CLI with `npm install -g grunt-cli`.
2. In your project directory, run `npm install grunt` to install the local guts into the `node_modules` folder.

For more details on `grunt` installation, [check out the official documentation][install grunt].

---

Now, to grunticon.

1. In your project directory, run `npm install grunt-grunticon` to install the grunticon locally.
2. Add the following to your `Gruntfile.js`:
	```javascript
	grunt.loadNpmTasks('grunt-grunticon');
	```

[brew]: http://brew.sh/
[brew wiki]: https://github.com/mxcl/homebrew/wiki
[grunt]: https://github.com/cowboy/grunt/
[install grunt]: http://gruntjs.com/getting-started#installing-the-cli


## Configuring your grunticon task

Grunticon is a [multi task][multitask], which makes it easy to create as many export batches as you’d like. Here’s a sample task:

```javascript
grunticon: {
	yourTaskName: {
		files: [
			{
				src: 'icons/*.{svg,png}',
				filter: 'isFile'
			}
		],
		options: {
			dest: 'static/icons'
		}
	}
}
```

Read more about multi tasks on the [official grunt documentation][multitask].

`files` is a [grunt file array object][grunt file array].

The `dest` property is the directory you’d like grunticon to create. It’ll contain all the files the grunticon generated. **Important note:** grunticon will delete and recreate the `dest` directory every time it runs. *Make sure* grunticon gets its own subfolder.

If you’d like grunticon to run as a default task (whenever you run `grunt` without specifying a task), add `grunticon` to your default tasks list:

```javascript
grunt.registerTask('default', 'svgo cssmin grunticon');
```

Otherwise, you can run the grunticon task with `grunt grunticon:yourTaskName`.

[multitask]: http://gruntjs.com/creating-tasks#multi-tasks
[grunt file array]: http://gruntjs.com/configuring-tasks#files-array-format


### Optional configuration properties

grunticon is designed to run with minimal configuration, but if you’d like to customise things, the following keys are configurable in `options`:

<dl>
<dt>cssBasePath</dt>
<dd>CSS file path prefix appended to CSS filenames.</dd>
<dd>Default: <code>''</code></dd>
<dt>pngcrush</dt>
<dd>Path to pngcrush binary. Set to false to disable pngcrush. Set to true to load npm-installed pngcrush (install it with `npm install pngcrush-installer`).</dd>
<dd>Default: <code>false</code></dd>
<dt>phantomjs</dt>
<dd>Path to phantomjs binary. Set to false to load npm-installed phantomjs (install with `npm install phantomjs`).</dd>
<dd>Default: <code>false</code></dd>
<dt>svgDataCSS</dt>
<dd>The name of the generated CSS file containing SVG data URIs.</dd>
<dd>Default: <code>'icons.data.svg.css'</code></dd>
<dt>pngDataCSS</dt>
<dd>The name of the generated CSS file containing PNG data URIs.</dd>
<dd>Default: <code>'icons.data.png.css'</code></dd>
<dt>pngFileCSS</dt>
<dd>The name of the generated CSS file containing external PNG URL references.</dd>
<dd>Default: <code>'icons.fallback.css'</code></dd>
<dt>snippetFile</dt>
<dd>The name of the generated HTML file containing the grunticon async snippet.</dd>
<dd>Default: <code>'snippet.html'</code></dd>
<dt>previewFile</dt>
<dd>The name of the generated icon preview HTML file. Set to `false` to disable preview generation.</dd>
<dd>Default: <code>'preview.html'</code></dd>
<dt>pngDestDir</dt>
<dd>The name of the subfolder in `dest` containing the generated PNG images.</dd>
<dd>Default: <code>'png'</code></dd>
<dt>cssPrefix</dt>
<dd>A string to prefix all CSS selectors with.</dd>
<dd>Default: <code>'icon-'</code></dd>
<dt>previewTemplate</dt>
<dd>Path to your custom preview.html template.</dd>
<dd>Default: <a href="example/templates/preview.html">internal preview template</a></dd>
<dt>snippetTemplate</dt>
<dd>Path to your custom snippet.html template.</dd>
<dd>Default: <a href="example/templates/snippet.html">internal snippet template</a></dd>
<dt>cssTemplate</dt>
<dd>Path to your custom icon CSS template.</dd>
<dd>Default: <a href="example/templates/icons.css">internal CSS template</a></dd>
<dt>loaderTemplate</dt>
<dd>Path to your custom JS loader template.</dd>
<dd>Default: <a href="example/templates/loader.js">internal loader template</a></dd>
</dl>

## Browser testing results for icon output

The generated asynchronous CSS loader script delivers an appropriate icon stylesheet depending on the browser’s capabilities. Grunticon is even supported in cases where icon fonts fail.

Browsers that render the SVG data URI stylesheet:
- IE9
- Chrome 14+ (maybe older too?)
- Safari 4+ (maybe older too?)
- Firefox 3.6+ (maybe older too?)
- Opera 15+
- iOS 3+ Safari and Chrome
- Android 4.0 Chrome (caveat: SVG icons do not scale in vector, but do appear to draw in high-resolution)
- Android 4.0 ICS Browser
- BlackBerry Playbook

Browsers that receive the PNG data URI stylesheet:
- IE8
- All versions of Opera, Opera Mini, and Opera Mobile before Chrome integration (v 15)
- Android 2.3 Browser
- Android 2.2 Browser
- Android 2.1 Browser
- Android 1.6 Browser
- Android 1.5 Browser

Browsers that receive the fallback PNG request:
- IE7
- IE6
- Non-JavaScript environments

View the full support spreadsheet [here][support spreadsheet]. Feel free to edit it if you find anything new.

The test page can be found [here][test page].

[support spreadsheet]: https://docs.google.com/spreadsheet/ccc?key=0Ag5_yGvxpINRdHFYeUJPNnZMWUZKR2ItMEpRTXZPdUE#gid=0
[test page]: http://filamentgroup.com/examples/grunticon-icon-test/

## Tips

### Serving compressed CSS
One of the great benefits to data URIs is the ability to compress images heavily via gzip compression. Enabling gzip on your server, as it’ll cut your icon transfer size greatly.

### Creating SVG Artwork

The workflow we’ve been using so far involves creating a new Illustrator file with the artboard set to the desired size of the icon you want set in the CSS.

Export the artwork by choosing `File > Save as…`. In the dialog, choose *SVG* as the format and enter a name for the file. This filename will be used as your class name later. Non-word characters will be stripped out.

#### Recommended *Save SVG* dialog options

<dl>
	<dt>SVG Profiles</dt>
	<dd>If you’re not using gradients and fancy SVG effects, <em>SVG 1.1 Tiny</em> will yield a smaller, more compatible file. If you want to use all the fancy effects, save artwork as <em>SVG 1.1</em>.</dd>
	<dt>Type</dt>
	<dd>Select <em>Convert to outline</em></dd>
	<dt>Subsetting</dt>
	<dd>Not necessary, since text is converted to outlines</dd>
	<dt>Image Location</dt>
	<dd>Select <em>Embed</em></dd>
	<dt>Preserve Illustrator Editing Capabilities</dt>
	<dd>Leave this unchecked to reduce SVG file size.</dd>
</dl>

## Changelog

- Version 0.6.5: CSS Writing has been moved from Phantom to Node, in order to decrease base64 datauri sizes
- Version 0.6.0: Grunticon now comes with PNG Crush. This will reduce the size of your SVGs
- Version 0.5.0: Grunticon now comes with SVGO. This cleans up your SVGs, greatly reducing the size of your CSS file.
- Version 0.4.1: Opera browsers prior to version 15 are given fallback PNG due to SVG scaling troubles.
- Version 0.4.0: Automated filename-driven color variations were added, along with the `colors` option
- Version 0.3.4: SVGs without width and height can be used
- Version 0.3.2: Added PhantomJS as a Node dependency, easing installation
- Version 0.3.1: Documentation updates
- Version 0.3.0: Grunticon becomes a multi task - syntax change involved in gruntfile
- Version 0.2.1: Custom selectors feature added
- Version 0.2.0: Compatibility rewrite for Grunt 0.4x
- Version 0.1.6: Switched from base64 encoding to escaping raw SVG text in data uris. Fixes to cssPrefix setting. If fallback png data uri is > 32768 chars, link to ext png instead for IE issues.


## Copyright and licensing for the example SVG icons...

The example SVG icons in the source folder are borrowed from a few places, with attribution noted below.
- [Unicorn icon by Andrew McKinley, The Noun Project][unicorn icon]
- [Bear icon by National Park Service][bear icon]
- [Cat icon by  Marie Coons][cat icon]
- All others are either from [this free set by Tehk Seven][475 icon set] or drawn by @toddparker of Filament Group

[unicorn icon]: http://thenounproject.com/noun/unicorn/#icon-No3364
[bear icon]: http://thenounproject.com/noun/bear/#icon-No499
[cat icon]: http://thenounproject.com/noun/cat/#icon-No840
[475 icon set]: http://www.tehkseven.net/seven-mega-102655/