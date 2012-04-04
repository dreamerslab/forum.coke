var mongoose = require( 'mongoose' );

module.exports = {

  pre_remove : function ( next ){
    var self    = this;
    var User    = mongoose.model( 'User' );
    var Tag     = mongoose.model( 'Tag' );
    var Comment = mongoose.model( 'Comment' );

    // remove post's _id from its user
    User.findById( this.user, function ( err, user ){
      if( err ){
        next( err );
        return;
      }

      User.
        collection.
        findAndModify({
          _id : user._id
        }, [], {
          $pull : {
            posts : self._id
        }}, {}, function ( err ){
            if( err ){
              next( err );
              return;
            }
        });
    });

    // remove post's _id from its tags
    Tag.find({
      _id : { $in : this.tags
      }}, function ( err, tags ){
        if( err ){
          next( err );
          return;
        }

        tags.forEach( function ( tag ){
          Tag.
            collection.
            findAndModify({
              _id : tag._id
            }, [], {
              $pull : {
                posts : self._id
            }}, {}, function ( err ){
                if( err ){
                  next( err );
                  return;
                }
            });
        });
    });

    // remove post comments' _ids from their users
    Comment.find({
      _id : {
        $in : this.comments
      }}, function ( err, comments ){
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
