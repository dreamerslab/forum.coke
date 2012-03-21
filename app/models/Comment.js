var Comment = require( BASE_DIR + 'db/schema' ).Comment;


Comment.methods = {

  update_user : function ( user, callback ){
    var self = this;

    user.comment_ids.push( this._id );
    user.save( function ( err, user ){
      self.user = user.obj_attrs();
      self.save( function ( err, comment ){
        callback && callback();
      });
    });
  },

  update_post : function ( post, callback ){
    post.comment_ids.push( this._id );
    post.save( function ( err, post ){
      callback && callback();
    });
  },

};


require( 'mongoose' ).model( 'Comment', Comment );