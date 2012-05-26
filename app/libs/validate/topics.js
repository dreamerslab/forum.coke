var form  = require( 'express-form2' );
var field = form.field;

form.configure({
  autoTrim : true
});

module.exports = {
  validate_topics : form(
    field( 'topic.title', 'Tilte' ).required(),
    field( 'topic.content', 'Content' ).required()
  ),
};