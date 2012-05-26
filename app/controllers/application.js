var Class    = require( 'resig-class' );
var mongoose = require( 'mongoose' );
var Cache    = mongoose.model( 'Cache' );

module.exports = Class.extend({

  _merge : function ( req, result, base_query ){
    return UTILS.merge( result || {}, {
      sidebar   : req.sidebar,
      sess_user : req.user,
      path      : req.path,
      query     : base_query || '?'
    });
  },

  no_content : function ( err, req, res, next ){
    err && LOG.error( 204, res, err );

    req.flash( 'flash-error', req.msg + ' not found' );
    res.redirect( 'back' );
  },

  forbidden : function ( req, res, next ){
    LOG.error( 403, res, 'Permission denied' );

    req.flash( 'flash-error', 'Permission denied: not your ' + req.msg );
    res.redirect( req.origin );
  },

  validation : function ( err, req, res, next ){
    if( err.name && err.name == 'ValidationError' ){
      Object.keys( err.errors ).forEach( function ( error ){
        req.flash( 'flash-error', err.errors[ error ].message );
      });

      res.redirect( 'back' );
      return LOG.error( 400, res, err );
    }

    next( err );
  },

  unique : function ( err, req, res, next ){
    if( err.name && err.name == 'MongoError' ){
      req.flash( 'flash-error', err.err );
      res.redirect( 'back' );
      return LOG.error( 46, res, err );
    }

    next( err );
  },

  sidebar : function ( req, res, next ){
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

  authenticated : function ( req, res, next ){
    if( req.isAuthenticated()) return next();

    res.redirect( '/auth/google' );
  }
});


