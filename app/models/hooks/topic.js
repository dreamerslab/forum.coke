var mongoose = require( 'mongoose' );

module.exports = {

  // hook into pre-save --------------------------------------------------------
  mark_new_record : function ( next ){
    this.is_new = this.isNew;
    next();
  },

  cache_user_info : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user, function ( err, user ){
      if( err ){
        LOG.error( 500, '[model/hooks/topics#cache_user_info] Fail to cache topic\'s user info', err );
        return next();
      }

      self.as_user = user.obj_attrs;
      next();
    });
  },

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    if( this.is_new ){
      var User = mongoose.model( 'User' );

      User.update(
        { _id : this.user },
        { $push : { topics : this._id }},
        function ( err, count ){
           err && LOG.error( 500, '[model/hooks/topics#add_to_user] Fail to add topic\'s _id to its user', err );
        });
    }
  },

  remove_from_tags : function (){
    if( ! this.is_new ){
      var Tag = mongoose.model( 'Tag' );

      Tag.update(
        { name : { $in : this.tag_names }},
        { $pull : { topics : this._id }},
        { multi : true },
        function ( err, count ){
          err && LOG.error( 500, '[model][hooks][topics][remove_from_tags] Fail to remove topic\'s _id from its tags', err );
        });
    }
  },

  add_to_tags : function (){
    var self = this;
    var Tag  = mongoose.model( 'Tag' );

    Tag.create_all( this.tag_names, function ( err ){
      if( err ){
        LOG.error( 500, '[model][hooks][topics][add_to_tags] Fail to create all topic\'s tags', err );
        return;
      }

      console.log( self.tag_names );

      Tag.update(
        { name : { $in : self.tag_names }},
        { $push : { topics : self._id }},
        { multi : true },
        function ( err, count ){
          err && LOG.error( 500, '[model][hooks][topics][add_to_tags] Fail to add topic\'s _id to its tags', err );
        });
    });
  },

  notify_subscribers : function (){

  },

  // post_init : function (){
  //   this.orig_tag_names = this.tag_names;
  // },

  // pre_save : function ( next ){
  //   var self = this;
  //   var User = mongoose.model( 'User' );

  //   this.is_updated    = !this.isNew && !!this._dirty();
  //   this.tags_modified = this.isModified( 'tag_names' );

  //   User.findById( this.user, function ( err, user ){
  //     if( err ) return next( err );

  //     self.as_user = user.obj_attrs();
  //     next();
  //   });
  // },

  // post_save : function (){
  //   var self  = this;
  //   var User  = mongoose.model( 'User' );
  //   var Tag   = mongoose.model( 'Tag' );
  //   var Notif = mongoose.model( 'Notification' );

  //   // append topic's _id to its user
  //   User.push_topic( this, function ( err, user ){
  //     err && LOG.error( 500,
  //       '[libs][topic_hooks][post_save] Having trouble pushing topic\'s id to its user', err );
  //   });

  //   if( this.tags_modified ){
  //     Tag.remove_topic( self, function (){
  //       Tag.create_all( self.tag_names, function (){
  //         Tag.append_topic( self )
  //       });
  //     });
  //   }

  //   if( this.is_updated )
  //     Notif.send( 'update-topic', this );
  // },

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


