/*
	UNICON!
		         /'
	        //
	    .  //
	    |\//7
	   /' " \     
	  .   . .      
	  | (    \     
	  |  '._  '        
	  /    \'-'

 	[c]2012 @scottjehl, Filament Group, Inc.
*/
(function(){

	//config
	var config = {
		sourceDir : "icons/"
	};

	var fs = require( "fs" ),
		dir = "icons/",
		assets = "assets/",
		outputdir = "temp/",
		pngout =  "png/"
		files = fs.list( dir ),
		currfile = 0,
		pngcssrules = [],
		pngdatacssrules = [],
		datacssrules = [],
		htmlpreviewbody = [],
		fallbackcss = "icons.fallback.css",
		pngdatacss = "icons.data.png.css",
		datacss = "icons.data.css";

		// create new temp dir
		fs.removeTree( outputdir );
		fs.makeDirectory( outputdir );

		function processFile(){
			var theFile = files[ currfile ];

			if( theFile ){
				if( theFile.match( /\.svg$/i ) ){
					(function(){
						var page = require( "webpage" ).create(),
							svgcontent = fs.read( config.sourceDir + theFile ),
							svgdatauri = "data:image/svg+xml,",
							pngdatauri = "data:image/png;base64,",
							filename = theFile,
							filenamenoext = filename.replace( /\.svg$/i, "" ),
							frag = document.createElement( "div" );

						// get rid of anything outside of the svg element
						if( svgcontent ){
							frag.innerHTML = svgcontent;
							svgcontent = frag.querySelector( "svg" );
							frag.innerHTML = "";
							frag.appendChild( svgcontent );
							svgcontent = frag.innerHTML;
						}

						svgdatauri += encodeURI( svgcontent );
						

						pngcssrules.push( ".icon-" + filenamenoext + " { background-image: url(" + pngout + filenamenoext + ".png" + "); }" );
						datacssrules.push( ".icon-" + filenamenoext + " { background-image: url(" + svgdatauri + "); }" );

						htmlpreviewbody.push( '<div class="icon-' + filenamenoext + '"></div>' );


						// open svg file in webkit to make a png
						page.open( config.sourceDir + theFile, function( status ){
							// create png file
							page.render( outputdir + pngout + filenamenoext + ".png" );

							// create png data URI
							pngdatacssrules.push( ".icon-" + filenamenoext + " { background-image: url(" +  pngdatauri + page.renderBase64( "png" ) + "); }" );

							// process the next svg
							nextFile();
						} );
					}());
				}
				else {
					nextFile();
				}
			}
			else {
				finishUp();
				console.log( "All done. Your files are in the temp folder." )
				phantom.exit();
			}
		}

		function nextFile(){
			currfile++;
			processFile();
		}

		processFile();

		function finishUp(){
			// make the preview HTML file - omg so ghetto sorry
			var htmldoc = fs.read( assets + "preview.html" ),
				asyncCSS = fs.read( assets + "asyncCSS.js" )

			// add async loader to the top
			htmldoc = htmldoc.replace( /<script>/, "<script>\n\t" + asyncCSS );

			// add icons to the body
			htmldoc = htmldoc.replace( /<\/body>/, htmlpreviewbody.join( "\n\t" ) + "\n</body>" );

			fs.write( outputdir + "preview.html", htmldoc );

			// write CSS file
			fs.write( outputdir + fallbackcss, pngcssrules.join( "\n\n" ) );
			fs.write( outputdir + pngdatacss, pngdatacssrules.join( "\n\n" ) );
			fs.write( outputdir + datacss, datacssrules.join( "\n\n" ) );
		}

}());