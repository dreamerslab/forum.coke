var mongoose = require( 'mongoose' );



module.exports = {
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

    // add topic's _id to its user
    User.update(
      { _id : this.user },
      { $push : { topics : this._id }},
      function ( err ){
        if( err ) LOG.error( 500,
          '[libs][topic_hooks][post_save] Having trouble updating user topic', err );
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
    User.update(
      { _id : this.user },
      { $pull : { topics : this._id }},
      function ( err ){
        if( err ) return next( err );
      });

    // remove topic's _id from its tags
    Tag.update(
      { name : { $in : this.tag_names }},
      { $pull : { topics : this._id }},
      { multi : true },
      function ( err ){
        if( err ) return next( err );
      });

    // remove topic comments' _ids from their users
    Comment.find(
      { _id : { $in : this.comments }},
      function ( err, comments ){
        if( err ) return next( err );

        comments.forEach( function ( comment ){
          comment.remove( function ( err, comment ){
            if( err ) return next( err );
          });
        });
    });

    next();
  }
};