var mongoose    = require( 'mongoose' );
var Notif        = mongoose.model( 'Notification' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.ensure_authenticated );
  },

  index : function ( req, res, next ){
    Notif.find({
      user : req.user._id
    }, function ( err, notifs ){
        if( err ){
          next( err );
          return;
        }

        res.render( 'notifications/index', {
          sidebar   : req.sidebar,
          referrer  : req.url,
          sess_user : req.user,
          notifs    : notifs
        });
      });
  }
});