var Comment = require( BASE_DIR + 'db/schema' ).Comment;



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