// call grunticon
var cb = function(){
	grunticon.svgLoadedCallback();
	if( grunticon.method ){
		window.document.documentElement.className += " grunticon-" + grunticon.method;
	}
};
grunticon(["grunticon/icons.data.svg.css", "grunticon/icons.data.png.css", "grunticon/icons.fallback.css"], cb );