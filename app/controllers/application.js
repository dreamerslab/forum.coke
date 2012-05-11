var Class    = require( 'resig-class' );
var mongoose = require( 'mongoose' );
var Cache    = mongoose.model( 'Cache' );

module.exports = Class.extend({

  _merge : function ( req, result, base_query ){
    return UTILS.merge( result || {}, {
      sidebar   : req.sidebar,
      sess_user : req.user,
      path      : req.path,
      query     : base_query || ''
    });
  },

  record_not_found : function ( err, req, res, next ){
    err && LOG.error( 500, res, err );

    req.flash( 'flash-error', req.msg + ' not found' );
    res.redirect( 'back' );
  },

  permission_denied : function ( req, res, next ){
    LOG.error( 500, res, 'Permission denied' );

    req.flash( 'flash-error', 'Permission denied: not your ' + req.msg );
    res.redirect( req.origin );
  },

  validation : function ( err, req, res, next ){
    if( err.name && err.name == 'ValidationError' ){
      var error;
      for( error in err.errors ){
        req.flash( 'flash-error', err.errors[ error ].message );
      }

      res.redirect( 'back' );
      LOG.error( 500, res, err );

      return;
    }

    next( err );
  },

  unique : function ( err, req, res, next ){
    if( err.name && err.name == 'MongoError' ){
      // respond with html page
      if( req.accepts( 'html' )){
        req.flash( 'flash-error', err.err );
        res.redirect( 'back' );
        LOG.error( 46, res, err );

        return;
      }

      // respond with json
      if( req.accepts( 'json' )){
        res.json({
          status : 46,
          body : 'The given field has been taken'
        });

        return;
      }
    }

    next( err );
  },

  fill_sidebar : function ( req, res, next ){
    Cache.findOne({
      name : 'sidebar'
    }, function ( err, cache ){
      err && LOG.error( 500,
        '[app][controllers][application] Having trouble filling sidebar data' );

      req.sidebar = cache && cache.trunk ?
        cache.trunk :
        { tags : [], users : [], issues : []};

      next();
    });
  },

  ensure_authenticated : function ( req, res, next ){
    if( req.isAuthenticated()){
      next();
      return;
    }

    res.redirect( '/auth/google' );
  }
});