var common       = require( MODEL_DIR + 'hooks/common' );
var hooks        = require( MODEL_DIR + 'hooks/notif' );

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
    if( doc._id.toString() !== id ) a.push( doc );
  });

  return a;
};

module.exports = {

  hooks : {
    pre : {
      save : [ common.mark_new ]
    },

    post : {
      save : [ hooks.add_to_user ]
    }
  },

  statics : {

    paginate : function ( conds, opts, next, callback ){
      var reslut = {};
      var self   = this;

      this.count( conds, function ( err, count ){
        if( err ) return next( err );

        self.
          find( conds ).
          sort( opts.sort ).
          skip( opts.skip ).
          limit( opts.limit ).exec( function ( err, notifs ){
            if( err ) return next( err );

            callback({
              notifs : notifs,
              count  : count,
              from   : opts.skip,
              limit  : opts.limit
            });
          });
      });
    },

    index : function ( args, next, success ){
      var conds = { user_id : args.user_id };
      var opts  = { sort    : 'is_read',
                    skip    : args.skip || 0,
                    limit   : 20 };

      this.paginate( conds, opts, next, success );
    },

    mark_read : function( id, callback ){
      var self = this;
      var User = Model( 'User' );

      this.findById( id, function ( err, notif ){
        if( notif ){
          return self.update(
            { _id : notif._id },
            { $set : { is_read : true }},
            function ( err, count ){
              if( err ) return callback( err );

              User.update(
                { _id : notif.user_id },
                { $pull : { notifications : notif._id }},
                function ( err, count ){
                  callback( err );
                });
            });
        }

        callback( err );
      });
    },

    send : function ( type, topic, comment ){
      var self     = this;
      var User     = Model( 'User' );
      var Comment  = Model( 'Comment' );

      Comment.
        find({ topic_id : topic._id }).
        populate( 'user_id' ).
        exec( function ( err, comments ){
          if( err ) return LOG.error( 500,
            '[app][models][Notifications] Having trouble finding comments', err );

          var topic_user_id = topic.user_id.toString();
          var subscribers   = comments.map( function ( c ){ return c.user_id; });

          subscribers = unique( subscribers );
          subscribers = exclude( subscribers, topic_user_id );

          if( type === 'create-comment' ){
            var comment_user_id = comment.user_id.toString();

            subscribers = exclude( subscribers, comment_user_id );
            User.findById( comment_user_id, function ( err, user ){
              if( err ) return LOG.error( 500,
                '[app][models][Notifications] Having trouble finding comment\'s user', err );

              // notify all subscribers
              subscribers.forEach( function ( subr ){
                new self({
                  user_id    : subr._id,
                  type       : type,
                  originator : user.obj_attrs(),
                  topic      : topic.obj_attrs(),
                  content    : comment.content,
                  activity   : 'commented on the topic'
                }).save( function ( err ){
                  err && LOG.error( 500,
                    '[app][models][Notifications] Having trouble saving notification', err );
                });
              });

              // notify the topic author
              if( topic_user_id !== comment_user_id ){
                new self({
                  user_id    : topic_user_id,
                  type       : type,
                  originator : user.obj_attrs(),
                  topic      : topic.obj_attrs(),
                  content    : comment.content,
                  activity   : 'commented on your topic'
                }).save( function ( err, notif, count ){
                  err && LOG.error( 500,
                    '[app][models][Notifications] Having trouble saving notification', err );
                });
              }
            });
          }

          if( type === 'update-topic' ){
            User.findById( topic_user_id, function ( err, user ){
              if( err ) return LOG.error( 500,
                  '[app][models][Notifications] Having trouble finding topic\'s user', err );

              // notify all subscribers
              subscribers.forEach( function ( subr ){
                new self({
                  user_id    : subr._id,
                  type       : type,
                  originator : user.obj_attrs(),
                  topic      : topic.obj_attrs(),
                  content    : topic.content,
                  activity   : 'updated on the topic'
                }).save( function ( err, notif, count ){
                  err && LOG.error( 500,
                    '[app][models][Notifications] Having trouble saving notification', err );
                });
              });
            });
          }
        });
    }
  }
};


