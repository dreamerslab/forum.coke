module.exports = function ( map ){
  map.root( 'topics#index' );
  map.get( 'topics/trending', 'topics#trending' );
  map.get( 'topics/unsolved', 'topics#unsolved' );
  map.get( 'topics/search', 'topics#search' );
  map.resources( 'topics', function ( topic ){
    topic.resources( 'comments', {
      only : [ 'create', 'destroy' ]
    });
  });

  map.get( 'tags', 'tags#index' );
  map.get( 'tags/:name/topics', 'tag_topics#index' );

  map.resources( 'users', {
    only : [ 'index', 'show' ]
  }, function ( user ){
    user.get( 'topics', 'users#topics' );
    user.get( 'replies', 'users#replies' );
  });

  map.get( 'notifications', 'notifications#index' );

  map.get( 'auth/google', 'auth#google' );
  map.get( 'auth/callback', 'auth#callback' );
  map.get( 'logout', 'auth#logout' );
};


