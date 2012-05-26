# Controller routes for forum.coke

## Home
- /home

## User
- users
- users/:id/edit
- users/signup
- users/signin
- users/signout
- auth/google (signin via OAuth2)
- auth/google/callback (signin callback)

## Notification
- notifications

## Topic
- topics
- topics/new
- topics/:id
- topics/:id/edit
- topics/trending
- topics/unsolved
- topics/search?keyword=xxx
- topics/tag?name=xxx

## Comment
- topics/:id/comments [GET]
- topics/:id/comments [POST]

## Tag
- tags
- tags/:name

