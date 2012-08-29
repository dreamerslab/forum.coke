module.exports = {
  pre_save : function ( next ){
    this.topic_count = this.topics.length;
    next();
  }
};


