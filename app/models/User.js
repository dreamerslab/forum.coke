var User = require( BASE_DIR + 'db/schema' ).User;



User.methods = {
  // this a virtual property
  avatar_link : function(){
    return UTILS.is( this.picture ) === 'String' ?
      this.picture :
      'http://www.gravatar.com/avatar/00000000000000000000000000000000';
  },

  obj_attrs : function (){
    return {
      _id         : this._id,
      name        : this.name,
      avatar_link : this.avatar_link()};
  }
};



require( 'mongoose' ).model( 'User', User );