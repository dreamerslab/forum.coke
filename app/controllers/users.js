var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Topic       = mongoose.model( 'Topic' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

//--- filters ------------------------------------------------------------------

  init : function ( before, after ){
    before( this.sidebar );
    before( this.find_user, {
      only : [ 'show', 'topics', 'replies' ]
    });
  },

  find_user : function ( req, res, next ){
    var self = this;
    var id   = req.params.id || req.params.user_id;

    User.findById( id, function ( err, user ){
      if( user ){
        // do not usr req.user, its for seesion user
        req.this_user = user;
        return next();
      }

      req.msg = 'User';
      self.no_content( err, req, res );
    });
  },

//--- actions ------------------------------------------------------------------

  index : function ( req, res, next ){
    var self  = this;

    User.index( req.query.from, next, function ( result ){
      result.nav_selected = 'users';
      res.render( 'users/index', self._merge( req, result ));
    });
  },

  show : function ( req, res, next ){
    var self  = this;
    var args = {
      user_id  : req.this_user._id,
      comments : req.this_user.comments
    };

    User.show( args, next, function ( topics, replies ){
      req.this_user.recent_topics  = topics;
      req.this_user.recent_replies = replies;

      res.render( 'users/show', self._merge( req, {
        nav_selected : 'users',
        user         : req.this_user
      }));
    });
  },

  topics : function ( req, res, next ){
    var self  = this;
    var args = {
      user_id : req.this_user._id,
      skip    : req.query.from
    };

    User.topics( args, next, function ( result ){
      res.render( 'users/topics', self._merge( req, result ));
    });
  },

  replies : function ( req, res, next ){
    var self  = this;
    var args = {
      comments : req.this_user.comments,
      skip     : req.query.from
    };

    User.replies( args, next, function ( result ){
      res.render( 'users/topics', self._merge( req, result ));
    });
  }
});


