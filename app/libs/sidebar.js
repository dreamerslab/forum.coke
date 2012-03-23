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

    flow.series( function( next ){
      Cache.findOne({ name : 'sidebar' }, function( err, cache ){
        if(cache){
          cache = cache;
        }else{
          cache = new Cache({ name : 'sidebar', trunk : {}});
        }

        User.find().sort( 'rating', -1 ).limit( 20 ).run( function ( err, users ){
          users.forEach( function( user ){
            trunk_users.push( user.obj_attrs());
          });

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
    });

    flow.end( function (){
      console.log( 'sidebar updated!' );
      callback && callback();
    });

  }
};