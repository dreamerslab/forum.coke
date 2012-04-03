var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );

module.exports = {

  pre_remove : function ( next ){
    var self = this;

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
            comments : self._id
        }}, {}, function ( err ){
            if( err ){
              next( err );
              return;
            }else{
              next();
            }
        });
    });
  }

};