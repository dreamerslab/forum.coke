var Post = require( BASE_DIR + 'db/schema' ).Post;


Post.statics = {

  latest : function ( callback ){
    this.find()
    .populate( '_user' )
    .sort( 'updated_at', -1 )
    .run( callback );
  },

  trending : function ( callback ){
    this.find()
    .populate( '_user' )
    .sort( 'read_count', -1 )
    .run( callback );
  },

  unsolved : function( callback ){
    this.find({ comment_count : 0})
    .populate( '_user' )
    .run( callback );
  }

};


Post.methods = {

  update_user : function ( User, callback ){
    var self = this;
    User.findById( self._user, function ( err, user ){
      // Note: add err handling later
      user.posts.push( self );
      user.save( function ( err, user ){
        self.user_name   = user.name;
        self.user_avatar = user.avatar;
        self.save( function ( err, post ){
          callback && callback.call( self );
        });
      });
    });
  }

}


require( 'mongoose' ).model( 'Post', Post );