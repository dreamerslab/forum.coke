var mongoose = require( 'mongoose' );



module.exports = {
  post_init : function (){
    this.orig_tag_names = this.tag_names;
  },

  pre_save : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    this.tag_names_modified =
      this.isModified( 'tag_names' );

    User.findById( this.user, function ( err, user ){
      if( err ){
        next( err );
        return;
      }

      self.as_user = user.obj_attrs();
      next();
    });
  },

  post_save : function (){
    var self  = this;
    var User  = mongoose.model( 'User' );
    var Tag   = mongoose.model( 'Tag' );
    var Notif = mongoose.model( 'Notification' );

    // add topic's _id to its user
    User.findById( this.user, function ( err, user ){
      if( err ){
        return;
      }

      if( user.topics.indexOf( self._id ) === -1 ){
        User.update(
          { _id : self.user },
          { $push : { topics : self._id }},
          function ( err ){
            if( err ){
              // next( err );
              // NOTE: there is not 'next' in mongoose's
              // post middleware, how can I handle error?
              return;
            }
          });
      }
    });

    if( this.tag_names_modified ){
      Tag.remove_topic( this, function (){
        Tag.create_all( self.tag_names, function (){
          Tag.append_topic( self )
        });
      });
    }else{
      Tag.create_all( this.tag_names, function (){
        Tag.append_topic( self )
      });
    }

    if( this.updated_at !== this.created_at )
      Notif.send( 'update-topic', this );
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
      { name : { $in : this.tag_names }},
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