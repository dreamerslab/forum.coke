var mongoose    = require( 'mongoose' );
var User        = mongoose.model( 'User' );
var Application = require( CONTROLLER_DIR + 'application' );

module.exports = Application.extend({

  init : function ( before, after ){
    after( this.validation, {
      only : [ 'create', 'update' ]
    });

    after( this.unique, {
      only : [ 'create', 'update' ]
    });

    after( this.record_not_found, {
      except : [ 'new', 'create', 'index' ]
    });
  },

  'new' : function ( req, res, next ){
    res.render( 'users/new' );
  },

  create : function ( req, res, next ){
    User.create_or_update( new User(), req.body.user,
      function ( err, user ){
        if( err ){
          next( err );
          return;
        }

        req.flash( 'flash-info', 'User created' );
        res.redirect( '/users/' + user._id );
      });
  },

  index : function ( req, res, next ){
    User.find( function ( err, users ){
      if( err ){
        next( err );
        return;
      }

      res.render( 'users/index', {
        users : users
      });
    });
  },

  show : function ( req, res, next ){
    User.findById( req.params.id , function ( err, user ){
      if( user ){
        res.render( 'users/show', {
          user : user
        });

        return;
      }

      req.msg = 'User';
      next( err );
    });
  },

  edit : function ( req, res, next ){
    User.findById( req.params.id , function ( err, user ){
      if( user ){
        res.render( 'users/edit', {
          user : user
        });

        return;
      }

      req.msg = 'User';
      next( err );
    });
  },

  update : function ( req, res, next ){
    User.findById( req.params.id , function ( err, user ){
      if( user ){
        User.create_or_update( user, req.body.user,
          function ( err, user ){
            if( err ){
              next( err );
              return;
            }

            req.flash( 'flash-info', 'User updated' );
            res.redirect( '/users/' + user._id );
          });

        return;
      }

      req.msg = 'User';
      next( err );
    });
  },

  destroy : function ( req, res, next ){
    User.findById( req.params.id , function ( err, user ){
      if( user ){
        user.remove( function ( err, user ){
          if( err ){
            next( err );
            return;
          }

          req.flash( 'flash-info', 'User deleted' );
          res.redirect( '/users' );
        });

        return;
      }

      req.msg = 'User';
      next( err );
    });
  }
});