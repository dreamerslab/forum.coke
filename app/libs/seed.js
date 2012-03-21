var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );
var Comment  = mongoose.model( 'Comment' );
var Cache    = mongoose.model( 'Cache' );
var flow     = new Flow();

module.exports = {

  init : function ( callback ){
    var users = [
      {
         name  : 'Ben Lin',
         email : 'ben@dreamerslab.com'
      } , {
         name  : 'Fred Chu',
         email : 'fred@dreamerslab.com'
      }, {
         name  : 'Mason Chang',
         email : 'mason@dreamerslab.com'
       }
    ]

    // clearing all collections
    flow.series( function( next ){
        User.collection.drop( function (){
          Post.collection.drop( function (){
            Comment.collection.drop( function (){
              Cache.collection.drop( function (){
                next();
              }); // end of drop Cache.collection
            }); // end of drop Comment.collection
          }); // end of drop Post.collection
        }); // end of drop User.collection
    });

    // creating users
    users.forEach( function ( user ){
      flow.parallel( function ( user, ready ){
        new User( user ).save( function ( err, user ){
          ready();
        });
      }, user );
    });

    flow.join();

    // creating posts
    var i = 30;

    for( ; i--; ){
      flow.parallel( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var umax = users.length;
          var user = users[ Math.floor( Math.random() * umax )];

          new Post({
            user_id    : user._id,
            title      : 'Post title',
            content    : 'Post content blah blah...',
            tags       : [ 'tag1', 'tag2', 'tag3' ],
            read_count : Math.floor( Math.random() * 10 ),
          }).save( function ( err, post ){

            post.update_user( user, function (){
              ready();
            });
          });
        });
      });
    }

    flow.join();

    // create comments
    var j = 100;

    for( ; j--; ){
      flow.parallel( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var umax = users.length;
          var user = users[ Math.floor( Math.random() * umax )];

          Post.find( function ( err, posts ){
            // get a random post
            var pmax = posts.length;
            var post = posts[ Math.floor( Math.random() * pmax )];

            new Comment({
              user_id : user._id,
              post_id : post._id,
              content : 'Comment content blah blah...'
            }).save( function ( err, comment ){
              comment.update_user( user, function (){
                comment.update_post( post, function (){
                  ready();
                });
              });
            });
          });
        });
      });
    }

    flow.join();

    flow.end( function (){
      callback && callback();
    });
  }

};