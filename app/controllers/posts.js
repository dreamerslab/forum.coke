var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  'new' : function ( req, res, next ){
    res.render( 'posts/new' );
  },

  create : function ( req, res, next ){
    Post.create_or_update( new Post(), req.body.post,
      function ( err, post ){
        if( err ){
          next( err );
          return;
        }

        req.flash( 'flash-info', 'Post created' );
        res.redirect( '/posts/' + post._id );
      });
  },

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

  show : function ( req, res, next ){
    Post.findById( req.params.id , function ( err, post ){
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

  edit : function ( req, res, next ){
    Post.findById( req.params.id , function ( err, post ){
      if( post ){
        res.render( 'posts/edit', {
          post : post
        });

        return;
      }

      req.msg = 'Post';
      next( err );
    });
  },

  update : function ( req, res, next ){
    Post.findById( req.params.id , function ( err, post ){
      if( post ){
        Post.create_or_update( post, req.body.post,
          function ( err, post ){
            if( err ){
              next( err );
              return;
            }

            req.flash( 'flash-info', 'Post updated' );
            res.redirect( '/posts/' + post._id );
          });

        return;
      }

      req.msg = 'Post';
      next( err );
    });
  },

  destroy : function ( req, res, next ){
    Post.findById( req.params.id , function ( err, post ){
      if( post ){
        post.remove( function ( err, post ){
          if( err ){
            next( err );
            return;
          }

          req.flash( 'flash-info', 'Post deleted' );
          res.redirect( '/posts' );
        });

        return;
      }

      req.msg = 'Post';
      next( err );
    });
  },

  latest : function ( req, res, next ){
    Post.latest( function ( err, posts ) {
      if( err ){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  },

  trending : function ( req, res, next ){
    Post.trending( function ( err, posts ) {
      if( err ){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts : posts
      });
    });
  },

  unsolved : function ( req, res, next ){
    Post.unsolved( function ( err, posts ) {
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
