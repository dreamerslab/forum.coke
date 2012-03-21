var User = require( BASE_DIR + 'db/schema' ).User;


User.methods = {

  obj_attrs : function (){
    return {
      _id    : this._id,
      name   : this.name,
      avatar : this.avatar
    };
  }

};

require( 'mongoose' ).model( 'User', User );