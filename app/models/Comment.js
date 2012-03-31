var Comment = require( BASE_DIR + 'db/schema' ).Comment;


Comment.methods = {

  add_to_user : function ( user, callback ){
    var self = this;

    user.comments.push( this._id );
    user.save( function ( err, user ){
      self.as_user = user.obj_attrs();
      self.save( callback );
    });
  },

  add_to_post : function ( post, callback ){
    post.comments.push( this );
    post.save( callback );
  }
};


require( 'mongoose' ).model( 'Comment', Comment );