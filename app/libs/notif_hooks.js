var mongoose = require( 'mongoose' );
var Message  = {
  'update-topic'   : 'updated the topic',
  'create-comment' : 'commented on the topic'
};



module.exports = {
  pre_save : function ( next ){
    this.activity = Message[ this.type ];
    next();
  },

  post_save : function (){
    self = this;
    mongoose.model( 'User' ).findById( this.user, function( err, user ){
      console.log( '---' );
      console.log( 'Hey, ' + user.name );
      console.log( self.originator.name + ' ' + self.activity + ': ' + self.topic.title );
    });
  },
};