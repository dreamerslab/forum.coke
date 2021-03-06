var Flow    = require( 'node.flow' );
var rater   = require( './rater' );
var sidebar = require( './sidebar' );
var flow    = new Flow();

module.exports = {

  init : function ( express, app ){

    flow.series( function ( next ){
      if( NODE_ENV === 'dev' ){
        var seed = require( './seed' );

        seed.init( next );
      }
    });

    flow.series( function ( next ){
      rater.init( next );
    });

    flow.series( function ( next ){
      sidebar.init( next );
    });

    flow.end( function(){
      setInterval( rater.init, 3600 * 1000 );
      setInterval( sidebar.init, 3600 * 1000 );

      LOG.debug( 'All background job finished' );
    });
  }
};


