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
  updated_at  : { type : Number }
});

Model.Topic = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  title       : { type : String, required : true },
  content     : { type : String, required : true },
  tag_names   : [{ type : String}],
  tags        : [{ type : ObjectId, ref : 'Tag' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  read_count  : { type : Number, 'default' : 0 },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number}
});

Model.Comment = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  topic       : { type : ObjectId, required : true, ref : 'Topic' },
  content     : { type : String, required : true },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number }
});

Model.Tag = new Schema({
  name        : { type : String, required : true,
                  index : { unique : true, dropDups : true }},
  topics      : [{ type : ObjectId, ref : 'Topic' }],
});

Model.Notification = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  type        : { type : String, required : true },
  activity    : { type : String, required : true },
  originator  : { type : Schema.Types.Mixed },
  topic       : { type : Schema.Types.Mixed },
  is_read     : { type : Boolean, 'default' : false },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number }
});


// auto update `updated_at` on save
Object.keys( Model ).forEach( function ( model ){
  if( Model[ model ].tree.updated_at !== undefined ){
    Model[ model ].pre( 'save', function ( next ){
      this.updated_at = this.isNew?
        this.created_at :
        Date.now();

      next();
    });
  }
});

var topic_hooks   = require( LIB_DIR + 'topic_hooks' );
var tag_hooks     = require( LIB_DIR + 'tag_hooks' );
var comment_hooks = require( LIB_DIR + 'comment_hooks' );
var notif_hooks   = require( LIB_DIR + 'notif_hooks' );

Model.Topic.post( 'init', topic_hooks.post_init );
Model.Topic.pre( 'save', topic_hooks.pre_save );
Model.Topic.post( 'save', topic_hooks.post_save );
Model.Topic.pre( 'remove', topic_hooks.pre_remove );

Model.Tag.pre( 'save', tag_hooks.pre_save );

Model.Comment.pre( 'save', comment_hooks.pre_save );
Model.Comment.post( 'save', comment_hooks.post_save );
Model.Comment.pre( 'remove', comment_hooks.pre_remove );

Model.Notification.pre( 'save', notif_hooks.pre_save );
Model.Notification.post( 'save', notif_hooks.post_save );



module.exports = Model;