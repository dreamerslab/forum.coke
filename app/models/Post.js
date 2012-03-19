var Post = require( BASE_DIR + 'db/schema' ).Post;


Post.statics = {

  create_or_update : function ( post, props, callback ){
    post.title = props.title;
    post.content = props.content;
    post.tags = props.tags;
    post.save( callback );
  },

  latest : function ( callback ){
    this.find().
         sort( 'updated_at', -1 ).
         run( callback );
  },

  trending : function ( callback ){
    this.find().
         sort( 'read_count', -1 ).
         run( callback );
  },

  unsolved : function( callback ){
    this.find().
         size( 'comments', 0 ).
         run( callback );
  }

};


Post.methods = {

  update_user : function ( user, callback ){
    var self = this;

    user.posts.push( this );
    user.save( function ( err, user ){
      if( err ){
        console.log( err.message );
      }

      self.user_name   = user.name;
      self.user_avatar = user.avatar;
      self.save( function ( err, post ){
        callback && callback();
      });
    });
  }

}


require( 'mongoose' ).model( 'Post', Post );