module.exports = function ( map ){
  map.get( 'posts/latest', 'posts#latest' );
  map.get( 'posts/hottest', 'posts#hottest' );
  map.get( 'posts/unsolved', 'posts#unsolved' );
  map.resources( 'posts' );
  map.resources( 'users' );
  map.get( '/','welcome#index' );
};