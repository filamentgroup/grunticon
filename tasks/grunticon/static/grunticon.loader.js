window.grunticon = function( css, foo ){
	// expects a css array with 3 items representing CSS paths to datasvg, datapng, urlpng
	if( !css || css.length !== 3 ){
		return;
	}

	// Thanks Modernizr & Erik Dahlstrom
	var w = window,
		svg = !!w.document.createElementNS && !!w.document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect && !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") && !(window.opera && navigator.userAgent.indexOf('Chrome') === -1) && navigator.userAgent.indexOf('Series40') === -1,
		icons = {},
		/*! loadCSS: borrowed from https://github.com/filamentgroup/loadCSS */
		loadCSS = function( data ){
			var link = w.document.createElement( "link" ),
				ref = w.document.getElementsByTagName( "script" )[ 0 ];
			link.rel = "stylesheet";
			link.href = css[ data && svg ? 0 : data ? 1 : 2 ];
			// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
			link.media = "only x";
			// NOTE: link onload approach will need to be cross-browser.  Check how onload lines up with svg support
			if( svg ){
				link.onload = function(){
					icons = getIcons();
					bindSVGDomReady();
				};
			}
			ref.parentNode.insertBefore( link, ref );
			// set media back to `all` so that the styleshet applies once it loads
			setTimeout( function(){
				link.media = "all";
			} );
		},

		// this function can rip the svg markup from the css so we can embed it anywhere
		getIcons = function(){
			// get grunticon stylesheet by its href
			var allss = w.document.styleSheets;
			var svgcss = "icons.data.svg.css";
			var svgss;
			for( var i = 0; i < allss.length; i++ ){
				if( allss[ i ].href && allss[ i ].href.indexOf( svgcss ) > -1 ){
					svgss = allss[ i ];
					break;
				}
			}

			if( svgss ){
				var icons = {};
				var rules = svgss.rules; //cssRules better?
				for( i = 0; i < rules.length; i++ ){
					var cssText = rules[ i ].cssText;
					var iconSelector = cssText.split( "{" )[ 0 ].split( "," ).pop();
					var iconClass = iconSelector.replace( ".", "" ).trim();
					var iconSVGEncoded = cssText.match( /US\-ASCII,([^']+)/ );
					if( iconSVGEncoded && iconSVGEncoded[ 1 ] ){
						var iconSVGRaw = unescape( iconSVGEncoded[ 1 ] );
						icons[ iconClass ] = iconSVGRaw;
					}
				}
				return icons;
			}
		},

		// attr to specify svg embedding
		embedAttr = "data-grunticon-embed",

		// embed an icon of a particular name ("icon-foo") in all elements with that icon class
		// and remove its background image
		embedIcons = function(){
			for( var iconName in icons ){
				var embedElems = w.document.querySelectorAll( "." + iconName + "[" + embedAttr + "]" );
				for( var i = 0; i < embedElems.length; i++ ){
					embedElems[ i ].innerHTML = icons[ iconName ];
					embedElems[ i ].style.backgroundImage = "none";
				}
			}
		},

		bindSVGDomReady = function(){
			if( w.document.readyState === "complete" ){
				embedIcons();
			}
			else {
				w.document.addEventListener( "DOMContentLoaded", embedIcons );
			}
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
// Call grunticon() here to load CSS:
