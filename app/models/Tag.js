var hooks = require( MODEL_DIR + '/hooks/tag' );
var Flow  = require( 'node.flow' );

module.exports = {

  hooks : {
    pre : {
      save : [ hooks.pre_save ]
    }
  },

  statics : {

    paginate : function ( conds, opts, next, callback ){
      var reslut = {};
      var self   = this;

      this.count( conds, function ( err, count ){
        if( err ) return next( err );

        self.
          find( conds ).
          sort( opts.sort ).
          skip( opts.skip ).
          limit( opts.limit ).exec( function ( err, tags ){
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

    index : function ( skip, next, success ){
      var opts  = { sort  : 'name',
                    skip  : skip || 0,
                    limit : 20 };

      this.paginate({}, opts, next, success );
    },

    extract_names : function ( str ){
      if( UTILS.is( str ) !== 'string' || str === '' ){
        return [];
      }

      var candidates = str.split( /\s*[,|;]\s*/ ).slice( 0, 5 );
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
            if( err ) return flow.end( function (){
              callback( err );
            });

            if( tag ) return next();

            new self({
              name : name
            }).save( function ( err, tag, count ){
              if( err ) return flow.end( function (){
                callback( err );
              });

              next();
            });
          });
        }, name );
      });

      flow.end( function (){
        callback();
      });
    }
  },

  methods : {
    obj_attrs : function (){
      return {
        _id         : this._id,
        name        : this.name,
        topic_count : this.topics.length
      };
    }
  }
};
