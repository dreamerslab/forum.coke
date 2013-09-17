var Schema = function ( Schema ){
/**
 * Module dependencies.
 * @private
 */

  var ObjectId = Schema.ObjectId;
  var Models   = {};

  Models.Cache = new Schema({
    name  : { type : String, required : true, index : true },
    trunk : { type : Schema.Types.Mixed }
  });

  Models.User = new Schema({
    google_id     : { type : String, required : true, index : true },
    google_raw    : { type : Schema.Types.Mixed },
    name          : { type : String, required : true },
    email         : { type : String },
    picture       : { type : String },
    rating        : { type : Number, 'default' : 0 },
    topics        : [{ type : ObjectId, ref : 'Topic' }],
    comments      : [{ type : ObjectId, ref : 'Comment' }],
    notifications : [{ type : ObjectId, ref : 'Notification' }],
    created_at    : { type : Number, 'default' : Date.now },
    updated_at    : { type : Number }
  });

  Models.Topic = new Schema({
    user_id    : { type : ObjectId, required : true, ref : 'User' },
    user       : { type : Schema.Types.Mixed },
    title      : { type : String, required : true },
    content    : { type : String, required : true },
    tag_names  : [{ type : String }],
    tags       : [{ type : ObjectId, ref : 'Tag' }],
    comments   : [{ type : ObjectId, ref : 'Comment' }],
    read_count : { type : Number, 'default' : 0 },
    created_at : { type : Number, 'default' : Date.now },
    updated_at : { type : Number }
  });

  Models.Comment = new Schema({
    user_id    : { type : ObjectId, required : true, ref : 'User' },
    topic_id   : { type : ObjectId, required : true, ref : 'Topic' },
    user       : { type : Schema.Types.Mixed },
    content    : { type : String, required : true },
    created_at : { type : Number, 'default' : Date.now },
    updated_at : { type : Number }
  });

  Models.Tag = new Schema({
    name   : { type : String, required : true, index : { unique : true, dropDups : true }},
    topics : [{ type : ObjectId, ref : 'Topic' }],
  });

  Models.Notification = new Schema({
    user_id    : { type : ObjectId, required : true, ref : 'User' },
    type       : { type : String, required : true },
    activity   : { type : String, required : true },
    originator : { type : Schema.Types.Mixed },
    topic      : { type : Schema.Types.Mixed },
    content    : { type : String, 'default' : '' },
    is_read    : { type : Boolean, 'default' : false },
    created_at : { type : Number, 'default' : Date.now },
    updated_at : { type : Number }
  });

  // auto update `updated_at` on save
  Object.keys( Models ).forEach( function ( model ){
    if( Models[ model ].tree.updated_at !== undefined ){
      Models[ model ].pre( 'save', function ( next ){
        this.updated_at = this.isNew ?
          this.created_at :
          Date.now();

        next();
      });
    }
  });

  return Models;
};

/**
 * Exports module.
 */

module.exports = Schema;
