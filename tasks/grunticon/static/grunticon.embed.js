/*global grunticon:true*/
(function(grunticon, window){
	"use strict";
	var document = window.document;
	var selectorPlaceholder = "grunticon:";

	var ready = function( fn ){
		// If DOM is already ready at exec time, depends on the browser.
		// From: https://github.com/mobify/mobifyjs/blob/526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
		if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
			fn();
		} else {
			var created = false;
			document.addEventListener("readystatechange", function() {
				if (!created) {
					created = true;
					fn();
				}
			}, false);
		}
	};

	// this function can rip the svg markup from the css so we can embed it anywhere
	var getIcons = function(svgcss){
		// get grunticon stylesheet by its href
		var icons = {},
			allss = document.styleSheets,
			svgss, rules, cssText,
			iconClass, iconSVGEncoded, iconSVGRaw;

		for( var i = 0; i < allss.length; i++ ){
			if( allss[ i ].href && allss[ i ].href.indexOf( svgcss ) > -1 ){
				svgss = allss[ i ];
				break;
			}
		}

		if( !svgss ){ return icons; }

		rules = svgss.cssRules ? svgss.cssRules : svgss.rules;
		for( i = 0; i < rules.length; i++ ){
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
		ready(function(){
			embedIcons(getIcons(grunticon.href));
		});
	};

	grunticon.embedIcons = embedIcons;
	grunticon.getIcons = getIcons;
	grunticon.ready = ready;
	grunticon.svgLoadedCallback = svgLoadedCallback;

}(grunticon, this));
