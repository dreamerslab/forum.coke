var mongoose = require( 'mongoose' );
var Message  = {
  'update-topic'   : 'updated the topic',
  'create-comment' : 'commented on the topic'
};



module.exports = {
  pre_save : function ( next ){
    this.activity = Message[ this.type ];
    next();
  },
};