var mongoose = require( 'mongoose' );



module.exports = {
  post_save : function ( next ){
    var User = mongoose.model( 'User' );
    var Post = mongoose.model( 'Post' );

    // // add comment's _id to its user
    // User.update(
    //   { _id : this.user },
    //   { $push : { comments : this._id }},
    //   function ( err ){
    //     if( err ){
    //       next( err );
    //       return;
    //     }
    //   });

    // // add comment's _id to its post
    // Post.update(
    //   { _id : this.post },
    //   { $push : { comments : this._id }},
    //   function ( err ){
    //     if( err ){
    //       next( err );
    //       return;
    //     }
    //   });

    next();
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