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
    var User  = mongoose.model( 'User' );
    var Topic = mongoose.model( 'Topic' );

    // add comment's _id to its user
    User.update(
      { _id : this.user },
      { $push : { comments : this._id }},
      function ( err ){
        if( err ){
          next( err );
          return;
        }
      });

    // add comment's _id to its topic
    Topic.update(
      { _id : this.topic },
      { $push : { comments : this._id }},
      function ( err ){
        if( err ){
          next( err );
          return;
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