module.exports = {

  // hook into pre-save --------------------------------------------------------

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    var User = Model( 'User' );

    User.update(
      { _id : this.user_id },
      { $push : { notifications : this._id }},
      function ( err, count ){
        err && LOG.error( 500,
          '[models/hooks/notif#add_to_user] Fail to add to user\'s notifications', err );
      });
  },

  // Debugging messages for development use only
  debug_message : function (){
    var self = this;
    var User = Model( 'User' );

    User.findById( this.user_id, function( err, user ){
      LOG.debug(
        'Hey ' + user.name + ',\n' +
        self.originator.name + ' ' + self.activity + ': ' + self.topic.title );
    });
  },
};


