var Comment = require( BASE_DIR + 'db/schema' ).Comment;


Comment.methods = {

  update_user : function ( User, callback ){
    var self = this;

    User.findById( self._user, function ( err, user ){
      // Note: add err handling later
      user.comments.push( self );
      user.save( function ( err, user ){
        self.user_name   = user.name;
        self.user_avatar = user.avatar;
        self.save( function ( err, comment ){
          callback && callback.call( self );
        });
      });
    });
  },

  update_post : function ( Post, callback ){
    var self = this;
    Post.findById( self._post )
    .populate( 'comments' )
    .run( function ( err, post ){
      // Note: add err handling later
      post.comments.push( self );
      post.save( function ( err, post ){
        // callback && callback.call( self );
      });
    });
  }

};


require( 'mongoose' ).model( 'Comment', Comment );