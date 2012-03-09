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

## Post controller
- /posts
- /posts/new
- /posts/:id
- /posts/:id/edit
- /posts/latest
- /posts/trending
- /posts/unsolved
- /posts/search?keyword=xxx
- /posts/tag?name=xxx

## Comment controller
- /posts/:id/comments [GET]
- /posts/:id/comments [POST]

## Tag controller
- /tags
