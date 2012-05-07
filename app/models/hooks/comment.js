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

    // append comment's _id to its user
    User.push_comment( this, function ( err, user ){
      err && LOG.error( 500,
        '[libs][comment_hooks][post_save] Having trouble pushing comment\'s id to its user', err );
    });

    // append comment's _id to its topic
    Topic.push_comment( this, function ( err, topic ){
      err && LOG.error( 500,
        '[libs][comment_hooks][post_save] Having trouble pushing comment\'s id to its topic', err );
    });

    Topic.findById( this.topic, function( err, topic ){
      if( err ){
        return LOG.error( 500,
          '[libs][comment_hooks][post_save] Having trouble finding comment\'s topic', err );
      }

      Notif.send( 'create-comment', topic, self );
    });
  },

  pre_remove : function ( next ){
    var User  = mongoose.model( 'User' );
    var Topic = mongoose.model( 'Topic' );

    // remove comment's _id from its user
    User.pull_comment( this, function ( err, user ){
      err && LOG.error( 500,
        '[libs][comment_hooks][pre_remove] Having trouble pulling comment\'s id from its user', err );
    });

    // remove comment's _id from its topic
    Topic.pull_comment( this, function ( err, topic ){
      err && LOG.error( 500,
        '[libs][comment_hooks][pre_remove] Having trouble pulling comment\'s id from its topic', err );
    });

    next();
  }
};


