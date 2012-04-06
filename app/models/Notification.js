var Notification = require( BASE_DIR + 'db/schema' ).Notification;



Notification.statics = {
  send : function ( type, topic, comment, callback ){
    var self = this;
    var mongoose = require( 'mongoose' );
    var User     = mongoose.model( 'User' );
    var Comment  = mongoose.model( 'Comment' );

    Comment.
      find({ topic : topic._id }).
      populate( 'user' ).
      run( function ( err, comments ){
        if( err ) return;

        // var originator  = {};
        var subscribers = comments.map( function ( c ){ return c.user; });

        if( type === 'create-comment' ){
          User.findById( comment.user, function ( err, user ){
            if( err ) return;

            // notify all subscribers
            subscribers.forEach( function ( subr ){
              if( subr._id.toString() !== user._id.toString()){
                new self({
                  user       : subr._id,
                  type       : type,
                  originator : user.obj_attrs(),
                  topic      : topic.obj_attrs()
                }).save();
              }

              // notify the topic author
            });
          });
        }else if( type === 'update-topic' ){

        }
      });
  }
};



require( 'mongoose' ).model( 'Notification', Notification );