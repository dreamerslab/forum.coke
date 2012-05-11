module.exports = function ( map ){

  map.get( 'logout', 'auth#logout' );
  map.get( 'auth/google', 'auth#google' );
  map.get( 'auth/callback', 'auth#callback' );

  map.get( 'notifications', 'notifications#index' );

  map.resources( 'users', { only : [ 'index', 'show' ]}, function ( user ){
    user.get( 'topics', 'users#topics' );
    user.get( 'replies', 'users#replies' );
  });

  map.get( 'topics/search', 'topics#search' );
  map.get( 'topics/tag', 'topics#tag' );
  map.get( 'topics/tags', 'topics#tags' );

  map.get( 'topics', 'topics#latest' );
  map.get( 'topics/index', 'topics#latest' );
  map.get( 'topics/latest', 'topics#latest' );
  map.get( 'topics/trending', 'topics#trending' );
  map.get( 'topics/unsolved', 'topics#unsolved' );
  map.resources( 'topics', function ( topic ){
    topic.resources( 'comments', { only : [ 'create', 'destroy' ]});
  });

  map.get( '/','topics#latest' );
};


