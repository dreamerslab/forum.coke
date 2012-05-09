var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Topic       = mongoose.model( 'Topic' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({
  _merge : function ( req, result, base_query ){
    return UTILS.merge( result || {}, {
      sidebar   : req.sidebar,
      sess_user : req.user,
      path      : req.path,
      query     : base_query || ''
    });
  },

  find_param_user : function ( req, res, next ){
    var self    = this;
    var user_id = req.params.id || req.params.user_id;

    User.findById( user_id, function ( err, user ){
      if( user ){
        req.para_user = user;
        return next();
      }

      req.msg = 'User';
      self.record_not_found( err, req, res );
    });
  },

  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.find_param_user, { only : [ 'show', 'topics', 'replies' ]});
  },

  index : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = { sort  : [ 'name', 1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    User.paginate( conds, opts, next, function ( result ){
      result.nav_selected = 'users';
      res.render( 'users/index', self._merge( req, result, '?' ));
    });
  },

  show : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = {};

    conds = { user : req.para_user._id };
    opts  = { limit : 6, sort : [[ 'updated_at', -1 ]]};
    Topic.find( conds, null, opts, function ( err, recent_topics ){
      if( err ) return next( err );

      conds = { comments : { $in : req.para_user.comments }};
      Topic.find( conds, null, opts, function ( err, recent_replies ){
        if( err ) return next( err );

        req.para_user.recent_topics  = recent_topics;
        req.para_user.recent_replies = recent_replies;

        res.render( 'users/show', {
          nav_selected : 'users',
          sidebar      : req.sidebar,
          sess_user    : req.user,
          user         : req.para_user
        });
      });
    });
  },

  topics : function ( req, res, next ){
    var self  = this;
    var conds = { user : req.para_user._id };
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'users/topics', self._merge( req, result, '?' ));
    });
  },

  replies : function ( req, res, next ){
    var self  = this;
    var conds = { comments : { $in : req.para_user.comments }};
    var opts  = { sort  : [ 'updated_at', -1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    Topic.paginate( conds, opts, next, function ( result ){
      res.render( 'users/topics', self._merge( req, result, '?' ));
    });
  }
});