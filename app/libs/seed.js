var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Post     = mongoose.model( 'Post' );
var Comment  = mongoose.model( 'Comment' );

var users    = [
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
];


module.exports = {
  init : function (){

    User.collection.drop( function (){
      Post.collection.drop( function (){
        Comment.collection.drop( function (){

          users.forEach( function ( u ){
            new User( u )
            .save( function ( err, user ){

              var i     = 0;
              var isize = 10;
              for( ; i < isize; i++ ){
                new Post({
                  _user      : user._id,
                  title      : 'Post title',
                  content    : 'Post content blah blah...',
                  tags       : [ 'tag1', 'tag2', 'tag3' ],
                  read_count : Math.floor( Math.random() * 10 ),
                })
                .save( function ( err, post ){

                  post.update_user( User );

                  var j     = 0;
                  var jsize = Math.floor( Math.random() * 10 );
                  for( ; j < jsize; j++ ){
                    new Comment({
                      _user   : user._id,
                      _post   : post._id,
                      content : 'Comment content blah blah...'
                    })
                    .save( function ( err, comment ){

                      comment.update_user( User );
                      comment.update_post( Post );

                    });
                  }
                });
              }

            });
          });

        }); // end of drop Comment.collection
      }); // end of drop Post.collection
    }); // end of drop User.collection

  }
};