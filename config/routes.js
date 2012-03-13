module.exports = function ( map ){

  map.get( 'users', 'users#index' );

  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/trending', 'posts#trending' );
  map.get( 'posts/unsolved', 'posts#unsolved' );
  map.resources( 'posts' );

  map.get( '/','welcome#index' );

};