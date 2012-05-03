var Comment = require( BASE_DIR + 'db/schema' ).Comment;
var hooks   = require( MODEL_DIR + 'hooks/comment' );

Comment.pre( 'save', hooks.pre_save );
Comment.post( 'save', hooks.post_save );
Comment.pre( 'remove', hooks.pre_remove );

Comment.methods = {
  set_attrs : function ( comment ){
    this.content = comment.content;
  },

  is_owner : function( user ){
    return user ?
      this.as_user._id.toString() === user._id.toString() :
      false;
  }
};

require( 'mongoose' ).model( 'Comment', Comment );


