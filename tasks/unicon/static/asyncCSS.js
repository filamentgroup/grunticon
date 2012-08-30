/*
 * Unicon - Asynchronous Stylesheet Loader Function
 * https://github.com/filamentgroup/unicon
 *
 * Copyright (c) 2012 Scott Jehl
 * Licensed under the MIT license.
 */
(function(w){
	var css = [
			"icons.data.css",
			"icons.data.png.css",
			"icons.fallback.css"
		],

		// Thanks Modernizr & Erik Dahlstrom
		svg = !!w.document.createElementNS && !!w.document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,

		loadCSS = function( data ){
			var link = w.document.createElement( "link" ),
				ref = w.document.getElementsByTagName( "script" )[ 0 ];
			link.rel = "stylesheet";
			link.href = css[ data && svg ? 0 : data ? 1 : 2 ];
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
}( this ));