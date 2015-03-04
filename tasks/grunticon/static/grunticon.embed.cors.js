/*global grunticon:true*/
(function(grunticon, window){
	"use strict";
	var document = window.document;

	// x-domain get (with cors if available)
	var ajaxGet = function( url, cb ) {
		var xhr = new window.XMLHttpRequest();
		if ( "withCredentials" in xhr ) {
			xhr.open( "GET", url, true );
		} else if ( typeof window.XDomainRequest !== "undefined" ) { //IE
			xhr = new window.XDomainRequest();
			xhr.open( "GET", url );
		}
		if( cb ){
			xhr.onload = cb;
		}
		xhr.send();
		return xhr;
	};

	var svgLoadedCORSCallback = function(callback){
		if( grunticon.method !== "svg" ){
			return;
		}
		grunticon.ready(function(){
			ajaxGet( grunticon.href, function() {
				var style = document.createElement( "style" );
				style.innerHTML = this.responseText;
				var ref = grunticon.getCSS( grunticon.href );
				if( ref ){
					ref.parentNode.insertBefore( style, ref );
					ref.parentNode.removeChild( ref );
					grunticon.embedIcons( grunticon.getIcons( style ) );
					if( typeof callback === "function" ){
						callback();
					}
				}
			} );
		});
	};

	grunticon.ajaxGet = ajaxGet;
	grunticon.svgLoadedCORSCallback = svgLoadedCORSCallback; //TODO: Deprecated
	grunticon.embedSVGCors = svgLoadedCORSCallback;

}(grunticon, this));
