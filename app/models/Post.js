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
         size( 'comment_ids', 0 ).
         run( callback );
  }

};


Post.methods = {

  add_to_user : function ( user, callback ){
    var self = this;

    user.post_ids.push( this._id );
    user.save( function ( err, user ){
      if( err ){
        console.log( err.message );
      }
      self.user = user.obj_attrs();
      self.save( function ( err, post ){
        callback && callback();
      });
    });
  }

}


require( 'mongoose' ).model( 'Post', Post );