# grunticon!

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

grunticon is a [Grunt.js](https://github.com/cowboy/grunt/) task that makes it easy to manage icons and background images for all devices, preferring HD (retina) SVG icons but also provides fallback support for standard definition browsers, and old browsers alike. From a CSS perspective, it's easy to use, as it generates a class referencing each icon, and doesn't use CSS sprites. 

grunticon takes a [folder of SVG files](https://github.com/filamentgroup/grunticon/tree/master/example/source) (typically, icons that you've drawn in an application like Adobe Illustrator), and [outputs them](https://github.com/filamentgroup/grunticon/tree/master/example/output) to CSS in 3 formats: [svg data urls](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.svg.css), [png data urls](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.data.png.css), and [a third fallback CSS file with references to regular png images](https://github.com/filamentgroup/grunticon/blob/master/example/output/icons.fallback.css), which are also automatically [generated and placed in a folder](https://github.com/filamentgroup/grunticon/tree/master/example/output/png). 

grunticon also generates [a small bit of JavaScript and CSS](https://github.com/filamentgroup/grunticon/blob/master/example/output/grunticon.loader.txt) to drop into your site, which asynchronously loads the appropriate icon CSS depending on a browser's capabilities, and a preview HTML file with that loader script in place. 

You can see [a demonstration of the output here](http://filamentgroup.github.com/grunticon/example/output/preview.html).

## License
Copyright (c) 2012 Scott Jehl, [Filament Group, Inc.](http://filamentgroup.com)
Licensed under the MIT license.

## Getting Started

First, you'll need to install [PhantomJS](http://phantomjs.org/), which you might already have if you have [Grunt](https://github.com/cowboy/grunt) installed (No? You'll need that too.).

Once those are installed...

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

These can be set in your Gruntfile.js config file, under the name `grunticon`, like so:

```
	grunticon: {
		options: {
      src: "css/dist/icons/",
      dest: "css/icons/"
    }
	}
```

The `src` property refers to the directory in which your SVG icons are stored. The `dest` property refers to the directory you'd like grunticon to create, which will contain your output files. 

**IMPORTANT NOTE:** grunticon will overwrite any files in the `dest` directory if they are of the same name as a file that grunticon needs to create. For easiest results, you can set `dest` to a folder that does not yet exist in your directory and grunticon will create that folder, or set it to an existing folder and be sure to configure grunticon to create file names that do not already exist in that folder.

With these configuration properties set, you can add `grunticon` to your default tasks list. That'll look something like this:

    grunt.registerTask('default', 'lint qunit concat min grunticon');

grunticon will now batch your icons whenever you run grunt.

### Optional configuration properties

In addition to the required configuration properties above, grunticon's grunt configuration lets you configure the names of the files and the images folder it generates inside `dest`. 

- `datasvgcss`: The name of the generated CSS file containing SVG data uris. Default: `"icons.data.svg.css"`
- `datapngcss`: The name of the generated CSS file containing PNG data uris. Default: `"icons.data.png.css"`
- `urlpngcss`: The name of the generated CSS file containing external png url references. Default: `"icons.fallback.css"`
- `previewhtml`: The name of the generated HTML file containing PNG data uris. Default: `"preview.html"`
- `loadersnippet`:  The name of the generated text file containing the grunticon loading snippet. Default: `"grunticon.loader.txt"`
- `pngfolder`:  The name of the generated folder containing the generated PNG images. Default: `"png/"`
- `cssprefix`: a string to prefix all css classes with. Default: `"icon-"`
- `customselectors`: Allows you to specify custom selectors (in addition to the generated `cssprefix + filename - extension` class) for individual files. 

## Notable forks

- Interested in a version of Grunticon that incorporates SASS to give you tighter control over your icons' CSS selectors? Check out @zigotica's [Fork of Grunticon](https://github.com/zigotica/grunticon/) that does just that!


## Browser testing results for icon output

The generated asynchronous CSS loader script delivers an appropriate icon stylesheet depending on a device/browser's capabilities.

Browsers that render the SVG data url stylesheet:
- IE9
- Chrome 14+ (maybe older too?)
- Safari 4+ (maybe older too?)
- Firefox 3.6+ (maybe older too?)
- Opera 10+ (maybe older too?)
- iOS 3+ Safari and Chrome
- Android 4.0 Chrome (caveat: SVG icons do not scale in vector, but do appear to draw in high-resolution)
- Android 4.0 ICS Browser
- BlackBerry Playbook

Browsers that receive the PNG data url stylesheet:
- IE8
- Android 2.3 Browser
- Android 2.2 Browser
- Android 2.1 Browser
- Android 1.6 Browser
- Android 1.5 Browser

Browsers that receive the fallback png request:
- IE7
- IE6
- Non-JavaScript environments

## Tips

### Serving compressed CSS
One of the great benefits to data uris is the ability to compress the images heavily via gzip. Be sure to do this, as it'll cut your icon transfer size greatly.

### Creating SVG Artwork

The workflow we've been using so far involves creating a new Illustrator file with the artboard set to the desired size of the icon you want set in the CSS. 

Export the artwork by choosing File > Save as...  In the dialog, choose "SVG" as the format and enter a name for the file (this wil be used as your class name later, so keep it free of any disallowed CSS class characters like `.`, `{`, `(`, `)`, etc.

In the Save SVG dialog that opens up, there are lots of options. SVG has a ton of formats, so here are a few tips we've learned. 

- SVG Profile: Seems like SVG 1.1 Tiny is really well supported across even older mobile platforms so if you have simple artwork that doesn't use gradients or opacity this will yield a smaller and more compatible graphic. If you want to use all the fancy effects, save artwork as SVG 1.1. 
- Type: Convert to outline before export.
- Subsetting: None, I usually convert all text to outlines ahead of time
- Images: Embed
- Don't check "Preserve Illustrator editing" to reduce file size

### Copyright and licensing for the example SVG icons...

The example SVG icons in the source folder are borrowed from a few places, with attribution noted below. 
- [Unicorn icon by Andrew McKinley, The Noun Project](http://thenounproject.com/noun/unicorn/#icon-No3364)
- [Bear icon by National Park Service](http://thenounproject.com/noun/bear/#icon-No499)
- [Cat icon by  Marie Coons](http://thenounproject.com/noun/cat/#icon-No840)
- All others are either from [this free set by Tehk Seven](http://www.tehkseven.net/blog/1/entry-1066-475-free-awesome-high-quality-icons-for-designers/) or drawn by @toddparker of Filament Group


