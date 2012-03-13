var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Model = {};

Model.Post = new Schema({
  user_id       : { type : ObjectId, required : true, index : true },
  user_name     : { type : String },
  user_avatar   : { type : String },
  title         : { type : String },
  content       : { type : String },
  tags          : { type : Array },
  subscribers   : { type : Array },
  read_count    : { type : Number },
  comment_count : { type : Number },
  created_at    : { type : Number, 'default' : Date.now },
  updated_at    : { type : Number, 'default' : Date.now }
});

Model.User = new Schema({
  name    : { type : String, required : true, index : true },
  email   : { type : String },
  avatar  : { type : String },
  rate    : { type : Number },
  posts   : [ Model.Post ],
  comment_count : { type : Number },
  created_at    : { type : Number, 'default' : Date.now },
  updated_at    : { type : Number, 'default' : Date.now }
});



// auto update `updated_at` on save
Object.keys( Model ).forEach( function ( model ){
  if( Model[ model ].updated_at !== undefined ){
    model.pre( 'save', function ( next ){
      this.updated_at = Date.now();
      next();
    });
  }
});


// auto push post to user's posts
// Model.Post.post( 'save', function ( next ){
//   mongoose.model( 'User', Model.User ).findById( this.user_id, function ( err, user ){

//     user.posts.push( this );
//     user.save();
//   });
// })


module.exports = Model;