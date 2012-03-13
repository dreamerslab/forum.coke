var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );

var users    = [
  {
     name  : 'Ben Lin',
     email :  'ben@dreamerslab.com'
  } , {
     name  : 'Fred Chu',
     email :  'fred@dreamerslab.com'
  }, {
     name  : 'Mason Chang',
     email : 'mason@dreamerslab.com'
   }
];

var i         = 0;
var size      = 10;

module.exports = {
  init : function (){

    User.collection.drop( function (){
      Post.collection.drop( function (){

        users.forEach( function ( u ){
          new User( u ).save( function ( err, user ){

            for( i=0; i < size; i++ ){
              new Post({
                user_id       : user._id,
                user_name     : user.name,
                title         : 'Title title title ' + i,
                content       : 'Content content content ' + i,
                read_count    : Math.floor( Math.random() * 10 ),
                comment_count : Math.floor( Math.random() * 10 )
              }).save();
            }

          });
        });

      }); // end of drop Post.collection
    }); // end of drop User.collection

  }
};