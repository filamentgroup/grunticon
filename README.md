# Grunticon [![Build Status](https://travis-ci.org/filamentgroup/grunticon.png?branch=master)](https://travis-ci.org/filamentgroup/grunticon)

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

[![Filament Group](http://filamentgroup.com/images/fg-logo-positive-sm-crop.png) ](http://www.filamentgroup.com/)

### A mystical CSS icon solution

grunticon is a [Grunt.js](https://github.com/cowboy/grunt/) task that makes it easy to manage icons and background images for all devices, preferring HD (retina) SVG icons but also provides fallback support for standard definition browsers, and old browsers alike. From a CSS perspective, it's easy to use, as it generates a class referencing each icon, and doesn't use CSS sprites.

grunticon takes a [folder of SVG/PNG files](https://github.com/filamentgroup/grunticon/tree/master/example/source) (typically, icons that you've drawn in an application like Adobe Illustrator), and [outputs them](https://github.com/filamentgroup/grunticon/tree/master/example/output) to CSS in 3 formats: [svg data urls](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.svg.css), [png data urls](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.png.css), and [a third fallback CSS file with references to regular png images](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.fallback.css), which are also automatically [generated and placed in a folder](https://github.com/filamentgroup/grunticon/tree/master/example/output/png).

grunticon also generates [a small bit of JavaScript and CSS](https://github.com/filamentgroup/grunticon/blob/master/tasks/grunticon/static/grunticon.loader.js) to drop into your site, which asynchronously loads the appropriate icon CSS depending on a browser's capabilities, and a preview HTML file with that loader script in place.

You can see [a demonstration of the output here](http://filamentgroup.github.com/grunticon/example/output/preview.html).

## Before you get started!

[Have you seen Grumpicon?](http://grumpicon.com)

[<img src="http://filamentgroup.com/images/grunticon_workflow_grumpicon.jpg" width="400">](http://grumpicon.com)

[Grumpicon](http://grumpicon.com) is a browser-based app that performs much of the functionality of Grunticon through a simple drag and drop interface. It's much easier to set up than Grunticon, and sometimes, it's all you need (though it won't always be!)

If you're interested in trying out Grumpicon, you might be interested in this handy guide as well: [Grumpicon Workflow](http://filamentgroup.com/lab/grumpicon_workflow/)

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-grunticon --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-grunticon');
```

## The "grunticon" task

### Required configuration properties

grunticon has a files object that needs to be filled in order to run,
this files object currently requires that a cwd, and a dest dir are
placed, and therefore will blow up without it. This will be fixed to
better fit the pattern set by Grunt for this.

These can be set in your Gruntfile.js config file. Grunticon is a multitask, making it easy to create as many export batches as you'd like. Just create one or more custom named objects within the `grunticon` object, and configure Grunticon `options` within it, like so:

```
grunticon: {
	myIcons: {
		files: [{
			expand: true,
			cwd: 'example/source',
			src: ['*.svg', '*.png'],
			dest: "example/output"
		}],
		options: {
		}
	}
}
```

**IMPORTANT NOTE:** grunticon will overwrite any files in the `dest` directory if they are of the same name as a file that grunticon needs to create. For easiest results, you can set `dest` to a folder that does not yet exist in your directory and grunticon will create that folder, or set it to an existing folder and be sure to configure grunticon to create file names that do not already exist in that folder.

With these configuration properties set, you can add `grunticon` to your default tasks list. That'll look something like this:

    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify', 'grunticon:myIcons']);

grunticon will now batch your icons whenever you run grunt.

### Options

#### options.datasvgcss
Type: `String`
Default value: `"icons.data.svg.css"`

The name of the generated CSS file containing SVG data uris.

#### options.datapngcss
Type: `String`
Default value: `"icons.data.png.css"`

The name of the generated CSS file containing PNG data uris

#### options.urlpngcss
Type: `String`
Default value: `"icons.fallback.css"`

The name of the generated CSS file containing external png url references.

#### options.previewhtml
Type: `String`
Default value: `"preview.html"`

The name of the generated HTML file containing PNG data uris.


#### options.loadersnippet
Type: `String`
Default value: `"grunticon.loader.txt"`

 The name of the generated text file containing the grunticon loading snippet.

#### options.pngfolder
Type: `String`
Default value: `"png/"`

 The name of the generated folder containing the generated PNG images.

#### options.pngpath
Type: `String`
Default value: value of `options.pngfolder`

Allows you to specify a custom URL to serve fallback PNGs at.

Example:

```
{
    pngpath: "/assets/icons/png"
}
```

Will generate PNG fallbacks like:

```
.icon-bar {
	background-image: url('/assets/icons/png/bar.png');
	background-repeat: no-repeat;
}
```

#### options.cssprefix
Type: `String`
Default value: `".icon-"`

a string to prefix all css classes with.

#### options.customselectors
Type: `Object`

Allows you to specify custom selectors (in addition to the generated `cssprefix + filename - extension` class) for individual files.

Example:

```
{
	"foo": [".icon-bar", ".baz"]
}
```

will produce:

```
.icon-bar,
.bar,
.icon-foo {
	//css
}
```

You can also use an asterisk in your custom selector!

Examples:

```
customselectors: {
  "*": [".icon-$1:before", ".icon-$1-what", ".hey-$1"]
},
cssprefix: ".icon-"
```

Should give the file bear.svg the css
```
.icon-bear:before,
.icon-bear-what,
.hey-bear,
.icon-bear {
 // CSS THINGS
}
```

And if there are files bear.svg and cat.svg, the css should be like:

```
.icon-bear:before,
.icon-bear-what,
.hey-bear,
.icon-bear {
 // CSS THINGS
}

.icon-cat:before,
.icon-cat-what,
.hey-cat,
.icon-cat {
 // CSS THINGS
}
```

This should give you more flexibility with your selectors.

#### options.defaultWidth
Type: `String`
Default value: `"400px"`

a string that MUST be defined in px that will be the size of the PNG if there is no width given in the SVG element.

#### options.defaultHeight
Type: `String`
Default value: `"300px"`

similar to defaultWidth, but for height

#### options.previewTemplate
Type: `String`
Default value: Goes to the example/preview.hbs file

Takes a path to the template that will be used for the preview.html. Example of .hbs file contents:

```
<!doctype HTML>
<html>
  <head>
    <title>Icons Preview!</title>
    <style>
      body {
        background-image: linear-gradient(#eee 25%, transparent 25%, transparent), linear-gradient(#eee 25%, transparent 25%, transparent), linear-gradient(transparent 75%, #eee 75%), linear-gradient(transparent 75%, #eee 75%);
        width: 100%;
        background-size: 10px 10px;
      }
    </style>
    <script>
      {{{loaderText}}}
      grunticon(["icons.data.svg.css", "icons.data.png.css", "icons.fallback.css"]);
    </script>
  <noscript><link href="icons.fallback.css" rel="stylesheet"></noscript>
  </head>
  <body>
    {{#each icons}}
      {{#with this}}
      <pre><code>{{prefix}}{{name}}:</code></pre><div class="{{prefixClass}}{{name}}" style="width: {{width}}px; height: {{height}}px;" ></div><hr/>
      {{/with}}
    {{/each}}
</body>
</html>
```

#### options.tmpDir
Type: `String`
Default value: `"grunticon-tmp"`

Let's you specify a tmp-folder. Useful when having multiple grunticon tasks and using [grunt-concurrent](https://github.com/sindresorhus/grunt-concurrent "grunt-concurrent on github").

#### options.template
Type: `String`
Default value: `""`

Location of a handlebars template that will allow you to structure your
CSS file the way that you choose. As more data becomes available via
[directory-encoder](https://github.com/filamentgroup/directory-encoder),
more options will be available for you to tap into during templating.


Example of .hbs file contents:

```
{{#each customselectors}}{{this}},{{/each}}
{{prefix}}{{name}} {
	background-image: url('{{datauri}}');
	background-repeat: no-repeat;
}
```


#### options.colors

Allows you to predefine colors as variables that can be used in filename color configuration.
```
options: {
	colors: {
		myAwesomeRed: "#fc3d39",
		coolBlue: "#6950ff"
	}
```

#### options.dynamicColorOnly
Type: `Boolean`
Default value: `false`

Allows you to tell directory-colorfy to ignore the original file when
using colors.

For example, if given a file named like so:

```
bear.colors-white.svg
```

And `dynamicColorOnly` is set to `true`:

```
{
	dynamicColorOnly: true
}
```

Only a single file will be generated:

```
bear-white.svg
```


#### Automating color variations

Grunticon allows you to output any icon in different colors simply by changing its filename to the following syntax: `myfilename.colors-red-aa0000-gray.svg`. In this example, any color names or hexidecimal values that follow `colors-` and are separated by a dash will be used to generate additional icons of that color. By default, each icon will be assigned a numbered class name for CSS use. You can improve the class naming conventions by defining color variables in your Gruntfile's `colors` option shown above. When defined, you can reference a color variable in place of a color in your file names, and the generated classes will use that variable name as well. See the `Gruntfile.js`'s `colors` option and the sample bear svg for an example of color automation.

*A note on filesize impact:* Adding color variations of an icon involves creating duplicates of that icon's SVG source in the CSS, so unfortunately, each color variation will cause an increase in filesize. However, transferring CSS with gzip compression can negate much of this filesize increase, and we highly recommend always transferring with gzip. In testing, we found that creating a color variation of every icon in our example set increased overall size by 25%, rather than 100% as a raw text duplicate would increase. That said, size increases for non-SVG-supporting browsers will be more dramatic, as the fallback PNGs will not have the heavy transfer compression as SVG enjoys. We advise using this feature on a case-by-case basis to ensure overhead is kept to a minimum.

## Browser testing results for icon output

The generated asynchronous CSS loader script delivers an appropriate icon stylesheet depending on a device/browser's capabilities. Grunticon is supported in cases where icon fonts fail.

Browsers that render the SVG data url stylesheet:
- IE9
- Chrome 14+ (maybe older too?)
- Safari 4+ (maybe older too?)
- Firefox 3.6+ (maybe older too?)
- Opera 15+
- iOS 3+ Safari and Chrome
- Android 4.0 Chrome (caveat: SVG icons do not scale in vector, but do appear to draw in high-resolution)
- Android 4.0 ICS Browser
- BlackBerry Playbook

Browsers that receive the PNG data url stylesheet:
- IE8
- All versions of Opera, Opera Mini, and Opera Mobile before Chrome integration (v 15)
- Android 2.3 Browser
- Android 2.2 Browser
- Android 2.1 Browser
- Android 1.6 Browser
- Android 1.5 Browser

Browsers that receive the fallback png request:
- IE7
- IE6
- Non-JavaScript environments

View the full support spreadsheet [here](https://docs.google.com/spreadsheet/ccc?key=0Ag5_yGvxpINRdHFYeUJPNnZMWUZKR2ItMEpRTXZPdUE#gid=0). Feel free to edit it if you find anything new.

The test page can be found [here](http://filamentgroup.com/examples/grunticon-icon-test/).

## Tips

### Cleaning the cruft out of your SVGs

In earlier versions of Grunticon, we included SVGO to optimize the SVG output. In the 1.0
version, we removed this dependency to ease the installation complexity but still recommend
that SVG optimization is part of the Grunticon workflow.

When producing SVGs through a tool like Illustrator, there is a lot of
unnecessary markup, comments, and general code written into your SVG
files. Because of that, we strongly recommend using a tool like [grunt-svgmin](https://github.com/sindresorhus/grunt-svgmin).
If run before running Grunticon, it can greatly reduce your filesizes!

Here's an example:

```
svgmin: {
	dist: {
		files: [{
			expand: true,
			cwd: 'example/svgs',
			src: ['*.svg'],
			dest: 'example/source'
		}]
	}
},
grunticon: {
	foo: {
		files: [{
			expand: true,
			cwd: 'example/source',
			src: ['*.svg', '*.png'],
			dest: "example/output"
		}],
		options: {
    }
  }
}
```

For a more extensive example, check out our Gruntfile and example
project.

### Serving compressed CSS
One of the great benefits to data uris is the ability to compress the images heavily via gzip compression. Be sure to enable gzip of CSS on your server, as it'll cut your icon transfer size greatly.

### Creating SVG Artwork

The workflow we've been using so far involves creating a new Illustrator file with the artboard set to the desired size of the icon you want set in the CSS.

Export the artwork by choosing File > Save as...  In the dialog, choose "SVG" as the format and enter a name for the file (this wil be used as your class name later, so keep it free of any disallowed CSS class characters like `.`, `{`, `(`, `)`, etc.

In the Save SVG dialog that opens up, there are lots of options. SVG has a ton of formats, so here are a few tips we've learned.

- SVG Profile: Seems like SVG 1.1 Tiny is really well supported across even older mobile platforms so if you have simple artwork that doesn't use gradients or opacity this will yield a smaller and more compatible graphic. If you want to use all the fancy effects, save artwork as SVG 1.1.
- Type: Convert to outline before export.
- Subsetting: None, I usually convert all text to outlines ahead of time
- Images: Embed
- Don't check "Preserve Illustrator editing" to reduce file size

## Warnings
* If your files have `#`, `.`, `>`, or any other css selecting character in their names, they will likely be improperly processed.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## What's Changed (in this Major Version)?
With the release of 1.0.0, we have broken out the code to make it
easier to maintain so we can more quickly respond to bugs and new
feature requests. There have also been some changes to the way the
Gruntfile is set up, in that it now uses Grunt's file system.

Example:

Old way:
```
grunticon: {
  foo: {
    options: {
			src: "example/source",
			dest: "example/dest"
    }
  }
}
```

New way:

```
grunticon: {
  foo: {
		files: [{
			expand: true,
			cwd: 'example/source',
			src: ['*.svg', '*.png'],
			dest: "example/output"
		}],
		options: {
    }
  }
}
```

Custom Selectors now have a wildcard!

Example:

```
grunticon: {
	foo: {
		files: [{
			expand: true,
			cwd: 'example/source',
			src: ['*.svg', '*.png'],
			dest: "example/output"
		}],
		options: {
			customselectors: {
				"*": [".icon-$1:before"]
			}
        }
	}
}
```

If you have a file named `bear.svg` and a file named `cat.svg`, it will produce these selectors:

```
.icon-bear:before,
.icon-bear{
//css
}

.icon-cat:before,
.icon-cat{
//css
}

```


We've parted with SVGO, as keeping grunt-svgmin part of your build
process is easy and they do a great job on that project over there.
We've also parted with using PNGCrush for the time being. We're
currently looking for another solution (suggestions welcome).


## Release History
* Version 1.3.0: Add `dynamicColorOnly` support from directory-colorfy
* Version 1.2.0: Update directory-encoder version, this allows the
  `pngpath` option
* Version 1.1.0: Add `previewTemplate` option
* Version 1.0.0: Some alpha and beta bugs taken care of.
* Version 1.0.0-alpha: Almost complete rewrite. Breaking out pieces of this
project into other areas. Removed SVGO and PNGCrush. SVGO is better
served through the svgmin plugin.
* Version 0.6.5: CSS Writing has been moved from Phantom to Node, in order to decrease base64 datauri sizes
* Version 0.6.0: Grunticon now comes with PNG Crush. This will reduce the size of your PNGs
* Version 0.5.0: Grunticon now comes with SVGO. This cleans up your SVGs, greatly reducing the size of your CSS file.
* Version 0.4.1: Opera browsers prior to version 15 are given fallback PNG due to SVG scaling troubles.
* Version 0.4.0: Automated filename-driven color variations were added, along with the `colors` option
* Version 0.3.4: SVGs without width and height can be used
* Version 0.3.2: Added PhantomJS as a Node dependency, easing installation
* Version 0.3.1: Documentation updates
* Version 0.3.0: Grunticon becomes a multitask - syntax change involved in Gruntfile
* Version 0.2.1: Custom selectors feature added
* Version 0.2.0: Compatibility rewrite for Grunt 0.4x
* Version 0.1.6: Switched from base64 encoding to escaping raw SVG text in data uris. Fixes to cssprefix setting. If fallback png data uri is > 32768 chars, link to ext png instead for IE issues.
