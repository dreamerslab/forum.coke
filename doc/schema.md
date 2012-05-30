# Schema

## Cache

    {
      _id   : ObjectId,
      name  : String,
      trunk : Mixed
    }



## User

    {
      _id           : ObjectId,
      google_id     : String,
      google_raw    : Mixed,
      name          : String,
      email         : String,
      picture       : String,
      rating        : Number,
      topics        : [ ObjectId ], // ref : 'Topic' for populate
      comments      : [ ObjectId ], // ref : 'Comment' for populate,
      notifications : [ ObjectId ], // ref : 'Notification' for populate,
      created_at    : Number,
      updated_at    : Number
    }



## Topic

    {
      _id        : ObjectId,
      user_id    : ObjectId,
      user       : Mixed,
      title      : String,
      content    : String,
      tag_names  : String,
      tags       : [ ObjectId ], // ref : 'Tag' for populate
      comments   : [ ObjectId ] , // ref : 'Comment' for populate,
      read_count : Number,
      created_at : Number,
      updated_at : Number
    }



## Comment

    {
      _id        : ObjectId,
      user_id    : ObjectId,
      topic_id   : ObjectId,
      user       : Mixed,
      content    : String,
      created_at : Number,
      updated_at : Number
    }



## Tag

    {
      _id    : ObjectId,
      name   : String,
      topics : [ ObjectId ]
    }



## Notification

    {
      _id        : ObjectId,
      user_id    : ObjectId,
      type       : String,
      activity   : String,
      originator : Mixed,
      topic      : Mixed,
      content    : String,
      is_read    : Boolean,
      created_at : Number,
      updated_at : Number
    }


