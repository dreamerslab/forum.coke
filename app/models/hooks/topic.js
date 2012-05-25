var mongoose = require( 'mongoose' );

module.exports = {

  // hook into pre-init --------------------------------------------------------
  catch_old_tag_names : function (){
    this.old_tag_names = this.tag_names;
  },

  // hook into pre-save --------------------------------------------------------
  cache_user_info : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user_id, function ( err, user ){
      if( err ){
        LOG.error( 500,
          '[models/hooks/topic#cache_user_info] Fail to cache topic\'s user info', err );
        return next();
      }

      self.user = user.obj_attrs();
      next();
    });
  },

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    if( this.is_new ){
      var User = mongoose.model( 'User' );

      User.update(
        { _id : this.user_id },
        { $push : { topics : this._id }},
        function ( err, count ){
           err && LOG.error( 500,
             '[models/hooks/topic#add_to_user] Fail to add topic\'s _id to its user', err );
        });
    }
  },

  remove_from_tags : function (){
    if( ! this.is_new ){
      var Tag = mongoose.model( 'Tag' );

      Tag.update(
        { name : { $in : this.old_tag_names }},
        { $pull : { topics : this._id }},
        { multi : true },
        function ( err, count ){
          err && LOG.error( 500,
            '[models/hooks/topic#remove_from_tags] Fail to remove topic\'s _id from its tags', err );
        });
    }
  },

  add_to_tags : function (){
    var self = this;
    var Tag  = mongoose.model( 'Tag' );

    Tag.create_all( this.tag_names, function ( err ){
      if( err ){
        LOG.error( 500,
          '[models/hooks/topic#add_to_tags] Fail to create all topic\'s tags', err );
        return;
      }

      Tag.update(
        { name : { $in : self.tag_names }},
        { $push : { topics : self._id }},
        { multi : true },
        function ( err, count ){
          err && LOG.error( 500,
            '[models/hooks/topic#add_to_tags] Fail to add topic\'s _id to its tags', err );
        });
    });
  },

  notify : function (){
    var Notif = mongoose.model( 'Notification' );

    Notif.send( 'update-topic', this );
  },

  // hook into post-remove -----------------------------------------------------
  remove_from_user : function (){
    var User = mongoose.model( 'User' );

    User.update(
      { _id : this.user_id },
      { $pull : { topics : this._id }},
      function ( err, count ){
         err && LOG.error( 500,
           '[models/hooks/topic#add_to_user] Fail to add topic\'s _id to its user', err );
      });
  },

  remove_all_comments : function (){
    var Comment = mongoose.model( 'Comment' );

    Comment.find(
      { _id : { $in : this.comments }},
      function ( err, comments ){
        if( err ){
          LOG.error( 500,
            '[models/hooks/topic#remove_all_comments] Fail to find topic\'s comments', err );
          return;
        }

        comments.forEach( function ( comment ){
          comment.remove( function ( err, comment ){
            err && LOG.error( 500,
              '[models/hooks/topic#remove_all_comments] Fail to remove topic comments', err );
          });
        });
    });
  }
};


