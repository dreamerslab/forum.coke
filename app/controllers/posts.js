var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Post        = mongoose.model( 'Post' );
var Tag         = mongoose.model( 'Tag' );
var Application = require( CONTROLLER_DIR + 'application' );

var paginate = function( Model, conds, from, num, callback ){
  var sort = [ 'updated_at', -1 ];

  if( 'sort' in conds ){
    sort = conds.sort;
    delete conds.sort;
  }

  Model.
    count( conds ).
    run( function ( err, total ){
      Model.
        find( conds ).
        sort( sort[ 0 ], sort[ 1 ]).
        skip( from ).
        limit( num ).
        run( function ( err, docs ){
          callback && callback( total, docs );
        });
    });
}

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.fill_sidebar );
  },

  index : function ( req, res, next ){
    res.redirect( '/posts/latest' );
  },

  latest : function ( req, res, next ){
    var conds = { sort : [ 'updated_at', -1 ]};

    paginate( Post, conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts,
        nav_selected : 'latest'
      });
    });

    // Post.latest( function ( err, posts ){
    //   if( err ){
    //     next( err );
    //     return;
    //   }

    //   res.render( 'posts/index', {
    //     sidebar      : req.sidebar,
    //     posts        : posts,
    //     nav_selected : 'latest'
    //   });
    // });
  },

  trending : function ( req, res, next ){
    var conds = { sort : [ 'read_count', -1 ]};

    paginate( Post, conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts,
        nav_selected : 'trending'
      });
    });

    // Post.trending( function ( err, posts ){
    //   if( err ){
    //     next( err );
    //     return;
    //   }

    //   res.render( 'posts/index', {
    //     sidebar      : req.sidebar,
    //     posts        : posts,
    //     nav_selected : 'trending'
    //   });
    // });
  },

  unsolved : function ( req, res, next ){
    var conds = { comments : { $size : 0 }};

    paginate( Post, conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts,
        nav_selected : 'unsolved'
      });
    });

    // Post.unsolved( function ( err, posts ){
    //   if( err ){
    //     next( err );
    //     return;
    //   }

    //   res.render( 'posts/index', {
    //     sidebar      : req.sidebar,
    //     posts        : posts,
    //     nav_selected : 'unsolved'
    //   });
    // });
  },

  tag : function ( req, res, next ){
    var conds = { tag_names : { $in : [ req.query.name ]}};

    paginate( Post, conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts
      });
    });

    // Post.
    //   find().
    //   where( 'tag_names' ).
    //   in([ req.query.name ]).
    //   run( function ( err, posts ){
    //     if( err ){
    //       next( err );
    //       return;
    //     }

    //     res.render( 'posts/index', {
    //       sidebar      : req.sidebar,
    //       posts        : posts,
    //     });
    // });
  },

  search : function ( req, res, next ){
    if( ! req.query.keywords ){
      req.flash( 'flash-info', 'unknown keywords' );
      res.redirect( '/posts' );
      return;
    }else{
      var keywords = req.query.keywords.split(/\s+/);
      var regexp   = new RegExp( keywords.join( '|' ), 'gi');
      var conds    = { $or : [{ title : regexp }, { content : regexp }]};

      paginate( Post, conds, 0, 10, function ( total, posts ){
        res.render( 'posts/index', {
          sidebar      : req.sidebar,
          posts        : posts
        });
      });

      // Post.
      //   find({ $and : [{
      //     title : conditions
      //   }, {
      //     content : conditions
      //   }] }).
      //   run( function ( err, posts ){
      //     res.render( 'posts/index', {
      //       sidebar      : req.sidebar,
      //       posts        : posts
      //     });
      //   });
    }
  },

  'new' : function ( req, res, next ){
    res.render( 'posts/new', {
      sidebar : req.sidebar
    });
  },

  create : function ( req, res, next ){
    // Note: should replace this user by session user later
    User.findOne( function ( err, user ){

      var post = new Post({
        user      : user,
        title     : req.body.post.title,
        content   : req.body.post.content,
        tag_names : Tag.extract_names( req.body.post.tag_names )
      });

      post.save( function ( err, post ){
        if( err ){
          next( err );
          return;
        }

        post.update_tags( Tag );
        post.add_to_user( user );
        req.flash( 'flash-info', 'Post created' );
        res.redirect( '/posts/' + post._id );
      });
    });
  },

  show : function ( req, res, next ){
    Post.findById( req.params.id ).
         populate( 'user' ).
         populate( 'comments' ).
         run( function ( err, post ){
           if( post ){
             res.render( 'posts/show', {
               sidebar : req.sidebar,
               post    : post
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
        sidebar : req.sidebar,
        post    : post
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

      post.title     = req.body.post.title;
      post.content   = req.body.post.content;
      post.tag_names = Tag.extract_names( req.body.post.tag_names );
      post.save( function ( err, post ){
        if( err ){
          next( err );
          return;
        }

        post.update_tags( Tag );
        req.flash( 'flash-info', 'Post updated' );
        res.redirect( '/posts/' + post._id );
      });
    });
  },

  tags : function ( req, res, next ){
    Tag.find().sort( 'name', 1 ).run( function ( err, tags ){

      res.render( 'posts/tags', {
        sidebar : req.sidebar,
        tags    : tags
      });
    });
  },

});