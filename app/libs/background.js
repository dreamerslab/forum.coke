var Flow    = require( 'node.flow' );
var seed    = require( './seed' );
var sidebar = require( './sidebar' );
var flow    = new Flow();


module.exports = {
  init : function (){
    flow.series( function ( next ){
      seed.init( next );
    });

    flow.series( function ( next ){
      sidebar.init( next );
    })

    flow.end( function(){
      setInterval( sidebar.init, 3600 * 1000 );
      console.log( 'end of background' );
    });
  }
}
