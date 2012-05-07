var Topic    = require( BASE_DIR + 'db/schema' ).Topic;
var hooks    = require( MODEL_DIR + 'hooks/topic' );
var mongoose = require( 'mongoose' );
var Flow     = require( 'node.flow' );

Topic.post( 'init', hooks.post_init );
Topic.pre( 'save', hooks.pre_save );
Topic.post( 'save', hooks.post_save );
Topic.pre( 'remove', hooks.pre_remove );

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

          callback && callback({
            topics : topics,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },

  push_comment : function ( comment, callback ){
    this.update(
      { _id : comment.topic },
      { $addToSet : { comments : comment._id }},
      function ( err ){
        callback && callback( err );
      });
  },

  pull_comment : function ( comment, callback ){
    this.update(
      { _id : comment.topic },
      { $pull : { comments : comment._id }},
      function ( err ){
        callback && callback( err );
      });
  }
};

Topic.methods = {
  obj_attrs : function (){
    return {
      _id   : this._id,
      title : this.title
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
      function ( err ){
        err && LOG.error( 500,
          '[app][models][Topic] Having trouble increasing read count', err )
      }
    );
  },

  is_owner : function( user ){
    return user ?
      this.as_user._id.toString() === user._id.toString() :
      false;
  },
};

require( 'mongoose' ).model( 'Topic', Topic );


