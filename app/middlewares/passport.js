var passport = require( 'passport' );
var Strategy = require( 'passport-google-oauth' ).OAuth2Strategy;
var User     = Model( 'User' );

var config = CONF.passport;

passport.serializeUser( function( user, next ){
  var id = user.id ?
    user.id : user.google_id;

  next( null, id );
});

passport.deserializeUser( function ( id, next ){
  User.findOne({
    google_id : id
  }, function ( err, user ){
    if( user ) return next( null, user );

    next( null, id );
  });
});

passport.use( new Strategy({
  clientID     : config.google_client_id,
  clientSecret : config.google_client_secret,
  callbackURL  : config.callback_url
}, function ( accessToken, refreshToken, profile, next ){
  process.nextTick( function () {
    return next( null, profile );
  });
}));

module.exports = function (){
  return function ( req, res, next ){
    passport.initialize()( req, res, function (){
      passport.session()( req, res, next );
    });
  };
};