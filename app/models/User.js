var User     = require( BASE_DIR + 'db/schema' ).User;
var virtuals = require( MODEL_DIR + 'virtuals/user' );

virtuals( User );

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


