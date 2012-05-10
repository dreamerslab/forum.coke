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
        LOG.error( 500, '[model/hooks/comment#cache_user_info] Fail to cache comment\'s user info', err );
        return next();
      }

      self.as_user = user.obj_attrs();
      next();
    });
  },

  cache_topic_info : function ( next ){
    var self  = this;
    var Topic = mongoose.model( 'Topic' );

    Topic.findById( this.topic, function ( err, topic ){
      if( err ){
        LOG.error( 500, '[model/hooks/comment#cache_topic_info] Fail to cache comment\'s topic info', err );
        return next();
      }

      self.as_topic = topic.obj_attrs();
      next();
    });
  },

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    if( this.is_new ){
      var User = mongoose.model( 'User' );

      User.update(
        { _id : this.user },
        { $push : { comments : this._id }},
        function ( err, count ){
           err && LOG.error( 500, '[model/hooks/comment#add_to_user] Fail to add comment\'s _id to its user', err );
        });
    }
  },

  add_to_topic : function (){
    if( this.is_new ){
      var Topic = mongoose.model( 'Topic' );

      Topic.update(
        { _id : this.topic },
        { $push : { comments : this._id }},
        function ( err, count ){
           err && LOG.error( 500, '[model/hooks/comment#add_to_user] Fail to add comment\'s _id to its topic', err );
        });
    }
  },

  notify_subscribers : function (){
    var self  = this;
    var Topic = mongoose.model( 'Topic' );
    var Notif = mongoose.model( 'Notification' );

    Topic.findById( this.topic, function ( err, topic ){
      if( err ){
        LOG.error( 500, '[model/hooks/comment#notify_subscribers] Fail to notify subscribers when comment created', err );
        return;
      }

      Notif.send( 'create-comment', topic, self );
    });
  },

  // hook into post-remove -----------------------------------------------------
  remove_from_user : function (){
    var User = mongoose.model( 'User' );

    User.update(
      { _id : this.user },
      { $pull : { comments : this._id }},
      function ( err, count ){
         err && LOG.error( 500, '[model/hooks/comment#add_to_user] Fail to add comment\'s _id to its user', err );
      });
  },

  remove_from_topic : function (){
    var Topic = mongoose.model( 'Topic' );

    Topic.update(
      { _id : this.topic },
      { $pull : { comments : this._id }},
      function ( err, count ){
         err && LOG.error( 500, '[model/hooks/comment#add_to_topic] Fail to add comment\'s _id to its topic', err );
      });
  },
};


