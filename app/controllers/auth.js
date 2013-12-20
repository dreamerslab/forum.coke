var Application = require( CONTROLLER_DIR + '/application' );
var passport    = require( 'passport' );
var User        = Model( 'User' );

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.referer,          { only : [ 'google' ]});
    before( this.failure_redirect, { only : [ 'callback' ]});
  },

  referer : function ( req, res, next ){
    var referer = req.headers.referer ?
      req.headers.referer : '/';

    res.cookie( 'referer', referer );
    next();
  },

  google : passport.authenticate( 'google', {
    scope : [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
  ]}),

  failure_redirect : passport.authenticate( 'google', {
    failureRedirect : '/'
  }),

  callback : function ( req, res, next ){
    var referer = req.cookies.referer ?
      req.cookies.referer : '/';

    User.create( req.user,
      // error
      function (){
        LOG.error( 500, res, err );
        res.redirect( '/logout' );
      },
      // success
      function (){
        res.redirect( referer );
      });
  },

  logout : function ( req, res, next ){
    req.logout();
    res.redirect( '/topics' );
  },
});
