var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Model    = {};

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
  rating      : { type : Number, 'default' : 0 },
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
  tag_names   : [{ type : String }],
  tags        : [{ type : ObjectId, ref : 'Tag' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  read_count  : { type : Number, 'default' : 0 },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number }
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

module.exports = Model;


