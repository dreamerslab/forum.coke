
module.exports = {

  mark_new : function ( next ){
    this.is_new = this.isNew;
    next();
  }
};