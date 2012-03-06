var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Model = {

  User : new Schema({
    name : { type : String, required : true, index : true },
    email : { type : String },
    avatar : { type : String },
    rate : { type : Number },
    post_count : { type : String },
    comment_count : { type : String },
    created_at : { type : Number, 'default' : Date.now },
    updated_at : { type : Number, 'default' : Date.now }
  })
};



// auto update `updated_at` on save
Object.keys( Model ).forEach( function ( model ){
  if( Model[ model ].updated_at !== undefined ){
    model.pre( 'save', function ( next ){
      this.updated_at = Date.now();
      next();
    });
  }
});



module.exports = Model;