module.exports = function ( map ){
  map.resources( 'users' );
  map.get( '/','welcome#index' );
};