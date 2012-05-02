var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Notif       = mongoose.model( 'Notification' );
var Topic       = mongoose.model( 'Topic' );
var Tag         = mongoose.model( 'Tag' );
var Comment     = mongoose.model( 'Comment' );
var Application = require( CONTROLLER_DIR + 'application' );

var form        = require( 'express-form2' );
var filter      = form.filter;
var validate    = form.validate;

var validate_topic_form = form(
  filter( 'topic.title' ).trim(),
  validate( 'topic.title', 'Tilte' ).required(),
  filter( 'topic.content' ).trim(),
  validate( 'topic.content', 'Content' ).required()
);

module.exports = Application.extend({
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
    before( this.ensure_authenticated, {
      only : [ 'new', 'create', 'edit', 'update', 'destroy' ]});
    before( validate_topic_form, { only : [ 'create', 'update' ]});
  },

  latest : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'topics/index', self._merge( req, result, '?' ));
    });
  },

  trending : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = { sort  : [ 'read_count', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'topics/index', self._merge( req, result, '?' ));
    });
  },

  unsolved : function ( req, res, next ){
    var self  = this;
    var conds = { comments : { $size : 0 }};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'topics/index', self._merge( req, result, '?' ));
    });
  },

  tag : function ( req, res, next ){
    if( !req.query.name ){
      req.flash( 'flash-error', 'No tag name speciefied' );
      res.redirect( '/topics/tags' );

      return;
    }

    var self  = this;
    var conds = { tag_names : { $in : [ req.query.name ]}};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'topics/index',
        self._merge( req, result, '?name=' + req.query.name ));
    });
  },

  search : function ( req, res, next ){
    if( !req.query.keywords ){
      req.flash( 'flash-error', 'No keyword specified' );
      res.redirect( '/topics' );

      return;
    }

    var keywords = req.query.keywords.split( /\s+|\+/ );
    var regexp   = new RegExp( keywords.join( '|' ), 'gi' );
    var self     = this;
    var conds    = { $or : [{ title : regexp }, { content : regexp }]};
    var opts     = { sort  : [ 'updated_at', -1 ],
                     skip  : req.query.from || 0,
                     limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      result.keywords = keywords.join( ' ' );

      res.render( 'topics/index',
        self._merge( req, result, '?keywords=' + keywords.join( '+' )));
    });
  },

  show : function ( req, res, next ){
    var self = this;

    if( req.query.nid ){
      Notif.update(
        { _id : req.query.nid },
        { $set : { is_read : true }},
        function ( err ){
          err && LOG.error( 500, res, 'Fail to mark notification as read' );

          res.redirect( '/topics/' + req.params.id );
        });

      return;
    }

    Topic.
      findById( req.params.id ).
      populate( 'user' ).
      populate( 'comments' ).
      run( function ( err, topic ){
        if( topic ){
          var comment = { content : '' };

          topic.inc_read_count();
          res.render( 'topics/show',
            self._merge( req, { topic : topic }));

          return;
        }

        req.msg = 'Topic';
        self.record_not_found( err, req, res );
      });
  },

  'new' : function ( req, res, next ){
    res.render( 'topics/new',
      this._merge( req ));
  },

  create : function ( req, res, next ){
    var self = this;

    if( !req.form.isValid ){
      res.render( 'topics/new',
        self._merge( req, { topic : req.body.topic }));
      return;
    }

    var topic = new Topic({ user : req.user });

    topic.set_attrs( req.body.topic );
    topic.save( function ( err, topic ){
      if( err ){
        req.flash( 'flash-error', 'Topic creation fail' );
        res.redirect( '/topics' );
        return;
      }

      req.flash( 'flash-info', 'Topic created' );
      res.redirect( '/topics/' + topic._id );
    });
  },

  edit : function ( req, res, next ){
    var self = this;

    Topic.findById( req.params.id, function ( err, topic ){
      if( topic ){
        if( topic.is_owner( req.user )){
          return res.render( 'topics/edit',
            self._merge( req, { topic : topic }));
        }

        req.msg    = 'topic';
        req.origin = '/topics/' + topic._id;
        self.permission_denied( req, res, next );

        return;
      }

      req.msg = 'Topic';
      self.record_not_found( err, req, res );
    });
  },

  update : function ( req, res, next ){
    var self = this;

    Topic.findById( req.params.id, function ( err, topic ){
      if( topic ){
        if( topic.is_owner( req.user )){
          topic.set_attrs( req.body.topic );

          if( !req.form.isValid ){
            return res.render( 'topics/edit',
              self._merge( req, { topic : topic }));
          }

          topic.save( function ( err, topic ){
            if( err ){
              req.flash( 'flash-error', 'Topic update fail' );
            }else{
              req.flash( 'flash-info', 'Topic updated' );
            }

            res.redirect( '/topics/' + topic._id );
          });

          return;
        }

        req.msg    = 'topic';
        req.origin = '/topics/' + topic._id;
        self.permission_denied( req, res, next );

        return;
      }

      req.msg = 'Topic';
      self.record_not_found( err, req, res, next );
    });
  },

  destroy : function ( req, res, next ){
    var self = this;

    Topic.findById( req.params.id, function ( err, topic ){
      if( topic ){
        if( topic.is_owner( req.user )){
          topic.remove( function ( err ){
            if( err ){
              req.flash( 'flash-error', 'Topic deletion fail' );
            }else{
              req.flash( 'flash-info', 'Topic deleted' );
            }

            res.redirect( '/topics' );
          });

          return;
        }

        req.msg    = 'topic';
        req.origin = '/topics/' + topic._id;
        self.permission_denied( req, res, next );

        return;
      }

      req.msg = 'Topic';
      self.record_not_found( err, req, res, next );
    });
  },

  tags : function ( req, res, next ){
    var self = this;

    Tag.
      find().
      sort( 'name', 1 ).
      run( function ( err, tags ){
        if( err ) return next( err );

        res.render( 'topics/tags',
          self._merge( req, { tags : tags }));
      });
  }
});