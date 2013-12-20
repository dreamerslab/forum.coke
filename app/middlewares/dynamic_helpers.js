module.exports = function ( req, res, next ){
  res.locals({

    get_error : function (){
      return req.form ? req.form.getErrors() : {};
    },

    get_success : function (){
      var _info = req.flash();
      var info  = _info ? _info[ 'flash-info' ] : [];

      return info ? info[ 0 ] : undefined;
    }
  });

  next();
};
