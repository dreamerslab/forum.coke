var Post = require( BASE_DIR + 'db/schema' ).Post;


Post.statics = {

  latest : function ( callback ){
    this.find().sort( 'updated_at', -1 ).run( callback );
  },

  trending : function ( callback ){
    this.find().sort( 'read_count', -1 ).run( callback );
  },

  unsolved : function( callback ){
    this.find({ comment_count : 0}).run( callback );
  }

};

require( 'mongoose' ).model( 'Post', Post );