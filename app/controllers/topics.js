var Application = require( CONTROLLER_DIR + 'application' );
var validate    = require( LIB_DIR + 'validate/topics' );
var Controller  = Application.extend( validate );
var mongoose    = require( 'mongoose' );
var Topic       = mongoose.model( 'Topic' );

module.exports = Controller.extend({

//--- filters ------------------------------------------------------------------

  init : function ( before, after ){
    before( this.sidebar );

    before( this.authenticated, {
      only : [ 'new', 'create', 'edit', 'update', 'destroy' ]
    });

    before( this.validate_topics,{
      only : [ 'create', 'update' ]
    });

    before( this.authorized,{
      only : [ 'edit', 'update', 'destroy' ]
    });
  },

  authorized : function ( req, res, next ){
    var self = this;
    var args = {
      id   : req.params.id || req.params.topic_id,
      user : req.user
    };

    Topic.authorized( args,
      // no_content
      function ( err ){
        req.msg = 'Topic';
        self.no_content( err, req, res );
      },
      // forbidden
      function (){
        req.msg    = 'topic';
        req.origin = '/topics/' + id;
        self.forbidden( req, res, next );
      },
      // success
      function ( topic ){
        req.topic = topic;
        next();
      });
  },

//--- actions ------------------------------------------------------------------

  // latest
  index : function ( req, res, next ){
    var self  = this;

    Topic.latest( req.query.from, next, function ( result ){
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'latest';
      res.render( 'topics/index', self._merge( req, result ));
    });
  },

  trending : function ( req, res, next ){
    var self  = this;

    Topic.trending( req.query.from, next, function ( result ){
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'trending';
      res.render( 'topics/index', self._merge( req, result ));
    });
  },

  unsolved : function ( req, res, next ){
    var self  = this;

    Topic.unsolved( req.query.from, next, function ( result ){
      result.nav_selected     = 'topics';
      result.sub_nav_selected = 'unsolved';
      res.render( 'topics/index', self._merge( req, result ));
    });
  },

  search : function ( req, res, next ){
    var self     = this;
    var keywords = req.query.keywords.split( /\s+|\+/ );
    var args     = {
      keywords : keywords,
      skip     : req.query.from
    };

    Topic.search( args, next,
      // no keyword
      function (){
        req.flash( 'flash-error', 'No keyword specified' );
        res.redirect( '/topics' );
      },
      // success
      function ( result ){
        result.nav_selected     = 'topics';
        result.sub_nav_selected = 'keyword';
        result.keywords         = keywords.join( ' ' );
        res.render( 'topics/index',
          self._merge( req, result, '?keywords=' + keywords.join( '+' )));
      });
  },

  show : function ( req, res, next ){
    var self = this;
    var id   = req.params.id;
    var args = {
      id  : id,
      nid : req.query.nid
    };

    Topic.show( args,
      // mark as read
      function ( err ){
        err && LOG.error( 500, res, 'Fail to mark notification as read' );
        res.redirect( '/topics/' + id );
      },
      // no content
      function ( err ){
        req.msg = 'Topic';
        self.no_content( err, req, res );
      },
      // success
      function ( topic ){
        res.render( 'topics/show', self._merge( req, {
          topic        : topic,
          nav_selected : 'topics'
        }));
    });
  },

  'new' : function ( req, res, next ){
    res.render( 'topics/new',
      this._merge( req, { nav_selected : 'topics'}));
  },

  create : function ( req, res, next ){
    var self  = this;
    var topic = req.body.topic;
    var args  = {
      valid : req.form.isValid,
      user  : req.user,
      topic : topic
    };

    Topic.create( args,
      // invalid
      function (){
        res.render( 'topics/new',
          self._merge( req, { topic : topic }));
      },
      // success
      function ( err, topic, count ){
        if( err ){
          req.flash( 'flash-error', 'Topic creation fail' );
          return res.redirect( '/topics' );
        }

        req.flash( 'flash-info', 'Topic created' );
        res.redirect( '/topics/' + topic._id );
      });
  },

  edit : function ( req, res, next ){
    var self  = this;

    return res.render( 'topics/edit',
      self._merge( req, { topic : req.topic, nav_selected : 'topics' }));
  },

  update : function ( req, res, next ){
    var self = this;
    var args = {
      valid : req.form.isValid,
      topic : req.topic,
      src   : req.body.topic
    };

    Topic.update_props( args,
      // invalid
      function (){
        res.render( 'topics/edit',
          self._merge( req, { topic : req.topic }));
      },
      // success
      function ( err, topic, count ){
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

    req.topic.remove( function ( err ){
      if( err ){
        req.flash( 'flash-error', 'Topic deletion fail' );
      }else{
        req.flash( 'flash-info', 'Topic deleted' );
      }

      res.redirect( '/topics' );
    });
  }
});


