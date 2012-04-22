var Tag  = require( BASE_DIR + 'db/schema' ).Tag;
var Flow = require( 'node.flow' );



Tag.statics = {
  extract_names : function ( string ){
    if( UTILS.is( string ) !== 'String' || string === '' ){
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

  create_all : function ( tag_names, callback ){
    var self = this;
    var flow = new Flow();

    tag_names.forEach( function ( name ){
      flow.series( function ( name, next ){
        self.findOne({ name : name }, function ( err, tag ){
          if( err ){
            flow.end( function (){
              callback && callback( err );
            });
            return;
          }

          if( tag ){
            return next();
          }

          new self({ name : name }).save( function ( err, tag ){
            if( err ){
              flow.end( function (){
                callback && callback( err );
              });

              return;
            }

            next();
          });
        });
      }, name );
    });

    flow.end( function (){
      callback && callback();
    });
  },

  append_topic : function ( topic, callback ){
    if( UTILS.is( topic.tag_names ) === 'Array' ){
      this.update(
        { name : { $in : topic.tag_names }},
        { $push : { topics : topic._id }},
        { multi : true },
        function ( err ){
          if( err ){
            callback && callback( err );
            return;
          }

          callback && callback();
        });

      return;
    }

    callback && callback();
  },

  remove_topic : function ( topic, callback ){
    if( UTILS.is( topic.orig_tag_names ) === 'Array' ){
      this.update(
        { name : { $in : topic.orig_tag_names }},
        { $pull : { topics : topic._id }},
        { multi : true },
        function ( err ){
          if( err ){
            callback && callback( err );
            return;
          }

          callback && callback();
        });

      return;
    }

    callback && callback();
  },
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