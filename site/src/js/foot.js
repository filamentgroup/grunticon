// animate the plus icon
if( document.querySelector ){
	var toggle = document.querySelector(".icon-lamp-blink");
	var toggleClass = " on";
	if( toggle ){
		toggle.addEventListener( "click", function( e ){
			if( this.className.indexOf( toggleClass ) > -1 ){
				this.className = this.className.replace( toggleClass, "" );
			}
			else {
				this.className += toggleClass;
			}
			e.preventDefault();
		});
	}
}

/*! fontfaceonload - v0.1.3 - 2014-12-22
* https://github.com/zachleat/fontfaceonload
* Copyright (c) 2014 Zach Leatherman (@zachleat)
* MIT License */(function(e,t){"use strict";var n=100,r="AxmTYklsjo190QW",i=2,s="sans-serif",o="serif",u=["display:block","position:absolute","top:-999px","left:-999px","font-size:300px","width:auto","height:auto","line-height:normal","margin:0","padding:0","font-variant:normal","white-space:nowrap","font-family:%s"].join(";"),a='<div style="'+u+'">'+r+"</div>",f=function(){this.appended=!1,this.dimensions=undefined,this.serif=undefined,this.sansSerif=undefined,this.parent=undefined};f.prototype.initialMeasurements=function(e){var t=this.sansSerif,n=this.serif;this.dimensions={sansSerif:{width:t.offsetWidth,height:t.offsetHeight},serif:{width:n.offsetWidth,height:n.offsetHeight}},t.style.fontFamily=e+", "+s,n.style.fontFamily=e+", "+o},f.prototype.load=function(e,r){var u=new Date,f=this,l=f.serif,c=f.sansSerif,h=f.parent,p=f.appended,d=f.dimensions,v=r.tolerance||i,m=r.delay||n;h||(h=f.parent=t.createElement("div")),h.innerHTML=a.replace(/\%s/,s)+a.replace(/\%s/,o),c=f.sansSerif=h.firstChild,l=f.serif=c.nextSibling,r.glyphs&&(c.innerHTML+=r.glyphs,l.innerHTML+=r.glyphs),function g(){!p&&t.body&&(p=f.appended=!0,t.body.appendChild(h),f.initialMeasurements(e)),d=f.dimensions,p&&d&&(Math.abs(d.sansSerif.width-c.offsetWidth)>v||Math.abs(d.sansSerif.height-c.offsetHeight)>v||Math.abs(d.serif.width-l.offsetWidth)>v||Math.abs(d.serif.height-l.offsetHeight)>v)?r.success():(new Date).getTime()-u.getTime()>r.timeout?r.error():setTimeout(function(){g()},m)}()},f.prototype.init=function(n,r){var i=this,s={glyphs:"",success:function(){},error:function(){},timeout:1e4},o;r||(r={});for(var u in s)r.hasOwnProperty(u)||(r[u]=s[u]);!r.glyphs&&"fonts"in t?(t.fonts.load("1em "+n).then(function(){r.success(),e.clearTimeout(o)}),r.timeout&&(o=e.setTimeout(function(){r.error()},r.timeout))):i.load(n,r)};var l=function(e,t){var n=new f;return n.init(e,t),n};e.FontFaceOnload=l})(this,this.document);

FontFaceOnload( "Arvo", { success: function(){
	window.document.documentElement.className += " font-arvo";
}, delay: 150 });

FontFaceOnload( "Pacifico", { success: function(){
	window.document.documentElement.className += " font-pacifico";
}, delay: 150 });
