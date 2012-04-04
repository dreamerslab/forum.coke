var mongoose = require( 'mongoose' );



module.exports = {
  topic_save : function ( next ){
    var User  = mongoose.model( 'User' );
    var topic = mongoose.model( 'topic' );

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

    // // add comment's _id to its topic
    // topic.update(
    //   { _id : this.topic },
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