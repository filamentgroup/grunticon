/* Unicon. Asynchronous Stylesheet Loader Function */
(function(w){
	/* Unicon. Asynchronous Stylesheet Loader Function */
	var loadCSS = function( href ){
			var link = w.document.createElement( "link" ),
				ref = w.document.getElementsByTagName( "script" );
			link.rel = "stylesheet";
			link.href = href;
			ref[ 0 ].parentNode.insertBefore(link, ref[ 0 ] );
		},
		dE = w.document.documentElement,
		css = [ "icons.data.css", "icons.data.png.css", "icons.fallback.css" ],
		formats = [
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIycHgiIGhlaWdodD0iMXB4Ij48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyIi8+PC9zdmc+",
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABFJREFUCJljYGBg+M/AwMAAAAUEAQCUPjtCAAAAAElFTkSuQmCC"],
		i = 0,
		checkSupport = function(){
			if( formats[ i ] ){
				var img = new Image();
				img.src = formats[ i ];
				dE.insertBefore( img, dE.firstChild );
				img.onload = function(){
					if( img.offsetWidth === 2 ){
						loadCSS( css[ i ] );
					}
					else{
						i++;
						isSupported();
					}
					dE.removeChild( img );
				}
			}
			else{
				loadCSS( css[ i ] );
			}
		};

		checkSupport();
}(this));