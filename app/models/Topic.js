var Topic    = require( BASE_DIR + 'db/schema' ).Topic;
var common   = require( MODEL_DIR + 'hooks/common' );
var hooks    = require( MODEL_DIR + 'hooks/topic' );
var mongoose = require( 'mongoose' );
var Flow     = require( 'node.flow' );

Topic.post( 'init', hooks.catch_old_tag_names );

Topic.pre( 'save', common.mark_new_record );
Topic.pre( 'save', hooks.cache_user_info );

Topic.post( 'save', hooks.add_to_user );
Topic.post( 'save', hooks.remove_from_tags );
Topic.post( 'save', hooks.add_to_tags );
Topic.post( 'save', hooks.notify_subscribers );

Topic.post( 'remove', hooks.remove_from_user );
Topic.post( 'remove', hooks.remove_from_tags );
Topic.post( 'remove', hooks.remove_all_comments );

Topic.statics = {

  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, topics ){
          if( err ) return next( err );

          callback({
            topics : topics,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },
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


