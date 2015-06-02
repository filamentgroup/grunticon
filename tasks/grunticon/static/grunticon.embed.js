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
	var getCSS = function( href ){
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
		var selectedElems, filteredElems, embedAttr, selector;

		// attr to specify svg embedding
		embedAttr = "data-grunticon-embed";

		for( var iconName in icons ){
			selector = iconName.slice(selectorPlaceholder.length);

			try {
				// get ALL of the elements matching the selector
				selectedElems = document.querySelectorAll( selector );
			} catch (er) {
				// continue further with embeds even though it failed for this icon
				continue;
			}


			filteredElems = [];

			// keep only those elements with the embed attribute
			for( var i = 0; i < selectedElems.length; i++ ){
				if( selectedElems[i].getAttribute( embedAttr ) !== null ){
					filteredElems.push(selectedElems[i]);
				}
			}

			// continue if there are no elements left after filtering
			if( !filteredElems.length ){ continue; }

			// for all the elements matching the selector with the embed attribute
			// take the svg markup and embed it into the selected elements
			for( i = 0; i < filteredElems.length; i++ ){
				filteredElems[ i ].innerHTML = icons[ iconName ];
				filteredElems[ i ].style.backgroundImage = "none";
				filteredElems[ i ].removeAttribute( embedAttr );
			}
		}

		return filteredElems;
	};

	var svgLoadedCallback = function(callback){
		if( grunticon.method !== "svg" ){
			return;
		}
		ready(function(){
			embedIcons( getIcons( getCSS( grunticon.href ) ) );
			if( typeof callback === "function" ){
				callback();
			}
		});
	};

	grunticon.embedIcons = embedIcons;
	grunticon.getCSS = getCSS;
	grunticon.getIcons = getIcons;
	grunticon.ready = ready;
	grunticon.svgLoadedCallback = svgLoadedCallback; //TODO DEPRECATED
	grunticon.embedSVG = svgLoadedCallback;

}(grunticon, this));
