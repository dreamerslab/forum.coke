module.exports = function ( User ){
  User.virtual( 'avatar' ).get( function (){
    return UTILS.is( this.picture ) === 'string' ?
      this.picture :
      'http://www.gravatar.com/avatar/00000000000000000000000000000000';
  });
};