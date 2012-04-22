var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Application = require( CONTROLLER_DIR + 'application' );



module.exports = Application.extend({
  init : function ( before, after ){
    before( this.fill_sidebar );
  },

  index : function ( req, res, next ){
    User.find( function ( err, users ){
      if( err ) return next( err );

      res.render( 'users/index', {
        sidebar   : req.sidebar,
        referrer  : req.url,
        sess_user : req.user,
        users     : users
      });
    });
  },

  show : function ( req, res, next ){
    var self = this;

    User.findById( req.params.id, function ( err, user ){
      if( user ){
        res.render( 'users/show', {
          sidebar   : req.sidebar,
          referrer  : req.url,
          sess_user : req.user,
          user      : user
        });

        return;
      }

      req.msg = 'User';
      self.record_not_found( err, req, res );
    });
  }
});