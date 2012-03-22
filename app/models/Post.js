var Post = require( BASE_DIR + 'db/schema' ).Post;
var Flow = require( 'node.flow' );

Post.statics = {

  create_or_update : function ( post, props, callback ){
    post.title = props.title;
    post.content = props.content;
    post.tags = props.tags;
    post.save( callback );
  },

  latest : function ( callback ){
    this.find().
         sort( 'updated_at', -1 ).
         run( callback );
  },

  trending : function ( callback ){
    this.find().
         sort( 'read_count', -1 ).
         run( callback );
  },

  unsolved : function( callback ){
    this.find().
         size( 'comment_ids', 0 ).
         run( callback );
  }

};


Post.methods = {

  add_to_user : function ( user, callback ){
    var self = this;

    user.post_ids.push( this._id );
    user.save( function ( err, user ){
      if( err ){
        console.log( err.message );
      }
      self.user = user.obj_attrs();
      self.save( function ( err, post ){
        callback && callback();
      });
    });
  },

  add_to_tag : function ( tag, callback ){
    var self = this;

    tag.post_ids.push( this._id );
    tag.save( function ( err, tag){
      callback && callback( err, tag );
    });
  },

  remove_from_tag : function ( tag, callback ){
    var self = this;
    var idx  = tag.post_ids.indexOf( this._id );

    if( idx !== -1 ){
      tag.post_ids.splice( idx, 1 );
    }
    tag.save( function ( err, tag ){
      callback && callback( err, tag );
    });
  },

  update_tags : function ( Tag, callback ){
    var self = this;
    var flow = new Flow();

    // clear previous tags
    if( this.tag_ids.length !== 0 ){
      this.tag_ids.forEach( function ( tag_id ){
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
      self.tag_ids = [];
         next();
    });

    // add new tags
    if( this.tag_names.length !== 0 ){
      this.tag_names.forEach( function( name ){

        flow.parallel( function ( name, ready ){
          Tag.findOne({ name : name }, function ( err, tag ){
            if( tag ){
              self.tag_ids.push( tag._id );
              self.add_to_tag( tag, function ( err, tag ){
                ready();
              });
            }else{
              new Tag({ name : name }).save( function ( err, tag ){
                self.tag_ids.push( tag._id );
                self.add_to_tag( tag, function ( err, tag ){
                  ready();
                });
              });
            }
          });
        }, name );

      });

      flow.join();
    }

    // save the current post
    flow.series( function ( next ){
      self.save( function ( err, post ){
        next();
      });
    });

    flow.end( function (){
    });
  }
}


require( 'mongoose' ).model( 'Post', Post );