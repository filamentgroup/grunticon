;(function(window){
/*!
loadCSS: load a CSS file asynchronously.
[c]2014 @scottjehl, Filament Group, Inc.
Licensed MIT
*/
function loadCSS( href, before, media, callback ){
	"use strict";
	// Arguments explained:
	// `href` is the URL for your CSS file.
	// `before` optionally defines the element we'll use as a reference for injecting our <link>
	// By default, `before` uses the first <script> element in the page.
	// However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
	// If so, pass a different reference element to the `before` argument and it'll insert before that instead
	// note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
	var ss = window.document.createElement( "link" );
	var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
	var sheets = window.document.styleSheets;
	ss.rel = "stylesheet";
	ss.href = href;
	// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
	ss.media = "only x";
	// DEPRECATED
	if( callback ) {
		ss.onload = callback;
	}

	// inject link
	ref.parentNode.insertBefore( ss, ref );
	// This function sets the link's media back to `all` so that the stylesheet applies once it loads
	// It is designed to poll until document.styleSheets includes the new sheet.
	ss.onloadcssdefined = function( cb ){
		var defined;
		for( var i = 0; i < sheets.length; i++ ){
			if( sheets[ i ].href && sheets[ i ].href.indexOf( href ) > -1 ){
				defined = true;
			}
		}
		if( defined ){
			cb();
		}
		else {
			setTimeout(function() {
				ss.onloadcssdefined( cb );
			});
		}
	};
	ss.onloadcssdefined(function() {
		ss.media = media || "all";
	});
	return ss;
}
/*!
onloadCSS: adds onload support for asynchronous stylesheets loaded with loadCSS.
[c]2014 @zachleat, Filament Group, Inc.
Licensed MIT
*/
function onloadCSS( ss, callback ) {
	ss.onload = function() {
		ss.onload = null;
		if( callback ) {
			callback.call( ss );
		}
	};

	// This code is for browsers that don’t support onload, any browser that
	// supports onload should use that instead.
	// No support for onload:
	//	* Android 4.3 (Samsung Galaxy S4, Browserstack)
	//	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
	//	* Android 2.3 (Pantech Burst P9070)

	// Weak inference targets Android < 4.4
	if( "isApplicationInstalled" in navigator && "onloadcssdefined" in ss ) {
		ss.onloadcssdefined( callback );
	}
}
var grunticon = function( css, onload ){
	"use strict";
	// expects a css array with 3 items representing CSS paths to datasvg, datapng, urlpng
	if( !css || css.length !== 3 ){
		return;
	}

	var Image = window.Image;

	// Thanks Modernizr & Erik Dahlstrom
	var svg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect && !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") && !(window.opera && navigator.userAgent.indexOf('Chrome') === -1) && navigator.userAgent.indexOf('Series40') === -1;

	var img = new Image();

	img.onerror = function(){
		grunticon.method = "png";
		grunticon.href = css[2];
		loadCSS( css[2] );
	};

	img.onload = function(){
		var data = img.width === 1 && img.height === 1,
			href = css[ data && svg ? 0 : data ? 1 : 2 ];

		if( data && svg ){
			grunticon.method = "svg";
		} else if( data ){
			grunticon.method = "datapng";
		} else {
			grunticon.method = "png";
		}

		grunticon.href = href;
		onloadCSS( loadCSS( href ), onload );
	};

	img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
	document.documentElement.className += " grunticon";
};
grunticon.loadCSS = loadCSS;
grunticon.onloadCSS = onloadCSS;
window.grunticon = grunticon;
}(this));