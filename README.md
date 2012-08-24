# Unicon

A half-baked icon experiment

[c]2012 @scottjehl, Filament Group, Inc.

This script outputs a folder of svgs to 2 CSS files: one containing svg data uris of the icons, and a second one containing fallback references to png files generated from the svgs. A preview.html document and async-loaded CSS files will be generated in the temp folder after running, along with the png files.

To run, you'll need Node.js and Phantom.js installed.

1. `$ cd unicon`
2. `phantomjs unicon.js`
3. open the generated `temp/preview.html` in a browser.