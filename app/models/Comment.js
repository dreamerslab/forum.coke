var Comment = require( BASE_DIR + 'db/schema' ).Comment;


Comment.methods = {

  update_user : function ( User, callback ){
    var self = this;
    User.findById( self._user )
    .populate( 'comments' )
    .run( function ( err, user ){
      // Note: add err handling later
      user.comments.push( self );
      user.comment_count = user.comments.length;
      user.save( function ( err, user ){
        // callback && callback.call( self );
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
      post.comment_count = post.comments.length;
      post.save( function ( err, post ){
        // callback && callback.call( self );
      });
    });
  }

};


require( 'mongoose' ).model( 'Comment', Comment );