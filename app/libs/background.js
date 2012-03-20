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
      console.log( 'end of background' );
    });
  }
}
