var mongoose    = require( 'mongoose' );
var Notif        = mongoose.model( 'Notification' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  // controller filters --------------------------------------------------------
  init : function ( before, after ){
    before( this.sidebar );
    before( this.authenticated );
  },

  // controller actions --------------------------------------------------------
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


