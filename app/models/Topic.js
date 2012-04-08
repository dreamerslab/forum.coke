var Topic = require( BASE_DIR + 'db/schema' ).Topic;
var Flow  = require( 'node.flow' );

Topic.statics = {
  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    this.count( conds, function ( err, count ){
      if( err ){
        next( err );
        return;
      }

      self.
        find( conds ).
        sort( opts.sort[ 0 ], opts.sort[ 1 ]).
        skip( opts.skip ).
        limit( opts.limit ).run( function ( err, topics ){
          if( err ){
            next( err );
            return;
          }

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

  inc_read_count : function (){
    this.read_count = this.read_count + 1;
    this.save();
  },

  is_owner : function( user ){
    return user ?
      this.as_user._id.toString() === user._id.toString() :
      false;
  },

  add_to_tag : function ( tag, callback ){
    tag.topics.push( this );
    tag.save( callback );
  },

  remove_from_tag : function ( tag, callback ){
    var idx = tag.topics.indexOf( this._id );

    if( idx !== -1 ){
      tag.topics.splice( idx, 1 );
    }

    tag.save( callback );
  },

  update_tags : function ( Tag, callback ){
    var self = this;
    var flow = new Flow();

    // clear previous tags
    if( this.tags.length !== 0 ){
      this.tags.forEach( function ( tag_id ){
        flow.parallel( function( tag_id, ready ){
          Tag.findById( tag_id, function ( err, tag ){
           self.remove_from_tag( tag, function ( err, tag ){
             ready();
           });
         });
        }, tag_id );
      });

      flow.join();
    }

    flow.series( function ( next ){
      self.tags = [];
      next();
    });

    // add new tags
    if( this.tag_names.length !== 0 ){
      this.tag_names.forEach( function( name ){

        flow.series( function( name, next ){
          Tag.findOne({
            name : name
          }, function ( err, tag ){
            if( tag ){
              self.tags.push( tag._id );
              self.add_to_tag( tag, function ( err, tag ){
                next();
              });
            }else{
              new Tag({
                name : name
              }).save( function ( err, tag ){
                self.tags.push( tag._id );
                self.add_to_tag( tag, function ( err, tag ){
                  next();
                });
              });
            }
          });
        }, name );
      });
    }

    // save the current topic
    flow.series( function ( next ){
      self.save( function ( err, topic ){
        next();
      });
    });

    flow.end( function (){
      callback && callback();
    });
  }
};

require( 'mongoose' ).model( 'Topic', Topic );