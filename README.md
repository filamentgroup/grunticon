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

grunticon is a [Grunt.js][grunt] task that makes it easy to manage icons and background images for all devices, preferring HD (retina) SVG icons but also provides fallback support for standard definition browsers, and old browsers alike. From a CSS perspective, it's easy to use, as it generates a class referencing each icon, and doesn't use CSS sprites.

grunticon takes a [folder of SVG/PNG files][example source] (typically, icons that you've drawn in an application like Adobe Illustrator), and [outputs them][example output] to CSS in 3 formats: [svg data urls][], [png data urls][], and [a third fallback CSS file with references to regular png images][png fallback], which are also automatically [generated and placed in a folder][final].

grunticon also generates [a small bit of JavaScript and CSS][loader] to drop into your site, which asynchronously loads the appropriate icon CSS depending on a browser's capabilities, and a preview HTML file with that loader script in place.

You can see [a demonstration of the output here][demotron].

## License
Copyright (c) 2012 Scott Jehl, [Filament Group, Inc.](http://filamentgroup.com)
Licensed under the MIT license.

## Before you get started!

[Have you seen Grumpicon?][grump]

[<img src="http://filamentgroup.com/images/grunticon_workflow_grumpicon.jpg" width="400">][grump]

[Grumpicon][grump] is a browser-based app that performs much of the functionality of Grunticon through a simple drag and drop interface. It's much easier to set up than Grunticon, and sometimes, it's all you need (though it won't always be!)

If you're interested in trying out Grumpicon, you might be interested in this handy guide as well: [Grumpicon Workflow][]

## Getting Started

You'll need to have [Grunt][] installed.

Install the grunticon module with: `npm install grunt-grunticon`

Then add this line to your project's `Gruntfile.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-grunticon');
```

And lastly, add the configuration settings to your `Gruntfile.js` file as mentioned below. grunticon will batch your icons whenever you run `$ grunt`, and output the files listed above to your `dest` folder, which is documented below.


## Documentation

### Required configuration properties

grunticon has 2 required configuration properties: `src` and `dest`. Both need to be defined for grunticon to run.

- `src`: path to your folder of svg files, relative to the Gruntfile.js file. Perhaps something like `images/icons-source/`.
- `dest`: path to the folder that grunticon will write to, relative to the Gruntfile.js file. Ideally, this would be a folder that does not yet exist in your directory. Perhaps something like `css/icons-dist/`.

These can be set in your Gruntfile.js config file. Grunticon is a multitask, making it easy to create as many export batches as you'd like. Just create one or more custom named objects within the `grunticon` object, and configure Grunticon `options` within it, like so:

```
	grunticon: {
		myIcons: {
			options: {
				src: "css/dist/icons/",
				dest: "css/icons/"
			}
		}
	}
```

Within the `options` object, the `src` property refers to the directory in which your SVG icons are stored. The `dest` property refers to the directory you'd like grunticon to create, which will contain your output files.

**IMPORTANT NOTE:** grunticon will overwrite any files in the `dest` directory if they are of the same name as a file that grunticon needs to create. For easiest results, you can set `dest` to a folder that does not yet exist in your directory and grunticon will create that folder, or set it to an existing folder and be sure to configure grunticon to create file names that do not already exist in that folder.

With these configuration properties set, you can add `grunticon` to your default tasks list. That'll look something like this:

	grunt.registerTask('default', 'lint qunit concat min grunticon');

grunticon will now batch your icons whenever you run grunt.

### Optional configuration properties

In addition to the required configuration properties above, grunticon's grunt configuration lets you configure the names of the files and the images folder it generates inside `dest`.

- `svgDataCSS`: The name of the generated CSS file containing SVG data uris. Default: `"icons.data.svg.css"`
- `pngDataCSS`: The name of the generated CSS file containing PNG data uris. Default: `"icons.data.png.css"`
- `pngFileCSS`: The name of the generated CSS file containing external png url references. Default: `"icons.fallback.css"`
- `previewFile`: The name of the generated HTML file containing PNG data uris. Default: `"preview.html"`
- `loaderFile`:  The name of the generated text file containing the grunticon loading snippet. Default: `"grunticon.loader.html"`
- `pngDestDir`:  The name of the generated folder containing the generated PNG images. Default: `"png/"`
- `cssPrefix`: a string to prefix all css classes with. Default: `"icon-"`
- `customSelectors`: Allows you to specify custom selectors (in addition to the generated `cssPrefix + filename - extension` class) for individual files.
- `defaultWidth`: a string that MUST be defined in px that will be the
  size of the PNG if there is no width given in the SVG element.
Example: `defaultWidth: "300px";` Default: `"400px"`
- `defaultHeight`: similar to defaultWidth, but for height
Example: `defaultHeight: "200px";` Default: `"300px"`

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

View the full support spreadsheet [here][support spreadsheet]. Feel free to edit it if you find anything new.

The test page can be found [here][test page].

## Tips

### Serving compressed CSS
One of the great benefits to data uris is the ability to compress the images heavily via gzip compression. Be sure to enable gzip of CSS on your server, as it'll cut your icon transfer size greatly.

### Creating SVG Artwork

The workflow we've been using so far involves creating a new Illustrator file with the artboard set to the desired size of the icon you want set in the CSS.

Export the artwork by choosing File > Save as…  In the dialog, choose “SVG” as the format and enter a name for the file (this wil be used as your class name later, so keep it free of any disallowed CSS class characters like `.`, `{`, `(`, `)`, etc.

In the Save SVG dialog that opens up, there are lots of options. SVG has a ton of formats, so here are a few tips we've learned.

- SVG Profile: Seems like SVG 1.1 Tiny is really well supported across even older mobile platforms so if you have simple artwork that doesn't use gradients or opacity this will yield a smaller and more compatible graphic. If you want to use all the fancy effects, save artwork as SVG 1.1.
- Type: Convert to outline before export.
- Subsetting: None, I usually convert all text to outlines ahead of time
- Images: Embed
- Don't check "Preserve Illustrator editing" to reduce file size

## Changelog

- Version 0.6.5: CSS Writing has been moved from Phantom to Node, in order to decrease base64 datauri sizes
- Version 0.6.0: Grunticon now comes with PNG Crush. This will reduce the size of your SVGs
- Version 0.5.0: Grunticon now comes with SVGO. This cleans up your SVGs, greatly reducing the size of your CSS file.
- Version 0.4.1: Opera browsers prior to version 15 are given fallback PNG due to SVG scaling troubles.
- Version 0.4.0: Automated filename-driven color variations were added, along with the `colors` option
- Version 0.3.4: SVGs without width and height can be used
- Version 0.3.2: Added PhantomJS as a Node dependency, easing installation
- Version 0.3.1: Documentation updates
- Version 0.3.0: Grunticon becomes a multitask - syntax change involved in gruntfile
- Version 0.2.1: Custom selectors feature added
- Version 0.2.0: Compatibility rewrite for Grunt 0.4x
- Version 0.1.6: Switched from base64 encoding to escaping raw SVG text in data uris. Fixes to cssPrefix setting. If fallback png data uri is > 32768 chars, link to ext png instead for IE issues.


## Copyright and licensing for the example SVG icons...

The example SVG icons in the source folder are borrowed from a few places, with attribution noted below.
- [Unicorn icon by Andrew McKinley, The Noun Project][unicorn icon]
- [Bear icon by National Park Service][bear icon]
- [Cat icon by  Marie Coons][cat icon]
- All others are either from [this free set by Tehk Seven][475 icon set] or drawn by @toddparker of Filament Group


[grunt]: https://github.com/cowboy/grunt/
[grump]: http://grumpicon.com
[example source]: https://github.com/filamentgroup/grunticon/tree/master/example/source
[example output]: https://github.com/filamentgroup/grunticon/tree/master/example/output
[svg data urls]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.svg.css
[png data urls]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.png.css
[png fallback]: https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.fallback.css
[final]: https://github.com/filamentgroup/grunticon/tree/master/example/output/png
[loader]: https://github.com/filamentgroup/grunticon/blob/master/example/output/grunticon.loader.txt
[demotron]: http://filamentgroup.github.com/grunticon/example/output/preview.html
[grumpicon workflow]: http://filamentgroup.com/lab/grumpicon_workflow/
[support spreadsheet]: https://docs.google.com/spreadsheet/ccc?key=0Ag5_yGvxpINRdHFYeUJPNnZMWUZKR2ItMEpRTXZPdUE#gid=0
[test page]: http://filamentgroup.com/examples/grunticon-icon-test/
[unicorn icon]: http://thenounproject.com/noun/unicorn/#icon-No3364
[bear icon]: http://thenounproject.com/noun/bear/#icon-No499
[cat icon]: http://thenounproject.com/noun/cat/#icon-No840
[475 icon set]: http://www.tehkseven.net/seven-mega-102655/