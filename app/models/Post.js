var Post = require( BASE_DIR + 'db/schema' ).Post;
var Flow = require( 'node.flow' );

Post.statics = {

  create_or_update : function ( post, props, callback ){
    post.title = props.title;
    post.content = props.content;
    post.tags = props.tags;
    post.save( callback );
  },

  paginate : function ( conds, opts, next, callback ){
    var reslut = {};
    var self   = this;

    self.count( conds, function ( err, count ){
      if( err ){
        next( err );
        return;
      }

      self.find( conds ).
           sort( opts.sort[ 0 ], opts.sort[ 1 ]).
           skip( opts.skip ).
           limit( opts.limit ).run( function ( err, posts ){
             if( err ){
               next( err );
               return;
             }

             callback && callback({
               posts : posts,
               count : count,
               from  : opts.skip,
               limit : opts.limit
             });
           });
    });
  },
};

Post.methods = {

  inc_read_count : function (){
    this.read_count = this.read_count + 1;
    this.save();
  },

  add_to_user : function ( user, callback ){
    var self = this;

    user.posts.push( this );
    user.save( function ( err, user ){
      if( err ){
        console.log( err.message );
      }

      self.as_user = user.obj_attrs();
      self.save( function ( err, post ){
        callback && callback();
      });
    });
  },

  add_to_tag : function ( tag, callback ){
    var self = this;

    tag.posts.push( this );
    tag.save( function ( err, tag ){
      callback && callback( err, tag );
    });
  },

  remove_from_tag : function ( tag, callback ){
    var self = this;
    var idx  = tag.posts.indexOf( this._id );

    if( idx !== -1 ){
      tag.posts.splice( idx, 1 );
    }

    tag.save( function ( err, tag ){
      callback && callback( err, tag );
    });
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

    // save the current post
    flow.series( function ( next ){
      self.save( function ( err, post ){
        next();
      });
    });

    flow.end( function (){
      callback && callback();
    });
  }
};

require( 'mongoose' ).model( 'Post', Post );