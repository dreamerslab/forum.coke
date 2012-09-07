var common = require( MODEL_DIR + 'hooks/common' );
var hooks  = require( MODEL_DIR + 'hooks/comment' );

module.exports = {

  hooks : {
    pre : {
      save : [
        common.mark_new,
        hooks.cache_user_info,
        hooks.cache_topic_info
      ]
    },

    post : {
      save : [
        hooks.add_to_user,
        hooks.add_to_topic,
        hooks.notify
      ],

      remove : [
        hooks.remove_from_user,
        hooks.remove_from_topic
      ]
    }
  },

  statics : {

    create : function ( args, next, invalid, no_content , success ){
      var Topic = Model( 'Topic' );
      var self = this;

      Topic.
        findById( args.topic_id ).
        populate( 'user_id' ).
        populate( 'comments' ).
        exec( function ( err, topic ){
          if( topic ){
            var comment = new self({
              user_id  : args.user,
              topic_id : topic,
              content  : args.comment.content
            });

            return args.valid ?
              comment.save( success ):
              invalid( topic, comment );
          }

          no_content( err );
        });
    },

    destroy : function ( args, next, no_content, forbidden, success ){
      this.findById( args.id, function ( err, comment ){
        if( comment ) return comment.is_owner( args.user ) ?
            comment.remove( success ) :
            forbidden();

        no_content( err );
      });
    }
  },

  methods : {

    is_owner : function( user ){
      return user ?
        this.user._id.toString() === user._id.toString() :
        false;
    }
  }
};


