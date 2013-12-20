var Application = require( CONTROLLER_DIR + '/application' );
var Tag         = Model( 'Tag' );

module.exports = Application.extend({

  index : function ( req, res, next ){
    var self = this;

    Tag.index( req.query.from, next, function ( result ){
      result.nav_selected = 'tags';
      res.render( 'tags/index', self._merge( req, result ));
    });
  }
});
