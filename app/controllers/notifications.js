var Application = require( CONTROLLER_DIR + '/application' );
var Notif       = Model( 'Notification' );

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.sidebar );
    before( this.authenticated );
    before( this.common_locals );
  },

  index : function ( req, res, next ){
    var self = this;
    var args = {
      user_id : req.user._id,
      skip    : req.query.from
    };

    Notif.index( args, next, function ( notifs ){
      res.render( 'notifications/index', notifs );
    });
  }
});
