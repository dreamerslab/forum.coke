module.exports = {

  virtuals : [ 'user' ],

  statics : {

    paginate : function ( conds, opts, next, success ){
      var self = this;

      this.count( conds, function ( err, count ){
        if( err ) return next( err );

        self.
          find( conds ).
          sort( opts.sort ).
          skip( opts.skip ).
          limit( opts.limit ).exec( function ( err, users ){
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

    create : function ( src, error, success ){
      var self = this;

      this.findOne({
        google_id : src.id
      }, function ( err, user ){
        if( err )  return error();
        if( user ) return success();

        new self({
          google_id  : src.id,
          google_raw : src,
          name       : src._json.name,
          email      : src._json.email,
          picture    : src._json.picture
        }).save( function ( err, user, count ){
          if( err ) return error();

          success()
        });
      });
    },

    index : function ( skip, next, success ){
      var opts  = { sort  : 'name',
                    skip  : skip || 0,
                    limit : 20 };

      this.paginate({}, opts, next, success );
    },

    show : function ( args, next, success ){
      var Topic = Model( 'Topic' );
      var conds = { user_id : args.user_id };
      var opts  = { limit : 6, sort : '-updated_at' };

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
      var Topic = Model( 'Topic' );
      var conds = { user_id : args.user_id };
      var opts  = { sort    : '-updated_at',
                    skip    : args.skip || 0,
                    limit   : 20 };

      Topic.paginate( conds, opts, next, success );
    },

    replies : function ( args, next, success ){
      var Topic = Model( 'Topic' );
      var conds = { comments : { $in : args.comments }};
      var opts  = { sort     : '-updated_at',
                    skip     : args.skip || 0,
                    limit    : 20 };

      Topic.paginate( conds, opts, next, success );
    }
  },

  methods : {
    obj_attrs : function (){
      return {
        _id    : this._id,
        name   : this.name,
        avatar : this.avatar };
    }
  }
};


