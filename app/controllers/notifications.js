var mongoose    = require( 'mongoose' );
var Notif        = mongoose.model( 'Notification' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  // controller filters --------------------------------------------------------
  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.ensure_authenticated );
  },

  // controller actions --------------------------------------------------------
  index : function ( req, res, next ){
    var self  = this;
    var conds = { user : req.user._id };
    var opts  = { sort  : [ 'is_read', 1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Notif.paginate( conds, opts, next, function ( result ){
      res.render( 'notifications/index', self._merge( req, result, '?' ));
    });
  }
});


