var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var Topic    = require( BASE_DIR + 'db/schema' ).Topic;
var common   = require( MODEL_DIR + 'hooks/common' );
var hooks    = require( MODEL_DIR + 'hooks/topic' );

Topic.post( 'init', hooks.catch_old_tag_names );

Topic.pre( 'save', common.mark_new );
Topic.pre( 'save', hooks.cache_user_info );

Topic.post( 'save', hooks.add_to_user );
Topic.post( 'save', hooks.remove_from_tags );
Topic.post( 'save', hooks.add_to_tags );
Topic.post( 'save', hooks.notify );

Topic.post( 'remove', hooks.remove_from_user );
Topic.post( 'remove', hooks.remove_from_tags );
Topic.post( 'remove', hooks.remove_all_comments );

Topic.statics = {

  paginate : function ( conds, opts, next, success ){
    var self = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, topics ){
          if( err ) return next( err );

          success({
            topics : topics,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },

  authorized : function ( args, no_content, forbidden, success ){
    this.findById( args.id, function ( err, topic ){
      if( topic ) return topic.is_owner( args.user ) ?
        success( topic ) : forbidden();

      no_content( err );
    });
  },

  latest : function ( skip, next, success ){
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : skip || 0,
                  limit : 20
                };

    this.paginate({}, opts, next, success );
  },

  trending : function ( skip, next, success ){
    var opts  = {
      sort  : [ 'read_count', -1 ],
      skip  : skip || 0,
      limit : 20
    };

    this.paginate({}, opts, next, success );
  },

  unsolved : function ( skip, next, success ){
    var conds = { comments : { $size : 0 }};
    var opts  = {
      sort  : [ 'updated_at', -1 ],
      skip  : skip || 0,
      limit : 20
    };

    this.paginate( conds, opts, next, success );
  },

  search : function ( args, next, no_keyword, success ){
    if( !args.keywords ) return no_keyword();

    var regexp = new RegExp( args.keywords.join( '|' ), 'gi' );
    var conds  = { $or : [{ title : regexp }, { content : regexp }]};
    var opts   = { sort  : [ 'updated_at', -1 ],
                   skip  : args.skip || 0,
                   limit : 20 };

    this.paginate( conds, opts, next, success );
  },

  tag : function ( args, next, no_tag, success ){
    if( !args.tag ) return no_tag();

    var conds = { tag_names : { $in : [ args.tag ]}};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : args.skip || 0,
                  limit : 20 };

    this.paginate( conds, opts, next, success );
  },

  show : function ( args, mark_read, no_content, success ){
    var Notif = mongoose.model( 'Notification' );

    if( args.nid ) return Notif.mark_read( args.nid, mark_read );

    this.
      findById( args.id ).
      populate( 'user_id' ).
      populate( 'comments' ).
      run( function ( err, topic ){
        if( topic ){
          topic.inc_read_count();
          return success( topic );
        }

        no_content( err );
      });
  },

  create : function ( args, invalid, success ){
    if( !args.valid ) return invalid();

    var topic = new this({ user_id : args.user });

    topic.set_attrs( args.topic );
    topic.save( success );
  },

  update_props : function ( args, invalid, success ){
    if( !args.valid ) return invalid();

    var topic = args.topic;

    topic.set_attrs( args.src );
    topic.save( success );
  }
};

Topic.methods = {

  obj_attrs : function (){
    return {
      _id           : this._id,
      title         : this.title,
      comment_count : this.comments.length
    };
  },

  set_attrs : function ( topic ){
    var Tag = mongoose.model( 'Tag' );

    this.title     = topic.title;
    this.content   = topic.content;
    this.tag_names = Tag.extract_names( topic.tag_names );
  },

  inc_read_count : function (){
    mongoose.model( 'Topic' ).update(
      { _id : this._id },
      { $inc : { read_count : 1 }},
      function ( err, count ){
        err && LOG.error( 500,
          '[app][models][Topic] Having trouble increasing read count', err );
      }
    );
  },

  is_owner : function( user ){
    return user ?
      this.user._id.toString() === user._id.toString() :
      false;
  },
};

require( 'mongoose' ).model( 'Topic', Topic );


