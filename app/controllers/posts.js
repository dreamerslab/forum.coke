var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Post        = mongoose.model( 'Post' );
var Tag         = mongoose.model( 'Tag' );
var Application = require( CONTROLLER_DIR + 'application' );

var _cond = function ( query ){
  var find     = {};
  var find_raw = '';
  var i        = 0;
  var name;

  Object.keys( query ).forEach( function ( name ){
    var key = name.split( '.' );

    if( key.length > 1 ){
      find[ key[ 1 ]] = query[ name ];
    }

    if( name.match( 'find' )){
      if( i == 0 ){
        find_raw = '?';
      }else{
        find_raw += '&';
      }
      find_raw += name + '=' + query[ name ];
      i++;
    }
  });

  return {
    find     : find,
    find_raw : find_raw
  };
};

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.fill_sidebar );
  },

  // index : function ( req, res, next ){
  //   res.redirect( '/posts/latest' );
  // },

  latest : function ( req, res, next ){
    var conds    = { sort : [ 'updated_at', -1 ]};
    var page     = parseInt( req.query.page );
    var skip     = 0;
    var limit    = 10;

    if( ! page ) page = 1;
    skip = ( page - 1 ) * limit;

    Post.paginate( conds, skip, limit, function ( total, posts ){

      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts,
        page_count   : Math.ceil( total / limit),
        page_number  : page,
        request_url  : '/posts/latest?',
        nav_selected : 'latest'
      });
    });
  },

  trending : function ( req, res, next ){
    // var conds = { sort : [ 'read_count', -1 ]};

    // Post.paginate( conds, 0, 10, function ( total, posts ){
    //   res.render( 'posts/index', {
    //     sidebar      : req.sidebar,
    //     posts        : posts,
    //     nav_selected : 'trending'
    //   });
    // });

    var query = req.query;
    var cond  = _cond( query );
    var args = {
      action   : 'posts/trending',
      find     : cond.find,
      find_raw : cond.find_raw,
      sort     : query.sort || 'created_at',
      asc      : query.asc || 1,
      from     : query.from || 0,
      limit    : 20,
      sidebar  : req.sidebar
    };

    Post.count( args.find, function( e, count ){
      args.count = count;

      Post.find( args.find ).
           sort( args.sort, args.asc ).
           skip( args.from ).
           limit( args.limit ).run( function( err, posts ){
             if( err ){
               next( err );
               return;
             }

             args.posts = posts || [];
             res.render( 'posts/index', args );
           });
    });
  },

  unsolved : function ( req, res, next ){
    var conds = { comments : { $size : 0 }};

    Post.paginate( conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar      : req.sidebar,
        posts        : posts,
        nav_selected : 'unsolved'
      });
    });
  },

  tag : function ( req, res, next ){
    var conds = { tag_names : { $in : [ req.query.name ]}};

    Post.paginate( conds, 0, 10, function ( total, posts ){
      res.render( 'posts/index', {
        sidebar : req.sidebar,
        posts   : posts
      });
    });
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

      Post.paginate( conds, 0, 10, function ( total, posts ){
        res.render( 'posts/index', {
          sidebar : req.sidebar,
          posts   : posts
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