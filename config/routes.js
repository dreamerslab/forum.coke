module.exports = function ( map ){

  map.get( 'logout', 'auth#logout' );
  map.get( 'auth/google', 'auth#google' );
  map.get( 'auth/callback', 'auth#callback' );

  map.get( 'users', 'users#index' );
  map.get( 'users/:id', 'users#show' );

  map.get( 'posts/search', 'posts#search' );
  map.get( 'posts/tag', 'posts#tag' );
  map.get( 'posts/tags', 'posts#tags' );
  map.post( 'posts/:id/comments', 'comments#create' );

  map.get( 'posts', 'posts#latest' );
  map.get( 'posts/index', 'posts#latest' );
  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/trending', 'posts#trending' );
  map.get( 'posts/unsolved', 'posts#unsolved' );
  map.resources( 'posts' );

  map.get( '/','welcome#index' );

};