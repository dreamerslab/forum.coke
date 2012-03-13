module.exports = function ( map ){

  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/trending', 'posts#trending' );
  map.resources( 'posts' );

  map.get( '/','welcome#index' );
};