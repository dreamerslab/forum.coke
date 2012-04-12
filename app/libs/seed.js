var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Topic    = mongoose.model( 'Topic' );
var Comment  = mongoose.model( 'Comment' );
var Tag      = mongoose.model( 'Tag' );
var Notif    = mongoose.model( 'Notification' );
var Cache    = mongoose.model( 'Cache' );
var Flow     = require( 'node.flow' );
var flow     = new Flow();
var Faker    = require( 'faker' );

var random = function ( max ){
  return Faker.Helpers.randomNumber( max );
};

var random_user = function (){
  return {
    google_id : ( random( 1000000 ).toString()),
    name      : Faker.Name.findName(),
    email     : Faker.Internet.email(),
  };
};

var random_topic = function (){
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
        Topic.collection.drop( function (){
          Comment.collection.drop( function (){
            Cache.collection.drop( function (){
              Tag.collection.drop( function (){
                Notif.collection.drop( function (){
                  next();
                }); // end of drop Notif.collection
              }); // end of drop Tap.collection
            }); // end of drop Cache.collection
          }); // end of drop Comment.collection
        }); // end of drop Topic.collection
      }); // end of drop User.collection
    });

    // creating users
    var i = 10;

    for( ; i--; ){
      flow.parallel( function ( ready ){
        var user = random_user();
        new User( user ).save( function ( err, user ){
          ready();
        });
      });
    }

    flow.join();

    // creating topics
    var j = 100;

    for( ; j--; ){
      flow.series( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var user   = users[ random( users.length )];
          var topic  = random_topic();
          var string = Faker.Lorem.words( random( 5 )).join(', ');

          topic.user      = user;
          topic.tag_names = Tag.extract_names( string );
          new Topic( topic ).save( function ( err, topic ){
            ready();
          });
        });
      });
    }

    // create comments
    var k = 150;

    for( ; k--; ){
      flow.parallel( function ( ready ){
        User.find( function ( err, users ){
          // get a random user
          var user = users[ random( users.length )];

          Topic.find( function ( err, topics ){
            // get a random topic
            var topic   = topics[ random( topics.length )];
            var comment = random_comment();

            comment.user  = user;
            comment.topic = topic;
            new Comment( comment ).save( function ( err, comment ){
              ready();
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