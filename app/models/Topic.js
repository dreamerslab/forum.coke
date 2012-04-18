var Topic    = require( BASE_DIR + 'db/schema' ).Topic;
var Flow     = require( 'node.flow' );
var mongoose = require( 'mongoose' );



Topic.statics = {
  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, topics ){
          if( err ) return next( err );

          callback && callback({
            topics : topics,
            count  : count,
            from   : opts.skip,
            limit  : opts.limit
          });
        });
    });
  },
};

Topic.methods = {
  obj_attrs : function (){
    return {
      _id   : this._id,
      title : this.title
    };
  },

  set_attrs : function ( topic ){
    var Tag = mongoose.model( 'Tag' );

    this.title     = topic.title;
    this.content   = topic.content;
    this.tag_names = topic.tag_names;
  },

  inc_read_count : function (){
    mongoose.model( 'Topic' ).update(
      { _id : this._id },
      { $inc : { read_count : 1 }},
      function ( err ){}
    );
  },

  is_owner : function( user ){
    return user ?
      this.as_user._id.toString() === user._id.toString() :
      false;
  },
};



require( 'mongoose' ).model( 'Topic', Topic );