var fs       = require( 'fs' );
var yaml     = require( 'js-yaml' );
var passport = require( 'passport' );
var Strategy = require( 'passport-google-oauth' ).OAuth2Strategy;

var source = fs.readFileSync( CONF_DIR + NODE_ENV + '/config.yml', 'utf8' );
var config = yaml.load( source ).passport;


passport.serializeUser( function( user, done ) {
  done( null, user );
});

passport.deserializeUser( function( obj, done ) {
  done( null, obj );
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