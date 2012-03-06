var Post = require( BASE_DIR + 'db/schema' ).Post;

Post.statics = {

  create_or_update : function ( post, props, callback ){
    post.user_id = props.user_id;
    post.title = props.title;
    post.content = props.content;
    post.tags = props.tags;
    post.read_count = props.read_count;
    post.comment_count = props.comment_count;
    post.save( callback );
  }
};

require( 'mongoose' ).model( 'Post', Post );