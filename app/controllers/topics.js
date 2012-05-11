var Application = require( CONTROLLER_DIR + 'application' );
var validate    = require( LIB_DIR + 'validate/topics' );
var Controller  = Application.extend( validate );

var mongoose    = require( 'mongoose' );
var Notif       = mongoose.model( 'Notification' );
var Topic       = mongoose.model( 'Topic' );
var Tag         = mongoose.model( 'Tag' );

module.exports = Controller.extend({

  // controller filters --------------------------------------------------------
  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.ensure_authenticated, {
      only : [ 'new', 'create', 'edit', 'update', 'destroy' ]});
    before( this.validate_topic_form,
      { only : [ 'create', 'update' ]});
    before( this.verify_permission,
      { only : [ 'edit', 'update', 'destroy' ]});
  },

  verify_permission : function ( req, res, next ){
    var self = this;
    var id   = req.params.id || req.params.topic_id;

    Topic.findById( id, function ( err, topic ){
      if( topic ){
        if( topic.is_owner( req.user )){
          req.para_topic = topic;
          return next();
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

  // controller actions --------------------------------------------------------
  tags : function ( req, res, next ){
    var self = this;
    var conds = {};
    var opts  = { sort  : [ 'name', 1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Tag.paginate( conds, opts, next, function ( result ){
      result.nav_selected = 'tags';
      res.render( 'topics/tags', self._merge( req, result, '?' ));
    });
  },

  latest : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'latest';
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
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'trending';
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
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'unsolved';
      res.render( 'topics/index', self._merge( req, result, '?' ));
    });
  },

  tag : function ( req, res, next ){
    if( !req.query.name ){
      req.flash( 'flash-error', 'No tag name specified' );
      res.redirect( '/topics/tags' );

      return;
    }

    var self  = this;
    var conds = { tag_names : { $in : [ req.query.name ]}};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      result.nav_selected     = 'tags';
      result.sub_nav_selected = 'tag';
      result.tag_name         = req.query.name;
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
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'keywords';
      result.keywords = keywords.join( ' ' );
      res.render( 'topics/index',
        self._merge( req, result, '?keywords=' + keywords.join( '+' )));
    });
  },

  show : function ( req, res, next ){
    var self = this;

    if( req.query.nid ){
      Notif.mark_read( req.query.nid, function ( err ){
        err && LOG.error( 500, res, 'Fail to mark notification as read' );

        res.redirect( '/topics/' + req.params.id );
      });

      return;
    }

    Topic.
      findById( req.params.id ).
      populate( 'user_id' ).
      populate( 'comments' ).
      run( function ( err, topic ){
        if( topic ){
          var comment = { content : '' };

          topic.inc_read_count();
          res.render( 'topics/show', self._merge( req, {
              topic        : topic,
              nav_selected : 'topics'
          }));

          return;
        }

        req.msg = 'Topic';
        self.record_not_found( err, req, res );
      });
  },

  'new' : function ( req, res, next ){
    res.render( 'topics/new',
      this._merge( req, { nav_selected : 'topics'}));
  },

  create : function ( req, res, next ){
    var self = this;

    if( !req.form.isValid ){
      res.render( 'topics/new',
        self._merge( req, { topic : req.body.topic }));
      return;
    }

    var topic = new Topic({ user_id : req.user });

    topic.set_attrs( req.body.topic );
    topic.save( function ( err, topic, count ){
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
    var self  = this;
    var topic = req.para_topic;

    return res.render( 'topics/edit',
      self._merge( req, { topic : topic, nav_selected : 'topics' }));
  },

  update : function ( req, res, next ){
    var self  = this;
    var topic = req.para_topic;

    topic.set_attrs( req.body.topic );
    if( !req.form.isValid ){
      return res.render( 'topics/edit',
        self._merge( req, { topic : topic }));
    }

    topic.save( function ( err, topic, count ){
      if( err ){
        req.flash( 'flash-error', 'Topic update fail' );
      }else{
        req.flash( 'flash-info', 'Topic updated' );
      }

      res.redirect( '/topics/' + topic._id );
    });
  },

  destroy : function ( req, res, next ){
    var self  = this;
    var topic = req.para_topic;

    topic.remove( function ( err ){
      if( err ){
        req.flash( 'flash-error', 'Topic deletion fail' );
      }else{
        req.flash( 'flash-info', 'Topic deleted' );
      }

      res.redirect( '/topics' );
    });
  }
});


