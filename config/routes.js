module.exports = function ( map ){
  map.resources( 'posts' );
  map.resources( 'users' );
  map.get( '/','welcome#index' );
};