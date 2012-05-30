module.exports = function err404( req, res, next ){
  res.status( 404 );
  res.render( 'error/404', {
    status : 404
  });
};