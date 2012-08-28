# Unicon

A half-baked icon experiment

[c]2012 @scottjehl, Filament Group, Inc.

This script outputs a folder of svgs to 2 CSS files: one containing svg data uris of the icons, and a second one containing fallback references to png files generated from the svgs. A preview.html document and async-loaded CSS files will be generated in the temp folder after running, along with the png files.

To run, you'll need Node.js and Phantom.js installed.

1. `$ cd unicon`
2. `phantomjs unicon.js`
3. open the generated `temp/preview.html` in a browser.



## Results

Browsers that render the SVG data uri:
- IE9
- Chrome 14+ (maybe older too?)
- Safari 4+ (maybe older too?)
- Firefox 5+ (maybe older too?)
- iOS 3+ Safari and Chrome
- Android 4.0 Chrome (caveat: SVG icons do not scale in vector, but do appear to draw in high-resolution)
- Android 4.0 ICS Browser

Browsers that render the PNG data uri:
- IE8
- Android 2.3 Browser
- Android 2.2 Browser
- Android 2.1 Browser
- Android 1.6 Browser
- Android 1.5 Browser

Browsers that need the fallback png request:
- IE7
- IE6