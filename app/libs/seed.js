var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );
var Comment  = mongoose.model( 'Comment' );
var Tag      = mongoose.model( 'Tag' );
var Cache    = mongoose.model( 'Cache' );
var Flow     = require( 'node.flow' );
var flow     = new Flow();
var Faker    = require( 'faker' );

var random = function ( max ){
  return Faker.Helpers.randomNumber( max );
};

var random_user = function (){
  return {
    name  : Faker.Name.findName(),
    email : Faker.Internet.email(),
  };
};

var random_post = function (){
  return {
    title      : Faker.Lorem.sentence(),
    content    : Faker.Lorem.paragraphs( random( 3 )),
    read_count : random( 10 )
  };
};

var random_comment = function(){
  return {
    content : Faker.Lorem.paragraphs( random( 3 )),
  };
};

module.exports = {

  init : function ( callback ){

    // clearing all collections
    flow.series( function( next ){
      User.collection.drop( function (){
        Post.collection.drop( function (){
          Comment.collection.drop( function (){
            Cache.collection.drop( function (){
              Tag.collection.drop( function (){
                next();
              }); // end of drop Tap.collection
            }); // end of drop Cache.collection
          }); // end of drop Comment.collection
        }); // end of drop Post.collection
      }); // end of drop User.collection
    });

    // creating users
    var i = 5;

    for( ; i--; ){
      flow.parallel( function ( ready ){
        var user = random_user();
        new User( user ).save( function ( err, user ){
          ready();
        });
      });
    }

    flow.join();

    // creating posts
    var j = 50;

    for( ; j--; ){
      flow.series( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var user   = users[ random( users.length )];
          var post   = random_post();
          var string = Faker.Lorem.words( random( 5 )).join(', ');

          post.user      = user;
          post.tag_names = Tag.extract_names( string );
          new Post( post ).save( function ( err, post ){
            post.update_tags( Tag ); // async but no callback
            post.add_to_user( user, function (){
              ready();
            });
          });
        });
      });
    }

    // flow.join();

    // create comments
    var k = 100;

    for( ; k--; ){
      flow.parallel( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var user = users[ random( users.length )];

          Post.find( function ( err, posts ){
            // get a random post
            var post    = posts[ random( posts.length )];
            var comment = random_comment();

            comment.user = user;
            comment.post = post;
            new Comment( comment ).save( function ( err, comment ){
              comment.add_to_user( user, function (){
                comment.add_to_post( post, function (){
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
      console.log( 'seed filled!' );
      callback && callback();
    });
  }

};