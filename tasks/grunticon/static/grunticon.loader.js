(function(){
	"use strict";
window.grunticon = function( css, pixelratio ){
	// expects a css array with 3 items representing CSS paths to datasvg, datapng, urlpng
	if( !css || css.length !== 3 ){
		return;
	}

	// Thanks Modernizr & Erik Dahlstrom
	var w = window,
		svg = !!w.document.createElementNS && !!w.document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,

		loadCSS = function( data ){
			var link = w.document.createElement( "link" ),
				ref = w.document.getElementsByTagName( "script" )[ 0 ],
				hrefVersion = data && svg ? 0 : data ? 1 : 2;
			link.rel = "stylesheet";

			// if we have more than one pixel density defined and we have data png and fallback png
			if ( pixelratio && pixelratio.length > 1 && window.devicePixelRatio && ( hrefVersion === 1 || hrefVersion === 2 ) ) {			
				// get the highest possible version for the icons
				var maxPixelRatio;
				for ( var i = 0; i < pixelratio.length; i++ ) {
					if ( window.devicePixelRatio >= pixelratio[i] ) {
						maxPixelRatio = pixelratio[i];		
					}						
				}
				// make sure we have a value
				if ( !maxPixelRatio || maxPixelRatio === undefined ) {
					maxPixelRatio = pixelratio[0];	
				}
				// create the link
				if ( maxPixelRatio === 1 ){
					link.href = css[ hrefVersion ];	
				} else {
					link.href = css[ hrefVersion ].replace( /\.css$/i, "-" + maxPixelRatio + "x.css" );
				}
				
			} else {
				link.href = css[ hrefVersion ];	
			}			
			ref.parentNode.insertBefore( link, ref );
		},

		// Thanks Modernizr
		img = new w.Image();

		img.onerror = function(){
			loadCSS( false );
		};

		img.onload = function(){
			loadCSS( img.width === 1 && img.height === 1 );
		};

		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
};
})();
// Call grunticon() here to load CSS: