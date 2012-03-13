var mongoose    = require( 'mongoose' );
var Post        = mongoose.model( 'Post' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  index : function ( req, res, next ){
    Post.find( function ( err, posts ){
      if( err ){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  }





});