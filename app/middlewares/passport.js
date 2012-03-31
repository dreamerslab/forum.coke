var passport = require( 'passport' );
var Strategy = require( 'passport-google-oauth' ).OAuth2Strategy;
var User     = require( 'mongoose' ).model( 'User' );

var config = CONF.passport;

passport.serializeUser( function( user, done ){
  if( user.id ){
    done( null, user.id );
  }else{
    done( null, user.google_id );
  }
});

passport.deserializeUser( function ( id, done ){
  User.findOne({ google_id : id }, function ( err, user ){
    if( user ){
      done( null, user );
    }else{
      done( null, id );
    }
  });
});

passport.use( new Strategy({
    clientID     : config.google_client_id,
    clientSecret : config.google_client_secret,
    callbackURL  : config.callback_url
  }, function ( accessToken, refreshToken, profile, done ){
    process.nextTick( function () {
      return done( null, profile );
    });
  }
));

module.exports = function (){
  return function ( req, res, next ){
    passport.initialize()( req, res, function (){
      passport.session()( req, res, next );
    });
  };
};