var User = require( BASE_DIR + 'db/schema' ).User;


require( 'mongoose' ).model( 'User', User );