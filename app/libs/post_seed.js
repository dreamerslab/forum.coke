var mongoose = require( 'mongoose' );
var Post     = mongoose.model( 'Post' );
var i        = 0;
var size     = 100;


module.exports = {
  init : function (){
    for( ; i < size; i++ ){
      new Post({
        user_id       : '123456789012345678901234',
        user_name     : 'Mason Chang',
        title         : 'Title title title ' + i,
        content       : 'Content content content ' + i,
        read_count    : parseInt( i / 10 ),
        comment_count : parseInt( (99 - i) / 10 )
      }).save();
    }
  }
};