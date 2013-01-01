(function(){
	"use strict";
window.grunticon = function( css, foo ){
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

			//if(hrefVersion === 2 && window.devicePixelRatio){
			if(hrefVersion === 2 && window.devicePixelRatio){
				if(window.devicePixelRatio >= 2){
					link.href = css[ 2 ].replace( /\.css$/i, "2x.css" );
				}else if(window.devicePixelRatio === 1.5){
					link.href = css[ 2 ].replace( /\.css$/i, "1.5x.css" );
				}else{
					link.href = css[ 2 ];		
				}
			}else{
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