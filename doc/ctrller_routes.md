# Controller routes for forum.coke

## Home
- /home

## User controller
- /users
- /users/:id/edit
- /users/signup
- /users/signin
- /users/signout
- /auth/google (signin via OAuth2)
- /auth/google/callback (signin callback)

## Notification controller
- /notifications

## Topic controller
- /topics
- /topics/new
- /topics/:id
- /topics/:id/edit
- /topics/latest
- /topics/trending
- /topics/unsolved
- /topics/search?keyword=xxx
- /topics/tag?name=xxx

## Comment controller
- /topics/:id/comments [GET]
- /topics/:id/comments [POST]

## Tag controller
- /tags
