module.exports = function ( map ){

  map.get( 'users', 'users#index' );
  map.get( 'users/:id', 'users#show' );

  map.get( 'posts/tag', 'posts#tag' );
  map.get( 'posts/tags', 'posts#tags' );
  map.post( 'posts/:id/comments', 'comments#create' );

  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/trending', 'posts#trending' );
  map.get( 'posts/unsolved', 'posts#unsolved' );
  map.resources( 'posts' );

  map.get( '/','welcome#index' );

};