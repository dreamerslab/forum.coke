var Application = require( CONTROLLER_DIR + 'application' );
var Notif       = Model( 'Notification' );


module.exports = Application.extend({

  init : function ( before, after ){
    before( this.sidebar );
    before( this.authenticated );
  },

  index : function ( req, res, next ){
    var self = this;
    var args = {
      user_id : req.user._id,
      skip    : req.query.from
    };

    Notif.index( args, next, function ( result ){
      res.render( 'notifications/index', self._merge( req, result ));
    });
  }
});


