var mongoose = require( 'mongoose' );



module.exports = {
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