var Comment = require( BASE_DIR + 'db/schema' ).Comment;


Comment.methods = {

  update_user : function ( user, callback ){
    var self = this;

    user.comments.push( this );
    user.save( function ( err, user ){
      self.user_name = user.name;
      self.user_avatar = user.avatar;
      self.save( function ( err, comment ){
        callback && callback();
      });
    });
  },

  update_post : function ( post, callback ){
    post.comments.push( this );
    post.save( function ( err, post ){
      callback && callback();
    });
  },


};


require( 'mongoose' ).model( 'Comment', Comment );