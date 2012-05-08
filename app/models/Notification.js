var Notification = require( BASE_DIR + 'db/schema' ).Notification;
var hooks        = require( MODEL_DIR + 'hooks/notif' );
var mongoose     = require( 'mongoose' );

Notification.post( 'save', hooks.post_save );

var unique = function ( docs ){
  var a = [];
  var h = {};

  docs.forEach( function ( doc ){
    h[ doc._id.toString()] = doc;
  });

  Object.keys( h ).forEach( function ( k ){
    a.push( h[ k ]);
  });

  return a;
};

var exclude = function ( docs, id ){
  var a = [];

  docs.forEach( function ( doc ){
    if( doc._id.toString() !== id )
      a.push( doc );
  });

  return a;
};

Notification.statics = {
  mark_read : function( id, callback ){
    var self = this;
    var User = mongoose.model( 'User' );

    this.update(
      { _id : id },
      { $set : { is_read : true }},
      function ( err, count ){
        if( err ) return callback && callback( err );

        User.update(
          { _id : self.user },
          { $inc : { unread_notifs : -1 }},
          function ( err, count ){
            callback && callback( err );
          });
      });
  },

  send : function ( type, topic, comment ){
    var self     = this;
    var mongoose = require( 'mongoose' );
    var User     = mongoose.model( 'User' );
    var Comment  = mongoose.model( 'Comment' );

    Comment.
      find({ topic : topic._id }).
      populate( 'user' ).
      run( function ( err, comments ){
        if( err ){
          LOG.error( 500,
            '[app][models][Notifications] Having trouble finding comments', err );
          return;
        }

        var topic_user_id = topic.user.toString();
        var subscribers   = comments.map( function ( c ){ return c.user; });

        subscribers = unique( subscribers );
        subscribers = exclude( subscribers, topic_user_id );
        if( type === 'create-comment' ){
          var comment_user_id = comment.user.toString();

          subscribers = exclude( subscribers, comment_user_id );
          User.findById( comment_user_id, function ( err, user ){
            if( err ){
              LOG.error( 500,
                '[app][models][Notifications] Having trouble finding comment\'s user', err );
              return;
            }

            // notify all subscribers
            subscribers.forEach( function ( subr ){
              new self({
                user       : subr._id,
                type       : type,
                originator : user.obj_attrs(),
                topic      : topic.obj_attrs(),
                content    : comment.content,
                activity   : 'commented on the topic'
              }).save( function ( err ){
                err && LOG.error( 500,
                  '[app][models][Notifications] Having trouble saving notification', err );

                User.update(
                  { _id : subr._id },
                  { $inc : { unread_notifs : 1 }},
                  function ( err, count ){
                    err && LOG.error( 500,
                      '[app][models][Notifications] Having trouble updating user unread_notifs', err );
                  });
              });
            });

            // notify the topic author
            if( topic_user_id !== comment_user_id ){
              new self({
                user       : topic_user_id,
                type       : type,
                originator : user.obj_attrs(),
                topic      : topic.obj_attrs(),
                content    : comment.content,
                activity   : 'commented on your topic'
              }).save( function (){
                err && LOG.error( 500,
                  '[app][models][Notifications] Having trouble saving notification', err );

                User.update(
                  { _id : topic_user_id },
                  { $inc : { unread_notifs : 1 }},
                  function ( err, count ){
                    err && LOG.error( 500,
                      '[app][models][Notifications] Having trouble updating user unread_notifs', err );
                  });
              });
            }
          });
        }

        if( type === 'update-topic' ){
          User.findById( topic_user_id, function ( err, user ){
            if( err ){
              LOG.error( 500,
                '[app][models][Notifications] Having trouble finding topic\'s user', err );
              return;
            }

            // notify all subscribers
            subscribers.forEach( function ( subr ){
              new self({
                user       : subr._id,
                type       : type,
                originator : user.obj_attrs(),
                topic      : topic.obj_attrs(),
                content    : topic.content,
                activity   : 'updated on the topic'
              }).save( function ( err ){
                err && LOG.error( 500,
                  '[app][models][Notifications] Having trouble saving notification', err );

                User.update(
                  { _id : subr._id },
                  { $inc : { unread_notifs : 1 }},
                  function ( err, count ){
                    err && LOG.error( 500,
                      '[app][models][Notifications] Having trouble updating user unread_notifs', err );
                  });
              });
            });
          });
        }
      });
  }
};

require( 'mongoose' ).model( 'Notification', Notification );


