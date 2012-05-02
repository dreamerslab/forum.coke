var form  = require( 'express-form2' );
var field = form.field;

form.configure({
  autoTrim : true
});

module.exports = {
  validate_comment_form : form(
    field( 'comment.content', 'Content' ).required()
  ),
};