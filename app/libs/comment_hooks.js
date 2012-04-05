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

  post_save : function (){
    var self  = this;
    var User  = mongoose.model( 'User' );
    var Topic = mongoose.model( 'Topic' );

    // add comment's _id to its user
    User.findById( this.user, function ( err, user ){
      if( err ){
        // next( err );
        // NOTE: there is not 'next' in mongoose's
        // post middleware, how can I handle error?
        return;
      }

      if( user.comments.indexOf( self._id ) === -1 ){
        User.update(
          { _id : self.user },
          { $push : { comments : self._id }},
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

    // add comment's _id to its topic
    Topic.findById( this.topic, function ( err, topic ){
      if( err ){
        // next( err );
        // NOTE: there is not 'next' in mongoose's
        // post middleware, how can I handle error?
        return;
      }

      if( topic.comments.indexOf( self._id ) === -1 ){
        Topic.update(
          { _id : self.topic },
          { $push : { comments : self._id }},
          function ( err ){
            if( err ){
              next( err );
              // next( err );
              // NOTE: there is not 'next' in mongoose's
              // post middleware, how can I handle error?
              return;
            }
          });
      }
    });
  },

  pre_remove : function ( next ){
    var User = mongoose.model( 'User' );

    User.update(
      { _id : this.user },
      { $pull : { comments : this._id }},
      function ( err ){
        if( err ){
          next( err );
          return;
        }else{
          next();
        }
      });
  }
};