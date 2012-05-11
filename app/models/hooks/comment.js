var mongoose = require( 'mongoose' );

module.exports = {

  // hook into pre-save --------------------------------------------------------
  cache_user_info : function ( next ){
    var self = this;
    var User = mongoose.model( 'User' );

    User.findById( this.user_id, function ( err, user ){
      if( err ){
        LOG.error( 500, '[models/hooks/comment#cache_user_info] Fail to cache comment\'s user info', err );
        return next();
      }

      self.user = user.obj_attrs();
      next();
    });
  },

  cache_topic_info : function ( next ){
    var self  = this;
    var Topic = mongoose.model( 'Topic' );

    Topic.findById( this.topic_id, function ( err, topic ){
      if( err ){
        LOG.error( 500, '[models/hooks/comment#cache_topic_info] Fail to cache comment\'s topic info', err );
        return next();
      }

      next();
    });
  },

  // hook into post-save -------------------------------------------------------
  add_to_user : function (){
    if( this.is_new ){
      var User = mongoose.model( 'User' );

      User.update(
        { _id : this.user_id },
        { $push : { comments : this._id }},
        function ( err, count ){
           err && LOG.error( 500, '[models/hooks/comment#add_to_user] Fail to add comment\'s _id to its user', err );
        });
    }
  },

  add_to_topic : function (){
    if( this.is_new ){
      var Topic = mongoose.model( 'Topic' );

      Topic.update(
        { _id : this.topic_id },
        { $push : { comments : this._id }},
        function ( err, count ){
           err && LOG.error( 500, '[models/hooks/comment#add_to_user] Fail to add comment\'s _id to its topic', err );
        });
    }
  },

  notify_subscribers : function (){
    var self  = this;
    var Topic = mongoose.model( 'Topic' );
    var Notif = mongoose.model( 'Notification' );

    Topic.findById( this.topic_id, function ( err, topic ){
      if( err ){
        LOG.error( 500, '[models/hooks/comment#notify_subscribers] Fail to notify subscribers when comment created', err );
        return;
      }

      Notif.send( 'create-comment', topic, self );
    });
  },

  // hook into post-remove -----------------------------------------------------
  remove_from_user : function (){
    var User = mongoose.model( 'User' );

    User.update(
      { _id : this.user_id },
      { $pull : { comments : this._id }},
      function ( err, count ){
         err && LOG.error( 500, '[models/hooks/comment#add_to_user] Fail to add comment\'s _id to its user', err );
      });
  },

  remove_from_topic : function (){
    var Topic = mongoose.model( 'Topic' );

    Topic.update(
      { _id : this.topic_id },
      { $pull : { comments : this._id }},
      function ( err, count ){
         err && LOG.error( 500, '[models/hooks/comment#add_to_topic] Fail to add comment\'s _id to its topic', err );
      });
  },
};


