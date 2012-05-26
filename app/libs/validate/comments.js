var form  = require( 'express-form2' );
var field = form.field;

form.configure({
  autoTrim : true
});

module.exports = {
  validate_comments : form(
    field( 'comment.content', 'Content' ).required()
  ),
};