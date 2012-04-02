var Notification = require( BASE_DIR + 'db/schema' ).Notification;



require( 'mongoose' ).model( 'Notification', Notification );

// https://github.com/dreamerslab/forum.coke/issues/14
// https://github.com/dreamerslab/forum.coke/issues/14?_nid=39038120