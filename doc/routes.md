# Controller routes for forum.coke

## Root
- GET    /                              topics#index

## Authentication
- GET    /auth/google                   auth#google
- GET    /auth/callback                 auth#callback
- GET    /logout                        auth#logout

## Users
- GET    /users/:user_id/topics         users#topics
- GET    /users/:user_id/replies        users#replies
- GET    /users                         users#index
- GET    /users/:id                     users#show

## Notifications
- GET    /notifications                 notifications#index

## Tags
- GET    /tags                          tags#index

## Tag Topics
- GET    /tags/:name/topics             tag_topics#index

## Topics
- GET    /topics/trending               topics#trending
- GET    /topics/unsolved               topics#unsolved
- GET    /topics/search                 topics#search
- GET    /topics                        topics#index
- POST   /topics                        topics#create
- GET    /topics/new                    topics#new
- GET    /topics/:id/edit               topics#edit
- DELETE /topics/:id                    topics#destroy
- PUT    /topics/:id                    topics#update
- GET    /topics/:id                    topics#show

## Comments
- POST   /topics/:topic_id/comments     comments#create
- DELETE /topics/:topic_id/comments/:id comments#destroy


