(function(window){
	"use strict";

	var document = window.document,
		navigator = window.navigator,
		Image = window.Image;
	
	var selectorPlaceholder = "grunticon:";

	// Thanks Modernizr & Erik Dahlstrom
	var svg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect && !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") && !(window.opera && navigator.userAgent.indexOf('Chrome') === -1) && navigator.userAgent.indexOf('Series40') === -1;

	var ready = function( fn ){
		var ran = false;
		function callback(){
			if( !ran ){
				fn();
			}
			ran = true;
		}
		// If DOM is already ready at exec time, depends on the browser.
		// From: https://github.com/mobify/mobifyjs/blob/526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
		if ( document.readyState !== "loading" ) {
			fn();
		} else if( document.addEventListener ){
			document.addEventListener( "DOMContentLoaded", fn, false );
		}
	};

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

	// this function can rip the svg markup from the css so we can embed it anywhere
	var getIcons = function(svgcss){
		// get grunticon stylesheet by its href
		var icons = {};
		var allss = document.styleSheets;
		var svgss;
		for( var i = 0; i < allss.length; i++ ){
			if( allss[ i ].href && allss[ i ].href.indexOf( svgcss ) > -1 ){
				svgss = allss[ i ];
				break;
			}
		}

		if( !svgss ){ return icons; }

		var rules = svgss.cssRules ? svgss.cssRules : svgss.rules;
		for( i = 0; i < rules.length; i++ ){
			var cssText = rules[ i ].cssText;
			var iconSelector = rules[ i ].selectorText;
			var iconClass = selectorPlaceholder + iconSelector;
			var iconSVGEncoded = cssText.split( ");" )[ 0 ].match( /US\-ASCII\,([^"']+)/ );
			if( iconSVGEncoded && iconSVGEncoded[ 1 ] ){
				var iconSVGRaw = decodeURIComponent( iconSVGEncoded[ 1 ] );
				icons[ iconClass ] = iconSVGRaw;

			}
		}
		return icons;
	};
	// embed an icon of a particular name ("icon-foo") in all elements with that icon class
	// and remove its background image
	var embedIcons = function(icons){
		var embedElems;

		// attr to specify svg embedding
		var embedAttr = "data-grunticon-embed";

		for( var iconName in icons ){
			var selector = iconName.slice(selectorPlaceholder.length);
			embedElems = document.querySelectorAll( selector + "[" + embedAttr + "]" );
			if( !embedElems.length ){ continue; }

			for( var i = 0; i < embedElems.length; i++ ){
				embedElems[ i ].innerHTML = icons[ iconName ];
				embedElems[ i ].style.backgroundImage = "none";
				embedElems[ i ].removeAttribute( embedAttr );
			}
		}
		return embedElems;
	};

	var grunticon = function( css, foo ){
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
				href = css[ data && svg ? 0 : data ? 1 : 2 ],
				onload, icons;


			if( data && svg ){
				grunticon.method = "svg";
				onload = function(){
					icons = getIcons(href);
					ready( function(){
						embedIcons(icons);
					} );
				};
			} else if( data ){
				grunticon.method = "datapng";
			} else {
				grunticon.method = "png";
			}

			loadCSS( href, onload );
		};

		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		document.documentElement.className = document.documentElement.className + " grunticon";
	};

	grunticon.embedIcons = embedIcons;
	grunticon.getIcons = getIcons;
	grunticon.loadCSS = loadCSS;
	window.grunticon = grunticon;
}(window));
// Call grunticon() here to load CSS:
