var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
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

  init : function ( before, after ){
    before( this.fill_sidebar );
  },

  index : function ( req, res, next ){
    var self  = this;
    var conds = {};
    var opts  = { sort  : [ 'name', 1 ],
                  skip  : req.query.from || 0,
                  limit : 20 };

    User.paginate( conds, opts, next, function ( result ){
      res.render( 'users/index', self._merge( req, result, '?' ));
    });
  },

  show : function ( req, res, next ){
    var self = this;
    var id = req.params.id;

    User.
      findById( id ).
      populate( 'topics', null, {}, { sort : [[ 'updated_at', -1 ]], limit : 3 }).
      populate( 'comments', null, {}, { sort : [[ 'updated_at', -1 ]], limit : 3 }).
      run( function ( err, populated_user ){
        if( populated_user ){
          User.findById( id, function ( err, user ){
            // NOTE: the following vars will not appear in console.log()
            populated_user.topic_count   = user.topics.length;
            populated_user.comment_count = user.comments.length;

            res.render( 'users/show', {
              sidebar   : req.sidebar,
              sess_user : req.user,
              user      : populated_user,
            });
          });

          return;
        }

        req.msg = 'User';
        self.record_not_found( err, req, res );
      });
  }
});