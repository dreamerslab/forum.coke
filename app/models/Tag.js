var Tag = require( BASE_DIR + 'db/schema' ).Tag;


Tag.statics = {
  extract_names : function ( string ){
    if( {}.toString.call( string ) !== '[object String]' || string === '' ){
      return [];
    }else{
      var candidates = string.split( /\s*[,|;]\s*/ ).slice( 0, 5 );
      var names      = [];

      candidates.forEach( function ( name ){
        name = name.toLowerCase();
        if( names.indexOf( name ) === -1 && name.length < 20 ){
          names.push( name );
        }
      });
      return names;
    }
  }
};

require( 'mongoose' ).model( 'Tag', Tag );