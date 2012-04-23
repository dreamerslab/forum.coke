var mongoose = require( 'mongoose' );



module.exports = {
  pre_save : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user, function ( err, user ){
      if( err ) return next( err );

      self.as_user = user.obj_attrs();
      next();
    });
  },

  post_save : function (){
    var self  = this;
    var User  = mongoose.model( 'User' );
    var Topic = mongoose.model( 'Topic' );
    var Notif = mongoose.model( 'Notification' );

    // add comment's _id to its user
    User.findById( this.user, function ( err, user ){
      if( err ) return LOG.error( 500,
        '[libs][comment_hooks][post_save] Having trouble finding the user', err );

      if( user.comments.indexOf( self._id ) === -1 ){
        User.update(
          { _id : self.user },
          { $push : { comments : self._id }},
          function ( err ){
            if( err ) LOG.error( 500,
              '[libs][comment_hooks][post_save] Having trouble updating the user', err );
          });
      }
    });

    // add comment's _id to its topic
    Topic.findById( this.topic, function ( err, topic ){
      if( err ) return LOG.error( 500,
        '[libs][comment_hooks][post_save] Having trouble finding the topic', err );

      if( topic.comments.indexOf( self._id ) === -1 ){
        Topic.update(
          { _id : self.topic },
          { $push : { comments : self._id }},
          function ( err ){
            if( err ) LOG.error( 500,
              '[libs][comment_hooks][post_save] Having trouble updating the topic', err );
          });
      }

      Notif.send( 'create-comment', topic, self );
    });
  },

  pre_remove : function ( next ){
    var User  = mongoose.model( 'User' );
    var Topic = mongoose.model( 'Topic' );

    // remove comment's _id from its user
    User.update(
      { _id : this.user },
      { $pull : { comments : this._id }},
      function ( err ){
        if( err ) LOG.error( 500,
          '[libs][comment_hooks][pre_remove] Having trouble removing comment\'s id from its user', err );
      });

    // remove comment's _id from its topic
    Topic.update(
      { _id : this.topic },
      { $pull : { comments : this._id }},
      function ( err ){
        if( err ) LOG.error( 500,
          '[libs][comment_hooks][pre_remove] Having trouble removing comment\'s id from its topic', err );
      });

    next();
  }
};