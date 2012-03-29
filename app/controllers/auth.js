var Application = require( CONTROLLER_DIR + 'application' );
var passport    = require( 'passport' );

module.exports = Application.extend({

  google : function ( req, res, next ){
    console.log( 'Do something before redirect to google.' );

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

      console.log( 'Do somthing after successful callback.' );
      res.redirect( '/posts/latest' );
    });
  },

  // google : passport.authenticate( 'google', {
  //   scope : [
  //     'https://www.googleapis.com/auth/userinfo.profile',
  //     'https://www.googleapis.com/auth/userinfo.email'
  // ]}),

  // callback : passport.authenticate( 'google', {
  //   failureRedirect : '/',
  //   successRedirect : '/posts/latest'
  // }),

  login : function ( req, res, next ){

  },

  logout : function ( req, res, next ){
    req.logout();
    res.redirect( '/posts/latest' );
  },

});
