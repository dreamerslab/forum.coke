var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  index : function ( req, res, next ){
    User.find( function ( err, users ){
      if( err ){
        next( err );
        return;
      }

      res.render( 'users/index', {
        users : users
      });
    });
  }


});