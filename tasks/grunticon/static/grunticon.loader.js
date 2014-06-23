window.grunticon = function( css, foo ){
	// expects a css array with 3 items representing CSS paths to datasvg, datapng, urlpng
	if( !css || css.length !== 3 ){
		return;
	}

	// Thanks Modernizr & Erik Dahlstrom
	var w = window,
		svg = !!w.document.createElementNS && !!w.document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect && !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") && !(window.opera && navigator.userAgent.indexOf('Chrome') === -1),
		/*! loadCSS: borrowed from https://github.com/filamentgroup/loadCSS */
		loadCSS = function( data ){
			var link = w.document.createElement( "link" ),
				ref = w.document.getElementsByTagName( "script" )[ 0 ];
			link.rel = "stylesheet";
			link.href = css[ data && svg ? 0 : data ? 1 : 2 ];
			// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
			link.media = "only x";
			ref.parentNode.insertBefore( link, ref );
			// set media back to `all` so that the styleshet applies once it loads
			setTimeout( function(){
				link.media = "all";
			} );
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
