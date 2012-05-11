var Comment = require( BASE_DIR + 'db/schema' ).Comment;
var common  = require( MODEL_DIR + 'hooks/common' );
var hooks   = require( MODEL_DIR + 'hooks/comment' );

Comment.pre( 'save', common.mark_new_record );
Comment.pre( 'save', hooks.cache_user_info );
Comment.pre( 'save', hooks.cache_topic_info );

Comment.post( 'save', hooks.add_to_user );
Comment.post( 'save', hooks.add_to_topic );
Comment.post( 'save', hooks.notify_subscribers );

Comment.post( 'remove', hooks.remove_from_user );
Comment.post( 'remove', hooks.remove_from_topic );

Comment.methods = {

  set_attrs : function ( comment ){
    this.content = comment.content;
  },

  is_owner : function( user ){
    return user ?
      this.user._id.toString() === user._id.toString() :
      false;
  }
};

require( 'mongoose' ).model( 'Comment', Comment );


