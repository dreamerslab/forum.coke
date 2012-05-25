var Tag   = require( BASE_DIR + 'db/schema' ).Tag;
var hooks = require( MODEL_DIR + 'hooks/tag' );
var Flow  = require( 'node.flow' );

Tag.pre( 'save', hooks.pre_save );

Tag.statics = {
  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    this.count( conds, function ( err, count ){
      if( err ) return next( err );

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, tags ){
          if( err ) return next( err );

          callback({
            tags  : tags,
            count : count,
            from  : opts.skip,
            limit : opts.limit
          });
        });
    });
  },

  extract_names : function ( string ){
    if( UTILS.typeof( string ) !== 'string' || string === '' ){
      return [];
    }

    var candidates = string.split( /\s*[,|;]\s*/ ).slice( 0, 5 );
    var names      = [];

    candidates.forEach( function ( name ){
      name = name.toLowerCase();

      if( names.indexOf( name ) === -1 && name.length < 20 ){
        names.push( name );
      }
    });

    return names.sort();
  },

  create_all : function ( names, callback ){
    var self = this;
    var flow = new Flow();

    names.forEach( function ( name ){
      flow.series( function ( name, next ){
        self.findOne({ name : name }, function ( err, tag ){
          if( err ){
            flow.end( function (){
              callback( err );
            });
            return;
          }

          if( tag ){
            return next();
          }

          new self({ name : name }).save( function ( err, tag, count ){
            if( err ){
              flow.end( function (){
                callback( err );
              });
              return;
            }

            next();
          });
        });
      }, name );
    });

    flow.end( function (){
      callback();
    });
  }
};

Tag.methods = {
  obj_attrs : function (){
    return {
      _id         : this._id,
      name        : this.name,
      topic_count : this.topics.length
    };
  }
};

require( 'mongoose' ).model( 'Tag', Tag );


