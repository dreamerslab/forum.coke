module.exports = function ( map ){

  map.resources( 'posts' );

  map.get( '/','welcome#index' );
};