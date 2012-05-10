
module.exports = {

  mark_new_record : function ( next ){
    this.is_new = this.isNew;
    next();
  }
};