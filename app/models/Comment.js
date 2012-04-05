var Comment = require( BASE_DIR + 'db/schema' ).Comment;



Comment.methods = {
  is_owner : function( user ){
    if( user ){
      return this.as_user._id.toString() === user._id.toString();
    }

    return false;
  }
};



require( 'mongoose' ).model( 'Comment', Comment );