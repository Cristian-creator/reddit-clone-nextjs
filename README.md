# Fullstack reddit clone

### Technologies used
Front-end:
- Typescript
- Material UI
- NextJS
- GraphQL & URQL as client

Back-end:
- Typescript
- TypeGraphQL & Apollo server
- NodeJS | Express
- TypeORM
- Dataloader
- Redis
- PostgreSQL

### GraphQL
- Is a query language (QL) and it enables the client to make ( along with URQL )  HTTP requests and get responses when working with APIs. Furthermore, GraphQL allows users to request and receive exactly the data they need from several resources using a single request compared to REST arhitecture which exposes and provides a rigid data structure, so it avoids under-fetching and over-fetching and it gives more flexibility to the user.

### URQL
- Used as a GraphQL client, it enables declaratively send of GraphQL requests and become the primary data layer of the app. It helped in the process of implementing some of the most important features of the app like: document caching ( it avoids sending the same requests to GraphQL API repeatedly by caching the result of each query ), cursor pagination ( infinite scroll based on cursor ).

### Typeorm
- A common ORM for typescript servers. The main benefit was focusing more on the app’s logic and less on writing interfaces, part of the queries etc. I especially used it for creating and mapping entities, creating and running migrations, both retrieved by TypeORM in a performant, flexible, clean and maintainable way.

### App’s main features:
- Register, login, change password and forgot password ( for the last one a unique code is generated which is sent to the user's email ) functionalities for users
- Authentication with sessions
- Assigning cookies to logged in users and store them in redis store
- Create, edit, delete, vote up / down posts for authenticated users
- Cursor pagination for posts
- Using data loader for importing high-volume data
- Caching data
- Global client-side error handler

