var User = require( BASE_DIR + 'db/schema' ).User;

User.statics = {

  create_or_update : function ( user, props, callback ){
    user.name = props.name;
    user.email = props.email;
    user.avatar = props.avatar;
    user.rate = props.rate;
    user.post_count = props.post_count;
    user.comment_count = props.comment_count;
    user.save( callback );
  }
};

require( 'mongoose' ).model( 'User', User );