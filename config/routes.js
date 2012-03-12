module.exports = function ( map ){

  // root or home
  map.root( 'welcome#index' );

  // auth controller
  map.get( 'auth/signout', 'auth#signout' );
  map.get( 'auth/google', 'auth#google' );
  map.get( 'auth/callback', 'auth#callback' );

  // users controller
  map.resources( 'users' );

  // notifications controller
  // map.resources( 'notifications' );

  // posts and comments controller
  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/trending', 'posts#trending' );
  map.get( 'posts/unsolved', 'posts#unsolved' );
  map.get( 'posts/search', 'posts#search' );
  map.get( 'posts/tag', 'posts#tag' );
  map.resources( 'posts', function (post){
    post.resources( "comments" );
  });

  // tags controller
  map.get( 'tags', "tags#index" );

};