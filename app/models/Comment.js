var mongoose = require( 'mongoose' );
var Comment  = require( BASE_DIR + 'db/schema' ).Comment;
var common   = require( MODEL_DIR + 'hooks/common' );
var hooks    = require( MODEL_DIR + 'hooks/comment' );

Comment.pre( 'save', common.mark_new );
Comment.pre( 'save', hooks.cache_user_info );
Comment.pre( 'save', hooks.cache_topic_info );

Comment.post( 'save', hooks.add_to_user );
Comment.post( 'save', hooks.add_to_topic );
Comment.post( 'save', hooks.notify );

Comment.post( 'remove', hooks.remove_from_user );
Comment.post( 'remove', hooks.remove_from_topic );

Comment.statics = {

  create : function ( args, next, invalid, no_content , success ){
    var Topic = mongoose.model( 'Topic' );
    var self = this;

    Topic.
      findById( args.topic_id ).
      populate( 'user_id' ).
      populate( 'comments' ).
      exec( function ( err, topic ){
        if( topic ){
          var comment = new self({
            user_id  : args.user,
            topic_id : topic,
            content  : args.comment.content
          });

          return args.valid ?
            comment.save( success ):
            invalid( topic, comment );
        }

        no_content( err );
      });
  },

  destroy : function ( args, next, no_content, forbidden, success ){
    this.findById( args.id, function ( err, comment ){
      if( comment ) return comment.is_owner( args.user ) ?
          comment.remove( success ) :
          forbidden();

      no_content( err );
    });
  }
};

Comment.methods = {

  is_owner : function( user ){
    return user ?
      this.user._id.toString() === user._id.toString() :
      false;
  }
};

require( 'mongoose' ).model( 'Comment', Comment );


