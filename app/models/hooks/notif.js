var mongoose = require( 'mongoose' );

module.exports = {
  // Debugging messages for development use only
  debug_message : function (){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user, function( err, user ){
      LOG.debug(
        'Hey ' + user.name + ',\n' +
        self.originator.name + ' ' + self.activity + ': ' + self.topic.title );
    });
  },
};


