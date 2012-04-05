module.exports = function ( map ){

  map.get( 'logout', 'auth#logout' );
  map.get( 'auth/google', 'auth#google' );
  map.get( 'auth/callback', 'auth#callback' );

  map.get( 'users', 'users#index' );
  map.get( 'users/:id', 'users#show' );

  map.get( 'topics/search', 'topics#search' );
  map.get( 'topics/tag', 'topics#tag' );
  map.get( 'topics/tags', 'topics#tags' );

  map.post( 'topics/:id/create-comment', 'topics#create_comment' );
  map.post( 'topics/:id/delete-comment', 'topics#destroy_comment' );

  map.get( 'topics', 'topics#latest' );
  map.get( 'topics/index', 'topics#latest' );
  map.get( 'topics/latest', 'topics#latest' );
  map.get( 'topics/trending', 'topics#trending' );
  map.get( 'topics/unsolved', 'topics#unsolved' );
  map.resources( 'topics' );

  map.get( '/','welcome#index' );

};