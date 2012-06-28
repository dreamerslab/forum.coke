var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Topic    = mongoose.model( 'Topic' );
var Tag      = mongoose.model( 'Tag' );
var Cache    = mongoose.model( 'Cache' );

module.exports = {
  init : function ( callback ){
    var flow         = new Flow();
    var cache        = {};
    var trunk_tags   = [];
    var trunk_users  = [];
    var trunk_issues = [];

    function compare( a, b ){
      if( a > b ) return 1;
      if( a < b ) return -1;
      return 0;
    }

    flow.series( function ( next ){
      Tag.find(
        function ( err, tags ){
          if( err ) return LOG.error( 500,
            '[libs][sidebar][init] Having trouble finding tags' );

          tags.sort( function ( a, b ){
            return compare( b.topics.length, a.topics.length );
          });

          tags = tags.slice( 0, 21 );

          tags.forEach( function ( tag ){
            trunk_tags.push( tag.obj_attrs());
          });

          trunk_tags.sort( function ( a, b ){
            return compare( a.name, b.name );
          });
          next();
        });
    });

    flow.series( function( next ){
      User.
        find().
        sort( 'rating', -1 ).
        limit( 7 ).
        exec( function ( err, users ){
          if( err ) return LOG.error( 500,
            '[libs][sidebar][init] Having trouble finding users' );

          users.forEach( function( user ){
            trunk_users.push( user.obj_attrs());
          });

          next();
        });
    });

    // flow.series( function ( next ){
    //   var https   = require( 'https' );
    //   var data    = '';
    //   var options = {
    //     host: 'api.github.com',
    //     port: 443,
    //     path: '/repos/dreamerslab/coke/issues',
    //     method: 'GET'
    //   };

    //   var req = https.request( options, function( res ){
    //     res.on( 'data', function ( chunk ){
    //       data = data + chunk.toString();
    //     });

    //     res.on( 'end', function (){
    //       var issues = JSON.parse( data );

    //       issues.forEach( function ( issue ){
    //         if( trunk_issues.length < 6 ){
    //           if( issue.state === 'open' ){
    //             trunk_issues.push({
    //               title   : issue.title,
    //               content : issue.body,
    //               link    : issue.html_url
    //             });
    //           }
    //         }
    //       });

    //       next();
    //     });
    //   });

    //   req.on( 'error', function( err ){
    //     err && LOG.error( 500,
    //       '[libs][sidebar][init] Having trouble getting github issues', err );
    //   });

    //   req.end();
    // });

    flow.series( function ( next ){
      Cache.findOne({
        name : 'sidebar'
      }, function( err, cache ){
        if( err ) return LOG.error( 500,
          '[libs][sidebar][init] Having trouble finding sidebar cache', err );

        cache = !cache ?
          new Cache({ name : 'sidebar' }) :
          cache;

        cache.trunk = {
          tags   : trunk_tags,
          users  : trunk_users,
          issues : trunk_issues
        };

        cache.markModified( 'trunk' );
        cache.save( function ( err, cache, count ){
          if( err ) return LOG.error( 500,
            '[libs][sidebar][init] Having trouble updating sidebar cache', err );

          next();
        });
      });
    });

    flow.end( function (){
      LOG.debug( 'sidebar updated' );

      // callback && callback();
      if( UTILS.typeof( callback ) === 'function' ) callback();
    });
  }
};