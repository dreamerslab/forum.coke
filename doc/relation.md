# Hooks to handle model relation



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

### create
- add to user
- add to tags

### update
- remove from tags
- add to tags
- notify subscribers

### remove
- remove all comments
- remove from tags
- copy to topic backup



## Comment

### create
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
- add 1 to user's unread_notifs

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


