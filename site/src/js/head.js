// css transform support
function transformSupported() {
	var prefs = "transform WebkitTransform MozTransform OTransform msTransform".split(" ");
	for(var i = 0; i < prefs.length; i++) {
		if( window.document.documentElement.style[ prefs[ i ] ] !== undefined ) {
			return true;
		}
	}
	return false;
}

if( transformSupported() ){
	window.document.documentElement.className += " csstransform";
}

var cb = function(){
	grunticon.svgLoadedCallback();
	if( grunticon.method ){
		window.document.documentElement.className += " grunticon-" + grunticon.method;
	}
};
grunticon(["grunticon/icons.data.svg.css", "grunticon/icons.data.png.css", "grunticon/icons.fallback.css"], cb );