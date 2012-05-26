var mongoose = require( 'mongoose' );
var User     = require( BASE_DIR + 'db/schema' ).User;

require( MODEL_DIR + 'virtuals/user' )( User );

User.statics = {

  paginate : function ( conds, opts, next, success ){
    var self = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, users ){
          if( err ) return next( err );

          success({
            users  : users,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },

  index : function ( skip, next, success ){
    var opts  = { sort  : [ 'name', 1 ],
                  skip  : skip || 0,
                  limit : 20 };

    this.paginate({}, opts, next, success );
  },

  show : function ( args, next, success ){
    var Topic = mongoose.model( 'Topic' );
    var conds = { user_id : args.user_id };
    var opts  = { limit : 6, sort : [[ 'updated_at', -1 ]]};

    Topic.find( conds, null, opts, function ( err, topics ){
      if( err ) return next( err );

      var conds = { comments : { $in : args.comments }};

      Topic.find( conds, null, opts, function ( err, replies ){
        if( err ) return next( err );

        success( topics, replies );
      });
    });
  },

  topics : function ( args, next, success ){
    var Topic = mongoose.model( 'Topic' );
    var conds = { user_id : args.user_id };
    var opts  = { sort    : [ 'updated_at', -1 ],
                  skip    : args.skip || 0,
                  limit   : 20 };

    Topic.paginate( conds, opts, next, success );
  },

  replies : function ( args, next, success ){
    var Topic = mongoose.model( 'Topic' );
    var conds = { comments : { $in : args.comments }};
    var opts  = { sort     : [ 'updated_at', -1 ],
                  skip     : args.skip || 0,
                  limit    : 20 };

    Topic.paginate( conds, opts, next, success );
  }
};

User.methods = {
  obj_attrs : function (){
    return {
      _id    : this._id,
      name   : this.name,
      avatar : this.avatar };
  }
};

require( 'mongoose' ).model( 'User', User );


