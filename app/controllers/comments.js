var Application = require( CONTROLLER_DIR + 'application' );
var validate    = require( LIB_DIR + 'validate/comments' );
var Controller  = Application.extend( validate );

var mongoose    = require( 'mongoose' );
var Topic       = mongoose.model( 'Topic' );
var Comment     = mongoose.model( 'Comment' );

module.exports = Controller.extend({
  _merge : function ( req, result, base_query ){
    return UTILS.merge( result || {}, {
      sidebar   : req.sidebar,
      sess_user : req.user,
      path      : req.path,
      query     : base_query || ''
    });
  },

  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.ensure_authenticated, { only : [ 'create', 'destroy' ]});
    before( this.validate_comment_form, { only : [ 'create' ]});
  },

  create : function ( req, res, next ){
    var self = this;

    Topic.
      findById( req.params.topic_id ).
      populate( 'user' ).
      populate( 'comments' ).
      run( function ( err, topic ){
        if( topic ){
          var comment = new Comment({
            user  : req.user,
            topic : topic
          });

          comment.set_attrs( req.body.comment );

          if( !req.form.isValid ){
            return res.render( 'topics/show',
              self._merge( req, { topic : topic, comment : comment }));
          }

          comment.save( function ( err, comment, count ){
            if( err ){
              req.flash( 'flash-error', 'Comment creation fail' );
            }else{
              req.flash( 'flash-info', 'Comment created' );
            }

            res.redirect( '/topics/' + comment.topic );
          });

          return;
        }

        req.msg = 'Topic';
        self.record_not_found( err, req, res );
      });
  },

  destroy : function ( req, res, next ){
    var self = this;

    Comment.findById( req.params.id, function ( err, comment ){
      if( comment ){
        if( comment.is_owner( req.user )){
          comment.remove( function ( err ){
            if( err ){
              req.flash( 'flash-error', 'Comment deletion fail' );
            }else{
              req.flash( 'flash-info', 'Comment deleted' );
            }

            res.redirect( '/topics/' + comment.topic );
          });

          return;
        }

        req.msg    = 'comment';
        req.origin = '/topics/' + req.params.topic_id;
        self.permission_denied( req, res, next );

        return;
      }

      req.msg = 'Comment';
      self.record_not_found( err, req, res );
    });
  },
});