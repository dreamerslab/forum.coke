var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );
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
      if( a.name > b.name )
        return 1;
      if( a.name < b.name )
        return -1
      return 0
    };

    flow.series( function ( next ){
      Tag.
        find().
        sort( 'post_count', -1 ).
        limit( 20 ).
        run( function ( err, tags ){
          tags.forEach( function ( tag ){
            trunk_tags.push( tag.obj_attrs());
          });
          trunk_tags.sort( compare );
          next();
        });
    });

    flow.series( function( next ){
      User.
        find().
        sort( 'rating', -1 ).
        limit( 6 ).
        run( function ( err, users ){
          users.forEach( function( user ){
            trunk_users.push( user.obj_attrs());
          });
          trunk_users.sort( compare );
          next();
        });
    });

    flow.series( function ( next ){
      var https   = require( 'https' );
      var data    = "";
      var options = {
        host: 'api.github.com',
        port: 443,
        path: '/repos/dreamerslab/coke/issues',
        method: 'GET'
      };

      var req = https.request( options, function( res ){
        res.on( 'data', function ( chunk ){
          data = data + chunk.toString();
        });

        res.on( 'end', function (){
          var issues = JSON.parse( data );
          issues.forEach( function ( issue ){
            if( trunk_issues.length < 5 ){
              if( issue.state === 'open' ){
                trunk_issues.push({
                  title : issue.title,
                  link  : issue.html_url
                });
              }
            }
          });

          next();
        });
      });
      req.end();

      req.on( 'error', function( err ){
        console.error( err );
      });
    });

    flow.series( function ( next ){
      Cache.findOne({ name : 'sidebar' }, function( err, cache ){
        if( cache ){
          cache = cache;
        }else{
          cache = new Cache({ name : 'sidebar', trunk : {}});
        }

        cache.trunk = {
          tags   : trunk_tags,
          users  : trunk_users,
          issues : trunk_issues
        };

        cache.save( function ( err, cache ){
          next();
        });
      });
    });

    flow.end( function (){
      console.log( 'sidebar updated!' );
      callback && callback();
    });

  }
};