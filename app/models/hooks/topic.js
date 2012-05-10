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
        LOG.error( 500, '[model/hooks/topic#cache_user_info] Fail to cache topic\'s user info', err );
        return next();
      }

      self.as_user = user.obj_attrs();
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
           err && LOG.error( 500, '[model/hooks/topic#add_to_user] Fail to add topic\'s _id to its user', err );
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
          err && LOG.error( 500, '[model][hooks][topic][remove_from_tags] Fail to remove topic\'s _id from its tags', err );
        });
    }
  },

  add_to_tags : function (){
    var self = this;
    var Tag  = mongoose.model( 'Tag' );

    Tag.create_all( this.tag_names, function ( err ){
      if( err ){
        LOG.error( 500, '[model][hooks][topic][add_to_tags] Fail to create all topic\'s tags', err );
        return;
      }

      Tag.update(
        { name : { $in : self.tag_names }},
        { $push : { topics : self._id }},
        { multi : true },
        function ( err, count ){
          err && LOG.error( 500, '[model][hooks][topic][add_to_tags] Fail to add topic\'s _id to its tags', err );
        });
    });
  },

  notify_subscribers : function (){
    var Notif = mongoose.model( 'Notification' );

    Notif.send( 'update-topic', this );
  }
};


