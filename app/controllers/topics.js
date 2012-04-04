var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Topic       = mongoose.model( 'Topic' );
var Tag         = mongoose.model( 'Tag' );
var Application = require( CONTROLLER_DIR + 'application' );


module.exports = Application.extend({

  _merge : function ( req, result, base_query ){
    return UTILS.merge( result, {
      sidebar   : req.sidebar,
      sess_user : req.user,
      referrer  : req.url,
      path      : req.path,
      query     : base_query
    });
  },

  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.ensure_authenticated, {
      only : [ 'new', 'create', 'edit', 'update', 'destroy' ]});
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
      req.flash( 'flash-info', 'unknown keywords' );
      res.redirect( '/topics' );

      return;

    }else{
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
          self._merge( req, result, '?keywords=' + keywords.join( '+' ) ));
      });
    }
  },

  show : function ( req, res, next ){
    var self = this;

    Topic.findById( req.params.id ).
         populate( 'user' ).
         populate( 'comments' ).
         run( function ( err, topic ){
           if( topic ){
             topic.inc_read_count();
             res.render( 'topics/show',
               self._merge( req, { topic : topic }, '' ));
             return;
           }

           req.msg = 'Topic';
           next( err );
         });
  },

  'new' : function ( req, res, next ){
    res.render( 'topics/new',
      this._merge( req, {}, '' ));
  },

  create : function ( req, res, next ){
    // delegate authenticaiton to 'topics/new'
    if( !req.user ){
      res.redirect( '/topics/new' );
      return;
    }

    var user = req.user;
    var topic = new Topic({
      user      : user,
      title     : req.body.topic.title,
      content   : req.body.topic.content,
      tag_names : Tag.extract_names( req.body.topic.tag_names )
    });

    topic.save( function ( err, topic ){
      if( err ){
        next( err );
        return;
      }

      topic.update_tags( Tag );
      topic.add_to_user( user );

      req.flash( 'flash-info', 'Topic created' );
      res.redirect( '/topics/' + topic._id );
    });
  },

  edit : function ( req, res, next ){
    var self = this;

    Topic.findById( req.params.id, function ( err, topic ){
      if( err ){
        req.msg = 'Topic';
        next( err );
        return;
      }

      if( topic.is_owner( req.user )){
        res.render( 'topics/edit',
          self._merge( req, { topic : topic }, '' ));
      }else{
        req.flash( 'flash-info', 'Permission denied: not your topic' );
        res.redirect( '/topics/' + topic._id );
      }
    });
  },

  update : function ( req, res, next ){
    // delegate authenticaiton to 'topics/edit'
    if( !req.user ){
      res.redirect( '/topics/edit' );
      return;
    }

    Topic.findById( req.params.id, function ( err, topic ){
      if( err ){
        req.msg = 'Topic';
        next( err );
        return;
      }

      if( topic.is_owner( req.user )){
        topic.title     = req.body.topic.title;
        topic.content   = req.body.topic.content;
        topic.tag_names = Tag.extract_names( req.body.topic.tag_names );
        topic.save( function ( err, topic ){
          if( err ){
            next( err );
            return;
          }

          topic.update_tags( Tag );
          req.flash( 'flash-info', 'Topic updated' );
          res.redirect( '/topics/' + topic._id );
        });
      }else{
        req.flash( 'flash-info', 'Permission denied: not your topic' );
        res.redirect( '/topics/' + topic._id );
      }
    });
  },

  destroy : function ( req, res, next ){
    // delegate authenticaiton to 'topics/edit'
    if( !req.user ){
      res.redirect( '/topics/edit' );
      return;
    }

    Topic.findById( req.params.id, function ( err, topic ){
      if( err ){
        req.msg = 'Topic';
        next( err );
        return;
      }

      if( topic.is_owner( req.user )){
        topic.remove( function ( err, topic ){
          if( err ){
            req.msg = 'Topic';
            next( err );
            return;
          }

          req.flash( 'flash-info', 'Topic deleted' );
          res.redirect( '/topics' );
        });
      }else{
        req.flash( 'flash-info', 'Permission denied: not your topic' );
        res.redirect( '/topics/' + topic._id );
      }
    });
  },

  tags : function ( req, res, next ){
    var self = this;

    Tag.
      find().
      sort( 'name', 1 ).
      run( function ( err, tags ){
        res.render( 'topics/tags',
          self._merge( req, { tags : tags }, '' ));
      });
  }
});