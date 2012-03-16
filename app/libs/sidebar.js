var mongoose = require( 'mongoose' );
var Cache    = mongoose.model( 'Cache' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );

var fill_sidebar = function (){
  var sidebar      = {};
  var cache_tags   = []; // tags
  var cache_users  = []; // users
  var cache_issues = []; // issues

  Cache.findOne({ name : 'sidebar' }, function ( err, cache ){
    // Note: add error handling later
    if( cache ){
      cache = cache;
    } else {
      cache = new Cache({ name : 'sidebar', objects : {}});
    }

    User.find().sort( 'rating', -1 ).limit( 5 ).run( function ( err, users ){
      users.forEach( function ( user ){
        cache_users.push({
          name   : user.name,
          avatar : user.avatar,
          link   : '/users/' + user._id
        });

        cache.hash = {
          tags   : cache_tags,
          users  : cache_users,
          issues : cache_issues
        };
        cache.save();
      });
    });

  });
};

module.exports = {
  init : function(){

    fill_sidebar();
  }
}