var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Post        = mongoose.model( 'Post' );
var Comment     = mongoose.model( 'Comment' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  create : function ( req, res, next ){
    // Note: should replace this user by session user later
    User.findOne( function ( err, user ){
      Post.findById( req.params.id, function ( err, post ){

        var comment = new Comment({
          user    : user,
          post    : post,
          content : req.body.comment.content
        });

        comment.save( function ( err, comment ){
          if( err ){
            next( err );
            return;
          }

          comment.add_to_post( post );
          comment.add_to_user( user );

          req.flash( 'flash-info', 'Comment created' );
          res.redirect( '/posts/' + post._id );
        });
      });
    });

  },
});