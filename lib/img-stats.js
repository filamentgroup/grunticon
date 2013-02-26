/*! img-stats - v0.1.0 - 2013-02-26
* https://github.com/jlembeck/img-stats
* Copyright (c) 2013 Jeffrey Lembeck; Licensed MIT */

/*global require:true, console:true*/

(function(exports) {
  var fs = require( 'fs' );

  var isPng = function( data ){
    var d = data.slice(0, 16);
    return d === "89504e470d0a1a0a";
  };

  var padHexStringToTwoDigits = function( num ) {
    return ( num.length === 1 ? "0" : "" ) + num;
  };

  exports.stats = function( filename , callback ) {
    var ret = {};
    if( !filename ){ throw new Error("Needs a filename"); }

    var data,
      hexData = [],
      hexString = "";

    if( fs.readFileSync ) {
      data = fs.readFileSync( filename );
      hexString = data.toString( "hex" );
    } else {
      // PhantomJS compatible
      data = fs.open( filename, "r+b" ).read();
      for(var j=0, k=data.length; j<k; j++) {
        hexData.push( padHexStringToTwoDigits( data.charCodeAt(j).toString(16) ));
      }
      hexString = hexData.join("");
    }

    if( isPng( hexString ) ){
      var i = 16,
        l;
      for( l = hexString.length; i < l; i++ ){
        var d = hexString.slice(i, i+8);
        if( d === "49484452" ){
          i = i+8;
          break;
        }
      }

      ret.width = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );
      i = i+8;
      ret.height = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );

      callback( { width: ret.width, height: ret.height } );
    }
  };

}(typeof exports === 'object' && exports || this));
