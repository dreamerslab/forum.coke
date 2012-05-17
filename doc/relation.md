# Hooks to handle model relation
NOTE: In mongoose, current ver is v2.6.3, there is only one 'save' event emitted during a save operatio. To distinguish 'create' from 'update' operation, we must add a pre-save hook to mark new record, so we can tell it is 'create' or 'update' in a post-save hook.



## User

### create
do nothing

### update
no such action

### remove
- remove all topics
- remove all notifications
- copy to user backup



## Topic
NOTE: remember not to trigger hooks while updating 'read_count'

### init
- catch old tag names

### create
- mark new record
- cache user info
- add to user
- add to tags

### update
- remove from tags
- add to tags
- notify subscribers

### remove
- remove from user
- remove from tags
- remove all comments
- copy to topic backup



## Comment

### create
- mark new record
- cache user info
- cache topic info
- add to user
- add to topic
- notify author
- notify subscribers

### update
no such action

### remove
- remove from user
- remove from topic
- copy to comment backup



## Notification

### create
- mark new record
- add to user
- debug message

### update
no such action

### remove
- copy to notification backup



## Tag

### create
do nothing

### update
do nothing

### remove
no such action


