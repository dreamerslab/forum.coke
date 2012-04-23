var Application = require( CONTROLLER_DIR + 'application' );
var passport    = require( 'passport' );
var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );

module.exports = Application.extend({

  google : function ( req, res, next ){
    var referer = req.headers.referer ?
      req.headers.referer :
      '/topics/latest';

    res.cookie( 'referer', referer );

    passport.authenticate( 'google', {
      scope : [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]})( req, res, next );
  },

  callback : function ( req, res, next ){
    passport.authenticate( 'google', {
      failureRedirect : '/'
    })( req, res, function (){

      User.findOne({
        google_id : req.user.id
      }, function ( err, user ){
        if( !user ){
          var profile = req.user;

          new User({
            google_id  : profile.id,
            google_raw : profile,
            name       : profile._json.name,
            email      : profile._json.email,
            picture    : profile._json.picture
          }).save( function ( err, user ){
            res.redirect( req.cookies.referer );
          });

        }else{
          res.redirect( req.cookies.referer );
        }
      });
    });
  },

  logout : function ( req, res, next ){
    req.logout();

    var redirect = req.query.referrer ?
      decodeURIComponent( req.query.referrer ) :
      '/topics/latest';

    res.redirect( redirect );
  },
});