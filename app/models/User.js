var User = require( BASE_DIR + 'db/schema' ).User;



User.statics = {
  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, users ){
          if( err ) return next( err );

          callback && callback({
            users  : users,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },

  push_topic : function ( topic, callback ){
    this.findById( topic.user, function ( err, user ){
      if( err ) return callback && callback( err );

      if( user ){
        user.topics.$addToSet( topic._id );
        user.save( callback );
      }
    });
  },

  pull_topic : function ( topic, callback ){
    this.findById( topic.user, function ( err, user ){
      if( err ) return callback && callback( err );

      if( user ){
        user.topics.$pull( topic._id );
        user.save( callback );
      }
    });
  },

  push_comment : function ( comment, callback ){
    this.findById( comment.user, function ( err, user ){
      if( err ) return callback && callback( err );

      if( user ){
        user.comments.$addToSet( comment._id );
        user.save( callback );
      }
    });
  },

  pull_comment : function ( comment, callback ){
    this.findById( comment.user, function ( err, user ){
      if( err ) return callback && callback( err );

      if( user ){
        user.comments.$pull( comment._id );
        user.save( callback );
      }
    });
  }
};

User.methods = {
  // this a virtual property
  avatar : function (){
    return UTILS.typeof( this.picture ) === 'string' ?
      this.picture :
      'http://www.gravatar.com/avatar/00000000000000000000000000000000';
  },

  obj_attrs : function (){
    return {
      _id         : this._id,
      name        : this.name,
      avatar : this.avatar()};
  }
};



require( 'mongoose' ).model( 'User', User );