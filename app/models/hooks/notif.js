var mongoose = require( 'mongoose' );

module.exports = {

  // hook into pre-save --------------------------------------------------------
  mark_new_record : function ( next ){
    this.is_new = this.isNew;
    next();
  },

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    var User = mongoose.model( 'User' );

    User.update(
      { _id : this.user },
      { $push : { notifications : this._id }},
      function ( err, count ){
        err && LOG.error( 500,
          '[models/hooks/notif#add_to_user] Fail to add to user\'s notifications', err );
      });
  },

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


