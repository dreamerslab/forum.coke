var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Topic       = mongoose.model( 'Topic' );
var Comment     = mongoose.model( 'Comment' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.ensure_authenticated, {
      only : [ 'create' ]});
  },

  create : function ( req, res, next ){
    // redirect to 'topics/show' if not authenticated
    if( !req.user ){
      res.redirect( '/topics/show' );
      return;
    }

    Topic.findById( req.params.id, function ( err, topic ){
      var user = req.user;
      var comment = new Comment({
        user    : user,
        topic   : topic,
        content : req.body.comment.content
      });

      comment.save( function ( err, comment ){
        if( err ){
          next( err );
          return;
        }

        req.flash( 'flash-info', 'Comment created' );
        res.redirect( '/topics/' + topic._id );
      });
    });
  },
});