var mongoose = require( 'mongoose' );



module.exports = {
  pre_remove : function ( next ){
    var User    = mongoose.model( 'User' );
    var Tag     = mongoose.model( 'Tag' );
    var Comment = mongoose.model( 'Comment' );

    // remove post's _id from its user
    User.update(
      { _id : this.user },
      { $pull : { posts : this._id }},
      function ( err ){
        if( err ){
          next( err );
          return;
        }
      });

    // remove post's _id from its tags
    Tag.update(
      { _id : { $in : this.tags }},
      { $pull : { posts : this._id }},
      { multi : true },
      function ( err ){
        if( err ){
          next( err );
          return;
        }
      });

    // remove post comments' _ids from their users
    Comment.find(
      { _id : { $in : this.comments }},
      function ( err, comments ){
        if( err ){
          next( err );
          return;
        }

        comments.forEach( function ( comment ){
          comment.remove( function ( err, comment ){
            if( err ){
              next( err );
              return;
            }
          });
        });
    });

    next();
  }
};