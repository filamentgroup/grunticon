(function( w ){
	w.asyncCSS = function( href ){
		var link = w.document.createElement( "link" ),
			ref = w.document.getElementsByTagName( "script" );
		link.rel = "stylesheet";
		link.href = href;

		ref[ 0 ].parentNode.insertBefore(link, ref[ 0 ] );
	};
}( this ));