var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Post        = mongoose.model( 'Post' );
var Tag         = mongoose.model( 'Tag' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  init : function ( before, after ){
    before( this.fill_sidebar );
  },

  latest : function ( req, res, next ){
    var conds = {};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Post.count( conds, function( err, count ){
      Post.find( conds ).
           sort( opts.sort[ 0 ], opts.sort[ 1 ]).
           skip( opts.skip ).
           limit( opts.limit ).run( function( err, posts ){
             if( err ){
               next( err );
               return;
             }

             // args.posts = posts || [];
             res.render( 'posts/index', {
               sidebar : req.sidebar,
               path    : '/posts/latest',
               query   : '?',
               posts   : posts,
               count   : count,
               from    : opts.skip,
               limit   : opts.limit
             });
           });
    });
  },

  trending : function ( req, res, next ){
    var conds = {};
    var opts  = { sort  : [ 'read_count', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Post.count( conds, function( err, count ){
      Post.find( conds ).
           sort( opts.sort[ 0 ], opts.sort[ 1 ]).
           skip( opts.skip ).
           limit( opts.limit ).run( function( err, posts ){
             if( err ){
               next( err );
               return;
             }

             // args.posts = posts || [];
             res.render( 'posts/index', {
               sidebar : req.sidebar,
               path    : '/posts/trending',
               query   : '?',
               posts   : posts,
               count   : count,
               from    : opts.skip,
               limit   : opts.limit
             });
           });
    });
  },

  unsolved : function ( req, res, next ){
    var conds = { comments : { $size : 0 }};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Post.count( conds, function( err, count ){
      Post.find( conds ).
           sort( opts.sort[ 0 ], opts.sort[ 1 ]).
           skip( opts.skip ).
           limit( opts.limit ).run( function( err, posts ){
             if( err ){
               next( err );
               return;
             }

             // args.posts = posts || [];
             res.render( 'posts/index', {
               sidebar : req.sidebar,
               path    : '/posts/unsolved',
               query   : '?',
               posts   : posts,
               count   : count,
               from    : opts.skip,
               limit   : opts.limit
             });
           });
    });
  },

  tag : function ( req, res, next ){
    var conds = { tag_names : { $in : [ req.query.name ]}};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Post.count( conds, function( err, count ){
      Post.find( conds ).
           sort( opts.sort[ 0 ], opts.sort[ 1 ]).
           skip( opts.skip ).
           limit( opts.limit ).run( function( err, posts ){
             if( err ){
               next( err );
               return;
             }

             // args.posts = posts || [];
             res.render( 'posts/index', {
               sidebar : req.sidebar,
               path    : '/posts/tag',
               query   : '?name=' + req.query.name,
               posts   : posts,
               count   : count,
               from    : opts.skip,
               limit   : opts.limit
             });
           });
    });
  },

  search : function ( req, res, next ){
    if( ! req.query.keywords ){
      req.flash( 'flash-info', 'unknown keywords' );
      res.redirect( '/posts' );
      return;
    }else{
      var keywords = req.query.keywords.split( /\s+|\+/ );
      var regexp   = new RegExp( keywords.join( '|' ), 'gi' );
      var conds    = { $or : [{ title : regexp }, { content : regexp }]};
      var opts     = { sort  : [ 'updated_at', -1 ],
                       skip  : req.query.from || 0,
                       limit : 20 };

      Post.count( conds, function( err, count ){
        Post.find( conds ).
             sort( opts.sort[ 0 ], opts.sort[ 1 ]).
             skip( opts.skip ).
             limit( opts.limit ).run( function( err, posts ){
               if( err ){
                 next( err );
                 return;
               }

               // args.posts = posts || [];
               res.render( 'posts/index', {
                 sidebar  : req.sidebar,
                 keywords : keywords.join( ' ' ),
                 path     : '/posts/search',
                 query    : '?keywords=' + keywords.join( '+' ),
                 posts    : posts,
                 count    : count,
                 from     : opts.skip,
                 limit    : opts.limit
               });
             });
      });
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