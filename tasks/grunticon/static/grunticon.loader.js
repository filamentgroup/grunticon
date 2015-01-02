(function(window){
	"use strict";

	var document = window.document,
		navigator = window.navigator,
		Image = window.Image;

	// Thanks Modernizr & Erik Dahlstrom
	var svg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect && !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") && !(window.opera && navigator.userAgent.indexOf('Chrome') === -1) && navigator.userAgent.indexOf('Series40') === -1;

	/*! loadCSS: borrowed from https://github.com/filamentgroup/loadCSS */
	var loadCSS = function( href, onload ){
		onload = onload || function(){};

		var link = document.createElement( "link" ),
			ref = document.getElementsByTagName( "script" )[ 0 ];

		link.rel = "stylesheet";
		link.href = href;
		// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
		link.media = "only x";
		// NOTE: link onload approach will need to be cross-browser.  Check how onload lines up with svg support
		link.onload = onload;

		ref.parentNode.insertBefore( link, ref );
		window.setTimeout(function(){
			// set media back to `all` so that the styleshet applies once it loads
			link.media = "all";
		});
	};

	var grunticon = function( css, onload ){
		// expects a css array with 3 items representing CSS paths to datasvg, datapng, urlpng
		if( !css || css.length !== 3 ){
			return;
		}

		// Thanks Modernizr
		var img = new Image();

		img.onerror = function(){
			grunticon.method = "png";
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
			loadCSS( href, onload );
		};

		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		document.documentElement.className = document.documentElement.className + " grunticon";
	};

	grunticon.loadCSS = loadCSS;
	window.grunticon = grunticon;
}(this));
// Call grunticon() here to load CSS:
