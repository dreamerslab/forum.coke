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
  },

  latest : function ( req, res, next ){
    Post.latest( function ( err, posts ){
      if(err){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  },

  trending : function ( req, res, next ){
    Post.trending( function ( err, posts ){
      if(err){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  },

  unsolved : function ( req, res, next ){
    Post.unsolved( function ( err, posts ){
      if(err){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  },

  show : function ( req, res, next ){
    Post.findById( req.params.id )
    .populate( '_user' )
    .populate( 'comments' )
    .run( function ( err, post ){
      if( post ){
        res.render( 'posts/show', {
          post : post
        });
        return;
      }

      req.msg = 'Post';
      next( err );
    });
  },


});