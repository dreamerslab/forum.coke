var Application = require( CONTROLLER_DIR + 'application' );
var mongoose    = require( 'mongoose' );
var Topic       = mongoose.model( 'Topic' );

module.exports = Application.extend({

  init : function ( before, after ){
    before( this.sidebar );
  },

  index : function ( req, res, next ){
    var self = this;
    var tag  = req.params.name;
    var args = {
      tag  : tag,
      skip : req.query.from
    };

    Topic.tag( args, next,
      // no tag
      function (){
        req.flash( 'flash-error', 'No tag name specified' );
        res.redirect( '/tags' );
      },
      // success
      function ( result ){
        result.nav_selected     = 'tags';
        result.sub_nav_selected = 'tag';
        result.tag_name         = tag;
        res.render( 'topics/index', self._merge( req, result ));
      });
  }
});


