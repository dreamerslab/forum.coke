var Class = require( 'node.class' );
var Cache = Model( 'Cache' );

module.exports = Class.extend({

  common_locals : function ( req, res, next ){
    res.locals({
      sidebar   : req.sidebar,
      sess_user : req.user,
      path      : req.path,
      query     : '?'
    });

    next();
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
    if( !( err.name && err.name == 'ValidationError' )){
      next( err );
    }

    Object.keys( err.errors ).forEach( function ( error ){
      req.flash( 'flash-error', err.errors[ error ].message );
    });

    res.redirect( 'back' );
    LOG.error( 400, res, err );
  },

  unique : function ( err, req, res, next ){
    if( !( err.name && err.name == 'MongoError' )){
      next( err );
    }

    req.flash( 'flash-error', err.err );
    res.redirect( 'back' );
    LOG.error( 46, res, err );
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


