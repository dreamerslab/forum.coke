var mongoose = require( 'mongoose' );



module.exports = {
  pre_save : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user, function ( err, user ){
      if( err ){
        next( err );
        return;
      }

      self.as_user = user.obj_attrs();
      next();
    });
  },

  pre_remove : function ( next ){
    var User    = mongoose.model( 'User' );
    var Tag     = mongoose.model( 'Tag' );
    var Comment = mongoose.model( 'Comment' );

    // remove topic's _id from its user
    User.update(
      { _id : this.user },
      { $pull : { topics : this._id }},
      function ( err ){
        if( err ){
          next( err );
          return;
        }
      });

    // remove topic's _id from its tags
    Tag.update(
      { _id : { $in : this.tags }},
      { $pull : { topics : this._id }},
      { multi : true },
      function ( err ){
        if( err ){
          next( err );
          return;
        }
      });

    // remove topic comments' _ids from their users
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