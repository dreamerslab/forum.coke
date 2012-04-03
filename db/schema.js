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
  posts       : [{ type : ObjectId, ref : 'Post' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Post = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  title       : { type : String },
  content     : { type : String },
  tag_names   : [{ type : String}],
  tags        : [{ type : ObjectId, ref : 'Tag' }],
  subscribers : [{ type : ObjectId, ref : 'User' }],
  comments    : [{ type : ObjectId, ref : 'Comment' }],
  read_count  : { type : Number, 'default' : 0 },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Comment = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  as_user     : { type : Schema.Types.Mixed },
  post        : { type : ObjectId, required : true, ref : 'Post' },
  content     : { type : String },
  created_at  : { type : Number, 'default' : Date.now },
  updated_at  : { type : Number, 'default' : Date.now }
});

Model.Tag = new Schema({
  name        : { type : String, required : true, index : { unique : true, dropDups : true }},
  posts       : [{ type : ObjectId, ref : 'Post' }],
  post_count  : { type : Number, 'default' : 0 }
});

Model.Notification = new Schema({
  user        : { type : ObjectId, required : true, ref : 'User' },
  post        : { type : ObjectId, required : true, ref : 'Post' },
  message     : { type : String, required : true },
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

Model.Tag.pre( 'save', function ( next ){
  this.post_count = this.posts.length;
  next();
});


Model.Post.pre( 'remove', function ( next ){
  var self    = this;
  var User    = mongoose.model( 'User' );
  var Tag     = mongoose.model( 'Tag' );
  var Comment = mongoose.model( 'Comment' );

  // remove post's _id from its user
  User.findById( self.user, function ( err, user ){
    if( err ){
      next( err );
      return;
    }

    User.
      collection.
      findAndModify({
        _id : user._id
      }, [], {
        $pull : {
          posts : self._id
      }}, {}, function ( err ){
          if( err ){
            next( err );
            return;
          }
      });
  });

  // remove post's _id from its tags
  Tag.find({
    _id : { $in : this.tags
    }}, function ( err, tags ){
      if( err ){
        next( err );
        return;
      }

      tags.forEach( function ( tag ){
        Tag.
          collection.
          findAndModify({
            _id : tag._id
          }, [], {
            $pull : {
              posts : self._id
          }}, {}, function ( err ){
              if( err ){
                next( err );
                return;
              }
          });
      });
  });

  // remove post comments' _ids from their users
  Comment.find({
    _id : {
      $in : this.comments
    }}, function ( err, comments ){
      if( err ){
        next( err );
        return;
      }

      comments.forEach( function ( comment ){
        comment.remove( function ( err, comment ){
          if( err ){
            next( err );
            return;
          }
        });
      });
  });

  next();
});


Model.Comment.pre( 'remove', function ( next ){
  var self = this;
  var User = mongoose.model( 'User' );

  User.findById( this.user, function ( err, user ){
    if( err ){
      next( err );
      return;
    }

    User.
      collection.
      findAndModify({
        _id : user._id
      }, [], {
        $pull : {
          comments : self._id
      }}, {}, function ( err ){
          if( err ){
            next( err );
            return;
          }else{
            next();
          }
      });
  });
});



module.exports = Model;