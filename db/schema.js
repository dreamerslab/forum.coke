var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Model = {};

Model.Cache = new Schema({
  name        : { type : String, required : true, index : true },
  trunk       : { type : Schema.Types.Mixed }
});

Model.User = new Schema({
  google_id   : { type : String, required : true, index : true },
  google_raw  : { type : Schema.Types.Mixed },
  name        : { type : String, required : true },
  email       : { type : String },
  picture     : { type : String },
  rating      : { type : Number },
  topics      : [{ type : ObjectId, ref : 'Topic' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Topic = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  title       : { type : String },
  content     : { type : String },
  tag_names   : [{ type : String}],
  tags        : [{ type : ObjectId, ref : 'Tag' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  read_count  : { type : Number, 'default' : 0 },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Comment = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  topic       : { type : ObjectId, required : true, ref : 'Topic' },
  content     : { type : String },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Tag = new Schema({
  name        : { type : String, required : true,
                  index : { unique : true, dropDups : true }},
  topics      : [{ type : ObjectId, ref : 'Topic' }],
  topic_count : { type : Number, 'default' : 0 }
});

Model.Notification = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  type        : { type : String, required : true },
  originator  : { type : Schema.Types.Mixed },
  topic       : { type : Schema.Types.Mixed },
  activity    : { type : String },
  is_read     : { type : Boolean, 'defaullt' : false },
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



var topic_hooks   = require( LIB_DIR + 'topic_hooks' );
var comment_hooks = require( LIB_DIR + 'comment_hooks' );
var notif_hooks   = require( LIB_DIR + 'notif_hooks' );

Model.Topic.pre( 'save', topic_hooks.pre_save );
Model.Topic.post( 'save', topic_hooks.post_save );
Model.Topic.pre( 'remove', topic_hooks.pre_remove );

Model.Comment.pre( 'save', comment_hooks.pre_save );
Model.Comment.post( 'save', comment_hooks.post_save );
Model.Comment.pre( 'remove', comment_hooks.pre_remove );

Model.Notification.pre( 'save', notif_hooks.pre_save );
Model.Notification.post( 'save', notif_hooks.post_save );


Model.Tag.pre( 'save', function ( next ){
  this.topic_count = this.topics.length;
  next();
});



module.exports = Model;