var Flow    = require( 'node.flow' );
var User    = Model( 'User' );
var Topic   = Model( 'Topic' );
var Comment = Model( 'Comment' );

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

          user.rating =
            user.topics.length * RATE_PER_TOPIC +
            user.comments.length * RATE_PER_COMMENT;

          user.save( function ( err, user, count ){
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


