# Unicon!

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

A mystical CSS icon solution.

Unicon takes a folder of SVG files (typically icons) and outputs them into CSS files in 3 formats: svg data urls, png data urls, and references to regular png images. It provides a small bit of JavaScript to asynchronously load the appropriate icon file depending on a browser's support for those formats. See the browser support section for how that breaks down.

## License
Copyright (c) 2012 Scott Jehl, Filament Group, Inc.
Licensed under the MIT license.

## Getting Started

First, you'll need to install [PhantomJS](http://phantomjs.org/), which you might already have if you have [Grunt](https://github.com/cowboy/grunt) installed (No? You'll need that too.).

Once those are in...

Install the module with: `npm install grunt-unicon`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-unicon');
```
Add the configuration settings to your `grunt.js` file as mentioned below, and Unicon will batch your icons whenever you run grunt.

## Documentation

Unicon has 2 configuration options: `src` and `dest`. Both need to be defined for Unicon to run.

- `src`: path to your folder of svg files
- `dest`: path to the folder you'd like the 

These can be set in your grunt.js config file, under the name `unicon`, like so:

```
	unicon: {
      src: "css/dist/icons/",
      dest: "css/icons/"
    }
```

The `src` property refers to the directory in which your SVG icons are stored. The `dest` property refers to the directory you'd like Unicon to create, which will contain your output files. 

**IMPORTANT NOTE:** Unicon will delete the `dest` folder if it already exists, so be sure not to specify a folder that already exists in your directories!!

With these configuration properties set, you can add `unicon` to your default tasks list. That'll look something like this:

    grunt.registerTask('default', 'lint qunit concat min **unicon**');

Unicon will now batch your icons whenever you run grunt.

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

## Creating SVG Artwork

The workflow we've been using so far involves creating a new Illustrator file with the artboard set to the desired size of the icon you want set in the CSS. 

Export the artwork by choosing File > Save as...  In the dialog, choose "SVG" as the format and enter a name for the file (this wil be used as your class name later).

In the Save SVG dialog that opens up, there are lots of options. SVG has a ton of formats, so here are a few tips we've learned. 

- SVG Profile: Seems like SVG 1.1 Tiny is really well supported across even older mobile platforms so if you have simple artwork that doesn't use gradients or opacity this will yield a smaller and more compatible graphic. If you want to use all the fancy effects, save artwork as SVG 1.1. 
- Type: Convert to outline
- Subsetting: None, I usually convert all text to outlines ahead of time
- Images: Embed
- Don't check "Preserve Illustrator editing" to reduce file size
