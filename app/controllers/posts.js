var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Post        = mongoose.model( 'Post' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  index : function ( req, res, next ){
    res.redirect( '/posts/latest' );
    // Post.find( function ( err, posts ){
    //   if( err ){
    //     next( err );
    //     return;
    //   }

    //   res.render( 'posts/index', {
    //     posts : posts
    //   });
    // });
  },

  latest : function ( req, res, next ){
    Post.latest( function ( err, posts ){
      if(err){
        next( err );
        return;
      }

      res.render( 'posts/index', {
        posts        : posts,
        nav_selected : 'latest'
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
        posts        : posts,
        nav_selected : 'trending'
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
        posts        : posts,
        nav_selected : 'unsolved'
      });
    });
  },

  'new' : function ( req, res, next ){
    res.render( 'posts/new' );
  },

  create : function ( req, res, next ){
    // Note: should replace this user by session user later
    User.findOne( function ( err, user ){

      Post.create_or_update( new Post( { _user : user._id }), req.body.post,
        function ( err, post ){
          if( err ){
            next( err );
            return;
          }

          post.update_user( User );
          req.flash( 'flash-info', 'Post created' );
          res.redirect( '/posts/' + post._id );
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

  edit : function ( req, res, next ){
    Post.findById( req.params.id, function ( err, post ){
      if( err ){
        req.msg = 'Post';
        next( err );
        return;
      }

      res.render( 'posts/edit', {
        post : post
      });
    });
  },

  update : function ( req, res, next ){
    Post.findById( req.params.id, function ( err, post ){
      if( err ){
        req.msg = 'Post';
        next( err );
        return;
      }

      Post.create_or_update( post, req.body.post,
        function ( err, post ){
          if( err ){
            next( err );
            return;
          }

          req.flash( 'flash-info', 'Post updated' );
          res.redirect( '/posts/' + post._id );
        });
    });
  },


});