var User = require( BASE_DIR + 'db/schema' ).User;

User.methods = {

};

require( 'mongoose' ).model( 'User', User );