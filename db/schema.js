var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Model = {};

Model.User = new Schema({
  name        : { type : String, required : true, index : true },
  email       : { type : String },
  avatar      : { type : String },
  rate        : { type : Number },
  posts       : [{ type : ObjectId, ref : 'Post' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Post = new Schema({
  _user       : { type : ObjectId, ref : 'User' },
  title       : { type : String },
  content     : { type : String },
  tags        : [{ type : String }],
  read_count  : { type : Number, 'default' : 0 },
  subscribers : [{ type : ObjectId, ref : 'User' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Comment = new Schema({
  _user       : { type : ObjectId, ref : 'User' },
  _post       : { type : ObjectId, ref : 'Post' },
  user_name   : { type : String },
  user_avatar : { type : String },
  content     : { type : String },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
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


module.exports = Model;