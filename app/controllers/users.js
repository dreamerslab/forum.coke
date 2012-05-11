var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Topic       = mongoose.model( 'Topic' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  // controller filters --------------------------------------------------------
  init : function ( before, after ){
    before( this.fill_sidebar );
    before( this.find_param_user, { only : [ 'show', 'topics', 'replies' ]});
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

  // controller actions --------------------------------------------------------
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
    var opts  = { limit : 6, sort : [[ 'updated_at', -1 ]]};;

    conds = { user : req.para_user._id };
    Topic.find( conds, null, opts, function ( err, topics ){
      if( err ) return next( err );

      conds = { comments : { $in : req.para_user.comments }};
      Topic.find( conds, null, opts, function ( err, replies ){
        if( err ) return next( err );

        req.para_user.recent_topics  = topics;
        req.para_user.recent_replies = replies;
        res.render( 'users/show', self._merge( req, {
          nav_selected : 'users',
          user         : req.para_user
        }));
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