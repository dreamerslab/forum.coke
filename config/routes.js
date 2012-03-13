module.exports = function ( map ){

  map.get( 'posts/latest', 'posts#latest' );
  map.resources( 'posts' );

  map.get( '/','welcome#index' );
};