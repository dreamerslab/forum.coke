var mongoose = require( 'mongoose' );

module.exports = {
  // add_to_user : function ( next ){
  //   var User = mongoose.model( 'User' );
  //   User.update({ _id : this.user });
  // },

  // add_to_tags : function ( next ){
  // },

  post_init : function (){
    this.orig_tag_names = this.tag_names;
  },

  pre_save : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    this.is_updated    = !this.isNew && !!this._dirty();
    this.tags_modified = this.isModified( 'tag_names' );

    User.findById( this.user, function ( err, user ){
      if( err ) return next( err );

      self.as_user = user.obj_attrs();
      next();
    });
  },

  post_save : function (){
    var self  = this;
    var User  = mongoose.model( 'User' );
    var Tag   = mongoose.model( 'Tag' );
    var Notif = mongoose.model( 'Notification' );

    // append topic's _id to its user
    User.push_topic( this, function ( err, user ){
      err && LOG.error( 500,
        '[libs][topic_hooks][post_save] Having trouble pushing topic\'s id to its user', err );
    });

    if( this.tags_modified ){
      Tag.remove_topic( self, function (){
        Tag.create_all( self.tag_names, function (){
          Tag.append_topic( self )
        });
      });
    }

    if( this.is_updated )
      Notif.send( 'update-topic', this );
  },

  pre_remove : function ( next ){
    var User    = mongoose.model( 'User' );
    var Tag     = mongoose.model( 'Tag' );
    var Comment = mongoose.model( 'Comment' );

    // remove topic's _id from its user
    User.pull_topic( this, function ( err, user ){
      err && LOG.error( 500,
        '[libs][topic_hooks][pre_remove] Having trouble pulling topic\'s id from its user', err );
    });

    // remove topic's _id from its tags
    Tag.update(
      { name : { $in : this.tag_names }},
      { $pull : { topics : this._id }},
      { multi : true },
      function ( err, count ){
        err && LOG.error( 500,
          '[libs][topic_hooks][pre_remove] Having trouble removing topic\'s id from its tags', err );
      });

    // remove topic comments' _ids from their users
    Comment.find(
      { _id : { $in : this.comments }},
      function ( err, comments ){
        err && LOG.error( 500,
          '[libs][topic_hooks][pre_remove] Having trouble find topic\'s comments', err );

        comments.forEach( function ( comment ){
          comment.remove( function ( err, comment ){
            err && LOG.error( 500,
              '[libs][topic_hooks][pre_remove] Having trouble removing topic comments\' ids from their users', err );
          });
        });
    });

    next();
  }
};


