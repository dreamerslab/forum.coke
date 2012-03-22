var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Model = {};

Model.Cache = new Schema({
  name        : { type : String, required : true, index : true },
  trunk       : { type : Schema.Types.Mixed }
});

Model.User = new Schema({
  name        : { type : String, required : true, index : true },
  email       : { type : String },
  avatar      : { type : String },
  rating      : { type : Number },
  post_ids    : [{ type : ObjectId, ref : 'Post' }],
  comment_ids : [{ type : ObjectId, ref : 'Comment' }],
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Post = new Schema({
  user        : { type : Schema.Types.Mixed },
  user_id     : { type : ObjectId, required : true, ref : 'User' },
  title       : { type : String },
  content     : { type : String },
  tag_names   : [{ type : String}],
  tag_ids     : [{ type : ObjectId, ref : 'Tag' }],
  subscribers : [{ type : ObjectId, ref : 'User' }],
  comment_ids : [{ type : ObjectId, ref : 'Comment' }],
  read_count  : { type : Number, 'default' : 0 },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Comment = new Schema({
  user        : { type : Schema.Types.Mixed },
  user_id     : { type : ObjectId, required : true, ref : 'User' },
  post_id     : { type : ObjectId, required : true, ref : 'Post' },
  content     : { type : String },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Tag = new Schema({
  name        : { type : String, required : true, index : true },
  post_ids    : [{ type : ObjectId, ref : 'Post' }]
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