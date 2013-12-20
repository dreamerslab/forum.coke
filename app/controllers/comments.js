var Application = require( CONTROLLER_DIR + '/application' );
var validate    = require( LIB_DIR + '/validate/comments' );
var Topic       = Model( 'Topic' );
var Comment     = Model( 'Comment' );

module.exports = Application.inject( validate ).extend({

  init : function ( before, after ){
    before( this.sidebar );
    before( this.authenticated );
    before( this.validate_comments, { only : [ 'create' ]});
    before( this.common_locals,     { only : [ 'create' ]});
  },

  create : function ( req, res, next ){
    var self = this;
    var args = {
      valid    : req.form.isValid,
      user     : req.user,
      topic_id : req.params.topic_id,
      comment  : req.body.comment
    };

    Comment.create( args, next,
      // invalid
      function ( topic, comment ){
        res.render( 'topics/show', {
          topic   : topic,
          comment : comment
        });
      },
      // no_content
      function ( err ){
        req.msg = 'Topic';

        self.no_content( err, req, res );
      },
      // success
      function ( err, comment, count ){
        if( err ){
          req.flash( 'flash-error', 'Comment creation fail' );
        }else{
          req.flash( 'flash-info', 'Comment created' );
        }

        res.redirect( '/topics/' + comment.topic_id );
      });
  },

  destroy : function ( req, res, next ){
    var self     = this;
    var topic_id = req.params.topic_id;
    var args     = {
      id   : req.params.id,
      user : req.user
    };

    Comment.destroy( args, next,
      // no content
      function ( err ){
        req.msg = 'Comment';

        self.no_content( err, req, res );
      },
      // forbidden
      function (){
        req.msg    = 'comment';
        req.origin = '/topics/' + topic_id;

        self.forbidden( req, res, next );
      },
      // success
      function ( err, count ){
        if( err ){
          req.flash( 'flash-error', 'Comment deletion fail' );
        }else{
          req.flash( 'flash-info', 'Comment deleted' );
        }

        res.redirect( '/topics/' + topic_id );
      });
  },
});
