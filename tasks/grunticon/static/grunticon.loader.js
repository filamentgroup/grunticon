(function(window){
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
				if( data && svg ){
					link.onload = function(){
						icons = getIcons();
						ready( embedIcons );
						ready( useIcons );
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
				var svgcss = css[ 0 ];
				var svgss;
				for( var i = 0; i < allss.length; i++ ){
					if( allss[ i ].href && allss[ i ].href.indexOf( svgcss ) > -1 ){
						svgss = allss[ i ];
						break;
					}
				}

				if( svgss ){
					var icons = {};
					var rules = svgss.cssRules ? svgss.cssRules : svgss.rules;
					for( i = 0; i < rules.length; i++ ){
						var cssText = rules[ i ].cssText;
						var iconSelector = cssText.split( "{" )[ 0 ].split( "," ).pop();
						var iconClass = iconSelector.replace( ".", "" ).trim();
						var iconSVGEncoded = cssText.split( ");" )[ 0 ].match( /US\-ASCII\,([^"']+)/ );
						if( iconSVGEncoded && iconSVGEncoded[ 1 ] ){
							var iconSVGRaw = decodeURIComponent( iconSVGEncoded[ 1 ] );
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
					if( embedElems.length ){
						for( var i = 0; i < embedElems.length; i++ ){
							embedElems[ i ].innerHTML = icons[ iconName ];
							embedElems[ i ].style.backgroundImage = "none";
							embedElems[ i ].removeAttribute( embedAttr );
						}
					}
				}
			},

			// attr to specify svg embedding
			useAttr = "data-grunticon-use",

			useContainer = w.document.createElement( "div" ),
			defs = [],

			// create a <defs> template for an icon of a particular name ("icon-foo") and reference that def in all elements with that icon class through a <use> element
			// and remove its background image
			useIcons = function(){
				for( var iconName in icons ){
					//template first
					var useElems = w.document.querySelectorAll( "." + iconName + "[" + useAttr + "]" );
					if( useElems.length ){
						// if useTemplate isn't already in the page, insert it
						if( !useContainer.parentNode ){
							useContainer.className = "grunticon-template";
							useContainer.style.display = "none";
							w.document.body.insertBefore( useContainer, w.document.body.firstChild );
						}
						if( !w.document.getElementById( iconName ) ){
							//var svgvb = symbol.firstChild.getAttribute( "viewBox" );
							//symbol.setAttribute( "viewBox", svgvb );
							//symbol.viewBox = svgvb;
							var vb = icons[ iconName ].match( /viewBox="([^"]+)/mi ) && RegExp.$1;
							var strippedSVG = icons[ iconName ].replace( /<\/?svg[^>]*>/gmi, "" );
							// NOTE: viewBox must be defined in the source SVG file for this to work
							defs.push( "<symbol id='" + iconName + "' viewBox='" + ( vb || "" ) + "'>" + strippedSVG + "</symbol>" );
						}
						var use = "<svg><use xlink:href='#" + iconName + "'></use></svg>";
						var useTemp = w.document.createElement( "div" );
						for( var i = 0; i < useElems.length; i++ ){
							useElems[ i ].innerHTML = use;
							useElems[ i ].style.backgroundImage = "none";
							useElems[ i ].removeAttribute( useAttr );
						}
					}
				}
				useContainer.innerHTML = "<svg><defs>" + defs.join( "" ) + "</defs></svg>";
			},

			ready = function( fn ){
				var ran = false;
				function callback(){
					if( !ran ){
						fn();
					}
					ran = true;
				}
				// If DOM is already ready at exec time, depends on the browser.
				// From: https://github.com/mobify/mobifyjs/blob/526841be5509e28fc949038021799e4223479f8d/src/capture.js#L128
				if ( w.document.readyState !== "loading" ) {
					fn();
				} else if( w.document.addEventListener ){
					w.document.addEventListener( "DOMContentLoaded", fn, false );
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
}(window));
// Call grunticon() here to load CSS:
