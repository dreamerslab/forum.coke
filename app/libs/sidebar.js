var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );
var Cache    = mongoose.model( 'Cache' );
var flow     = new Flow();


module.exports = {
  init : function ( callback ){
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
            // console.log( "user : ", user.name );
            trunk_users.push({
              name   : user.name,
              avatar : user.avatar,
              link   : '/users/' + user._id
            });
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
      callback && callback();
    });

  }
};