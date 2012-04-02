var User = require( BASE_DIR + 'db/schema' ).User;


User.methods = {

  // this a virtual property
  avatar_link : function(){
    if( UTILS.is( this.picture ) === 'String' ){
      return this.picture;
    }else{
      return 'http://www.gravatar.com/avatar/00000000000000000000000000000000'
    }
  },

  obj_attrs : function (){
    return {
      _id         : this._id,
      name        : this.name,
      avatar_link : this.avatar_link()
    };
  }

};

require( 'mongoose' ).model( 'User', User );