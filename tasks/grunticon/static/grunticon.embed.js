/*global grunticon:true*/
(function(grunticon, window){
	"use strict";
	var document = window.document;
	var selectorPlaceholder = "grunticon:";

	var ready = function( fn ){
		// If DOM is already ready at exec time, depends on the browser.
		// From: https://github.com/mobify/mobifyjs/blob/526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
		if ( document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
			fn();
		} else {
			var created = false;
			document.addEventListener( "readystatechange", function() {
				if (!created) {
					created = true;
					fn();
				}
			}, false);
		}
	};

	// get the SVG link
	var getSVGCSS = function( href ){
		return window.document.querySelector( 'link[href$="'+ href +'"]' );
	};

	// this function can rip the svg markup from the css so we can embed it anywhere
	var getIcons = function(stylesheet){
		// get grunticon stylesheet by its href
		var icons = {},
			svgss,
			rules, cssText,
			iconClass, iconSVGEncoded, iconSVGRaw;

		svgss = stylesheet.sheet;

		if( !svgss ){ return icons; }

		rules = svgss.cssRules ? svgss.cssRules : svgss.rules;
		for( var i = 0; i < rules.length; i++ ){
			cssText = rules[ i ].cssText;
			iconClass = selectorPlaceholder + rules[ i ].selectorText;
			iconSVGEncoded = cssText.split( ");" )[ 0 ].match( /US\-ASCII\,([^"']+)/ );
			if( iconSVGEncoded && iconSVGEncoded[ 1 ] ){
				iconSVGRaw = decodeURIComponent( iconSVGEncoded[ 1 ] );
				icons[ iconClass ] = iconSVGRaw;

			}
		}
		return icons;
	};

	// embed an icon of a particular name ("icon-foo") in all elements with that icon class
	// and remove its background image
	var embedIcons = function(icons){
		var embedElems, embedAttr, selector;

		// attr to specify svg embedding
		embedAttr = "data-grunticon-embed";

		for( var iconName in icons ){
			selector = iconName.slice(selectorPlaceholder.length);
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

	var svgLoadedCallback = function(){
		if( grunticon.method !== "svg" ){
			return;
		}
		ready(function(){
			embedIcons( getIcons( getSVGCSS( grunticon.href ) ) );
		});
	};

	// x-domain get (with cors if available)
	var ajaxGet = function( url ) {
		var xhr = new window.XMLHttpRequest();
		if ( "withCredentials" in xhr ) {
			xhr.open( "GET", url, true );
		} else if ( typeof window.XDomainRequest !== "undefined" ) { //IE
			xhr = new window.XDomainRequest();
			xhr.open( "GET", url );
		} else {
			xhr = null;
		}
		return xhr;
	};

	var svgLoadedCORSCallback = function(){
		if( grunticon.method !== "svg" ){
			return;
		}
		ready(function(){
			var xhr = ajaxGet( grunticon.href );
			if ( !xhr ){ return; }
			xhr.onload = function() {
				var style = document.createElement( "style" );
				style.innerHTML = xhr.responseText;
				var ref = grunticon.getSVGCSS();
				ref.parentNode.insertBefore( style, ref );
				ref.parentNode.removeChild( ref );
				embedIcons( getIcons( style ) );
			};
			xhr.send();
		});
	};

	grunticon.embedIcons = embedIcons;
	grunticon.getSVGCSS = getSVGCSS;
	grunticon.getIcons = getIcons;
	grunticon.ready = ready;
	grunticon.ajaxGet = ajaxGet;
	grunticon.svgLoadedCallback = svgLoadedCallback;
	grunticon.svgLoadedCORSCallback = svgLoadedCORSCallback;

}(grunticon, this));
