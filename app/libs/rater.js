var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var Topic    = mongoose.model( 'Topic' );
var Comment  = mongoose.model( 'Comment' );



module.exports = {
  init : function ( callback ){
    User.find( function ( err, users ){
      if( err ){
        LOG.error( 500, '[libs][rater][init] Having trouble finding users' );
        callback && callback();
      }

      var flow             = new Flow();
      var RATE_PER_TOPIC   = 5;
      var RATE_PER_COMMENT = 1;

      users.forEach( function ( user ){
        flow.series( function ( next ){
          var c1 = user.topics.length;
          var c2 = user.comments.length;

          user.rating = c1 * RATE_PER_TOPIC + c2 * RATE_PER_COMMENT;
          user.save( function ( err, user ){
            if( err ) return LOG.error( 500,
              '[libs][rater][init] Having trouble saving the user' );

            next();
          });
        });
      });

      flow.end( function (){
        LOG.debug( 'all user rated' );

        callback && callback();
      });

    });
  }
};