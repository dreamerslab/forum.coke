var NotificationBackup = require( BASE_DIR + 'db/schema' ).NotificationBackup;

require( 'mongoose' ).model( 'NotificationBackup', NotificationBackup );